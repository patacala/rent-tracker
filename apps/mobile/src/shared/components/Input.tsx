import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

interface InputContextValue {
  focused: boolean;
  setFocused: (v: boolean) => void;
  secure: boolean;
  toggleSecure: () => void;
}

const InputContext = React.createContext<InputContextValue | null>(null);

function useInputContext(): InputContextValue {
  const ctx = React.useContext(InputContext);
  if (!ctx) throw new Error('Input sub-components must be used within Input.Root');
  return ctx;
}

interface InputRootProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function InputRoot({ children, style }: InputRootProps): JSX.Element {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(false);
  const toggleSecure = () => setSecure((v) => !v);

  return (
    <InputContext.Provider value={{ focused, setFocused, secure, toggleSecure }}>
      <View style={[styles.root, style]}>{children}</View>
    </InputContext.Provider>
  );
}

function InputLabel({
  children,
  style,
}: {
  children: string;
  style?: StyleProp<TextStyle>;
}): JSX.Element {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

interface InputFieldProps {
  secureTextEntry?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function InputField({ secureTextEntry = false, children, style }: InputFieldProps): JSX.Element {
  const { focused, secure, toggleSecure } = useInputContext();
  return (
    <View
      style={[
        styles.fieldContainer,
        focused && styles.fieldContainerFocused,
        style,
      ]}
    >
      {children}
      {secureTextEntry ? (
        <TouchableOpacity onPress={toggleSecure} hitSlop={8}>
          <Ionicons
            name={secure ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            color={THEME.colors.textMuted}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function InputTextInput({ secureTextEntry, style, ...rest }: TextInputProps): JSX.Element {
  const { setFocused, secure } = useInputContext();
  return (
    <TextInput
      style={[styles.field, style]}
      placeholderTextColor={THEME.colors.textMuted}
      secureTextEntry={secureTextEntry ? !secure : false}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...rest}
    />
  );
}

function InputIcon({
  name,
  size = 18,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
}): JSX.Element {
  return <Ionicons name={name} size={size} color={THEME.colors.textMuted} />;
}

function InputError({ children }: { children: string }): JSX.Element {
  return <Text style={styles.error}>{children}</Text>;
}

export const Input = Object.assign(InputRoot, {
  Label: InputLabel,
  Field: InputField,
  TextInput: InputTextInput,
  Icon: InputIcon,
  Error: InputError,
});

const styles = StyleSheet.create({
  root: {
    gap: THEME.spacing.xs,
  },
  label: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.medium,
    color: THEME.colors.text,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm + 2,
    gap: THEME.spacing.sm,
  },
  fieldContainerFocused: {
    borderColor: THEME.colors.primary,
  },
  field: {
    flex: 1,
    fontSize: THEME.fontSize.base,
    color: THEME.colors.text,
    padding: 0,
  },
  error: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.error,
  },
});
