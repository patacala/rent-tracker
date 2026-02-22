import { createApi } from '@reduxjs/toolkit/query/react';
import { authenticatedBaseQuery } from '@shared/api/baseQuery';

export interface SaveOnboardingRequest {
  workAddress: string;
  commute: number;
  priorities: string[];
  hasChildren: string;
  childAgeGroups: string[];
  hasPets: string;
  lifestyle?: string;
}

export interface OnboardingProfile extends SaveOnboardingRequest {
  id: string;
  userId: string;
}

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['Onboarding'],
  endpoints: (builder) => ({
    saveOnboarding: builder.mutation<void, SaveOnboardingRequest>({
      query: (body) => ({
        url: '/onboarding',
        method: 'POST',
        body,
      }),
    }),
    updateOnboarding: builder.mutation<void, SaveOnboardingRequest>({
      query: (body) => ({
        url: '/onboarding',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Onboarding'],
    }),
    getOnboarding: builder.query<OnboardingProfile | null, void>({
      query: () => ({
        url: '/onboarding',
        method: 'GET',
      }),
      providesTags: ['Onboarding'],
    }),
  }),
});

export const {
  useSaveOnboardingMutation,
  useUpdateOnboardingMutation,
  useGetOnboardingQuery,
  useLazyGetOnboardingQuery,
} = onboardingApi;