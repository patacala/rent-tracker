import { Stack } from 'expo-router';
import { JSX } from 'react';

export default function OnboardingLayout(): JSX.Element {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
  );
}