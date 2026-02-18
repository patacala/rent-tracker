import React, { JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

const StatCardContext = React.createContext<null>(null);

interface StatCardRootProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function StatCardRoot({ children, style }: StatCardRootProps): JSX.Element {
  return (
    <StatCardContext.Provider value={null}>
      <View style={[styles.root, style]}>{children}</View>
    </StatCardContext.Provider>
  );
}

function StatCardIcon({
  name,
  size = 22,
  color = THEME.colors.primary,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
}): JSX.Element {
  return (
    <View style={[styles.iconContainer, { backgroundColor: THEME.colors.primaryLight }]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

function StatCardValue({ children }: { children: string }): JSX.Element {
  return <Text style={styles.value}>{children}</Text>;
}

function StatCardDescription({ children }: { children: string }): JSX.Element {
  return <Text style={styles.description}>{children}</Text>;
}

export const StatCard = Object.assign(StatCardRoot, {
  Icon: StatCardIcon,
  Value: StatCardValue,
  Description: StatCardDescription,
});

const styles = StyleSheet.create({
  root: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    gap: THEME.spacing.xs,
    ...THEME.shadow.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  description: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
  },
});
