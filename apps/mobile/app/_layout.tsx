import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { JSX } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@shared/context/AuthContext';

export default function RootLayout(): JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
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
      </AuthProvider>
    </SafeAreaProvider>
  );
}