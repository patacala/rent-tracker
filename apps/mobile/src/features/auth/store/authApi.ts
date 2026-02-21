import { createApi } from '@reduxjs/toolkit/query/react';
import { authenticatedBaseQuery } from '@shared/api/baseQuery';

export interface UpdateProfileRequest {
  name: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: authenticatedBaseQuery,
  endpoints: (builder) => ({
    syncUser: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/sync',
        method: 'POST',
      }),
    }),
    checkEmail: builder.mutation<{ exists: boolean }, { email: string }>({
      query: (body) => ({
        url: '/auth/check-email',
        method: 'POST',
        body,
      }),
    }),
    updateProfile: builder.mutation<void, UpdateProfileRequest>({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body,
      }),
    }),
  }),
});

export const {
  useSyncUserMutation,
  useCheckEmailMutation,
  useUpdateProfileMutation,
} = authApi;