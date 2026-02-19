import React, { JSX, useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { Button, CategoryCard, HeaderBackButton, StepIndicator } from '@shared/components';
import { useOnboarding } from './context/OnboardingContext';

const CATEGORIES: Array<{
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}> = [
  { key: 'commute', label: 'Commute', icon: 'car-outline' },
  { key: 'schools', label: 'Top-Rated Schools', icon: 'school-outline' },
  { key: 'safety', label: 'Safety', icon: 'shield-checkmark-outline' },
  { key: 'dining', label: 'Dining & Bars', icon: 'restaurant-outline' },
  { key: 'parks', label: 'Parks & Greenery', icon: 'leaf-outline' },
  { key: 'shopping', label: 'Shopping', icon: 'bag-handle-outline' },
  { key: 'healthcare', label: 'Hospitals', icon: 'medkit-outline' },
  { key: 'transit', label: 'Public Transit', icon: 'bus-outline' },
];

const MIN_REQUIRED = 3;

export function OnboardingStep2Screen(): JSX.Element {
  const router = useRouter();
  const { data, setStep2, setCurrentStep } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(data.priorities);
  const isMounted = useRef(false);

  useEffect(() => {
    setCurrentStep(2);
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setStep2({ priorities: selected });
  }, [selected]);

  const toggle = useCallback((key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const canContinue = selected.length >= MIN_REQUIRED;

  const onNext = async () => {
    await setStep2({ priorities: selected });
    router.push('/onboarding/step3');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => router.navigate('/onboarding/step1')} />
        <Text style={styles.brandName}>ONBOARDING</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator current={2} total={3} label="Personalization" />

        <View style={styles.titleBlock}>
          <Text style={styles.title}>What matters most to you?</Text>
          <Text style={styles.subtitle}>
            Choose at least {MIN_REQUIRED} categories to help us personalize your lifestyle score.
          </Text>
        </View>

        <View style={styles.grid}>
          {CATEGORIES.map((cat, idx) => (
            <View key={cat.key} style={[styles.cardWrapper, idx % 2 !== 0 && styles.cardWrapperRight]}>
              <CategoryCard selected={selected.includes(cat.key)} onPress={() => toggle(cat.key)}>
                <CategoryCard.Icon name={cat.icon} />
                <CategoryCard.Label>{cat.label}</CategoryCard.Label>
              </CategoryCard>
            </View>
          ))}
        </View>

        <Text style={[styles.counter, canContinue ? styles.counterMet : styles.counterPending]}>
          Selected: {selected.length} of {MIN_REQUIRED} required
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={onNext}
          disabled={!canContinue}
          variant={canContinue ? 'primary' : 'outline'}
          style={styles.cta}
        >
          <Button.Label>Next: Family & Household</Button.Label>
          <Button.Icon name="arrow-forward-outline" />
        </Button>
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
    marginLeft: 20,
  },
  brandName: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  titleBlock: {
    gap: THEME.spacing.sm,
  },
  title: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    lineHeight: 19,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  cardWrapper: {
    width: '47%',
  },
  cardWrapperRight: {
    marginLeft: 'auto',
  },
  counter: {
    fontSize: THEME.fontSize.sm,
    textAlign: 'center',
    marginTop: -THEME.spacing.sm,
  },
  counterMet: {
    color: THEME.colors.success,
    fontWeight: THEME.fontWeight.semibold,
  },
  counterPending: {
    color: THEME.colors.textMuted,
  },
  footer: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  cta: {
    width: '100%',
  },
});