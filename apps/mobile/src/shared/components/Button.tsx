import React, { JSX } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type TouchableOpacityProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: THEME.colors.primary, text: '#FFFFFF' },
  outline: { bg: '#FFFFFF', text: THEME.colors.primary, border: THEME.colors.primary },
  ghost: { bg: 'transparent', text: THEME.colors.primary },
};

const SIZE_STYLES: Record<ButtonSize, { paddingV: number; paddingH: number; fontSize: number }> = {
  sm: { paddingV: THEME.spacing.sm, paddingH: THEME.spacing.md, fontSize: THEME.fontSize.sm },
  md: { paddingV: 12, paddingH: 20, fontSize: THEME.fontSize.base },
  lg: { paddingV: THEME.spacing.md, paddingH: THEME.spacing.lg, fontSize: THEME.fontSize.md },
};

interface ButtonContextValue {
  textColor: string;
  fontSize: number;
  disabled: boolean;
}

const ButtonContext = React.createContext<ButtonContextValue | null>(null);

function useButtonContext(): ButtonContextValue {
  const ctx = React.useContext(ButtonContext);
  if (!ctx) throw new Error('Button sub-components must be used within Button.Root');
  return ctx;
}

interface ButtonRootProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function ButtonRoot({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...rest
}: ButtonRootProps): JSX.Element {
  const isDisabled = disabled ?? loading;
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <ButtonContext.Provider
      value={{ textColor: variantStyle.text, fontSize: sizeStyle.fontSize, disabled: isDisabled }}
    >
      <TouchableOpacity
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.base,
          {
            backgroundColor: variantStyle.bg,
            paddingVertical: sizeStyle.paddingV,
            paddingHorizontal: sizeStyle.paddingH,
            borderWidth: variantStyle.border ? 1.5 : 0,
            borderColor: variantStyle.border ?? 'transparent',
          },
          isDisabled && styles.disabled,
          style,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={variantStyle.text} size="small" />
        ) : (
          children
        )}
      </TouchableOpacity>
    </ButtonContext.Provider>
  );
}

function ButtonLabel({
  children,
  style,
}: {
  children: string;
  style?: StyleProp<TextStyle>;
}): JSX.Element {
  const { textColor, fontSize } = useButtonContext();
  return (
    <Text style={[styles.label, { color: textColor, fontSize }, style]}>{children}</Text>
  );
}

function ButtonIcon({
  name,
  size,
  style,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  style?: StyleProp<TextStyle>;
}): JSX.Element {
  const { textColor, fontSize } = useButtonContext();
  return (
    <Ionicons
      name={name}
      size={size ?? fontSize + 2}
      color={textColor}
      style={style}
    />
  );
}

export const Button = Object.assign(ButtonRoot, {
  Label: ButtonLabel,
  Icon: ButtonIcon,
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.borderRadius.md,
    gap: THEME.spacing.xs,
    minHeight: 48,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontWeight: THEME.fontWeight.semibold,
  },
});
