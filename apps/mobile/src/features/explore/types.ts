export interface NeighborhoodListItem {
  id: string;
  name: string;
  score: number;
  tagline: string;
  tags: string[];
  matchCount: number;
  commuteMinutes: number;
}

export const EXPLORE_FILTERS = ['Best Match', 'Commute', 'Schools', 'Budget', 'Safety'] as const;
export type ExploreFilter = (typeof EXPLORE_FILTERS)[number];
