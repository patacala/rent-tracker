import React, { useState, useCallback, JSX } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmenityType, CommuteOption } from '@rent-tracker/types';
import type { OnboardingFormData } from '@rent-tracker/types';
import { THEME } from '@shared/theme';
import { Button } from '@shared/components/Button';
import { apiClient } from '@shared/api';
import { useApi } from '@shared/hooks/useApi';
import { MIAMI_CONFIG } from '@rent-tracker/config';

const COMMUTE_OPTIONS: CommuteOption[] = [
  CommuteOption.FIFTEEN,
  CommuteOption.THIRTY,
  CommuteOption.FORTY_FIVE,
];

const AMENITY_OPTIONS: { key: AmenityType; label: string }[] = [
  { key: AmenityType.SUPERMARKET, label: '🛒 Supermarket' },
  { key: AmenityType.GYM, label: '🏋️ Gym' },
  { key: AmenityType.PARK, label: '🌳 Park' },
  { key: AmenityType.SCHOOL, label: '🎓 School' },
  { key: AmenityType.RESTAURANT, label: '🍽️ Restaurants' },
  { key: AmenityType.PHARMACY, label: '💊 Pharmacy' },
  { key: AmenityType.COFFEE_SHOP, label: '☕ Coffee' },
  { key: AmenityType.PUBLIC_TRANSPORT, label: '🚌 Transit' },
];

export function OnboardingScreen(): JSX.Element {
  const router = useRouter();

  const [form, setForm] = useState<OnboardingFormData>({
    workAddress: '',
    maxCommuteMinutes: CommuteOption.THIRTY,
    amenities: [],
    hasFamily: false,
  });

  const createUser = useApi(apiClient.createUser);
  const savePreferences = useApi(apiClient.savePreferences);

  const toggleAmenity = useCallback((amenity: AmenityType): void => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!form.workAddress.trim()) {
      Alert.alert('Missing Info', 'Please enter your work location');
      return;
    }
    if (form.amenities.length === 0) {
      Alert.alert('Missing Info', 'Please select at least one amenity');
      return;
    }

    // Step 1: Create user (mock email for MVP)
    const userResult = await createUser.execute({
      email: `user_${Date.now()}@relocation.ai`,
      name: 'MVP User',
    });

    if (!userResult) return;

    // Step 2: Save preferences (use Miami center as work coords for MVP)
    const prefsResult = await savePreferences.execute({
      userId: userResult.user.id,
      workLat: MIAMI_CONFIG.center.lat,
      workLng: MIAMI_CONFIG.center.lng,
      maxCommuteMinutes: form.maxCommuteMinutes,
      amenities: form.amenities,
      hasFamily: form.hasFamily,
    });

    if (prefsResult) {
      router.push('/map');
    }
  }, [form, createUser, savePreferences, router]);

  const isLoading = createUser.loading || savePreferences.loading;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Find Your Neighborhood</Text>
          <Text style={styles.subtitle}>
            Tell us about your lifestyle and we'll show you where you'll thrive.
          </Text>
        </View>

        {/* Work Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>📍 Where do you work?</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g. Brickell, Downtown Miami"
            placeholderTextColor={THEME.colors.textMuted}
            value={form.workAddress}
            onChangeText={(text) => setForm((p) => ({ ...p, workAddress: text }))}
            returnKeyType="done"
          />
        </View>

        {/* Commute */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>⏱️ Max commute time</Text>
          <View style={styles.row}>
            {COMMUTE_OPTIONS.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[styles.chip, form.maxCommuteMinutes === minutes && styles.chipActive]}
                onPress={() => setForm((p) => ({ ...p, maxCommuteMinutes: minutes }))}
              >
                <Text
                  style={[
                    styles.chipText,
                    form.maxCommuteMinutes === minutes && styles.chipTextActive,
                  ]}
                >
                  {minutes} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🏙️ What matters to you nearby?</Text>
          <View style={styles.amenitiesGrid}>
            {AMENITY_OPTIONS.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.amenityChip, form.amenities.includes(key) && styles.chipActive]}
                onPress={() => toggleAmenity(key)}
              >
                <Text
                  style={[styles.chipText, form.amenities.includes(key) && styles.chipTextActive]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Family */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>👨‍👩‍👧 Do you have a family?</Text>
          <View style={styles.row}>
            {[true, false].map((val) => (
              <TouchableOpacity
                key={String(val)}
                style={[styles.chip, form.hasFamily === val && styles.chipActive]}
                onPress={() => setForm((p) => ({ ...p, hasFamily: val }))}
              >
                <Text style={[styles.chipText, form.hasFamily === val && styles.chipTextActive]}>
                  {val ? 'Yes' : 'No'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Error */}
        {(createUser.error ?? savePreferences.error) ? (
          <Text style={styles.error}>{createUser.error ?? savePreferences.error}</Text>
        ) : null}

        {/* Submit */}
        <Button
          label="See My Lifestyle Map →"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  container: { flex: 1 },
  content: { padding: THEME.spacing.lg, paddingBottom: THEME.spacing.xxl },
  header: { marginBottom: THEME.spacing.xl },
  title: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
  },
  section: { marginBottom: THEME.spacing.xl },
  sectionLabel: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm + 4,
    color: THEME.colors.text,
    fontSize: THEME.fontSize.base,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  row: { flexDirection: 'row', gap: THEME.spacing.sm },
  chip: {
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  chipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: `${THEME.colors.primary}20`,
  },
  chipText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.medium,
  },
  chipTextActive: { color: THEME.colors.primary },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  amenityChip: {
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  error: {
    color: THEME.colors.error,
    fontSize: THEME.fontSize.sm,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  cta: { marginTop: THEME.spacing.sm },
});
