import { useMemo } from 'react';
import { useAnalysis } from '@features/analysis/context/AnalysisContext';
import { useAuth } from '@shared/context/AuthContext';
import { useGetNeighborhoodsQuery } from '@features/analysis/store/analysisApi';
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

interface UseExploreNeighborhoodsReturn {
  data: NeighborhoodListItem[];
  isEmpty: boolean;
  isLoading: boolean;
}

function calculateScore(poisCount: number): number {
  const baseScore = 70;
  const poiBonus = Math.min(poisCount * 2, 30);
  return Math.min(baseScore + poiBonus, 100);
}

export function useExploreNeighborhoods(): UseExploreNeighborhoodsReturn {
  const { isLoggedIn } = useAuth();
  const { analysisResult } = useAnalysis();

  const { data: apiNeighborhoods, isLoading } = useGetNeighborhoodsQuery(undefined, {
    skip: !isLoggedIn,
  });

  const source = isLoggedIn
    ? apiNeighborhoods?.neighborhoods ?? []
    : analysisResult?.neighborhoods ?? [];

  const data = useMemo(() => {
    if (source.length === 0) return [];

    return source.map((item, idx) => {
      const uniqueCategories = Array.from(
        new Set(item.pois.map((p) => p.category.toUpperCase())),
      );

      const score = item.neighborhood.score ?? calculateScore(item.pois.length);

      return {
        id: item.neighborhood.id,
        name: item.neighborhood.name,
        score,
        tagline: TAGLINES[idx % TAGLINES.length] ?? 'NEIGHBORHOOD',
        tags: uniqueCategories.slice(0, 3),
        matchCount: Math.max(1, Math.floor(item.pois.length / 3)),
        commuteMinutes: 15 + idx * 2,
        photoUrl: item.neighborhood.photoUrl ?? null,
      };
    });
  }, [source]);

  return { data, isEmpty: data.length === 0, isLoading };
}