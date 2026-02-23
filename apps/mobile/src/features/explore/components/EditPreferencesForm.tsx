import React, { JSX, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { THEME } from '@shared/theme';
import { Button } from '@shared/components';
import { SaveOnboardingRequest, useGetOnboardingQuery } from '@features/onboarding/store/onboardingApi';

const PRIORITIES = [
  { id: 'schools', label: 'Schools' },
  { id: 'safety', label: 'Safety' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'walkability', label: 'Walkability' },
  { id: 'quiet', label: 'Quiet' },
  { id: 'parks', label: 'Parks' },
  { id: 'commute', label: 'Commute' },
  { id: 'healthcare', label: 'Healthcare' },
];

type LifestylePreference = 'suburban' | 'urban';

interface EditPreferencesFormProps {
  onSave: () => void;
  onUpdate: (payload: SaveOnboardingRequest) => Promise<void>;
}

export function EditPreferencesForm({
  onSave,
  onUpdate,
}: EditPreferencesFormProps): JSX.Element {
  const { data: serverData, isLoading, isError } = useGetOnboardingQuery(undefined);

  const [showLoader, setShowLoader] = useState(isLoading || !serverData);
  const [dataPopulated, setDataPopulated] = useState(false);

  const [workAddress, setWorkAddress] = useState<string>('');
  const [commute, setCommute] = useState<number>(30);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<LifestylePreference | null>(null);
  const [hasChildren, setHasChildren] = useState<string>('no');
  const [childAgeGroups, setChildAgeGroups] = useState<string[]>([]);
  const [hasPets, setHasPets] = useState<string>('no');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (serverData && !dataPopulated) {
      setWorkAddress(serverData.workAddress ?? '');
      setCommute(serverData.commute ?? 30);
      setPriorities(serverData.priorities ?? []);
      setLifestyle((serverData.lifestyle as LifestylePreference) ?? null);
      setHasChildren(serverData.hasChildren ?? 'no');
      setChildAgeGroups(serverData.childAgeGroups ?? []);
      setHasPets(serverData.hasPets ?? 'no');
      setDataPopulated(true);
    }
  }, [serverData]);

  useEffect(() => {
    if (!isLoading) {
      if (dataPopulated) {
        const timeout = setTimeout(() => setShowLoader(false), 400);
        return () => clearTimeout(timeout);
      } else {
        setShowLoader(false);
      }
    }
    return undefined;
  }, [isLoading, dataPopulated, isError]);

  if (showLoader) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator color={THEME.colors.primary} />
      </View>
    );
  }

  const togglePriority = (id: string) => {
    setPriorities((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        workAddress,
        commute,
        priorities,
        hasChildren,
        childAgeGroups,
        hasPets,
        lifestyle: lifestyle ?? undefined,
      });
      onSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Work Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WORK LOCATION</Text>
          {isEditingAddress ? (
            <View style={styles.locationEditRow}>
              <TextInput
                style={styles.locationInput}
                value={workAddress}
                onChangeText={setWorkAddress}
                placeholder="Enter work address"
                placeholderTextColor={THEME.colors.textMuted}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => setIsEditingAddress(false)}
              />
              <TouchableOpacity onPress={() => setIsEditingAddress(false)} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.locationRow}>
              <View style={styles.locationIcon}>
                <Ionicons name="briefcase-outline" size={16} color={THEME.colors.primary} />
              </View>
              <View style={styles.locationText}>
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {workAddress || 'No address set'}
                </Text>
                <Text style={styles.locationSub}>Work address</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditingAddress(true)}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Max Commute */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>MAX COMMUTE</Text>
            <Text style={styles.commuteValue}>
              {commute === 60 ? '60m+' : `${commute} min`}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={3}
            step={1}
            value={[15, 30, 45, 60].indexOf(commute)}
            onValueChange={(index) => setCommute([15, 30, 45, 60][index])}
            minimumTrackTintColor={THEME.colors.primary}
            maximumTrackTintColor={THEME.colors.border}
            thumbTintColor={THEME.colors.primary}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>15m</Text>
            <Text style={styles.sliderLabel}>30m</Text>
            <Text style={styles.sliderLabel}>45m</Text>
            <Text style={styles.sliderLabel}>60m+</Text>
          </View>
        </View>

        {/* Top Priorities */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            TOP PRIORITIES{' '}
            <Text style={styles.sectionLabelSub}>(SELECT UP TO 3)</Text>
          </Text>
          <View style={styles.chipsWrap}>
            {PRIORITIES.map((p) => {
              const active = priorities.includes(p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => togglePriority(p.id)}
                  style={[styles.priorityChip, active && styles.priorityChipActive]}
                >
                  <Text style={[styles.priorityChipText, active && styles.priorityChipTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Lifestyle */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DO YOU PREFER A SUBURBAN OR URBAN FEEL?</Text>
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
                <View style={[styles.lifestyleIconWrap, lifestyle === option && styles.lifestyleIconWrapActive]}>
                  <Ionicons
                    name={option === 'suburban' ? 'home-outline' : 'business-outline'}
                    size={26}
                    color={lifestyle === option ? '#FFFFFF' : THEME.colors.textSecondary}
                  />
                </View>
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

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.floatingBtn}>
        <Button onPress={handleSave} disabled={isSaving}>
          <Button.Label>{isSaving ? 'Saving...' : 'Save & Update'}</Button.Label>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: {
    gap: THEME.spacing.lg,
    paddingBottom: THEME.spacing.sm,
  },
  bottomSpacer: { height: 80 },
  floatingBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: THEME.spacing.sm,
    paddingBottom: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: THEME.spacing.sm },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.textSecondary,
    letterSpacing: 0.8,
  },
  sectionLabelSub: {
    fontWeight: THEME.fontWeight.regular,
    color: THEME.colors.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
  },
  locationEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    padding: THEME.spacing.md,
  },
  locationInput: {
    flex: 1,
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.text,
    padding: 0,
  },
  doneBtn: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    backgroundColor: THEME.colors.primaryLight,
    borderRadius: THEME.borderRadius.sm,
  },
  doneBtnText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.primary,
  },
  locationIcon: {
    width: 34,
    height: 34,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: { flex: 1 },
  locationAddress: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
  locationSub: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
  },
  editLink: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },
  commuteValue: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.primary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  priorityChip: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  priorityChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  priorityChipText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.medium,
    color: THEME.colors.textSecondary,
  },
  priorityChipTextActive: { color: '#FFFFFF' },
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
  lifestyleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifestyleIconWrapActive: {
    backgroundColor: THEME.colors.primary,
  },
  lifestyleTitle: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
  lifestyleTitleActive: { color: THEME.colors.primary },
  lifestyleDesc: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -THEME.spacing.sm,
  },
  sliderLabel: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
    fontWeight: THEME.fontWeight.medium,
  },
});