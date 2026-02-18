import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { JSX, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@shared/context/AuthContext';
import { OnboardingProvider, useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { THEME } from '@shared/theme';

function RootLayoutContent(): JSX.Element {
  const { isLoading: authLoading, isLoggedIn } = useAuth();
  const { isLoading: onboardingLoading, data: onboardingData } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();

  const isLoading = authLoading || onboardingLoading;

  useEffect(() => {
    if (isLoading) return;

    const inAuthScreen = segments[0] === 'auth';
    const hasOnboardingData = onboardingData.workAddress.trim().length > 0;

    if (!isLoggedIn && hasOnboardingData && !inAuthScreen) {
      router.replace('/auth');
    }
  }, [isLoading, isLoggedIn, onboardingData, segments]);

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