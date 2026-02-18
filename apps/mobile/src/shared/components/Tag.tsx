import React, { JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

type TagVariant = 'default' | 'success' | 'warning' | 'neutral';

const VARIANT_COLORS: Record<TagVariant, { bg: string; text: string }> = {
  default: { bg: THEME.colors.primaryLight, text: THEME.colors.primary },
  success: { bg: THEME.colors.successLight, text: THEME.colors.success },
  warning: { bg: '#FEF3C7', text: THEME.colors.warning },
  neutral: { bg: THEME.colors.surfaceElevated, text: THEME.colors.textSecondary },
};

interface TagContextValue {
  variant: TagVariant;
}

const TagContext = React.createContext<TagContextValue | null>(null);

function useTagContext(): TagContextValue {
  const ctx = React.useContext(TagContext);
  if (!ctx) throw new Error('Tag sub-components must be used within Tag.Root');
  return ctx;
}

interface TagRootProps {
  variant?: TagVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function TagRoot({ variant = 'default', children, style }: TagRootProps): JSX.Element {
  const colors = VARIANT_COLORS[variant];
  return (
    <TagContext.Provider value={{ variant }}>
      <View style={[styles.root, { backgroundColor: colors.bg }, style]}>{children}</View>
    </TagContext.Provider>
  );
}

function TagLabel({
  children,
  style,
}: {
  children: string;
  style?: StyleProp<TextStyle>;
}): JSX.Element {
  const { variant } = useTagContext();
  const colors = VARIANT_COLORS[variant];
  return <Text style={[styles.label, { color: colors.text }, style]}>{children}</Text>;
}

function TagIcon({
  name,
  size = 12,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
}): JSX.Element {
  const { variant } = useTagContext();
  const colors = VARIANT_COLORS[variant];
  return <Ionicons name={name} size={size} color={colors.text} style={styles.icon} />;
}

export const Tag = Object.assign(TagRoot, {
  Label: TagLabel,
  Icon: TagIcon,
});

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  label: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.medium,
  },
  icon: {
    marginRight: 3,
  },
});
