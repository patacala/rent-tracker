import React, { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../theme';

const SIZE_MAP = {
  sm: 32,
  md: 44,
  lg: 56,
} as const;

const FONT_SIZE_MAP = {
  sm: THEME.fontSize.xs,
  md: THEME.fontSize.sm,
  lg: THEME.fontSize.base,
} as const;

function scoreToColor(score: number): string {
  if (score >= 80) return THEME.colors.scoreExcellent;
  if (score >= 60) return THEME.colors.scoreGood;
  if (score >= 40) return THEME.colors.scoreFair;
  return THEME.colors.scorePoor;
}

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps): JSX.Element {
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const color = scoreToColor(score);

  return (
    <View
      style={[
        styles.badge,
        { width: dimension, height: dimension, borderRadius: dimension / 2, backgroundColor: color },
      ]}
    >
      <Text style={[styles.text, { fontSize }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: THEME.fontWeight.bold,
    lineHeight: undefined,
  },
});
