import React, { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@shared/theme';
import type { MarketTrendBar } from '../types';

interface MarketTrendsSectionProps {
  trends: MarketTrendBar[];
  trendChange: string;
}

export function MarketTrendsSection({ trends, trendChange }: MarketTrendsSectionProps): JSX.Element {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Market Trends</Text>
        <View style={styles.trendBadge}>
          <Text style={styles.trendBadgeText}>{trendChange}</Text>
        </View>
      </View>
      <View style={styles.chartCard}>
        <Text style={styles.chartSubtitle}>Median Price Appreciation</Text>
        <View style={styles.chartBars}>
          {trends.map((bar) => (
            <View key={bar.label} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View style={{ flex: 100 - bar.value }} />
                <View
                  style={[
                    styles.barFill,
                    { flex: bar.value },
                    bar.highlighted && styles.barFillHighlighted,
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{bar.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
    gap: THEME.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  trendBadge: {
    backgroundColor: THEME.colors.successLight,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  trendBadgeText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.success,
  },
  chartCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  chartSubtitle: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.fontWeight.medium,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: THEME.spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    gap: THEME.spacing.xs,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: THEME.colors.primaryLight,
    borderRadius: 3,
    minHeight: 4,
  },
  barFillHighlighted: {
    backgroundColor: THEME.colors.primary,
  },
  barLabel: {
    fontSize: THEME.fontSize.xxs,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
});
