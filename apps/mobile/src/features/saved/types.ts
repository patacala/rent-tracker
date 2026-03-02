export interface SavedNeighborhood {
  id: string;
  name: string;
  city: string;
  matchPercent: number;
  tag: string;
  avgPrice: string;
}

export const SORT_OPTIONS = ['Highest Match', 'Most Matches', 'Shortest Commute'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
