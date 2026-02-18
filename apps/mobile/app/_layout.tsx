import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { JSX } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout(): JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="analysis" />
        <Stack.Screen name="map" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="neighborhood/[id]" />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
