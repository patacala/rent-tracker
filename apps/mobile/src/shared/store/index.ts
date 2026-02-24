import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '@features/auth/store/authApi';
import { onboardingApi } from '@features/onboarding/store/onboardingApi';
import { analysisApi } from '@features/analysis/store/analysisApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [analysisApi.reducerPath]: analysisApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(onboardingApi.middleware)
      .concat(authApi.middleware)
      .concat(analysisApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;