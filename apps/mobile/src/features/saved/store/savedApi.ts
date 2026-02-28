import { createApi } from '@reduxjs/toolkit/query/react';
import { authenticatedBaseQuery } from '@shared/api/baseQuery';
import type { NeighborhoodEntry } from '@features/analysis/store/analysisApi';

export interface ToggleFavoriteResponse {
  isFavorite: boolean;
}

export interface GetFavoritesResponse {
  neighborhoods: NeighborhoodEntry[];
}

export const savedApi = createApi({
  reducerPath: 'savedApi',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['Favorites', 'Neighborhoods'],
  endpoints: (builder) => ({
    toggleFavorite: builder.mutation<ToggleFavoriteResponse, string>({
      query: (neighborhoodId) => ({
        url: `/favorites/${neighborhoodId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Favorites', 'Neighborhoods']
    }),
    getFavorites: builder.query<GetFavoritesResponse, void>({
      query: () => ({
        url: '/favorites',
        method: 'GET',
      }),
      providesTags: ['Favorites'],
    }),
  }),
});

export const { useToggleFavoriteMutation, useGetFavoritesQuery } = savedApi;