import React, { JSX } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { THEME } from '../theme';

interface FilterChipsProps<T extends string | number> {
  options: readonly T[];
  value: T | null | T[];
  onChange: (value: T | null | T[]) => void;
  getLabel?: (option: T) => string;
  activeIndicator?: boolean;
  toggleable?: boolean;
  multiSelect?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function FilterChips<T extends string | number>({
  options,
  value,
  onChange,
  getLabel,
  activeIndicator = false,
  toggleable = false,
  multiSelect = false,
  containerStyle,
}: FilterChipsProps<T>): JSX.Element {
  const isActive = (option: T): boolean => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(option);
    }
    return option === value;
  };

  const handlePress = (option: T) => {
    if (multiSelect && Array.isArray(value)) {
      const already = value.includes(option);
      const next = already
        ? value.filter((v) => v !== option)
        : [...value, option];
      onChange(next.length === 0 ? [] : next);
      return;
    }

    if (toggleable && value === option) {
      onChange(null);
    } else {
      onChange(option);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, containerStyle]}
    >
      {options.map((option) => {
        const label = getLabel ? getLabel(option) : String(option);
        const active = isActive(option);
        return (
          <TouchableOpacity
            key={String(option)}
            onPress={() => handlePress(option)}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
          >
            <Text
              style={[
                styles.chipText,
                active ? styles.chipTextActive : styles.chipTextInactive,
              ]}
            >
              {activeIndicator && active ? `${label} ▼` : label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
  },
  chip: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipInactive: {
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
  },
  chipText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.medium,
  },
  chipTextActive: { color: '#FFFFFF' },
  chipTextInactive: { color: THEME.colors.textSecondary },
});