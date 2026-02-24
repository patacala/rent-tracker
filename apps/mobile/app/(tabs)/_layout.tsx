import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { JSX } from 'react';
import { useAuth } from '@shared/context/AuthContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Array<{
  name: string;
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
}> = [
  { name: 'explore', label: 'Explore', icon: 'search-outline', iconActive: 'search' },
  { name: 'favorities', label: 'Favorities', icon: 'heart-outline', iconActive: 'heart' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

export default function TabsLayout(): JSX.Element {
  const { isLoggedIn } = useAuth();

  return (
    <Tabs
      backBehavior="none"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textMuted,
        tabBarStyle: {
          backgroundColor: THEME.colors.background,
          borderTopColor: THEME.colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: THEME.fontSize.xs,
          fontWeight: THEME.fontWeight.medium,
        },
      }}
    >
      {TAB_CONFIG.map(({ name, label, icon, iconActive }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarLabel: label,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? iconActive : icon} size={22} color={color} />
            ),
            tabBarItemStyle:
              !isLoggedIn && name !== 'explore'
                ? { display: 'none' }
                : undefined,
          }}
        />
      ))}
    </Tabs>
  );
}