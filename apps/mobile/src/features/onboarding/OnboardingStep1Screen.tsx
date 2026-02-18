import React, { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { THEME } from '@shared/theme';
import { Button, HeaderBackButton, Input, MapPlaceholder, StepIndicator, ToggleGroup } from '@shared/components';
import { useOnboarding } from './context/OnboardingContext';

type CommuteOption = 15 | 30 | 45;

const step1Schema = z.object({
  workAddress: z.string().min(3, 'Please enter a valid work address'),
  commute: z.union([z.literal(15), z.literal(30), z.literal(45)]),
});

type Step1FormData = z.infer<typeof step1Schema>;

export function OnboardingStep1Screen(): JSX.Element {
  const router = useRouter();
  const { data, setStep1 } = useOnboarding();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    defaultValues: {
      workAddress: data.workAddress,
      commute: data.commute,
    },
  });

  const onNext = async (values: Step1FormData) => {
    await setStep1(values);
    router.push('/onboarding/step2');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => router.back()} />
        <Text style={styles.brandName}>ONBOARDING</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator current={1} total={3} label="Work Location & Commute" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where will you be working?</Text>
          <Text style={styles.sectionSubtitle}>
            This helps us center your search around your professional hub.
          </Text>
          <Controller
            control={control}
            name="workAddress"
            render={({ field: { onChange, value } }) => (
              <Input>
                <Input.Field>
                  <Input.Icon name="location-outline" />
                  <Input.TextInput
                    placeholder="Enter work address or company name"
                    value={value}
                    onChangeText={onChange}
                    returnKeyType="done"
                    autoCapitalize="words"
                  />
                </Input.Field>
              </Input>
            )}
          />
          {errors.workAddress ? (
            <Text style={styles.errorText}>{errors.workAddress.message}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ideal commute time?</Text>
          <Text style={styles.sectionSubtitle}>
            What's your maximum daily travel comfort zone?
          </Text>
          <Controller
            control={control}
            name="commute"
            render={({ field: { onChange, value } }) => (
              <ToggleGroup
                value={value}
                onChange={(v) => onChange(v as CommuteOption)}
              >
                <ToggleGroup.Item value={15} label="15 min" sublabel="NEARBY" />
                <ToggleGroup.Item value={30} label="30 min" sublabel="BALANCED" />
                <ToggleGroup.Item value={45} label="45 min" sublabel="FLEXIBLE" />
              </ToggleGroup>
            )}
          />
          <View style={styles.commuteHint}>
            <Ionicons name="information-circle-outline" size={14} color={THEME.colors.primary} />
            <Text style={styles.commuteHintText}>
              We use this to calculate your daily routine efficiency and suggest
              neighborhoods with the best transit scores.
            </Text>
          </View>
        </View>

        <MapPlaceholder style={styles.mapPreview} />

        <View style={styles.mapPreviewLabel}>
          <Ionicons name="navigate-outline" size={14} color={THEME.colors.primary} />
          <Text style={styles.mapPreviewText}>Interactive Map Preview</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={handleSubmit(onNext)}
          disabled={!isValid}
          style={styles.cta}
        >
          <Button.Label>Next: My Priorities</Button.Label>
          <Button.Icon name="arrow-forward-outline" />
        </Button>
        <Text style={styles.stepLabel}>Step 1 of 3 · Work & Commute</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
    gap: THEME.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    marginLeft: 20
  },
  brandName: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  section: {
    gap: THEME.spacing.sm,
  },
  sectionTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  sectionSubtitle: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    lineHeight: 19,
  },
  errorText: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.error,
    marginTop: 2,
  },
  commuteHint: {
    flexDirection: 'row',
    gap: THEME.spacing.xs,
    backgroundColor: THEME.colors.primaryLight,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    marginTop: THEME.spacing.xs,
  },
  commuteHintText: {
    flex: 1,
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.primary,
    lineHeight: 17,
  },
  mapPreview: {
    height: 140,
    borderRadius: THEME.borderRadius.lg,
  },
  mapPreviewLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.xs,
    marginTop: -THEME.spacing.md,
  },
  mapPreviewText: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.medium,
  },
  footer: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
    gap: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  cta: {
    width: '100%',
  },
  stepLabel: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
});