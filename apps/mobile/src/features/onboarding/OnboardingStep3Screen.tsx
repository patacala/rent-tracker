import React, { JSX, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { Button, HeaderBackButton, StepIndicator, ToggleGroup } from '@shared/components';
import { useOnboarding } from './context/OnboardingContext';

type ChildAgeGroup = '0-5' | '6-12' | '13-18';
type LifestylePreference = 'suburban' | 'urban';

const AGE_GROUPS: ChildAgeGroup[] = ['0-5', '6-12', '13-18'];

export function OnboardingStep3Screen(): JSX.Element {
  const router = useRouter();
  const { data, setStep3 } = useOnboarding();

  const [hasChildren, setHasChildren] = useState<'yes' | 'no'>(data.hasChildren);
  const [childAgeGroups, setChildAgeGroups] = useState<ChildAgeGroup[]>(data.childAgeGroups);
  const [hasPets, setHasPets] = useState<'yes' | 'no'>(data.hasPets);
  const [lifestyle, setLifestyle] = useState<LifestylePreference | null>(data.lifestyle);

  const toggleAgeGroup = (group: ChildAgeGroup) => {
    setChildAgeGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
  };

  const onNext = async () => {
    await setStep3({ hasChildren, childAgeGroups, hasPets, lifestyle });

    const finalData = { ...data, hasChildren, childAgeGroups, hasPets, lifestyle };
    console.log('Resultado consola', JSON.stringify(finalData, null, 2));

    router.replace('/analysis');
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
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator current={3} total={3} label="Family Profile" />

        <Text style={styles.title}>Tell us about your household</Text>

        <View style={styles.section}>
          <Text style={styles.question}>Are you moving with children?</Text>
          <ToggleGroup value={hasChildren} onChange={(v) => setHasChildren(v as 'yes' | 'no')}>
            <ToggleGroup.Item value="yes" label="Yes" />
            <ToggleGroup.Item value="no" label="No" />
          </ToggleGroup>

          {hasChildren === 'yes' ? (
            <View style={styles.ageGroups}>
              <Text style={styles.ageGroupLabel}>
                Ages of children? <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <View style={styles.ageGroupRow}>
                {AGE_GROUPS.map((group) => (
                  <TouchableOpacity
                    key={group}
                    onPress={() => toggleAgeGroup(group)}
                    style={[styles.ageChip, childAgeGroups.includes(group) && styles.ageChipActive]}
                  >
                    <Text style={[styles.ageChipText, childAgeGroups.includes(group) && styles.ageChipTextActive]}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.question}>Any pets?</Text>
          <ToggleGroup value={hasPets} onChange={(v) => setHasPets(v as 'yes' | 'no')}>
            <ToggleGroup.Item value="yes" label="Yes" />
            <ToggleGroup.Item value="no" label="No" />
          </ToggleGroup>
        </View>

        <View style={styles.section}>
          <Text style={styles.question}>Do you prefer a suburban or urban feel?</Text>
          <View style={styles.lifestyleRow}>
            {(['suburban', 'urban'] as LifestylePreference[]).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setLifestyle(option)}
                style={[styles.lifestyleCard, lifestyle === option && styles.lifestyleCardActive]}
              >
                {lifestyle === option ? (
                  <View style={styles.lifestyleCheck}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                ) : null}
                <Ionicons
                  name={option === 'suburban' ? 'home-outline' : 'business-outline'}
                  size={28}
                  color={lifestyle === option ? THEME.colors.primary : THEME.colors.textSecondary}
                />
                <Text style={[styles.lifestyleTitle, lifestyle === option && styles.lifestyleTitleActive]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
                <Text style={styles.lifestyleDesc}>
                  {option === 'suburban'
                    ? 'Quiet streets, parks, and more space.'
                    : 'Walkable, vibrant, and close to action.'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={onNext} style={styles.cta}>
          <Button.Label>Next: Analyze My Life</Button.Label>
          <Button.Icon name="arrow-forward-outline" />
        </Button>
        <Text style={styles.disclaimer}>
          We use these details to refine your personalized relocation matching algorithm.
        </Text>
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
  stepBadge: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
    lineHeight: 36,
  },
  section: {
    gap: THEME.spacing.md,
  },
  question: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
  ageGroups: {
    gap: THEME.spacing.sm,
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  ageGroupLabel: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.medium,
    color: THEME.colors.primary,
  },
  optional: {
    color: THEME.colors.textMuted,
    fontWeight: THEME.fontWeight.regular,
  },
  ageGroupRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  ageChip: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  ageChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  ageChipText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.medium,
    color: THEME.colors.textSecondary,
  },
  ageChipTextActive: {
    color: THEME.colors.primary,
  },
  lifestyleRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  lifestyleCard: {
    flex: 1,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    gap: THEME.spacing.xs,
    position: 'relative',
  },
  lifestyleCardActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  lifestyleCheck: {
    position: 'absolute',
    top: THEME.spacing.xs,
    right: THEME.spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifestyleTitle: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
  lifestyleTitleActive: {
    color: THEME.colors.primary,
  },
  lifestyleDesc: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
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
  disclaimer: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});