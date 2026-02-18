import React, { JSX } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../theme';

type SocialProvider = 'google' | 'apple';

const PROVIDER_CONFIG: Record<
  SocialProvider,
  { label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; bg: string; text: string; iconColor: string; borderColor?: string }
> = {
  google: {
    label: 'Continue with Google',
    icon: 'google',
    bg: '#FFFFFF',
    text: THEME.colors.text,
    iconColor: '#4285F4',
    borderColor: THEME.colors.border,
  },
  apple: {
    label: 'Continue with Apple',
    icon: 'apple',
    bg: '#000000',
    text: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
};

interface SocialAuthButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SocialAuthButton({ provider, onPress, style }: SocialAuthButtonProps): JSX.Element {
  const config = PROVIDER_CONFIG[provider];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: config.bg,
          borderColor: config.borderColor ?? 'transparent',
          borderWidth: config.borderColor ? 1.5 : 0,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons name={config.icon} size={20} color={config.iconColor} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    paddingVertical: 13,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    minHeight: 48,
  },
  label: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.semibold,
  },
});
