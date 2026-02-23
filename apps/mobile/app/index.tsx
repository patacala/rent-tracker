import { Redirect } from 'expo-router';
import { JSX } from 'react';
import { useAuth } from '@shared/context/AuthContext';
import { useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { ActivityIndicator, View } from 'react-native';
import { THEME } from '@shared/theme';

export default function Index(): JSX.Element {
  const { isLoading: authLoading, isLoggedIn } = useAuth();
  const { isLoading: onboardingLoading, data: onboardingData, currentStep } = useOnboarding();

  const isLoading = authLoading || onboardingLoading;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={THEME.colors.primary} />
      </View>
    );
  }

  if (isLoggedIn) {
    return <Redirect href="/(tabs)/explore" />;
  }

  if (currentStep > 0 && currentStep < 4) {
    return <Redirect href={`/onboarding/step${currentStep}` as any} />;
  }

  if (onboardingData.workAddress.trim().length > 0 && currentStep === 0) {
    return <Redirect href="/(tabs)/explore" />;
  }

  return <Redirect href="/welcome" />;
}