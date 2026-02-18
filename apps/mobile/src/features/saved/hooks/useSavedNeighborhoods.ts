import { useState, useCallback } from 'react';
import { MIAMI_CONFIG } from '@rent-tracker/config';
import type { SavedNeighborhood } from '../types';

const MOCK_SAVED: SavedNeighborhood[] = MIAMI_CONFIG.neighborhoods.slice(0, 3).map((n, idx) => ({
  id: n.id,
  name: n.name,
  city: 'Miami, FL',
  matchPercent: ([96, 88, 81] as const)[idx] ?? 80,
  tag: (['Safe for Families', 'Financial Hub', 'Arts District'] as const)[idx] ?? 'Neighborhood',
  avgPrice: (['$1.2M', '$890K', '$650K'] as const)[idx] ?? '$750K',
}));

interface UseSavedNeighborhoodsReturn {
  data: SavedNeighborhood[];
  remove: (id: string) => void;
}

export function useSavedNeighborhoods(): UseSavedNeighborhoodsReturn {
  const [data, setData] = useState<SavedNeighborhood[]>(MOCK_SAVED);

  const remove = useCallback((id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { data, remove };
}
