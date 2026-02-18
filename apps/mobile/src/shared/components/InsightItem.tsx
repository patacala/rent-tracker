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

type InsightVariant = 'success' | 'warning' | 'info';

const VARIANT_CONFIG: Record<
  InsightVariant,
  { bg: string; iconColor: string; icon: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  success: { bg: THEME.colors.successLight, iconColor: THEME.colors.success, icon: 'checkmark-circle' },
  warning: { bg: '#FEF3C7', iconColor: THEME.colors.warning, icon: 'warning' },
  info: { bg: '#FFF7ED', iconColor: '#F97316', icon: 'information-circle' },
};

interface InsightItemContextValue {
  variant: InsightVariant;
}

const InsightItemContext = React.createContext<InsightItemContextValue | null>(null);

function useInsightItemContext(): InsightItemContextValue {
  const ctx = React.useContext(InsightItemContext);
  if (!ctx) throw new Error('InsightItem sub-components must be used within InsightItem.Root');
  return ctx;
}

interface InsightItemRootProps {
  variant?: InsightVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function InsightItemRoot({
  variant = 'info',
  children,
  style,
}: InsightItemRootProps): JSX.Element {
  return (
    <InsightItemContext.Provider value={{ variant }}>
      <View style={[styles.root, style]}>{children}</View>
    </InsightItemContext.Provider>
  );
}

function InsightItemIcon({ size = 22 }: { size?: number }): JSX.Element {
  const { variant } = useInsightItemContext();
  const config = VARIANT_CONFIG[variant];
  return (
    <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon} size={size} color={config.iconColor} />
    </View>
  );
}

function InsightItemTitle({ children }: { children: string }): JSX.Element {
  return <Text style={styles.title}>{children}</Text>;
}

function InsightItemDescription({ children }: { children: string }): JSX.Element {
  return <Text style={styles.description}>{children}</Text>;
}

export const InsightItem = Object.assign(InsightItemRoot, {
  Icon: InsightItemIcon,
  Title: InsightItemTitle,
  Description: InsightItemDescription,
});

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: THEME.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    lineHeight: 19,
    flex: 1,
  },
});
