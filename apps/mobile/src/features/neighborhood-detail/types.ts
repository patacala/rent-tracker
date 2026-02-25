import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export interface NeighborhoodMatch {
  label: string;
  value: number;
}

export interface NeighborhoodStat {
  icon: IoniconsName;
  value: string;
  description: string;
}

export interface NeighborhoodAmenity {
  icon: IoniconsName;
  name: string;
  distance: string;
}

export interface NeighborhoodInsight {
  variant: 'success' | 'warning' | 'info';
  title: string;
  description: string;
}

export interface MarketTrendBar {
  label: string;
  value: number;
  highlighted: boolean;
}

export interface NeighborhoodDetail {
  id: string;
  name: string;
  score: number;
  tagline: string;
  matchQuote: string;
  matches: NeighborhoodMatch[];
  stats: NeighborhoodStat[];
  amenities: NeighborhoodAmenity[];
  insights: NeighborhoodInsight[];
  marketTrends: MarketTrendBar[];
  marketTrendChange: string;
  medianPrice: string;
  walkScore: number;
  walkScoreLabel: string;
  safetyGrade: string;
  safetyRank: string;
  crimeComparison: string;
  crimeYoY: string;
  crimeYoYValue: number;
  lat: number;
  lng: number;
  photoUrl?: string | null;
}
