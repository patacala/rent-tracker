import React, { JSX, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { Button, FilterChips, Input, NeighborhoodCard, Tag } from '@shared/components';
import { APP_CONFIG } from '@rent-tracker/config';
import { useExploreNeighborhoods } from './hooks/useExploreNeighborhoods';
import { EXPLORE_FILTERS, type ExploreFilter } from './types';
import { useAuth } from '@shared/context/AuthContext';
import { useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { BottomSheet } from '@shared/components/BottomSheet';
import { EditPreferencesForm } from './components/EditPreferencesForm';
import { AuthPromptModal } from './components/AuthPromptModal';
import {
  OnboardingProfile,
  SaveOnboardingRequest,
  useGetOnboardingQuery,
  useUpdateOnboardingMutation,
} from '@features/onboarding/store/onboardingApi';

export function ExploreScreen(): JSX.Element {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { data: localOnboarding } = useOnboarding();
  const { data: neighborhoods, isEmpty } = useExploreNeighborhoods();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ExploreFilter>('Best Match');
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    console.log('neighborhoods', neighborhoods);
  }, [neighborhoods]);

  const { data: serverOnboarding, isLoading: onboardingLoading } = useGetOnboardingQuery(
    undefined,
    { skip: !isLoggedIn },
  );

  const [updateOnboarding] = useUpdateOnboardingMutation();

  // Si hay datos del servidor úsalos, si no usa los locales
  const formInitialData: OnboardingProfile | null = serverOnboarding
    ? serverOnboarding
    : localOnboarding?.workAddress?.trim().length
    ? {
        id: '',
        userId: '',
        workAddress: localOnboarding.workAddress,
        commute: localOnboarding.commute,
        priorities: localOnboarding.priorities,
        hasChildren: localOnboarding.hasChildren,
        childAgeGroups: localOnboarding.childAgeGroups,
        hasPets: localOnboarding.hasPets,
        lifestyle: localOnboarding.lifestyle ?? undefined,
      }
    : null;

  const cityName =
    APP_CONFIG.defaultCity.charAt(0).toUpperCase() + APP_CONFIG.defaultCity.slice(1);

  const filtered = neighborhoods.filter(
    (item) =>
      search.trim() === '' || item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCardPress = (id: string) => {
    router.push(`/neighborhood/${id}`);
  };

  const handleUpdate = async (payload: SaveOnboardingRequest) => {
    await updateOnboarding(payload);
    setFormKey((k) => k + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Top Rated for You</Text>
          <TouchableOpacity style={styles.notifBtn} hitSlop={8}>
            <Ionicons name="notifications-outline" size={22} color={THEME.colors.text} />
          </TouchableOpacity>
        </View>

        {isLoggedIn ? (
          <TouchableOpacity style={styles.editPrefsBtn} onPress={() => setPrefsOpen(true)}>
            <Ionicons name="options-outline" size={14} color={THEME.colors.primary} />
            <Text style={styles.editPrefsLabel}>Edit Onboarding Preferences</Text>
          </TouchableOpacity>
        ) : null}

        <Input>
          <Input.Field>
            <Input.Icon name="search-outline" />
            <Input.TextInput
              placeholder={`Search neighborhoods in ${cityName}`}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </Input.Field>
        </Input>

        <FilterChips
          options={EXPLORE_FILTERS}
          value={activeFilter}
          onChange={(v) => v && setActiveFilter(v)}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NeighborhoodCard
            onPress={() => handleCardPress(item.id)}
            style={styles.card}
          >
            <View style={styles.cardImageContainer}>
              <Image
                source={
                  item.photoUrl
                    ? { uri: item.photoUrl }
                    : require('@assets/miami-bg.png')
                }
                style={{ width: '100%', height: 180 }}
                resizeMode="cover"
              />
              <NeighborhoodCard.Score score={item.score} />
              <View style={styles.cardOverlayText}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardTagline}>{item.tagline}</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <NeighborhoodCard.Tags>
                {item.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} variant="neutral">
                    <Tag.Label>{tag}</Tag.Label>
                  </Tag>
                ))}
              </NeighborhoodCard.Tags>

              <NeighborhoodCard.Footer>
                <View style={styles.matchRow}>
                  <View style={styles.matchAvatars}>
                    <View style={[styles.avatar, { backgroundColor: THEME.colors.primary }]} />
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: THEME.colors.primaryActive, marginLeft: -6 },
                      ]}
                    />
                  </View>
                  <Text style={styles.matchText}>{item.matchCount} match your profile</Text>
                </View>
                <TouchableOpacity onPress={() => handleCardPress(item.id)}>
                  <Text style={styles.detailsLink}>Details &rsaquo;</Text>
                </TouchableOpacity>
              </NeighborhoodCard.Footer>
            </View>
          </NeighborhoodCard>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name={isEmpty ? 'map-outline' : 'search-outline'}
              size={40}
              color={THEME.colors.textMuted}
            />
            <Text style={styles.emptyText}>
              {isEmpty
                ? 'No analysis yet.\nRun an analysis to see neighborhoods.'
                : 'No neighborhoods match your search.'}
            </Text>
          </View>
        }
      />

      {isLoggedIn ? (
        <Button onPress={() => router.push('/map')} style={styles.fab}>
          <Button.Icon name="map-outline" />
          <Button.Label>View on Map</Button.Label>
        </Button>
      ) : (
        <TouchableOpacity
          style={styles.findMoreBtn}
          onPress={() => setAuthModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.findMoreLeft}>
            <View style={styles.findMoreIconWrap}>
              <Ionicons name="compass-outline" size={18} color={THEME.colors.primary} />
            </View>
            <Text style={styles.findMoreTitle}>Find More Neighborhoods</Text>
          </View>
          <View style={styles.findMoreBadge}>
            <Ionicons name="lock-closed" size={12} color={THEME.colors.primary} />
          </View>
        </TouchableOpacity>
      )}

      <BottomSheet
        visible={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        title="Edit Preferences"
        blur
        blurIntensity={12}
        snapHeight="83%"
      >
        <EditPreferencesForm
          key={formKey}
          initialData={formInitialData}
          loading={onboardingLoading}
          onSave={() => setPrefsOpen(false)}
          onUpdate={handleUpdate}
        />
      </BottomSheet>

      <BottomSheet
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        title=""
        blur
        blurIntensity={12}
        snapHeight="52%"
      >
        <AuthPromptModal onClose={() => setAuthModalVisible(false)} />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  header: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
    gap: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xs,
  },
  headerTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: THEME.spacing.lg,
    paddingBottom: 100,
    gap: THEME.spacing.lg,
  },
  card: { width: '100%' },
  cardImageContainer: { position: 'relative' },
  cardOverlayText: {
    position: 'absolute',
    bottom: THEME.spacing.md,
    left: THEME.spacing.md,
  },
  cardName: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: '#FFFFFF',
  },
  cardTagline: {
    fontSize: THEME.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  matchAvatars: { flexDirection: 'row' },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  matchText: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
  },
  detailsLink: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xxl,
  },
  emptyText: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: THEME.spacing.md,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: THEME.spacing.xl,
    alignSelf: 'center',
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: THEME.spacing.lg,
    ...THEME.shadow.md,
  },
  findMoreBtn: {
    position: 'absolute',
    bottom: THEME.spacing.md,
    left: THEME.spacing.sm,
    right: THEME.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    ...THEME.shadow.md,
  },
  findMoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  findMoreIconWrap: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findMoreTitle: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
  findMoreBadge: {
    width: 28,
    height: 28,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPrefsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.primaryLight,
    borderWidth: 1,
    borderColor: THEME.colors.primary + '40',
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderStyle: 'dashed',
  },
  editPrefsLabel: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.primary,
    letterSpacing: 0.3,
  },
});