import React, { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { useSavedNeighborhoods } from './hooks/useSavedNeighborhoods';

function scoreToColor(score: number): string {
  if (score >= 80) return THEME.colors.scoreExcellent;
  if (score >= 60) return THEME.colors.scoreGood;
  if (score >= 40) return THEME.colors.scoreFair;
  return THEME.colors.scorePoor;
}

interface CompareRowProps {
  label: string;
  icon: string;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

function CompareRow({ label, icon, leftContent, rightContent }: CompareRowProps): JSX.Element {
  return (
    <View style={styles.compareRow}>
      <View style={styles.compareRowHeader}>
        <Ionicons name={icon as any} size={14} color={THEME.colors.primary} />
        <Text style={styles.compareRowLabel}>{label}</Text>
      </View>
      <View style={styles.compareRowValues}>
        <View style={styles.compareCell}>{leftContent}</View>
        <View style={styles.divider} />
        <View style={styles.compareCell}>{rightContent}</View>
      </View>
    </View>
  );
}

export function ComparisonScreen(): JSX.Element {
  const router = useRouter();
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const { data: saved } = useSavedNeighborhoods();

  const compareIds = (ids ?? '').split(',').filter(Boolean);
  const items = compareIds
    .map((id) => saved.find((s) => s.id === id))
    .filter(Boolean) as typeof saved;

  const left = items[0];
  const right = items[1];

  if (!left || !right) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Could not load comparison.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* const handleShare = async () => {
    await Share.share({
      message: `Comparing ${left.name} (score: ${left.score}) vs ${right.name} (score: ${right.score})`,
    });
  };
 */
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Neighborhoods</Text>
        {/*<TouchableOpacity onPress={handleShare} hitSlop={8}>
                  <Ionicons name="share-outline" size={22} color={THEME.colors.text} />
        </TouchableOpacity> */}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Neighborhood headers */}
        <View style={styles.neighborhoodHeaders}>
          {[left, right].map((item) => (
            <View key={item.id} style={styles.neighborhoodHeader}>
              <Image
                source={item.photoUrl ? { uri: item.photoUrl } : require('@assets/miami-bg.png')}
                style={styles.neighborhoodImage}
                resizeMode="cover"
              />
              <Text style={styles.neighborhoodName} numberOfLines={1}>{item.name}</Text>
            </View>
          ))}
        </View>

        {/* Lifestyle Match Score */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LIFESTYLE MATCH SCORE</Text>
          <View style={styles.compareRowValues}>
            {[left, right].map((item) => (
              <View key={item.id} style={styles.compareCell}>
                <View style={[styles.scoreCircle, { borderColor: scoreToColor(item.score) }]}>
                  <Text style={[styles.scoreCircleText, { color: scoreToColor(item.score) }]}>
                    {item.score}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Commute */}
        <CompareRow
          label="Commute to Downtown"
          icon="car-outline"
          leftContent={
            <Text style={styles.metricValue}>
              {left.commuteMinutes} <Text style={styles.metricUnit}>min</Text>
            </Text>
          }
          rightContent={
            <Text style={styles.metricValue}>
              {right.commuteMinutes} <Text style={styles.metricUnit}>min</Text>
            </Text>
          }
        />

        {/* Match Count */}
        <CompareRow
          label="Profile Matches"
          icon="people-outline"
          leftContent={
            <Text style={styles.metricValue}>
              {left.matchCount} <Text style={styles.metricUnit}>matches</Text>
            </Text>
          }
          rightContent={
            <Text style={styles.metricValue}>
              {right.matchCount} <Text style={styles.metricUnit}>matches</Text>
            </Text>
          }
        />

        {/* Tags */}
        <CompareRow
          label="Top Amenities"
          icon="grid-outline"
          leftContent={
            <View style={styles.tagsContainer}>
              {left.tags.slice(0, 4).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          }
          rightContent={
            <View style={styles.tagsContainer}>
              {right.tags.slice(0, 4).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          }
        />

        {/* View Details buttons */}
        <View style={styles.detailsRow}>
          {[left, right].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.detailsBtn}
              onPress={() => router.push(`/neighborhood/${item.id}`)}
            >
              <Text style={styles.detailsBtnText}>View Details</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 20,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },

  scroll: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
    paddingBottom: THEME.spacing.xxl,
  },

  neighborhoodHeaders: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  neighborhoodHeader: {
    flex: 1,
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  neighborhoodImage: {
    width: '100%',
    height: 100,
    borderRadius: THEME.borderRadius.md,
  },
  neighborhoodName: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
    textAlign: 'center',
  },
  neighborhoodCity: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
  },

  section: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    gap: THEME.spacing.md,
    ...THEME.shadow.sm,
  },
  sectionLabel: {
    fontSize: THEME.fontSize.xxs,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.primary,
    letterSpacing: 1,
  },

  compareRow: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    gap: THEME.spacing.sm,
    ...THEME.shadow.sm,
  },
  compareRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  compareRowLabel: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compareRowValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: THEME.colors.border,
  },

  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircleText: {
    fontSize: THEME.fontSize.xl,
    fontWeight: THEME.fontWeight.bold,
  },

  metricValue: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  metricUnit: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.regular,
    color: THEME.colors.textSecondary,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: THEME.colors.primaryLight,
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: THEME.fontSize.xxs,
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },

  detailsRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
  },
  detailsBtn: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
    ...THEME.shadow.sm,
  },
  detailsBtnText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.bold,
    color: '#FFFFFF',
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.md,
  },
  errorText: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textMuted,
  },
  backLink: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },
});