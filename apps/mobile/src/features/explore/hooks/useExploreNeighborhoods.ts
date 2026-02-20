import { useState } from 'react';
import { MIAMI_CONFIG } from '@rent-tracker/config';
import type { NeighborhoodListItem } from '../types';

const MOCK_ITEMS: NeighborhoodListItem[] = MIAMI_CONFIG.neighborhoods.map((n, idx) => ({
  id: n.id,
  name: n.name,
  score: 94 - idx * 3,
  tagline: [
    'THE CITY BEAUTIFUL',
    'FINANCIAL DISTRICT',
    'ARTS DISTRICT',
    'BAYSIDE LIVING',
    'CULTURAL HUB',
    'DESIGN DISTRICT',
    'DOWNTOWN CORE',
    'BEACH CITY',
  ][idx] ?? 'NEIGHBORHOOD',
  tags: [
    ['SAFE FOR FAMILIES', 'TOP SCHOOLS', 'WALKABLE'],
    ['WALKABLE', 'FINANCIAL HUB', 'PET FRIENDLY'],
    ['CULTURE', 'NIGHTLIFE', 'COFFEE SHOPS'],
    ['LUSH GREENERY', 'BOHEMIAN', 'BOATING'],
    ['DIVERSE', 'AUTHENTIC', 'AFFORDABLE'],
    ['ARTS', 'DESIGN', 'GALLERIES'],
    ['URBAN', 'TRANSIT', 'VIBRANT'],
    ['BEACH ACCESS', 'NIGHTLIFE', 'HOTELS'],
  ][idx] ?? [],
  matchCount: 12 - idx,
  commuteMinutes: 15 + idx * 3,
}));

interface UseExploreNeighborhoodsReturn {
  data: NeighborhoodListItem[];
}

export function useExploreNeighborhoods(): UseExploreNeighborhoodsReturn {
  const [data] = useState<NeighborhoodListItem[]>(MOCK_ITEMS);
  return { data };
}
