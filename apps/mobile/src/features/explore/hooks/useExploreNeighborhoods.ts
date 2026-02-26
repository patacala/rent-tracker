import { useMemo } from 'react';
import { useAnalysis } from '@features/analysis/context/AnalysisContext';
import { useAuth } from '@shared/context/AuthContext';
import { useGetNeighborhoodsQuery } from '@features/analysis/store/analysisApi';
import { useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { calculateWeightedScore } from '@rent-tracker/utils';
import type { POIEntity } from '@features/analysis/store/analysisApi';
import type { OnboardingData } from '@features/onboarding/context/OnboardingContext';
import type { NeighborhoodListItem } from '../types';

const TAGLINES = [
  'THE CITY BEAUTIFUL',
  'FINANCIAL DISTRICT',
  'ARTS DISTRICT',
  'BAYSIDE LIVING',
  'CULTURAL HUB',
  'DESIGN DISTRICT',
  'DOWNTOWN CORE',
  'BEACH CITY',
  'URBAN OASIS',
  'HISTORIC CHARM',
];

const PRIORITY_CATEGORY_MAP: Record<string, string[]> = {
  commute: ['transit'],
  schools: ['school'],
  safety: ['hospital', 'police'],
  dining: ['bar', 'restaurant'],
  parks: ['park'],
  shopping: ['shop', 'grocery'],
  healthcare: ['hospital', 'medical'],
  transit: ['transit', 'bus'],
};

interface UseExploreNeighborhoodsReturn {
  data: NeighborhoodListItem[];
  isEmpty: boolean;
  isLoading: boolean;
  searchParams: { longitude: number; latitude: number; timeMinutes: number; mode: 'driving' | 'walking' | 'cycling' } | null;
}

function calculateScoreFromPOIs(pois: POIEntity[], onboarding: OnboardingData): number {
  const categories = pois.map((p) => p.category.toLowerCase());

  // Commute score: 100 si commute=15, 50 si commute=45
  const commuteScore = Math.max(0, Math.min(100, 100 - (onboarding.commute - 15) * (50 / 30)));

  // Amenities score: diversidad + cantidad de POIs
  const uniqueCategories = new Set(categories).size;
  const amenitiesScore = Math.min(100, uniqueCategories * 12 + pois.length * 1.5);

  // Family score: basado en priorities del usuario + hasChildren + hasPets
  const autoPriorities: string[] = [];
  if (onboarding.hasChildren === 'yes') autoPriorities.push('school', 'park');
  if (onboarding.hasPets === 'yes') autoPriorities.push('park');

  const relevantCategories = [
    ...onboarding.priorities.flatMap((p) => PRIORITY_CATEGORY_MAP[p] ?? []),
    ...autoPriorities,
  ];

  const familyPOIs = categories.filter((c) => relevantCategories.includes(c)).length;
  const familyScore = Math.min(100, familyPOIs * 20);

  return calculateWeightedScore({
    commute: Math.round(commuteScore),
    amenities: Math.round(amenitiesScore),
    family: Math.round(familyScore),
  });
}

export function useExploreNeighborhoods(): UseExploreNeighborhoodsReturn {
  const { isLoggedIn } = useAuth();
  const { analysisResult } = useAnalysis();
  const { data: onboarding } = useOnboarding();

  const { data: apiNeighborhoods, isLoading } = useGetNeighborhoodsQuery(undefined, {
    skip: !isLoggedIn,
  });

  const source = useMemo(() => {
    if (analysisResult?.neighborhoods?.length) return analysisResult.neighborhoods;
    if (isLoggedIn && apiNeighborhoods?.neighborhoods?.length) return apiNeighborhoods.neighborhoods;
    return [];
  }, [analysisResult, apiNeighborhoods, isLoggedIn]);

  const data = useMemo(() => {
    if (source.length === 0) return [];

    return source.map((item, idx) => {
      const uniqueCategories = Array.from(
        new Set(item.pois.map((p) => p.category.toUpperCase()))
      );

      const score = calculateScoreFromPOIs(item.pois, onboarding);

      return {
        id: item.neighborhood.id,
        name: item.neighborhood.name,
        score,
        tagline: TAGLINES[idx % TAGLINES.length] ?? 'NEIGHBORHOOD',
        tags: uniqueCategories.slice(0, 3),
        matchCount: Math.max(1, Math.floor(item.pois.length / 3)),
        commuteMinutes: onboarding.commute,
        photoUrl: item.neighborhood.photoUrl ?? null,
      };
    });
  }, [source, onboarding]);

  return {
    data,
    isEmpty: data.length === 0,
    isLoading,
    searchParams: apiNeighborhoods?.searchParams ?? null,
  };
}