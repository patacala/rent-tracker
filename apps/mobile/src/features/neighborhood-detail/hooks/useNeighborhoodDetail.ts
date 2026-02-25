import { useMemo } from 'react';
import { useAnalysis } from '@features/analysis/context/AnalysisContext';
import { useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { useAuth } from '@shared/context/AuthContext';
import { useGetNeighborhoodsQuery } from '@features/analysis/store/analysisApi';
import { mapNeighborhoodDetail } from '../utils/mapNeighborhoodDetail';
import type { NeighborhoodDetail } from '../types';

interface UseNeighborhoodDetailReturn {
  data: NeighborhoodDetail | null;
}

export function useNeighborhoodDetail(id: string): UseNeighborhoodDetailReturn {
  const { analysisResult } = useAnalysis();
  const { data: onboarding } = useOnboarding();
  const { isLoggedIn } = useAuth();

  const { data: apiNeighborhoods } = useGetNeighborhoodsQuery(undefined, {
    skip: !isLoggedIn,
  });

  const data = useMemo(() => {
    if (!id) return null;

    const contextSource = analysisResult?.neighborhoods ?? [];
    const apiSource = apiNeighborhoods?.neighborhoods ?? [];
    const source = contextSource.length > 0 ? contextSource : apiSource;

    const index = source.findIndex((e) => e.neighborhood.id === id);
    if (index === -1) return null;

    const entry = source[index];
    return mapNeighborhoodDetail(
      entry.neighborhood,
      entry.pois,
      onboarding,
      index,
    );
  }, [id, analysisResult, apiNeighborhoods, onboarding]);

  return { data };
}