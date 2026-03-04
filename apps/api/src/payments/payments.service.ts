import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow('STRIPE_SECRET_KEY'), {
      apiVersion: '2026-02-25.clover',
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

  async createSubscription(userId: string, priceId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const customerId = await this.createOrGetCustomer({
      id: user.id,
      email: user.email,
      stripeCustomerId: user.stripeCustomerId,
    });

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Cast to any to handle Stripe API version type differences for expanded fields
    const invoice = subscription.latest_invoice as any;
    const clientSecret = invoice?.payment_intent?.client_secret as string | undefined;

    if (!clientSecret) {
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
    const priceId = sub.items.data[0]?.price?.id;
    const planMap: Record<string, string> = {
      [this.config.get('STRIPE_PRICE_ID_WEEKLY') ?? '']: 'weekly',
      [this.config.get('STRIPE_PRICE_ID_MONTHLY') ?? '']: 'monthly',
      [this.config.get('STRIPE_PRICE_ID_ANNUAL') ?? '']: 'annual',
    };

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
