import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { JSX, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@shared/context/AuthContext';
import { OnboardingProvider, useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { THEME } from '@shared/theme';
import { supabase } from '@shared/lib/supabase';

function RootLayoutContent(): JSX.Element {
  const { isLoading: authLoading, isLoggedIn } = useAuth();
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
    const inAnalysisScreen = currentSegment === 'analysis';
    const inTabsScreen = currentSegment === '(tabs)';
    const inNeighborhoodScreen = currentSegment === 'neighborhood';

    const hasOnboardingData = onboardingData.workAddress.trim().length > 0;

    if (!isLoggedIn && currentStep > 0 && currentStep < 4 && !inOnboardingScreen) {
      router.replace(`/onboarding/step${currentStep}` as any);
      return;
    }

    if (
      !isLoggedIn &&
      hasOnboardingData &&
      currentStep === 0 &&
      !inAuthScreen &&
      !inWelcomeScreen &&
      !inAnalysisScreen &&
      !inOnboardingScreen &&
      !inTabsScreen &&
      !inNeighborhoodScreen
    ) {
      router.replace('/auth');
    }
  }, [isLoading, isLoggedIn, onboardingData, currentStep, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="analysis" options={{ gestureEnabled: false }} />
      <Stack.Screen name="map" options={{ gestureEnabled: false }} />
      <Stack.Screen name="neighborhood/[id]" />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout(): JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OnboardingProvider>
          <StatusBar style="dark" />
          <RootLayoutContent />
        </OnboardingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}