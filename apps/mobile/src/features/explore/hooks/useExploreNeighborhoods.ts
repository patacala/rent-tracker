import { useMemo } from 'react';
import { useAnalysis } from '@features/analysis/context/AnalysisContext';
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
}

function calculateScore(poisCount: number): number {
  const baseScore = 70;
  const poiBonus = Math.min(poisCount * 2, 30);
  return Math.min(baseScore + poiBonus, 100);
}

export function useExploreNeighborhoods(): UseExploreNeighborhoodsReturn {
  const { analysisResult } = useAnalysis();

  const data = useMemo(() => {
    if (!analysisResult || analysisResult.neighborhoods.length === 0) {
      return [];
    }

    return analysisResult.neighborhoods.map((item, idx) => {
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
      };
    });
  }, [analysisResult]);

  return { data, isEmpty: data.length === 0 };
}
