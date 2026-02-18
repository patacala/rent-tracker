import React, { JSX } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { THEME } from '@shared/theme';
import { StatCard } from '@shared/components';
import type { NeighborhoodStat } from '../types';

const STAT_WIDTH =
  (Dimensions.get('window').width - THEME.spacing.lg * 2 - THEME.spacing.sm) / 2;

interface StatsSectionProps {
  stats: NeighborhoodStat[];
}

export function StatsSection({ stats }: StatsSectionProps): JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Neighborhood Stats</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <StatCard key={stat.description} style={{ width: STAT_WIDTH }}>
            <StatCard.Icon name={stat.icon} />
            <StatCard.Value>{stat.value}</StatCard.Value>
            <StatCard.Description>{stat.description}</StatCard.Description>
          </StatCard>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
});
