export interface NeighborhoodListItem {
  id: string;
  name: string;
  score: number;
  tags: string[];
  matchCount: number;
  commuteMinutes: number;
  photoUrl: string | null;
  isFavorite: boolean;
}

export const STATIC_FILTERS = ['All'] as const;
export type ExploreFilter = string;
