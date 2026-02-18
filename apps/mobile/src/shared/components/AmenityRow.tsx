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

const AmenityRowContext = React.createContext<null>(null);

interface AmenityRowRootProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function AmenityRowRoot({ children, style }: AmenityRowRootProps): JSX.Element {
  return (
    <AmenityRowContext.Provider value={null}>
      <View style={[styles.root, style]}>{children}</View>
    </AmenityRowContext.Provider>
  );
}

function AmenityRowIcon({
  name,
  size = 20,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
}): JSX.Element {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name={name} size={size} color={THEME.colors.primary} />
    </View>
  );
}

function AmenityRowName({ children }: { children: string }): JSX.Element {
  return <Text style={styles.name}>{children}</Text>;
}

function AmenityRowDistance({ children }: { children: string }): JSX.Element {
  return <Text style={styles.distance}>{children}</Text>;
}

export const AmenityRow = Object.assign(AmenityRowRoot, {
  Icon: AmenityRowIcon,
  Name: AmenityRowName,
  Distance: AmenityRowDistance,
});

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontSize: THEME.fontSize.base,
    color: THEME.colors.text,
    fontWeight: THEME.fontWeight.medium,
  },
  distance: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
  },
});
