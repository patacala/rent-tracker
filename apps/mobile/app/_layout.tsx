import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { JSX, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Mapbox from '@rnmapbox/maps';
import { store } from '@shared/store';
import { AuthProvider, useAuth } from '@shared/context/AuthContext';
import { OnboardingProvider, useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { AnalysisProvider } from '@features/analysis/context/AnalysisContext';
import { THEME } from '@shared/theme';
import { supabase } from '@shared/lib/supabase';
import { ToastProvider } from '@shared/context/ToastContext';
import { NeighborhoodCacheProvider } from '@shared/context/NeighborhoodCacheContext';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

function RootLayoutContent(): JSX.Element {
  const { isLoading: authLoading, isLoggedIn, justLoggedIn, clearJustLoggedIn } = useAuth();
  const { isLoading: onboardingLoading, data: onboardingData, currentStep } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();

  const isLoading = authLoading || onboardingLoading;

  useEffect(() => {
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      if (url.includes('auth/confirm')) {
        await supabase.auth.getSession();
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0];
    const inOnboardingScreen = currentSegment === 'onboarding';
    const inAuthScreen = currentSegment === 'auth';
    const inWelcomeScreen = currentSegment === 'welcome';
    const inPurchaseScreen = currentSegment === 'purchase';

    if (justLoggedIn) {
      // Si ya llegó a la pantalla destino (no auth), limpia la bandera
      if (!inAuthScreen) clearJustLoggedIn();
      return;
    }

    // Si está en purchase no tocar nada
    if (inPurchaseScreen) return;

    // Sesión restaurada al abrir la app estando en welcome o auth → explore
    if (isLoggedIn && (inWelcomeScreen || inAuthScreen)) {
      console.log('Envio a explore desde layout');
      router.replace('/(tabs)/explore');
      return;
    }

    if (!isLoggedIn && currentStep > 0 && currentStep < 4 && !inOnboardingScreen) {
      router.replace(`/onboarding/step${currentStep}` as any);
      return;
    }
  }, [isLoading, isLoggedIn, justLoggedIn, onboardingData, currentStep, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
      <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
      <Stack.Screen name="auth" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="analysis" options={{ gestureEnabled: false }} />
      <Stack.Screen name="map" options={{ gestureEnabled: false }} />
      <Stack.Screen name="neighborhood/[id]" />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="purchase/purchase" options={{ gestureEnabled: false }} />
      <Stack.Screen name="purchase/detail" />
    </Stack>
  );
}

export default function RootLayout(): JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AuthProvider>
          <OnboardingProvider>
            <AnalysisProvider>
              <NeighborhoodCacheProvider>
                <ToastProvider>
                  <StatusBar style="dark" />
                  <RootLayoutContent />
                </ToastProvider>
              </NeighborhoodCacheProvider>
            </AnalysisProvider>
          </OnboardingProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </Provider>
  );
}