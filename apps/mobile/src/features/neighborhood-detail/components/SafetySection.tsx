import React, { JSX } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import type { NeighborhoodSafetyData } from '@features/safety/store/safetyApi';
import { useRouter } from 'expo-router';

interface SafetySectionProps {
  isLoggedIn: boolean;
  isLoading: boolean;
  safety: NeighborhoodSafetyData | null;
}

function gradeColor(score: string): string {
  const first = score.charAt(0).toUpperCase();
  if (first === 'A') return THEME.colors.success;
  if (first === 'B') return '#84cc16';
  if (first === 'C') return '#f59e0b';
  return '#ef4444';
}

export function SafetySection({ isLoggedIn, isLoading, safety }: SafetySectionProps): JSX.Element {
  const router = useRouter();

  // No logueado — pantalla premium
  if (!isLoggedIn) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety & Crime</Text>
        <View style={styles.lockedCard}>
          <View style={styles.lockedIconWrap}>
            <Ionicons name="shield-checkmark-outline" size={32} color={THEME.colors.primary} />
          </View>
          <Text style={styles.lockedTitle}>Premium Feature</Text>
          <Text style={styles.lockedDescription}>
            Get detailed crime reports, safety scores, and incident data for this neighborhood.
          </Text>
          <TouchableOpacity
            style={styles.lockedBtn}
            onPress={() => router.push('/auth?mode=login')}
            activeOpacity={0.85}
          >
            <Ionicons name="lock-open-outline" size={14} color="#FFFFFF" />
            <Text style={styles.lockedBtnLabel}>Unlock with Free Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Cargando
  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety & Crime</Text>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading safety data...</Text>
        </View>
      </View>
    );
  }

  // Sin datos
  if (!safety) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety & Crime</Text>
        <View style={styles.loadingCard}>
          <Ionicons name="alert-circle-outline" size={20} color={THEME.colors.textMuted} />
          <Text style={styles.loadingText}>Safety data unavailable for this area.</Text>
        </View>
      </View>
    );
  }

  const color = gradeColor(safety.crimeScore);
  const yoyValue = Math.round(safety.crimeNumeric * 100);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Safety & Crime</Text>

      {/* Grade + description */}
      <View style={styles.safetyCard}>
        <View style={styles.safetyGradeBlock}>
          <View style={[styles.safetyGradeBadge, { borderColor: color }]}>
            <Text style={[styles.safetyGradeText, { color }]}>{safety.crimeScore}</Text>
          </View>
          <View style={styles.safetyGradeInfo}>
            <Text style={styles.safetyRank}>{safety.crimeDescription}</Text>
            <Text style={styles.safetyComparison}>{safety.crimeBreakdown.overall}</Text>
          </View>
        </View>

        {/* Breakdown */}
        <View style={styles.breakdownBlock}>
          {Object.entries(safety.crimeBreakdown)
            .filter(([key]) => key !== 'overall')
            .map(([key, value]) => (
              <View key={key} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Text style={styles.breakdownValue}>{value}</Text>
              </View>
            ))}
        </View>

        {/* Crime numeric bar */}
        <View style={styles.crimeYoY}>
          <View style={styles.crimeYoYHeader}>
            <Ionicons
              name={safety.crimeNumeric < 0.4 ? 'trending-down-outline' : 'trending-up-outline'}
              size={14}
              color={safety.crimeNumeric < 0.4 ? THEME.colors.success : '#ef4444'}
            />
            <Text style={styles.crimeYoYLabel}>Crime Risk Index:</Text>
            <Text style={[
              styles.crimeYoYValue,
              { color: safety.crimeNumeric < 0.4 ? THEME.colors.success : '#ef4444' }
            ]}>
              {yoyValue}%
            </Text>
          </View>
          <View style={styles.crimeBarTrack}>
            <View style={[
              styles.crimeBarFill,
              {
                width: `${yoyValue}%`,
                backgroundColor: safety.crimeNumeric < 0.4 ? THEME.colors.success : '#ef4444',
              }
            ]} />
          </View>
        </View>
      </View>

      {/* Recent incidents */}
      {safety.incidents.data.length > 0 && (
        <View style={styles.incidentsCard}>
          <View style={styles.incidentsHeader}>
            <Text style={styles.incidentsTitle}>Incidents</Text>
            <Text style={styles.incidentsCount}>
              {safety.incidents.count} in {safety.incidents.radius_feet}ft radius
            </Text>
          </View>
          {safety.incidents.data.map((incident, idx) => (
            <View key={idx} style={styles.incidentRow}>
              <View style={styles.incidentDot} />
              <View style={styles.incidentInfo}>
                <Text style={styles.incidentType}>{incident.type}</Text>
                <Text style={styles.incidentMeta}>
                  {incident.address} · {incident.distance_feet}ft away
                </Text>
              </View>
              <Text style={styles.incidentDate}>
                {new Date(incident.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          ))}
        </View>
      )}
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
  // Locked
  lockedCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.xl,
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  lockedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.xs,
  },
  lockedTitle: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  lockedDescription: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  lockedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    marginTop: THEME.spacing.xs,
  },
  lockedBtnLabel: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: '#FFFFFF',
  },
  // Loading / empty
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
  },
  loadingText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
  },
  // Safety card
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
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  safetyGradeText: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
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
  // Breakdown
  breakdownBlock: {
    gap: THEME.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: THEME.spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
  },
  breakdownValue: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
  // Crime bar
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
  },
  crimeBarTrack: {
    height: 6,
    backgroundColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.full,
  },
  crimeBarFill: {
    height: '100%',
    borderRadius: THEME.borderRadius.full,
  },
  // Incidents
  incidentsCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  incidentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  incidentsTitle: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
  incidentsCount: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
  },
  incidentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  incidentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    flexShrink: 0,
  },
  incidentInfo: {
    flex: 1,
    gap: 2,
  },
  incidentType: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
  incidentMeta: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
  },
  incidentDate: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
    flexShrink: 0,
  },
});