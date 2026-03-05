import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-04-10' as any,
    });
  }

  async createOrGetCustomer(user: { id: string; email: string; stripeCustomerId: string | null }) {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({ email: user.email });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  /** Resuelve product ID a price ID (primer precio recurrente activo del producto). */
  private async resolveToPriceId(productOrPriceId: string): Promise<string> {
    if (productOrPriceId.startsWith('price_')) {
      return productOrPriceId;
    }
    if (productOrPriceId.startsWith('prod_')) {
      const { data: prices } = await this.stripe.prices.list({
        product: productOrPriceId,
        active: true,
        type: 'recurring',
      });
      const price = prices[0];
      if (!price) {
        throw new BadRequestException(
          `El producto ${productOrPriceId} no tiene un precio recurrente activo en Stripe. Crea un precio en Stripe Dashboard → Productos → [producto] → Añadir precio.`,
        );
      }
      this.logger.log(`Product ${productOrPriceId} resuelto a price ${price.id}`);
      return price.id;
    }
    throw new BadRequestException('Se espera un Stripe Price ID (price_...) o Product ID (prod_...).');
  }

  async createSubscription(userId: string, priceId: string) {
    this.logger.log(`createSubscription received priceId: ${priceId ?? '(undefined)'}`);
    if (!priceId || typeof priceId !== 'string') {
      throw new BadRequestException('priceId es requerido y debe ser un string.');
    }
    const resolvedPriceId = await this.resolveToPriceId(priceId);
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const customerId = await this.createOrGetCustomer({
      id: user.id,
      email: user.email,
      stripeCustomerId: user.stripeCustomerId,
    });

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: resolvedPriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
    });

    // Resolve invoice ID (latest_invoice may be string or object depending on API version)
    const rawLatestInvoice = subscription.latest_invoice;
    const invoiceId: string | undefined =
      typeof rawLatestInvoice === 'string'
        ? rawLatestInvoice
        : (rawLatestInvoice as any)?.id;

    this.logger.log(
      `Subscription created: id=${subscription.id} status=${subscription.status} invoiceId=${invoiceId}`,
    );

    let clientSecret: string | undefined;

    if (invoiceId) {
      // Always retrieve the invoice directly — nested expand (latest_invoice.payment_intent)
      // is unreliable in the clover API version.
      const invoice = await this.stripe.invoices.retrieve(invoiceId, {
        expand: ['payment_intent'],
      });
      const pi = (invoice as any).payment_intent;
      this.logger.log(`Invoice ${invoiceId} payment_intent type=${typeof pi} value=${JSON.stringify(pi)?.slice(0, 80)}`);

      if (typeof pi === 'string') {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(pi);
        clientSecret = paymentIntent.client_secret ?? undefined;
      } else if (pi && typeof pi === 'object') {
        clientSecret = pi.client_secret ?? undefined;
      }
    }

    // Fallback: pending_setup_intent (trial / $0 first invoice)
    if (!clientSecret) {
      const subFull = await this.stripe.subscriptions.retrieve(subscription.id, {
        expand: ['pending_setup_intent'],
      });
      const psi = (subFull as any).pending_setup_intent;
      if (psi) {
        const setupIntentId = typeof psi === 'string' ? psi : psi.id;
        const setupIntent = await this.stripe.setupIntents.retrieve(setupIntentId);
        clientSecret = setupIntent.client_secret ?? undefined;
        this.logger.log(`Using pending_setup_intent for subscription=${subscription.id}`);
      }
    }

    if (!clientSecret) {
      this.logger.warn(`No client_secret found for subscription=${subscription.id} invoiceId=${invoiceId}`);
      throw new BadRequestException('Could not retrieve payment intent client secret');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
      },
    });

    return {
      clientSecret,
      subscriptionId: subscription.id,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.getOrThrow('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await this.updateSubscriptionInDb(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.updateSubscriptionInDb(sub);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription ?? invoice.subscription_id;
        if (subscriptionId) {
          await this.prisma.user.updateMany({
            where: { subscriptionId },
            data: { subscriptionStatus: 'past_due' },
          });
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription ?? invoice.subscription_id;
        if (subscriptionId) {
          const sub = await this.stripe.subscriptions.retrieve(subscriptionId as string);
          await this.updateSubscriptionInDb(sub);
        }
        break;
      }
    }

    return { received: true };
  }

  private async updateSubscriptionInDb(sub: Stripe.Subscription) {
    const priceId = sub.items.data[0]?.price?.id; // Stripe siempre devuelve price_xxx
    const planMap: Record<string, string> = {
      [this.config.get('STRIPE_PRICE_ID_WEEKLY') ?? '']: 'weekly',
      [this.config.get('STRIPE_PRICE_ID_MONTHLY') ?? '']: 'monthly',
      [this.config.get('STRIPE_PRICE_ID_ANNUAL') ?? '']: 'annual',
    };
    // STRIPE_PRICE_ID_* en .env deben ser los price_xxx (no prod_xxx) para que subscriptionPlan coincida

    // current_period_end may vary by Stripe API version
    const subAny = sub as any;
    const periodEnd = subAny.current_period_end
      ? new Date(subAny.current_period_end * 1000)
      : null;

    await this.prisma.user.updateMany({
      where: { subscriptionId: sub.id },
      data: {
        subscriptionStatus: sub.status,
        subscriptionPlan: priceId ? (planMap[priceId] ?? null) : null,
        subscriptionCurrentPeriodEnd: periodEnd,
      },
    });
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    return {
      isPremium: user.subscriptionStatus === 'active',
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    };
  }
}
