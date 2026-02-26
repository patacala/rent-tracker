import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';

type PricingPlan = 'weekly' | 'monthly' | 'annual';

const FEATURES = [
  {
    icon: 'time-outline',
    title: '30-Minute Rule',
    desc: 'Commute analysis & traffic patterns',
  },
  {
    icon: 'bar-chart-outline',
    title: 'Neighborhood DNA',
    desc: 'Demographics, vibe & crime data',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Avoid Remorse',
    desc: 'Risk assessment & future value',
  },
];

const PLANS: Record<PricingPlan, { label: string; price: string; sub: string; badge?: string; savings?: string }> = {
  weekly: { label: 'Weekly', price: '$4.99', sub: '/week' },
  monthly: { label: 'Pro Searcher', price: '$14.99', sub: '/month', badge: 'MOST POPULAR', savings: 'Save 25%' },
  annual: { label: 'Annual', price: '$99.99', sub: '/year' },
};

export function PurchaseScreen(): JSX.Element {
  const router = useRouter();
  const [selected, setSelected] = useState<PricingPlan>('monthly');

  return (
    <SafeAreaView style={styles.safe}>
      {/* <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={18} color={THEME.colors.textSecondary} />
      </TouchableOpacity> */}

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Don't choose where to{'\n'}
            <Text style={styles.titleAccent}>live based on a photo.</Text>
          </Text>
          <Text style={styles.subtitle}>
            Unlock deep insights that real estate listings hide.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as any} size={18} color={THEME.colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingRow}>
          {(Object.keys(PLANS) as PricingPlan[]).map((plan) => {
            const p = PLANS[plan];
            const isSelected = selected === plan;

            return (
              <TouchableOpacity
                key={plan}
                onPress={() => setSelected(plan)}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                ]}
                activeOpacity={0.85}
              >
                {p.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{p.badge}</Text>
                  </View>
                ) : null}

                <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>
                  {p.label}
                </Text>
                <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                  {p.price}
                </Text>
                <Text style={[styles.planSub, isSelected && styles.planSubSelected]}>
                  {p.sub}
                </Text>
                {p.savings ? (
                  <Text style={styles.planSavings}>{p.savings}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push({
                pathname: '/purchase/detail',
                params: {
                    plan: PLANS[selected].label,
                    price: PLANS[selected].price,
                    period: PLANS[selected].sub,
                },
            })}
            activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>Secure my new home</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.legal}>
          Recurring billing. Cancel anytime. By continuing you agree to our{' '}
          <Text style={styles.legalLink}>Terms</Text> and{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text>.
        </Text>

        {/* <TouchableOpacity style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: THEME.colors.background,
    paddingTop: 15
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: THEME.spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...THEME.shadow.sm,
  },
  container: {
    padding: THEME.spacing.lg,
    paddingTop: THEME.spacing.xl,
    gap: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  header: { gap: THEME.spacing.sm },
  title: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
    lineHeight: 36,
  },
  titleAccent: {
    color: THEME.colors.primary,
  },
  subtitle: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
  },
  features: {
    gap: THEME.spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
  featureDesc: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  planCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
    gap: 2,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
    ...THEME.shadow.md,
  },
  badge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#F59E0B',
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: THEME.fontSize.xxs,
    fontWeight: THEME.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planLabel: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.medium,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.sm,
  },
  planLabelSelected: { color: THEME.colors.primary },
  planPrice: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  planPriceSelected: { color: THEME.colors.primary },
  planSub: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
  },
  planSubSelected: { color: THEME.colors.primary },
  planSavings: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.primary,
    marginTop: 2,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.full,
    paddingVertical: THEME.spacing.md,
    ...THEME.shadow.md,
  },
  ctaText: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.bold,
    color: '#FFFFFF',
  },
  legal: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.medium,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xs,
  },
  restoreText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.medium,
    color: THEME.colors.textSecondary,
  },
});