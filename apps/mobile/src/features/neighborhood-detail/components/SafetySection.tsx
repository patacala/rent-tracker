import React, { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';

interface SafetySectionProps {
  grade: string;
  rank: string;
  crimeComparison: string;
  crimeYoY: string;
  crimeYoYValue: number;
}

export function SafetySection({
  grade,
  rank,
  crimeComparison,
  crimeYoY,
  crimeYoYValue,
}: SafetySectionProps): JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Safety & Crime</Text>
      <View style={styles.safetyCard}>
        <View style={styles.safetyGradeBlock}>
          <View style={styles.safetyGradeBadge}>
            <Text style={styles.safetyGradeText}>{grade}</Text>
          </View>
          <View style={styles.safetyGradeInfo}>
            <Text style={styles.safetyRank}>{rank}</Text>
            <Text style={styles.safetyComparison}>{crimeComparison}</Text>
          </View>
        </View>
        <View style={styles.crimeYoY}>
          <View style={styles.crimeYoYHeader}>
            <Ionicons name="trending-down-outline" size={14} color={THEME.colors.success} />
            <Text style={styles.crimeYoYLabel}>Year-over-Year Trend:</Text>
            <Text style={styles.crimeYoYValue}>{crimeYoY}</Text>
          </View>
          <View style={styles.crimeBarTrack}>
            <View style={[styles.crimeBarFill, { width: `${crimeYoYValue}%` }]} />
          </View>
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
  sectionTitle: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  safetyCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  safetyGradeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  safetyGradeBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: THEME.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  safetyGradeText: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.success,
  },
  safetyGradeInfo: {
    flex: 1,
    gap: 3,
  },
  safetyRank: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
  safetyComparison: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  crimeYoY: {
    gap: THEME.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: THEME.spacing.sm,
  },
  crimeYoYHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  crimeYoYLabel: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
  },
  crimeYoYValue: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.success,
  },
  crimeBarTrack: {
    height: 6,
    backgroundColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.full,
  },
  crimeBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.success,
    borderRadius: THEME.borderRadius.full,
  },
});
