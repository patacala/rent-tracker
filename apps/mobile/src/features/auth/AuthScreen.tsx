import React, { JSX, memo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { THEME } from '@shared/theme';
import { Button, Input, ToggleGroup } from '@shared/components';
import { useAuth } from '@shared/context/AuthContext';
import { useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { useAnalysis } from '@features/analysis/context/AnalysisContext';
import { useCheckEmailMutation, useSyncUserMutation } from './store/authApi';
import {
  useSaveOnboardingMutation,
  useUpdateOnboardingMutation,
  useLazyGetOnboardingQuery,
} from '@features/onboarding/store/onboardingApi';
import { apiClient } from '@shared/api/apiClient';
import { supabase } from '@shared/lib/supabase';
import { useLocalSearchParams } from 'expo-router';

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

const SignupForm = memo(function SignupForm({
  onSubmit,
  serverError,
  isSubmitting,
}: {
  onSubmit: (values: SignupFormData) => void;
  serverError: string | null;
  isSubmitting: boolean;
}) {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', password: '' },
  });

  return (
    <View style={styles.form}>
      <Input>
        <Input.Label>Full name</Input.Label>
        <Input.Field>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input.TextInput
                placeholder="Your full name"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />
        </Input.Field>
        {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}
      </Input>

      <Input>
        <Input.Label>Email address</Input.Label>
        <Input.Field>
          <Input.Icon name="mail-outline" />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input.TextInput
                placeholder="name@example.com"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            )}
          />
        </Input.Field>
        {errors.email ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}
      </Input>

      <Input>
        <Input.Label>Password</Input.Label>
        <Input.Field secureTextEntry>
          <Input.Icon name="lock-closed-outline" />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input.TextInput
                placeholder="Min. 6 characters"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />
        </Input.Field>
        {errors.password ? <Text style={styles.errorText}>{errors.password.message}</Text> : null}
      </Input>

      {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || !isValid}
        style={styles.submitBtn}
      >
        <Button.Label>{isSubmitting ? 'Please wait...' : 'Create Account'}</Button.Label>
      </Button>
    </View>
  );
});

const LoginForm = memo(function LoginForm({
  onSubmit,
  serverError,
  isSubmitting,
}: {
  onSubmit: (values: LoginFormData) => void;
  serverError: string | null;
  isSubmitting: boolean;
}) {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  return (
    <View style={styles.form}>
      <Input>
        <Input.Label>Email address</Input.Label>
        <Input.Field>
          <Input.Icon name="mail-outline" />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input.TextInput
                placeholder="name@example.com"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            )}
          />
        </Input.Field>
        {errors.email ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}
      </Input>

      <Input>
        <Input.Label>Password</Input.Label>
        <Input.Field secureTextEntry>
          <Input.Icon name="lock-closed-outline" />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input.TextInput
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />
        </Input.Field>
        {errors.password ? <Text style={styles.errorText}>{errors.password.message}</Text> : null}
      </Input>

      {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || !isValid}
        style={styles.submitBtn}
      >
        <Button.Label>{isSubmitting ? 'Please wait...' : 'Sign In'}</Button.Label>
      </Button>
    </View>
  );
});

