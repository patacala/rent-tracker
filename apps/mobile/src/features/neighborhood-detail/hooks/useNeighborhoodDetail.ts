import { useState } from 'react';
import { getNeighborhoodDetail } from '../data';
import type { NeighborhoodDetail } from '../types';

interface UseNeighborhoodDetailReturn {
  data: NeighborhoodDetail | null;
}

export function useNeighborhoodDetail(id: string): UseNeighborhoodDetailReturn {
  const [data] = useState<NeighborhoodDetail | null>(() =>
    id ? getNeighborhoodDetail(id) : null,
  );
  return { data };
}
