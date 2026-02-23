import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { FilterChips, Input, NeighborhoodCard, Tag } from '@shared/components';
import { APP_CONFIG } from '@rent-tracker/config';
import { useExploreNeighborhoods } from './hooks/useExploreNeighborhoods';
import { EXPLORE_FILTERS, type ExploreFilter } from './types';
import { useAuth } from '@shared/context/AuthContext';
import { BottomSheet } from '@shared/components/BottomSheet';
import { EditPreferencesForm } from './components/EditPreferencesForm';
import { SaveOnboardingRequest, useUpdateOnboardingMutation } from '@features/onboarding/store/onboardingApi';

export function ExploreScreen(): JSX.Element {
  const router = useRouter();
  const { isLoggedIn, hasClickedCard, markCardClicked } = useAuth();
  const { data: neighborhoods, isEmpty } = useExploreNeighborhoods();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ExploreFilter>('Best Match');
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const [updateOnboarding] = useUpdateOnboardingMutation();

  const cityName =
    APP_CONFIG.defaultCity.charAt(0).toUpperCase() + APP_CONFIG.defaultCity.slice(1);

  const filtered = neighborhoods.filter(
    (item) =>
      search.trim() === '' || item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCardPress = async (id: string) => {
    if (isLoggedIn) {
      router.push(`/neighborhood/${id}`);
      return;
    }

    if (!hasClickedCard) {
      await markCardClicked();
      router.push(`/neighborhood/${id}`);
    } else {
      router.push('/auth');
    }
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
              <NeighborhoodCard.Image height={180} />
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
          onSave={() => setPrefsOpen(false)}
          onUpdate={handleUpdate}
        />
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
  editPrefsBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  editPrefsLabel: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.primary,
    letterSpacing: 0.3,
  },
});