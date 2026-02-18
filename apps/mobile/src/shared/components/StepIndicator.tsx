import React, { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../theme';
import { ProgressBar } from './ProgressBar';

interface StepIndicatorProps {
  current: number;
  total: number;
  label: string;
}

export function StepIndicator({ current, total, label }: StepIndicatorProps): JSX.Element {
  const progress = (current / total) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.stepText}>
          Step {current} of {total}
        </Text>
        <Text style={styles.percentText}>{Math.round(progress)}% Complete</Text>
      </View>
      <ProgressBar progress={progress} style={styles.bar} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: THEME.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepText: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentText: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
  },
  bar: {
    height: 4,
  },
  label: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
