import { useGetFavoritesQuery, useToggleFavoriteMutation } from '@features/saved/store/savedApi';
import { useToast } from '@shared/context/ToastContext';
import { useOnboarding } from '@features/onboarding/context/OnboardingContext';
import {
  calculateWeightedScore,
  calculateCommuteScore,
  calculateAmenitiesScore,
  getEffectivePriorityTerms,
  isRelevantCategory,
  deriveScoreWeights,
} from '@rent-tracker/utils';
import { PRIORITY_TO_POI_CATEGORIES } from '@rent-tracker/config';
import type { POIEntity } from '@features/analysis/store/analysisApi';
import type { OnboardingData } from '@features/onboarding/context/OnboardingContext';
import type { NeighborhoodListItem } from '@features/explore/types';
import { useMemo } from 'react';
import { NeighborhoodCacheEntry } from '@shared/context/NeighborhoodCacheContext';
import { useAnalysis } from '@features/analysis/context/AnalysisContext';

function calculateScoreFromPOIs(pois: POIEntity[], onboarding: OnboardingData): number {
  const categories = pois.map((p) => p.category.toLowerCase());
  const priorityTerms = getEffectivePriorityTerms(
    onboarding.priorities,
    onboarding.hasChildren === 'yes',
    onboarding.hasPets === 'yes',
  );
  const totalKnownCategories = new Set(
    Object.values(PRIORITY_TO_POI_CATEGORIES).flat(),
  ).size;

  const commuteScore     = calculateCommuteScore(onboarding.commute);
  const amenitiesScore   = calculateAmenitiesScore(
    new Set(categories).size,
    pois.length,
    totalKnownCategories,
  );
  const relevantPOIs     = categories.filter((c) => isRelevantCategory(c, priorityTerms)).length;
  const priorityMatchScore = pois.length > 0
    ? Math.round((relevantPOIs / pois.length) * 100)
    : 0;

  const weights = deriveScoreWeights(onboarding.priorities.length, onboarding.commute);
  return calculateWeightedScore(
    { commute: commuteScore, priorityMatch: priorityMatchScore, amenities: amenitiesScore },
    weights,
  );
}

function buildTags(pois: POIEntity[], onboarding: OnboardingData): string[] {
  const uniqueCategories = Array.from(new Set(pois.map((p) => p.category.toLowerCase())));
  const priorityTerms = getEffectivePriorityTerms(
    onboarding.priorities,
    onboarding.hasChildren === 'yes',
    onboarding.hasPets === 'yes',
  );
  const matched = uniqueCategories.filter((cat) => isRelevantCategory(cat, priorityTerms));
  const unmatched = uniqueCategories.filter((cat) => !isRelevantCategory(cat, priorityTerms));
  return [...matched, ...unmatched]
    .slice(0, 8)
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1));
}

function countMatches(pois: POIEntity[], onboarding: OnboardingData): number {
  const categories = pois.map((p) => p.category.toLowerCase());
  const priorityTerms = getEffectivePriorityTerms(
    onboarding.priorities,
    onboarding.hasChildren === 'yes',
    onboarding.hasPets === 'yes',
  );
  const uniqueMatched = new Set(
    categories.filter((cat) => isRelevantCategory(cat, priorityTerms)),
  );
  return 1 + uniqueMatched.size;
}

interface UseSavedNeighborhoodsReturn {
  data: NeighborhoodListItem[];
  source: NeighborhoodCacheEntry[];
  remove: (id: string) => void;
  isLoading: boolean;
}

export function useSavedNeighborhoods(): UseSavedNeighborhoodsReturn {
  const toast = useToast();
  const { data: favoritesData, isLoading } = useGetFavoritesQuery();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const { data: onboarding } = useOnboarding();
  const { updateFavorite } = useAnalysis();

  const data = useMemo(() => {
    if (!favoritesData?.neighborhoods?.length) return [];

    return favoritesData.neighborhoods.map((entry) => ({
      id: entry.neighborhood.id,
      name: entry.neighborhood.name,
      score: calculateScoreFromPOIs(entry.pois, onboarding),
      tags: buildTags(entry.pois, onboarding),
      matchCount: countMatches(entry.pois, onboarding),
      commuteMinutes: onboarding.commute,
      photoUrl: entry.neighborhood.photoUrl ?? null,
      isFavorite: true,
    }));
  }, [favoritesData, onboarding]);

  const remove = async (id: string) => {
    updateFavorite(id, false);
    try {
      await toggleFavorite(id).unwrap();
      toast.success('Removed from favorites');
    } catch {
      updateFavorite(id, true);
      toast.error('Something went wrong, please try again');
    }
  };

  const source: NeighborhoodCacheEntry[] = useMemo(() => {
    if (!favoritesData?.neighborhoods?.length) return [];
    return favoritesData.neighborhoods.map((entry) => ({
      neighborhood: entry.neighborhood,
      pois: entry.pois,
      isFavorite: true,
    }));
  }, [favoritesData]);

  return { data, source, remove, isLoading };
}