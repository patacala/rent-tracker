import { useMemo } from 'react';
import { useAnalysis } from '@features/analysis/context/AnalysisContext';
import { useAuth } from '@shared/context/AuthContext';
import { useGetNeighborhoodsQuery } from '@features/analysis/store/analysisApi';
import { OnboardingData, useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { calculateWeightedScore } from '@rent-tracker/utils';
import type { NeighborhoodEntity, POIEntity } from '@features/analysis/store/analysisApi';
import type { NeighborhoodListItem } from '../types';

const TAGLINES = [
  'THE CITY BEAUTIFUL', 'FINANCIAL DISTRICT', 'ARTS DISTRICT',
  'BAYSIDE LIVING', 'CULTURAL HUB', 'DESIGN DISTRICT',
  'DOWNTOWN CORE', 'BEACH CITY', 'URBAN OASIS', 'HISTORIC CHARM',
];

const PRIORITY_TO_POI_CATEGORIES: Record<string, string[]> = {
  healthcare: ['hospital', 'medical'],
  dining: ['restaurant', 'bar', 'cafe'],
  schools: ['school'],
  parks: ['park'],
  shopping: ['shop', 'supermarket'],
  transit: ['transit', 'bus'],
  commute: ['transit'],
  safety: ['hospital', 'police'],
};

interface UseExploreNeighborhoodsReturn {
  data: NeighborhoodListItem[];
  source: Array<{ neighborhood: NeighborhoodEntity; pois: POIEntity[]; isFavorite: boolean }>;
  isEmpty: boolean;
  isLoading: boolean;
  searchParams: { longitude: number; latitude: number; timeMinutes: number; mode: 'driving' | 'walking' | 'cycling' } | null;
}

function calculateScoreFromPOIs(pois: POIEntity[], onboarding: OnboardingData): number {
  const categories = pois.map((p) => p.category.toLowerCase());
  const commuteScore = Math.max(0, Math.min(100, 100 - (onboarding.commute - 15) * (50 / 30)));

  const uniqueCategories = new Set(categories).size;
  const amenitiesScore = Math.min(100, uniqueCategories * 12 + pois.length * 1.5);

  const autoPriorities: string[] = [];
  if (onboarding.hasChildren === 'yes') autoPriorities.push('school', 'park');
  if (onboarding.hasPets === 'yes') autoPriorities.push('park');

  const userPriorityTerms = [
    ...onboarding.priorities.map((p) => p.toLowerCase()),
    ...autoPriorities,
  ];

  const familyPOIs = categories.filter((cat) =>
    userPriorityTerms.some((term) => cat.includes(term) || term.includes(cat))
  ).length;

  const familyScore = Math.min(100, familyPOIs * 20);

  return calculateWeightedScore({
    commute: Math.round(commuteScore),
    amenities: Math.round(amenitiesScore),
    family: Math.round(familyScore),
  });
}

function buildTags(pois: POIEntity[], onboarding: OnboardingData): string[] {
  const uniqueCategories = Array.from(new Set(pois.map((p) => p.category.toLowerCase())));

  const priorities = onboarding.priorities.flatMap(
    (p) => PRIORITY_TO_POI_CATEGORIES[p.toLowerCase()] ?? [p.toLowerCase()]
  );

  const userPriorityTerms = [
    ...priorities.map((p) => p.toLowerCase()),
    ...(onboarding.hasChildren === 'yes' ? ['school', 'park'] : []),
    ...(onboarding.hasPets === 'yes' ? ['park'] : []),
  ];

  const matched = uniqueCategories.filter((cat) =>
    userPriorityTerms.some((term) => cat.includes(term) || term.includes(cat))
  );

  const unmatched = uniqueCategories.filter((cat) =>
    !userPriorityTerms.some((term) => cat.includes(term) || term.includes(cat))
  );

  return [...matched, ...unmatched]
    .slice(0, 8)
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1));
}

export function useExploreNeighborhoods(): UseExploreNeighborhoodsReturn {
  const { isLoggedIn } = useAuth();
  const { analysisResult } = useAnalysis();
  const { data: onboardingResult } = useOnboarding();

  const { data: apiNeighborhoods, isLoading } = useGetNeighborhoodsQuery(undefined, {
    skip: !isLoggedIn || (analysisResult?.neighborhoods?.length ?? 0) > 0
  });

  const sourceAnalisys = useMemo(() => {
    if (analysisResult?.neighborhoods?.length) return analysisResult.neighborhoods;
    if (isLoggedIn && apiNeighborhoods?.neighborhoods?.length) return apiNeighborhoods.neighborhoods;
    return [];
  }, [analysisResult, apiNeighborhoods, isLoggedIn]);

  function countMatches(pois: POIEntity[], onboarding: OnboardingData): number {
    let count = 1; 
    const categories = pois.map((p) => p.category.toLowerCase());

    const priorities = onboarding.priorities.flatMap(
      (p) => PRIORITY_TO_POI_CATEGORIES[p.toLowerCase()] ?? [p.toLowerCase()]
    );

    for (const priority of priorities) {
      const term = priority.toLowerCase();
      const hasMatch = categories.some((cat) => cat.includes(term) || term.includes(cat));
      if (hasMatch) count++;
    }

    if (onboarding.hasChildren === 'yes' && !onboarding.priorities.includes('schools')) {
      const hasSchools = categories.some((c) => c.includes('school') || 'school'.includes(c));
      if (hasSchools) count++;
    }

    if (onboarding.hasPets === 'yes' && !onboarding.priorities.includes('parks')) {
      const hasParks = categories.some((c) => c.includes('park') || 'park'.includes(c));
      if (hasParks) count++;
    }

    return count;
  }

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
    isLoading,
    searchParams: apiNeighborhoods?.searchParams ?? null,
  };
}