import React, { JSX } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { THEME } from '../theme';

interface ToggleGroupContextValue {
  value: string | number;
  onChange: (value: string | number) => void;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

function useToggleGroupContext(): ToggleGroupContextValue {
  const ctx = React.useContext(ToggleGroupContext);
  if (!ctx) throw new Error('ToggleGroup.Item must be used within ToggleGroup.Root');
  return ctx;
}

interface ToggleGroupRootProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function ToggleGroupRoot<T extends string | number>({
  value,
  onChange,
  children,
  style,
}: ToggleGroupRootProps<T>): JSX.Element {
  return (
    <ToggleGroupContext.Provider
      value={{ value, onChange: onChange as (v: string | number) => void }}
    >
      <View style={[styles.root, style]}>{children}</View>
    </ToggleGroupContext.Provider>
  );
}

interface ToggleGroupItemProps<T extends string | number> {
  value: T;
  label: string;
  sublabel?: string;
  style?: StyleProp<ViewStyle>;
}

function ToggleGroupItem<T extends string | number>({
  value,
  label,
  sublabel,
  style,
}: ToggleGroupItemProps<T>): JSX.Element {
  const { value: groupValue, onChange } = useToggleGroupContext();
  const isActive = groupValue === value;

  return (
    <TouchableOpacity
      onPress={() => onChange(value)}
      activeOpacity={0.8}
      style={[
        styles.item,
        isActive ? styles.itemActive : styles.itemInactive,
        style,
      ]}
    >
      <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
      {sublabel ? (
        <Text style={[styles.sublabel, isActive ? styles.sublabelActive : styles.sublabelInactive]}>
          {sublabel}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Item: ToggleGroupItem,
});

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.sm + 2,
    paddingHorizontal: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    minHeight: 44,
  },
  itemActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  itemInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: THEME.colors.border,
  },
  label: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
  },
  labelActive: {
    color: '#FFFFFF',
  },
  labelInactive: {
    color: THEME.colors.text,
  },
  sublabel: {
    fontSize: THEME.fontSize.xs,
    marginTop: 2,
  },
  sublabelActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  sublabelInactive: {
    color: THEME.colors.textMuted,
  },
});
