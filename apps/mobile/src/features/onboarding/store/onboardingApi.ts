import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@shared/api/baseUrl';

export interface SaveOnboardingRequest {
  workAddress: string;
  commute: number;
  priorities: string[];
  hasChildren: string;
  childAgeGroups: string[];
  hasPets: string;
  lifestyle?: string;
}

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    saveOnboarding: builder.mutation<void, SaveOnboardingRequest>({
      query: (body) => ({
        url: '/onboarding',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSaveOnboardingMutation } = onboardingApi;
