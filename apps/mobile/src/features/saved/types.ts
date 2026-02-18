export interface SavedNeighborhood {
  id: string;
  name: string;
  city: string;
  matchPercent: number;
  tag: string;
  avgPrice: string;
}

export const SORT_OPTIONS = ['Highest Match', 'Price', 'Recently Added'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
