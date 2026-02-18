import { Stack } from 'expo-router';
import { JSX } from 'react';
import { OnboardingProvider } from '@features/onboarding/context/OnboardingContext';

export default function OnboardingLayout(): JSX.Element {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </OnboardingProvider>
  );
}