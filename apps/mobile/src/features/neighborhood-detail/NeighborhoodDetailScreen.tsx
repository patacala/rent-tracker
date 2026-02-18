import React, { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@shared/theme';
import { HeaderBackButton, ImagePlaceholder, ScoreBadge } from '@shared/components';
import { useNeighborhoodDetail } from './hooks/useNeighborhoodDetail';
import { MatchSection } from './components/MatchSection';
import { StatsSection } from './components/StatsSection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { InsightsSection } from './components/InsightsSection';
import { MarketTrendsSection } from './components/MarketTrendsSection';
import { PriceWalkSection } from './components/PriceWalkSection';
import { SafetySection } from './components/SafetySection';

export function NeighborhoodDetailScreen(): JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: detail } = useNeighborhoodDetail(id ?? '');

  if (!detail) return <View />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.stickyHeader}>
        <HeaderBackButton onPress={() => router.back()} />
        <Text style={styles.headerName} numberOfLines={1}>
          {detail.name}
        </Text>
        <ScoreBadge score={detail.score} size="sm" />
        <Text style={styles.scoreLabel}>SCORE</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ImagePlaceholder height={220} style={styles.hero} />

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>{detail.matchQuote}</Text>
        </View>

        <MatchSection matches={detail.matches} />
        <StatsSection stats={detail.stats} />
        <AmenitiesSection amenities={detail.amenities} />
        <InsightsSection insights={detail.insights} />
        <MarketTrendsSection trends={detail.marketTrends} trendChange={detail.marketTrendChange} />
        <PriceWalkSection
          medianPrice={detail.medianPrice}
          walkScore={detail.walkScore}
          walkScoreLabel={detail.walkScoreLabel}
        />
        <SafetySection
          grade={detail.safetyGrade}
          rank={detail.safetyRank}
          crimeComparison={detail.crimeComparison}
          crimeYoY={detail.crimeYoY}
          crimeYoYValue={detail.crimeYoYValue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: THEME.spacing.sm,
  },
  headerName: {
    flex: 1,
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  scoreLabel: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  content: { paddingBottom: THEME.spacing.xxl },
  hero: { borderRadius: 0 },
  quoteCard: {
    margin: THEME.spacing.lg,
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.primaryLight,
    borderRadius: THEME.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  quoteText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.primary,
    fontStyle: 'italic',
    lineHeight: 19,
  },
});
