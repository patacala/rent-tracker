import { Tabs } from 'expo-router';
import { THEME } from '@shared/theme';
import { JSX } from 'react';

export default function TabsLayout(): JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textMuted,
        tabBarStyle: {
          backgroundColor: THEME.colors.surface,
          borderTopColor: THEME.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Onboarding',
          tabBarLabel: 'Start',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Lifestyle Map',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <TabIcon name="map" color={color} />,
        }}
      />
    </Tabs>
  );
}

// ─── Simple Icon Placeholder ─────────────────
// Replace with @expo/vector-icons or lucide-react-native
function TabIcon({ name, color }: { name: string; color: string }): JSX.Element {
  const { Text } = require('react-native') as typeof import('react-native');
  const icons: Record<string, string> = { home: '🏠', map: '🗺️' };
  return <Text style={{ fontSize: 20, color }}>{icons[name] ?? '●'}</Text>;
}
