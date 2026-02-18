import React, { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@shared/theme';
import { InsightItem } from '@shared/components';
import type { NeighborhoodInsight } from '../types';

interface InsightsSectionProps {
  insights: NeighborhoodInsight[];
}

export function InsightsSection({ insights }: InsightsSectionProps): JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Personalized Insights</Text>
      <View style={styles.insightsList}>
        {insights.map((insight) => (
          <InsightItem key={insight.title} variant={insight.variant}>
            <InsightItem.Icon />
            <View style={styles.insightTextBlock}>
              <InsightItem.Title>{insight.title}</InsightItem.Title>
              <InsightItem.Description>{insight.description}</InsightItem.Description>
            </View>
          </InsightItem>
        ))}
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
  sectionTitle: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  insightsList: {
    gap: THEME.spacing.xs,
  },
  insightTextBlock: {
    flex: 1,
    gap: 2,
  },
});
