import { useState } from 'react';
import { MIAMI_CONFIG } from '@rent-tracker/config';
import type { NeighborhoodPreview } from '../types';

const MOCK_PREVIEWS: NeighborhoodPreview[] = MIAMI_CONFIG.neighborhoods.slice(0, 5).map(
  (n, idx) => ({
    id: n.id,
    name: n.name,
    city: 'Miami, FL',
    score: 94 - idx * 3,
    tags: [
      ['Excellent Nightlife', 'Creative Hub'],
      ['Safe for Families', 'Top Schools'],
      ['Walkable', 'Financial Hub'],
      ['Lush Greenery', 'Bohemian'],
      ['Diverse', 'Affordable'],
    ][idx] ?? [],
    commuteMinutes: 15 + idx * 3,
    lat: n.lat,
    lng: n.lng,
  }),
);

interface UseMapNeighborhoodsReturn {
  data: NeighborhoodPreview[];
}

export function useMapNeighborhoods(): UseMapNeighborhoodsReturn {
  const [data] = useState<NeighborhoodPreview[]>(MOCK_PREVIEWS);
  return { data };
}
