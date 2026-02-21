import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@shared/api/baseUrl';

export interface SaveOnboardingRequest {
  token: string;
  workAddress: string;
  commute: number;
  priorities: string[];
  hasChildren: string;
  childAgeGroups: string[];
  hasPets: string;
  lifestyle?: string;
}

export interface OnboardingProfile extends Omit<SaveOnboardingRequest, 'token'> {
  id: string;
  userId: string;
}

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    saveOnboarding: builder.mutation<void, SaveOnboardingRequest>({
      query: ({ token, ...body }) => ({
        url: '/onboarding',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      }),
    }),
    updateOnboarding: builder.mutation<void, SaveOnboardingRequest>({
      query: ({ token, ...body }) => ({
        url: '/onboarding',
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body,
      }),
    }),
    fetchOnboarding: builder.mutation<OnboardingProfile | null, { token: string }>({
      query: ({ token }) => ({
        url: '/onboarding',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),
  }),
});

export const {
  useSaveOnboardingMutation,
  useUpdateOnboardingMutation,
  useFetchOnboardingMutation,
} = onboardingApi;