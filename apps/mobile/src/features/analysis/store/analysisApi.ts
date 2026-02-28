import { createApi } from '@reduxjs/toolkit/query/react';
import { authenticatedBaseQuery } from '@shared/api/baseQuery';

export interface NeighborhoodEntity {
  id: string;
  name: string;
  boundary: GeoJSON.Polygon;
  source: 'mapbox_tilequery' | 'mapbox_boundaries' | 'osm_overpass' | 'static_miami_config' | 'manual';
  centerLat: number;
  centerLng: number;
  score?: number; 
  photoUrl?: string | null;
  cachedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface POIEntity {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
}

export interface NeighborhoodEntry {
  neighborhood: NeighborhoodEntity;
  pois: POIEntity[];
  isFavorite: boolean;
}

export interface MyAnalysisResponse {
  analyzedAt: string | null;
  neighborhoods: NeighborhoodEntry[];
  searchParams: {
    longitude: number;
    latitude: number;
    timeMinutes: number;
    mode: 'driving' | 'walking' | 'cycling';
  } | null;
}

export interface NeighborhoodUIItem {
  id: string;
  name: string;
  score: number;
  tagline: string;
  tags: string[];
  matchCount: number;
  photoUrl?: string | null;
}

export const analysisApi = createApi({
  reducerPath: 'analysisApi',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['Neighborhoods', 'Favorites'],
  endpoints: (builder) => ({
    getNeighborhoods: builder.query<MyAnalysisResponse, void>({
      query: () => ({
        url: '/neighborhoods/my-analysis',
        method: 'GET',
      }),
      providesTags: ['Neighborhoods', 'Favorites'],
    }),
  }),
});

export const { useGetNeighborhoodsQuery } = analysisApi;