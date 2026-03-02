import { useEffect, useMemo } from 'react';
import { useAnalysis } from '@features/analysis/context/AnalysisContext';
import { useAuth } from '@shared/context/AuthContext';
import { useGetNeighborhoodsQuery } from '@features/analysis/store/analysisApi';
import { OnboardingData, useOnboarding } from '@features/onboarding/context/OnboardingContext';
import {
  calculateWeightedScore,
  calculateCommuteScore,
  calculateAmenitiesScore,
  getEffectivePriorityTerms,
  isRelevantCategory,
  deriveScoreWeights,
} from '@rent-tracker/utils';
import { PRIORITY_TO_POI_CATEGORIES } from '@rent-tracker/config';
import type { NeighborhoodEntity, POIEntity } from '@features/analysis/store/analysisApi';
import type { NeighborhoodListItem } from '../types';

const TAGLINES = [
  'THE CITY BEAUTIFUL', 'FINANCIAL DISTRICT', 'ARTS DISTRICT',
  'BAYSIDE LIVING', 'CULTURAL HUB', 'DESIGN DISTRICT',
  'DOWNTOWN CORE', 'BEACH CITY', 'URBAN OASIS', 'HISTORIC CHARM',
];

interface UseExploreNeighborhoodsReturn {
  data: NeighborhoodListItem[];
  source: Array<{ neighborhood: NeighborhoodEntity; pois: POIEntity[]; isFavorite: boolean }>;
  isEmpty: boolean;
  isLoading: boolean;
  searchParams: { longitude: number; latitude: number; timeMinutes: number; mode: 'driving' | 'walking' | 'cycling' } | null;
}

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
  const categories = pois.map((p) => p.category.toLowerCase());
  const frequency = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});
  const uniqueCategories = Array.from(new Set(categories));
  const priorityTerms = getEffectivePriorityTerms(
    onboarding.priorities,
    onboarding.hasChildren === 'yes',
    onboarding.hasPets === 'yes',
  );
  const matched = uniqueCategories.filter((cat) => isRelevantCategory(cat, priorityTerms));
  const unmatched = uniqueCategories
    .filter((cat) => !isRelevantCategory(cat, priorityTerms))
    .sort((a, b) => (frequency[b] ?? 0) - (frequency[a] ?? 0));
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

export function useExploreNeighborhoods(): UseExploreNeighborhoodsReturn {
  const { isLoggedIn } = useAuth();
  const { analysisResult, setAnalysisResult, isHydrated } = useAnalysis();
  const { data: onboardingResult } = useOnboarding();

  const hasAnalysis = (analysisResult?.neighborhoods?.length ?? 0) > 0;

  const { data: apiNeighborhoods, isLoading } = useGetNeighborhoodsQuery(undefined, {
    skip: !isLoggedIn || !isHydrated || hasAnalysis,
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (!hasAnalysis && apiNeighborhoods?.neighborhoods?.length) {
      setAnalysisResult({ neighborhoods: apiNeighborhoods.neighborhoods });
    }
  }, [apiNeighborhoods, isHydrated]);

  const sourceAnalisys = useMemo(() => {
    return analysisResult?.neighborhoods ?? [];
  }, [analysisResult]);

  const data = useMemo(() => {
    if (sourceAnalisys.length === 0) return [];
    return sourceAnalisys.map((item, idx) => ({
      id: item.neighborhood.id,
      name: item.neighborhood.name,
      score: calculateScoreFromPOIs(item.pois, onboardingResult),
      tagline: TAGLINES[idx % TAGLINES.length] ?? 'NEIGHBORHOOD',
      tags: buildTags(item.pois, onboardingResult),
      matchCount: countMatches(item.pois, onboardingResult),
      commuteMinutes: onboardingResult.commute,
      photoUrl: item.neighborhood.photoUrl ?? null,
      isFavorite: item.isFavorite,
    }));
  }, [sourceAnalisys, onboardingResult]);

  return {
    data,
    source: sourceAnalisys,
    isEmpty: data.length === 0,
    isLoading: isLoading && !hasAnalysis,
    searchParams: apiNeighborhoods?.searchParams ?? null,
  };
}