import { useGetFavoritesQuery, useToggleFavoriteMutation } from '@features/saved/store/savedApi';
import { useToast } from '@shared/context/ToastContext';
import { useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { calculateWeightedScore } from '@rent-tracker/utils';
import type { POIEntity } from '@features/analysis/store/analysisApi';
import type { OnboardingData } from '@features/onboarding/context/OnboardingContext';
import type { NeighborhoodListItem } from '@features/explore/types';
import { useMemo } from 'react';
import { NeighborhoodCacheEntry } from '@shared/context/NeighborhoodCacheContext';
import { useAnalysis } from '@features/analysis/context/AnalysisContext';

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

function countMatches(pois: POIEntity[], onboarding: OnboardingData): number {
  const categories = pois.map((p) => p.category.toLowerCase());
  let count = 1;
  const priorities = onboarding.priorities.flatMap(
    (p) => PRIORITY_TO_POI_CATEGORIES[p.toLowerCase()] ?? [p.toLowerCase()]
  );
  for (const priority of priorities) {
    const term = priority.toLowerCase();
    if (categories.some((cat) => cat.includes(term) || term.includes(cat))) count++;
  }
  if (onboarding.hasChildren === 'yes' && !onboarding.priorities.includes('schools')) {
    if (categories.some((c) => c.includes('school'))) count++;
  }
  if (onboarding.hasPets === 'yes' && !onboarding.priorities.includes('parks')) {
    if (categories.some((c) => c.includes('park'))) count++;
  }
  return count;
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

    return favoritesData.neighborhoods.map((entry, idx) => ({
      id: entry.neighborhood.id,
      name: entry.neighborhood.name,
      score: calculateScoreFromPOIs(entry.pois, onboarding),
      tagline: TAGLINES[idx % TAGLINES.length] ?? 'NEIGHBORHOOD',
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