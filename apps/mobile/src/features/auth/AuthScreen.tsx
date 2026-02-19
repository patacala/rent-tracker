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
import { Button, Input, ToggleGroup } from '@shared/components';
import { useAuth } from '@shared/context/AuthContext';

type AuthMode = 'signup' | 'login' | 'confirm';

export function AuthScreen(): JSX.Element {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const result = await signup(email, password, name);
        console.log(result);
        
        if (result.error) {
          setError(result.error);
          return;
        }

        setMode('confirm');
      } else {
        const result = await login(email, password);
        if (result.error) {
          setError(result.error);
          return;
        }

        router.replace('/(tabs)/explore');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === 'confirm') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.confirmContainer}>
          <Input.Icon name="mail-outline" size={50} />
          <Text style={styles.confirmTitle}>Check your email</Text>
          <Text style={styles.confirmSubtitle}>
            We sent a confirmation link to{'\n'}
            <Text style={styles.confirmEmail}>{email}</Text>
          </Text>

          <Button onPress={() => setMode('login')} style={styles.submitBtn}>
            <Button.Label>Go to Login</Button.Label>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ToggleGroup value={mode} onChange={(v) => { setMode(v as AuthMode); setError(null); }} style={styles.modeToggle}>
          <ToggleGroup.Item value="signup" label="Sign Up" />
          <ToggleGroup.Item value="login" label="Log In" />
        </ToggleGroup>

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

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </View>

        <Button onPress={handleSubmit} disabled={isSubmitting} style={styles.submitBtn}>
          <Button.Label>
            {isSubmitting ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </Button.Label>
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          </Text>
          <TouchableOpacity onPress={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(null); }}>
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
  modeToggle: {
    marginTop: THEME.spacing.xs,
  },
  form: {
    gap: THEME.spacing.md,
  },
  errorText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.error,
    textAlign: 'center',
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
  confirmContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.lg,
    gap: THEME.spacing.lg,
  },
  confirmTitle: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  confirmSubtitle: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmEmail: {
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },
});