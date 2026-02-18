import React, { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@shared/theme';
import { MatchBar } from '@shared/components';
import type { NeighborhoodMatch } from '../types';

interface MatchSectionProps {
  matches: NeighborhoodMatch[];
}

export function MatchSection({ matches }: MatchSectionProps): JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Why It Matches Your Profile</Text>
      <View style={styles.matchBars}>
        {matches.map((m) => (
          <MatchBar key={m.label} value={m.value}>
            <MatchBar.Label>{m.label}</MatchBar.Label>
            <MatchBar.Bar />
            <MatchBar.Percentage />
          </MatchBar>
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
  matchBars: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    gap: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
});
