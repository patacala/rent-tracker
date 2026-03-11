import { useMemo } from 'react';
import { APP_CONFIG, PRIORITY_TO_POI_CATEGORIES } from '@rent-tracker/config';
import { POIEntity, useAnalysis } from '@features/analysis/context/AnalysisContext';
import { OnboardingData, useOnboarding } from '@features/onboarding/context/OnboardingContext';
import type { NeighborhoodPreview } from '../types';
import {
  calculateAmenitiesScore,
  calculateCommuteScore,
  calculateWeightedScore,
  deriveScoreWeights,
  getEffectivePriorityTerms,
  isRelevantCategory,
} from '@rent-tracker/utils';

interface UseMapNeighborhoodsReturn {
  data: NeighborhoodPreview[];
  isochrone: any | null;
  center: [number, number];
  source: Array<{
    neighborhood: any;
    pois: any[];
    isFavorite: boolean;
  }>;
}

function computeCenter(
  isochrone: any | null,
  neighborhoods: NeighborhoodPreview[],
): [number, number] {
  if (isochrone?.coordinates?.[0]?.length) {
    const ring: number[][] = isochrone.coordinates[0];
    let minLng = Infinity,
      maxLng = -Infinity;
    let minLat = Infinity,
      maxLat = -Infinity;
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
    return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
  }

  if (neighborhoods.length > 0) {
    const avgLng = neighborhoods.reduce((s, n) => s + n.lng, 0) / neighborhoods.length;
    const avgLat = neighborhoods.reduce((s, n) => s + n.lat, 0) / neighborhoods.length;
    return [avgLng, avgLat];
  }

  return [
    APP_CONFIG.defaultCity === 'miami' ? -80.1918 : 0,
    APP_CONFIG.defaultCity === 'miami' ? 25.7617 : 0,
  ];
}

function calculateScoreFromPOIs(pois: POIEntity[], onboarding: OnboardingData): number {
  const categories = pois.map((p) => p.category.toLowerCase());
  const priorityTerms = getEffectivePriorityTerms(
    onboarding.priorities,
    onboarding.hasChildren === 'yes',
    onboarding.hasPets === 'yes',
  );
  const totalKnownCategories = new Set(Object.values(PRIORITY_TO_POI_CATEGORIES).flat()).size;

  const commuteScore = calculateCommuteScore(onboarding.commute);
  const amenitiesScore = calculateAmenitiesScore(
    new Set(categories).size,
    pois.length,
    totalKnownCategories,
  );

  const uniqueRelevantCategories = new Set(
    categories.filter((c) => isRelevantCategory(c, priorityTerms)),
  ).size;
  const totalPriorityCategories = priorityTerms.length > 0 ? priorityTerms.length : 1;
  const priorityMatchScore = Math.round((uniqueRelevantCategories / totalPriorityCategories) * 100);

  const weights = deriveScoreWeights(onboarding.priorities.length, onboarding.commute);
  return calculateWeightedScore(
    { commute: commuteScore, priorityMatch: priorityMatchScore, amenities: amenitiesScore },
    weights,
  );
}

export function useMapNeighborhoods(): UseMapNeighborhoodsReturn {
  const { analysisResult } = useAnalysis();
  const { data: onboardingResult } = useOnboarding();

  const source = useMemo(() => {
    const raw = analysisResult?.neighborhoods ?? [];
    // Deduplica por id por si acaso
    const seen = new Set<string>();
    return raw.filter((item) => {
      if (seen.has(item.neighborhood.id)) return false;
      seen.add(item.neighborhood.id);
      return true;
    });
  }, [analysisResult]);

  const isochrone = analysisResult?.isochrone ?? null;

  const data = useMemo<NeighborhoodPreview[]>(
    () =>
      source.map((item) => {
        const uniqueCategories = Array.from(
          new Set(
            item.pois.map(
              (p) => p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase(),
            ),
          ),
        ).slice(0, 3);

        return {
          id: item.neighborhood.id,
          name: item.neighborhood.name,
          city: APP_CONFIG.defaultCity.charAt(0).toUpperCase() + APP_CONFIG.defaultCity.slice(1),
          score: calculateScoreFromPOIs(item.pois, onboardingResult),
          tags: uniqueCategories,
          commuteMinutes: onboardingResult.commute,
          lat: (item.neighborhood as any).centerLat ?? 0,
          lng: (item.neighborhood as any).centerLng ?? 0,
          photoUrl: item.neighborhood.photoUrl ?? null,
        };
      }),
    [source, onboardingResult],
  );

  const center = useMemo(() => computeCenter(isochrone, data), [isochrone, data]);
  return { data, isochrone, center, source };
}
