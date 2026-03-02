export interface NeighborhoodPreview {
  id: string;
  name: string;
  city: string;
  score: number;
  tags: string[];
  commuteMinutes: number;
  lat: number;
  lng: number;
  photoUrl: string | null;
}

export const MAP_FILTERS = ['Commute', 'Safety', 'Schools', 'Budget'] as const;
export type MapFilter = (typeof MAP_FILTERS)[number];