export function AuthScreen(): JSX.Element {
  const router = useRouter();
  const { login, signup } = useAuth();
  const { data: onboardingData } = useOnboarding();
  const { analysisResult } = useAnalysis();
  const [syncUser] = useSyncUserMutation();
  const [checkEmail] = useCheckEmailMutation();
  const [fetchOnboarding] = useLazyGetOnboardingQuery();
  const [saveOnboarding] = useSaveOnboardingMutation();
  const [updateOnboarding] = useUpdateOnboardingMutation();

  const { mode: initialMode } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<AuthMode>((initialMode as AuthMode) ?? 'signup');

  const [submittedEmail, setSubmittedEmail] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const persistAnalysisSession = async () => {
    if (!analysisResult || analysisResult.neighborhoods.length === 0) return;
    if (!onboardingData.workCoordinates) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const neighborhoodIds = analysisResult.neighborhoods.map(
      (item) => item.neighborhood.id,
    );

    apiClient
      .saveAnalysisSession(token, {
        neighborhoodIds,
        longitude: onboardingData.workCoordinates.longitude,
        latitude: onboardingData.workCoordinates.latitude,
        timeMinutes: onboardingData.commute,
        mode: 'driving',
      })
      .catch(() => {});
  };

  const syncToBackend = async () => {
    const syncResult = await syncUser();
    if ('error' in syncResult) throw new Error('User sync failed');

    if (onboardingData.workAddress.trim().length > 0) {
      const onboardingResult = await saveOnboarding({
        workAddress: onboardingData.workAddress,
        commute: onboardingData.commute,
        priorities: onboardingData.priorities,
        hasChildren: onboardingData.hasChildren,
        childAgeGroups: onboardingData.childAgeGroups,
        hasPets: onboardingData.hasPets,
        lifestyle: onboardingData.lifestyle ?? undefined,
      });
      if ('error' in onboardingResult) throw new Error('Onboarding save failed');
    }
  };

  const updateToBackend = async () => {
    await updateOnboarding({
      workAddress: onboardingData.workAddress,
      commute: onboardingData.commute,
      priorities: onboardingData.priorities,
      hasChildren: onboardingData.hasChildren,
      childAgeGroups: onboardingData.childAgeGroups,
      hasPets: onboardingData.hasPets,
      lifestyle: onboardingData.lifestyle ?? undefined,
    });
  };

  const handleSignup = async (values: SignupFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const checkResult = await checkEmail({ email: values.email });
      if ('data' in checkResult && checkResult?.data?.exists) {
        setServerError('An account with this email already exists. Please Log In.');
        return;
      }
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
      if (result.error) { setServerError(result.error); return; }

      const existingResult = await fetchOnboarding();
      const hasOnboarding = existingResult.data?.id;
      const hasLocalOnboarding = onboardingData.workAddress.trim().length > 0;

      if (!hasOnboarding && !hasLocalOnboarding) {
        router.replace('/onboarding/step1?fromAuth=true');
        return;
      }

      if (!hasOnboarding && hasLocalOnboarding) {
        try { 
          await syncToBackend(); 
        } catch (error) {
          setServerError('Something went wrong while syncing your account.');
          return;
        }
        persistAnalysisSession();
        router.replace('/(tabs)/explore');
        return;
      }

      if (hasOnboarding && !hasLocalOnboarding) {
        persistAnalysisSession();
        router.replace('/(tabs)/explore');
        return;
      }

      Alert.alert(
        'Update your Onboarding?',
        'You already have Onboarding Preferences. Would you like to update it?',
        [
          {
            text: 'No, keep existing',
            style: 'cancel',
            onPress: () => {
              persistAnalysisSession();
              router.replace('/(tabs)/explore');
            },
          },
          {
            text: 'Yes, update',
            onPress: async () => {
              try { await updateToBackend(); } catch (e) { console.warn('Update failed:', e); }
              persistAnalysisSession();
              router.replace('/(tabs)/explore');
            },
          },
        ]
      );
    } catch (error) {
      setServerError('Unexpected error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setServerError(null);
  };

  if (mode === 'confirm') {
    return (
      <SafeAreaView style={styles.confirmSafe}>
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
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
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
                <SignupForm
                  onSubmit={handleSignup}
                  serverError={serverError}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <LoginForm
                  onSubmit={handleLogin}
                  serverError={serverError}
                  isSubmitting={isSubmitting}
                />
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safe: { flex: 1 },
  keyboardView: { flex: 1 },
  scroll: { flex: 1 },
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
  modeToggle: { marginTop: THEME.spacing.xs },
  form: { gap: THEME.spacing.md },
  errorText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.error,
  },
  submitBtn: { marginTop: THEME.spacing.xs },
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
  legalLink: { color: THEME.colors.primary },
  confirmSafe: {
    flex: 1,
    backgroundColor: THEME.colors.background,
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