import { useMemo } from 'react';
import { useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { useNeighborhoodCache } from '@shared/context/NeighborhoodCacheContext';
import { mapNeighborhoodDetail } from '../utils/mapNeighborhoodDetail';
import type { NeighborhoodDetail } from '../types';

interface UseNeighborhoodDetailReturn {
  data: NeighborhoodDetail | null;
}

export function useNeighborhoodDetail(id: string): UseNeighborhoodDetailReturn {
  const { get } = useNeighborhoodCache();
  const { data: onboarding } = useOnboarding();

  const data = useMemo(() => {
    if (!id) return null;

    const cached = get(id);
    if (!cached) return null;

    return mapNeighborhoodDetail(
      cached.neighborhood,
      cached.pois,
      onboarding,
      0,
    );
  }, [id, onboarding]);

  return { data };
}