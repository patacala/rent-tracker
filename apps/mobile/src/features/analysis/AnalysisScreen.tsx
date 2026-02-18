import React, { JSX, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { MapPlaceholder, ProgressBar } from '@shared/components';

const STEPS = [
  'Calculating commute efficiencies...',
  'Ranking school safety data...',
  'Identifying nearby amenities...',
];

const STEP_DELAY = 900;
const NAV_DELAY = STEPS.length * STEP_DELAY + 800;

export function AnalysisScreen(): JSX.Element {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  const fadeAnims = useRef(STEPS.map(() => new Animated.Value(0))).current;
  const translateAnims = useRef(STEPS.map(() => new Animated.Value(16))).current;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((_, idx) => {
      const delay = idx * STEP_DELAY;

      timers.push(
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnims[idx], {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(translateAnims[idx], {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        }, delay),
      );

      timers.push(
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, idx]);
          setProgress(Math.round(((idx + 1) / STEPS.length) * 100));
        }, delay + 600),
      );
    });

    timers.push(
      setTimeout(() => {
        router.replace('/(tabs)/explore');
      }, NAV_DELAY),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [fadeAnims, translateAnims, router]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Map area */}
      <View style={styles.mapContainer}>
        <MapPlaceholder style={styles.map} />
        <View style={styles.mapOverlay}>
          <View style={styles.processingBadge}>
            <Text style={styles.processingText}>Data Processing</Text>
            <Text style={styles.processingPct}>{progress}%</Text>
          </View>
          <ProgressBar progress={progress} style={styles.mapProgress} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoMark} />
          <Text style={styles.brandName}>Relocation Intelligence</Text>
        </View>

        <Text style={styles.title}>Analyzing the best areas{'\n'}for your lifestyle...</Text>

        <View style={styles.checklistCard}>
          {STEPS.map((step, idx) => {
            const isDone = completedSteps.includes(idx);
            return (
              <Animated.View
                key={step}
                style={[
                  styles.checklistRow,
                  {
                    opacity: fadeAnims[idx],
                    transform: [{ translateY: translateAnims[idx] }],
                  },
                ]}
              >
                <View style={[styles.stepIcon, isDone ? styles.stepIconDone : styles.stepIconPending]}>
                  {isDone ? (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  ) : (
                    <View style={styles.stepDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.checklistText,
                    isDone ? styles.checklistTextDone : styles.checklistTextPending,
                  ]}
                >
                  {step}
                </Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Pro tip card */}
        <View style={styles.proTipCard}>
          <View style={styles.proTipBadge}>
            <Ionicons name="star" size={10} color={THEME.colors.primary} />
            <Text style={styles.proTipBadgeText}>PRO TIP</Text>
          </View>
          <Text style={styles.proTipText}>
            Most families choose{' '}
            <Text style={styles.proTipHighlight}>Coral Gables</Text> for its exceptional safety
            ratings and high walkability scores.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  processingBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  processingText: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.text,
    fontWeight: THEME.fontWeight.medium,
  },
  processingPct: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.bold,
  },
  mapProgress: {
    height: 8,
    borderRadius: THEME.borderRadius.full,
  },
  content: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  logoMark: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
  },
  brandName: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.primary,
  },
  title: {
    fontSize: THEME.fontSize.xl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
    lineHeight: 28,
  },
  checklistCard: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    gap: THEME.spacing.md,
    ...THEME.shadow.sm,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  stepIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepIconDone: {
    backgroundColor: THEME.colors.success,
  },
  stepIconPending: {
    backgroundColor: THEME.colors.border,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.textMuted,
  },
  checklistText: {
    fontSize: THEME.fontSize.sm,
    lineHeight: 19,
  },
  checklistTextDone: {
    color: THEME.colors.text,
    fontWeight: THEME.fontWeight.medium,
  },
  checklistTextPending: {
    color: THEME.colors.textMuted,
  },
  proTipCard: {
    backgroundColor: THEME.colors.primaryLight,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  proTipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proTipBadgeText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.primary,
    letterSpacing: 0.5,
  },
  proTipText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    lineHeight: 19,
  },
  proTipHighlight: {
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },
});
