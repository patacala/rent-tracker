import { createApi } from '@reduxjs/toolkit/query/react';
import { authenticatedBaseQuery } from '@shared/api/baseQuery';

export interface CrimeBreakdown {
  overall: string;
  assault?: string;
  theft?: string;
  robbery?: string;
  burglary?: string;
}

export interface CrimeIncident {
  type: string;
  date: string;
  address: string;
  distance_feet: number;
  lat: number;
  lng: number;
}

export interface NeighborhoodSafetyData {
  id: string;
  neighborhoodName: string;
  crimeScore: string;
  crimeNumeric: number;
  crimeDescription: string;
  crimeBreakdown: CrimeBreakdown;
  incidents: {
    radius_feet: number;
    date_from: string;
    date_to: string;
    count: number;
    data: CrimeIncident[];
  };
  cachedAt: string;
}

export interface GetNeighborhoodSafetyResponse {
  success: boolean;
  data: NeighborhoodSafetyData;
}

export interface GetNeighborhoodSafetyRequest {
  neighborhoodId: string;
  lat: number;
  lng: number;
}

export const safetyApi = createApi({
  reducerPath: 'safetyApi',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['Safety'],
  endpoints: (builder) => ({
    getNeighborhoodSafety: builder.query<GetNeighborhoodSafetyResponse, GetNeighborhoodSafetyRequest>({
      query: ({ neighborhoodId, lat, lng }) => ({
        url: `/safety/neighborhood`,
        method: 'GET',
        params: { neighborhoodId, lat, lng },
      }),
      providesTags: (_result, _error, { neighborhoodId, }) => [
        { type: 'Safety', id: neighborhoodId, },
      ],
    }),
  }),
});

export const {
  useGetNeighborhoodSafetyQuery,
  useLazyGetNeighborhoodSafetyQuery,
} = safetyApi;