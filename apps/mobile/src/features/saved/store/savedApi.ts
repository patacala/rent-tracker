import { createApi } from '@reduxjs/toolkit/query/react';
import { NeighborhoodEntity } from '@shared/api/apiClient';
import { authenticatedBaseQuery } from '@shared/api/baseQuery';

export interface ToggleFavoriteResponse {
  isFavorite: boolean;
}

export interface GetFavoritesResponse {
  neighborhoods: NeighborhoodEntity[];
}

export const savedApi = createApi({
  reducerPath: 'savedApi',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['Favorites'],
  endpoints: (builder) => ({
    toggleFavorite: builder.mutation<ToggleFavoriteResponse, string>({
      query: (neighborhoodId) => ({
        url: `/favorites/${neighborhoodId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Favorites'],
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