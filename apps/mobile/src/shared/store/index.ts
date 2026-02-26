import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '@features/auth/store/authApi';
import { onboardingApi } from '@features/onboarding/store/onboardingApi';
import { analysisApi } from '@features/analysis/store/analysisApi';
import { savedApi } from '@features/saved/store/savedApi';
import { safetyApi } from '@features/safety/store/safetyApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [analysisApi.reducerPath]: analysisApi.reducer,
    [savedApi.reducerPath]: savedApi.reducer,
    [safetyApi.reducerPath]: safetyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(onboardingApi.middleware)
      .concat(authApi.middleware)
      .concat(analysisApi.middleware)
      .concat(savedApi.middleware)
      .concat(safetyApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;