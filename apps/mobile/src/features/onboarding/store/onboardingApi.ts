import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'http://192.168.1.173:3000';

export interface OnboardingPayload {
  workAddress: string;
  commute: number;
  priorities: string[];
  hasChildren: string;
  childAgeGroups: string[];
  hasPets: string;
  lifestyle: string | null;
}

export interface OnboardingWithToken extends OnboardingPayload {
  token: string;
}

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    saveOnboarding: builder.mutation<void, OnboardingWithToken>({
      query: ({ token, ...body }) => ({
        url: '/onboarding',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      }),
    }),
    getOnboarding: builder.query<OnboardingPayload, { token: string }>({
      query: ({ token }) => ({
        url: '/onboarding',
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),
  }),
});

export const { useSaveOnboardingMutation, useGetOnboardingQuery } = onboardingApi;