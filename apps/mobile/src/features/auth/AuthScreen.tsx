import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { THEME } from '@shared/theme';
import { Button, Input, ToggleGroup } from '@shared/components';
import { useAuth } from '@shared/context/AuthContext';

type AuthMode = 'signup' | 'login' | 'confirm';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export function AuthScreen(): JSX.Element {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', password: '' },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const handleSignup = async (values: SignupFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await signup(values.email, values.password, values.name);
      if (result.error) {
        setServerError(result.error);
        return;
      }
      setSubmittedEmail(values.email);
      setMode('confirm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (values: LoginFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await login(values.email, values.password);
      if (result.error) {
        setServerError(result.error);
        return;
      }
      router.replace('/(tabs)/explore');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setServerError(null);
    signupForm.reset();
    loginForm.reset();
  };

  if (mode === 'confirm') {
    return (
      <ImageBackground
        source={require('@assets/family_01.png')}
        style={styles.background}
        resizeMode="cover"
        imageStyle={{ left: -90 }}
      >
        <SafeAreaView style={styles.safe}>
          <View style={styles.confirmContainer}>
            <Input.Icon name="mail-outline" size={50} />
            <Text style={styles.confirmTitle}>Check your email</Text>
            <Text style={styles.confirmSubtitle}>
              We sent a confirmation link to{'\n'}
              <Text style={styles.confirmEmail}>{submittedEmail}</Text>
            </Text>
            <Button onPress={() => handleModeChange('login')} style={styles.submitBtn}>
              <Button.Label>Go to Login</Button.Label>
            </Button>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('@assets/family_01.png')}
      style={styles.background}
      resizeMode="cover"
      imageStyle={{ left: -90 }}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.brandRow}>
              <View style={styles.logoMark} />
              <Text style={styles.brandName}>Relocation Intelligence</Text>
            </View>

            <ToggleGroup
              value={mode}
              onChange={(v) => handleModeChange(v as AuthMode)}
              style={styles.modeToggle}
            >
              <ToggleGroup.Item value="signup" label="Sign Up" />
              <ToggleGroup.Item value="login" label="Log In" />
            </ToggleGroup>

            {mode === 'signup' ? (
              <View style={styles.form}>
                <Controller
                  control={signupForm.control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <Input>
                      <Input.Label>Full name</Input.Label>
                      <Input.Field>
                        <Input.TextInput
                          placeholder="Your full name"
                          value={value}
                          onChangeText={onChange}
                          autoCapitalize="words"
                          returnKeyType="next"
                        />
                      </Input.Field>
                      {signupForm.formState.errors.name ? (
                        <Text style={styles.errorText}>{signupForm.formState.errors.name.message}</Text>
                      ) : null}
                    </Input>
                  )}
                />

                <Controller
                  control={signupForm.control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <Input>
                      <Input.Label>Email address</Input.Label>
                      <Input.Field>
                        <Input.Icon name="mail-outline" />
                        <Input.TextInput
                          placeholder="name@example.com"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          returnKeyType="next"
                        />
                      </Input.Field>
                      {signupForm.formState.errors.email ? (
                        <Text style={styles.errorText}>{signupForm.formState.errors.email.message}</Text>
                      ) : null}
                    </Input>
                  )}
                />

                <Controller
                  control={signupForm.control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <Input>
                      <Input.Label>Password</Input.Label>
                      <Input.Field secureTextEntry>
                        <Input.Icon name="lock-closed-outline" />
                        <Input.TextInput
                          placeholder="Min. 6 characters"
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry
                          returnKeyType="done"
                          onSubmitEditing={signupForm.handleSubmit(handleSignup)}
                        />
                      </Input.Field>
                      {signupForm.formState.errors.password ? (
                        <Text style={styles.errorText}>{signupForm.formState.errors.password.message}</Text>
                      ) : null}
                    </Input>
                  )}
                />

                {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

                <Button
                  onPress={signupForm.handleSubmit(handleSignup)}
                  disabled={isSubmitting || !signupForm.formState.isValid}
                  style={styles.submitBtn}
                >
                  <Button.Label>{isSubmitting ? 'Please wait...' : 'Create Account'}</Button.Label>
                </Button>
              </View>
            ) : (
              <View style={styles.form}>
                <Controller
                  control={loginForm.control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <Input>
                      <Input.Label>Email address</Input.Label>
                      <Input.Field>
                        <Input.Icon name="mail-outline" />
                        <Input.TextInput
                          placeholder="name@example.com"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          returnKeyType="next"
                        />
                      </Input.Field>
                      {loginForm.formState.errors.email ? (
                        <Text style={styles.errorText}>{loginForm.formState.errors.email.message}</Text>
                      ) : null}
                    </Input>
                  )}
                />

                <Controller
                  control={loginForm.control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <Input>
                      <Input.Label>Password</Input.Label>
                      <Input.Field secureTextEntry>
                        <Input.Icon name="lock-closed-outline" />
                        <Input.TextInput
                          placeholder="Enter your password"
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry
                          returnKeyType="done"
                          onSubmitEditing={loginForm.handleSubmit(handleLogin)}
                        />
                      </Input.Field>
                      {loginForm.formState.errors.password ? (
                        <Text style={styles.errorText}>{loginForm.formState.errors.password.message}</Text>
                      ) : null}
                    </Input>
                  )}
                />

                {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

                <Button
                  onPress={loginForm.handleSubmit(handleLogin)}
                  disabled={isSubmitting || !loginForm.formState.isValid}
                  style={styles.submitBtn}
                >
                  <Button.Label>{isSubmitting ? 'Please wait...' : 'Sign In'}</Button.Label>
                </Button>
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => handleModeChange(mode === 'signup' ? 'login' : 'signup')}>
                <Text style={styles.footerLink}>
                  {mode === 'signup' ? 'Log In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.legal}>
              By continuing, you agree to our{' '}
              <Text style={styles.legalLink}>Terms of Service</Text> and{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  card: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    gap: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadow.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
  },
  logoMark: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: THEME.colors.primary,
  },
  brandName: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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