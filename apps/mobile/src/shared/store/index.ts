import { configureStore } from '@reduxjs/toolkit';
import { onboardingApi } from '@features/onboarding/store/onboardingApi';
import { authApi } from '@features/auth/store/authApi';

export const store = configureStore({
  reducer: {
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(onboardingApi.middleware)
      .concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;