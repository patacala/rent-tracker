import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@shared/api/baseUrl';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    syncUser: builder.mutation<void, { token: string }>({
      query: ({ token }) => ({
        url: '/auth/sync',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),
    checkEmail: builder.mutation<{ exists: boolean }, { email: string }>({
      query: (body) => ({
        url: '/auth/check-email',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSyncUserMutation, useCheckEmailMutation } = authApi;
