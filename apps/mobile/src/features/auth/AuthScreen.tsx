import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@shared/theme';
import { Button, HeaderBackButton, Input, SocialAuthButton, ToggleGroup } from '@shared/components';

type AuthMode = 'signup' | 'login';

export function AuthScreen(): JSX.Element {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    router.push('/onboarding/step1');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeaderBackButton onPress={() => router.back()} />

        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoMark} />
          <Text style={styles.brandName}>Relocation Intelligence</Text>
        </View>

        {/* Mode toggle */}
        <ToggleGroup value={mode} onChange={(v) => setMode(v as AuthMode)} style={styles.modeToggle}>
          <ToggleGroup.Item value="signup" label="Sign Up" />
          <ToggleGroup.Item value="login" label="Log In" />
        </ToggleGroup>

        {/* Social auth */}
        <View style={styles.socialAuth}>
          <SocialAuthButton provider="google" onPress={() => {}} />
          <SocialAuthButton provider="apple" onPress={() => {}} />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with email</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form fields */}
        <View style={styles.form}>
          {mode === 'signup' ? (
            <Input>
              <Input.Label>Full name</Input.Label>
              <Input.Field>
                <Input.TextInput
                  placeholder="Your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </Input.Field>
            </Input>
          ) : null}

          <Input>
            <Input.Label>Email address</Input.Label>
            <Input.Field>
              <Input.Icon name="mail-outline" />
              <Input.TextInput
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </Input.Field>
          </Input>

          <Input>
            <Input.Label>Password</Input.Label>
            <Input.Field secureTextEntry>
              <Input.Icon name="lock-closed-outline" />
              <Input.TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </Input.Field>
          </Input>
        </View>

        <Button onPress={handleSubmit} style={styles.submitBtn}>
          <Button.Label>{mode === 'signup' ? 'Create Account' : 'Sign In'}</Button.Label>
        </Button>

        {/* Footer link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          </Text>
          <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
            <Text style={styles.footerLink}>
              {mode === 'signup' ? 'Log In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>
          By clicking "Create Account", you agree to our{' '}
          <Text style={styles.legalLink}>Terms of Service</Text> and{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  scroll: { flex: 1 },
  content: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
    gap: THEME.spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  logoMark: {
    width: 24,
    height: 24,
    borderRadius: 5,
    backgroundColor: THEME.colors.primary,
  },
  brandName: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.primary,
  },
  modeToggle: {
    marginTop: THEME.spacing.xs,
  },
  socialAuth: {
    gap: THEME.spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  form: {
    gap: THEME.spacing.md,
  },
  submitBtn: {
    marginTop: THEME.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
  },
  footerLink: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },
  legal: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
  },
  legalLink: {
    color: THEME.colors.primary,
  },
});
