import React, { JSX, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { HeaderBackButton, ScoreBadge } from '@shared/components';
import { useNeighborhoodDetail } from './hooks/useNeighborhoodDetail';
import { MatchSection } from './components/MatchSection';
import { StatsSection } from './components/StatsSection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { InsightsSection } from './components/InsightsSection';
import { MarketTrendsSection } from './components/MarketTrendsSection';
import { PriceWalkSection } from './components/PriceWalkSection';
import { SafetySection } from './components/SafetySection';
import { useAuth } from '@shared/context/AuthContext';
import { useToggleFavoriteMutation, useGetFavoritesQuery } from '@features/saved/store/savedApi';
import { useToast } from '@shared/context/ToastContext';
import { useNeighborhoodSafety } from './hooks/useNeighborhoodSafety';

export function NeighborhoodDetailScreen(): JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: detail } = useNeighborhoodDetail(id ?? '');

  if (!detail) return <View />;

  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [toggleFavorite, { isLoading: isToggling }] = useToggleFavoriteMutation();
  const { data: favoritesData } = useGetFavoritesQuery(undefined, { skip: !isLoggedIn });

  const isFavorite = favoritesData?.neighborhoods?.some((n) => n.id === id) ?? false;
  const [localFavorite, setLocalFavorite] = useState(isFavorite);

  const { safety, isLoading: safetyLoading } = useNeighborhoodSafety(
    id ?? '',
    detail?.lat ?? 0,
    detail?.lng ?? 0,
  );

  useEffect(() => {
    setLocalFavorite(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn || isToggling) return;
    const next = !localFavorite;
    setLocalFavorite(next);
    try {
      await toggleFavorite(id!).unwrap();
      toast.success(next ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      setLocalFavorite(!next);
      toast.error('Something went wrong, please try again');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <HeaderBackButton onPress={() => router.back()} />
        <Text style={styles.headerName} numberOfLines={1}>
          {detail.name}
        </Text>

        {detail.score > 0 && (
          <>
            <ScoreBadge score={detail.score} size="sm" />
            <Text style={styles.scoreLabel}>SCORE</Text>
          </>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={
              detail.photoUrl
                ? { uri: detail.photoUrl }
                : require('@assets/miami-bg.png')
            }
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.heroTop}>
              <View style={styles.taglineBadge}>
                <Text style={styles.taglineText}>{detail.tagline}</Text>
              </View>
              {isLoggedIn ? (
                <TouchableOpacity
                  style={styles.favoriteBtn}
                  onPress={handleToggleFavorite}
                  disabled={isToggling}
                >
                  <Ionicons
                    name={localFavorite ? 'heart' : 'heart-outline'}
                    size={18}
                    color={localFavorite ? THEME.colors.primary : '#FFFFFF'}
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.heroBottom}>
              <Text style={styles.heroName}>{detail.name}</Text>
              <View style={styles.heroMeta}>
                <View style={styles.heroMetaItem}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.heroMetaText}>{detail.score}/100 Score</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quote Card */}
        <View style={styles.quoteCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={THEME.colors.primary} />
          <Text style={styles.quoteText}>{detail.matchQuote}</Text>
        </View>

        <View style={styles.divider} />

        {detail.matches.length > 0 && (
          <MatchSection matches={detail.matches} />
        )}

        {detail.stats.length > 0 && (
          <StatsSection stats={detail.stats} />
        )}

        {detail.amenities.length > 0 && (
          <AmenitiesSection amenities={detail.amenities} />
        )}

        {detail.insights.length > 0 && (
          <InsightsSection insights={detail.insights} />
        )}

        <MarketTrendsSection
          trends={detail.marketTrends}
          trendChange={detail.marketTrendChange}
        />

        <PriceWalkSection
          medianPrice={detail.medianPrice}
          walkScore={detail.walkScore}
          walkScoreLabel={detail.walkScoreLabel}
          lat={detail.lat}
          lng={detail.lng}
        />

        <SafetySection
          isLoggedIn={isLoggedIn}
          isLoading={safetyLoading}
          safety={safety}
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
  heroContainer: {
    height: 240,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    padding: THEME.spacing.lg,
    justifyContent: 'space-between',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taglineBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 4,
  },
  taglineText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  favoriteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    gap: THEME.spacing.xs,
  },
  heroName: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: THEME.fontWeight.bold,
    color: '#FFFFFF',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    fontSize: THEME.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
  },
  heroMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: THEME.spacing.sm,
    margin: THEME.spacing.lg,
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.primaryLight,
    borderRadius: THEME.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  quoteText: {
    flex: 1,
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.primary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
  },
});