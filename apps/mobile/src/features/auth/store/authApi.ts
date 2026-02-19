import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'http://192.168.1.173:3000';

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
  }),
});

export const { useSyncUserMutation } = authApi;