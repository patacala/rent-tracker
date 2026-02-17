import React, { useState, useCallback, JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@shared/theme';
import { scoreToColor, formatScore } from '@rent-tracker/utils';
import type { NeighborhoodScore } from '@rent-tracker/types';
import { MIAMI_CONFIG } from '@rent-tracker/config';
import type { ScoreLevel } from '@rent-tracker/types';

const MOCK_NEIGHBORHOODS: NeighborhoodScore[] = MIAMI_CONFIG.neighborhoods.map((n) => ({
  neighborhoodId: n.id,
  name: n.name,
  lat: n.lat,
  lng: n.lng,
  city: 'miami',
  score: {
    overall: 45 + Math.floor(Math.random() * 55),
    level: 'GOOD' as ScoreLevel,
    breakdown: {
      commute: 40 + Math.floor(Math.random() * 60),
      amenities: 30 + Math.floor(Math.random() * 70),
      family: 50 + Math.floor(Math.random() * 50),
    },
  },
}));

export function LifestyleMapScreen(): JSX.Element {
  const [neighborhoods] = useState<NeighborhoodScore[]>(MOCK_NEIGHBORHOODS);
  const [selected, setSelected] = useState<NeighborhoodScore | null>(null);
  const [loading] = useState(false);

  const handleSelect = useCallback((n: NeighborhoodScore): void => {
    setSelected((prev) => (prev?.neighborhoodId === n.neighborhoodId ? null : n));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator color={THEME.colors.primary} size="large" />
        <Text style={styles.loadingText}>Calculating lifestyle scores...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Miami Neighborhoods</Text>
        <Text style={styles.subtitle}>Tap a neighborhood to see your lifestyle score</Text>
      </View>

      {/* Map placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderIcon}>🗺️</Text>
        <Text style={styles.mapPlaceholderText}>Map coming soon</Text>
        <Text style={styles.mapPlaceholderSub}>Interactive map will appear here</Text>
      </View>

      {/* Selected card */}
      {selected ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{selected.name}</Text>
            <View style={[styles.scoreBadge, { backgroundColor: scoreToColor(selected.score.overall) }]}>
              <Text style={styles.scoreBadgeText}>{formatScore(selected.score.overall)}</Text>
            </View>
          </View>
          <View style={styles.breakdown}>
            {[
              { label: '🚗 Commute', value: selected.score.breakdown.commute, weight: '40%' },
              { label: '🏪 Amenities', value: selected.score.breakdown.amenities, weight: '40%' },
              { label: '👨‍👩‍👧 Family', value: selected.score.breakdown.family, weight: '20%' },
            ].map(({ label, value, weight }) => (
              <View key={label} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  {label} <Text style={styles.breakdownWeight}>({weight})</Text>
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${value}%`, backgroundColor: scoreToColor(value) },
                    ]}
                  />
                </View>
                <Text style={[styles.breakdownValue, { color: scoreToColor(value) }]}>{value}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Neighborhood list */
        <ScrollView
          style={styles.list}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {[...neighborhoods]
            .sort((a, b) => b.score.overall - a.score.overall)
            .map((n) => (
              <TouchableOpacity
                key={n.neighborhoodId}
                style={styles.listCard}
                onPress={() => handleSelect(n)}
              >
                <Text style={styles.listCardName}>{n.name}</Text>
                <Text style={[styles.listCardScore, { color: scoreToColor(n.score.overall) }]}>
                  {n.score.overall}
                </Text>
                <Text style={styles.listCardLevel}>{n.score.level}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
  },
  title: { fontSize: THEME.fontSize.xl, fontWeight: THEME.fontWeight.bold, color: THEME.colors.text },
  subtitle: { fontSize: THEME.fontSize.sm, color: THEME.colors.textSecondary, marginTop: 2 },
  loadingText: { color: THEME.colors.textSecondary, marginTop: THEME.spacing.md, fontSize: THEME.fontSize.base },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
    margin: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    gap: THEME.spacing.sm,
  },
  mapPlaceholderIcon: { fontSize: 48 },
  mapPlaceholderText: { fontSize: THEME.fontSize.lg, fontWeight: THEME.fontWeight.semibold, color: THEME.colors.text },
  mapPlaceholderSub: { fontSize: THEME.fontSize.sm, color: THEME.colors.textMuted },
  card: {
    backgroundColor: THEME.colors.surface,
    margin: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: THEME.spacing.md },
  cardTitle: { fontSize: THEME.fontSize.lg, fontWeight: THEME.fontWeight.bold, color: THEME.colors.text },
  scoreBadge: { paddingHorizontal: THEME.spacing.sm, paddingVertical: 4, borderRadius: THEME.borderRadius.full },
  scoreBadgeText: { color: 'white', fontWeight: THEME.fontWeight.bold, fontSize: THEME.fontSize.sm },
  breakdown: { gap: THEME.spacing.sm },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: THEME.spacing.sm },
  breakdownLabel: { color: THEME.colors.textSecondary, fontSize: THEME.fontSize.sm, width: 110 },
  breakdownWeight: { color: THEME.colors.textMuted, fontSize: THEME.fontSize.xs },
  progressTrack: { flex: 1, height: 6, backgroundColor: THEME.colors.surfaceElevated, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  breakdownValue: { fontSize: THEME.fontSize.sm, fontWeight: THEME.fontWeight.semibold, width: 28, textAlign: 'right' },
  closeBtn: { marginTop: THEME.spacing.md, alignItems: 'center' },
  closeBtnText: { color: THEME.colors.textMuted, fontSize: THEME.fontSize.sm },
  list: { maxHeight: 130 },
  listContent: { paddingHorizontal: THEME.spacing.md, gap: THEME.spacing.sm, paddingVertical: THEME.spacing.sm },
  listCard: { backgroundColor: THEME.colors.surface, borderRadius: THEME.borderRadius.md, padding: THEME.spacing.md, alignItems: 'center', minWidth: 100 },
  listCardName: { color: THEME.colors.text, fontSize: THEME.fontSize.xs, fontWeight: THEME.fontWeight.medium, textAlign: 'center', marginBottom: 4 },
  listCardScore: { fontSize: THEME.fontSize.xl, fontWeight: THEME.fontWeight.bold },
  listCardLevel: { color: THEME.colors.textMuted, fontSize: 9, marginTop: 2 },
});