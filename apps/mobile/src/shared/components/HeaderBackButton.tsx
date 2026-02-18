import React, { JSX } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

type BackButtonVariant = 'surface' | 'overlay';

interface HeaderBackButtonProps {
  onPress: () => void;
  variant?: BackButtonVariant;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function HeaderBackButton({
  onPress,
  variant = 'surface',
  iconColor = THEME.colors.text,
  style,
}: HeaderBackButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btn, variant === 'overlay' ? styles.overlay : styles.surface, style]}
      hitSlop={8}
    >
      <Ionicons name="arrow-back-outline" size={22} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  surface: {
    backgroundColor: THEME.colors.surface,
  },
  overlay: {
    backgroundColor: THEME.colors.background,
    ...THEME.shadow.sm,
  },
});
