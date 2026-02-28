import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { Button, FilterChips, Tag } from '@shared/components';
import { useAuth } from '@shared/context/AuthContext';
import { useSavedNeighborhoods } from './hooks/useSavedNeighborhoods';
import { SORT_OPTIONS, type SortOption } from './types';
import { useNeighborhoodCache } from '@shared/context/NeighborhoodCacheContext';

export function SavedScreen(): JSX.Element {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { data: saved, source, remove, isLoading } = useSavedNeighborhoods();
  const { set } = useNeighborhoodCache();
  
  const [activeSort, setActiveSort] = useState<SortOption>('Highest Match');
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCardPress = (id: string) => {
    const entry = source.find((s) => s.neighborhood.id === id);
    if (entry) set(id, entry);
    router.push(`/neighborhood/${id}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Favorite Neighborhoods</Text>
            <Text style={styles.headerSubtitle}>{saved.length} Neighborhoods found</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} hitSlop={8}>
            <Ionicons name="options-outline" size={20} color={THEME.colors.text} />
          </TouchableOpacity>
        </View>

        <FilterChips
          options={SORT_OPTIONS}
          value={activeSort}
          onChange={(v) => v && setActiveSort(v)}
          activeIndicator
        />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={
                  item.photoUrl
                    ? { uri: item.photoUrl }
                    : require('@assets/miami-bg.png')
                }
                style={styles.cardImage}
                resizeMode="cover"
              />

              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <View style={styles.cardNameBlock}>
                    <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.cardCity}>Miami, FL</Text>
                  </View>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>{item.score}</Text>
                    <Text style={styles.matchBadgeLabel}>score</Text>
                  </View>
                </View>

                <View style={styles.tagsRow}>
                  {item.tags.map((tag) => (
                    <Tag key={tag} variant="neutral">
                      <Tag.Label>{tag}</Tag.Label>
                    </Tag>
                  ))}
                </View>

                <Text style={styles.matchText}>
                  {item.matchCount} match your profile
                </Text>

                <View style={styles.cardFooter}>
                  <TouchableOpacity onPress={() => handleCardPress(item.id)}>
                    <Text style={styles.detailsLink}>View details</Text>
                  </TouchableOpacity>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => remove(item.id)} hitSlop={8}>
                      <Ionicons name="heart" size={20} color={THEME.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.compareRow}
                  onPress={() => toggleCompare(item.id)}
                >
                  <View
                    style={[
                      styles.compareCheck,
                      compareIds.includes(item.id) && styles.compareCheckActive,
                    ]}
                  >
                    {compareIds.includes(item.id) ? (
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <Text style={styles.compareLabel}>Add to compare</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={40} color={THEME.colors.textMuted} />
              <Text style={styles.emptyText}>
                {!isLoggedIn
                  ? 'Sign in to see your favorites.'
                  : 'No saved neighborhoods yet.'}
              </Text>
            </View>
          }
        />
      )}

      <Button onPress={() => {}} style={styles.fab}>
        <Button.Icon name="git-compare-outline" />
        <Button.Label>{`Compare (${compareIds.length})`}</Button.Label>
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },

  header: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  headerSubtitle: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },

  list: {
    padding: THEME.spacing.lg,
    paddingBottom: 100,
    gap: THEME.spacing.md,
  },

  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
    ...THEME.shadow.sm,
  },

  cardImage: {
    width: '100%',
    height: 90,
  },

  cardBody: {
    padding: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  cardNameBlock: { flex: 1, gap: 2, marginRight: THEME.spacing.sm },

  cardName: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },

  cardCity: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
  },

  matchBadge: {
    alignItems: 'center',
    backgroundColor: THEME.colors.successLight,
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 4,
    minWidth: 52,
  },

  matchBadgeText: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.success,
  },

  matchBadgeLabel: {
    fontSize: THEME.fontSize.xxs,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.success,
    letterSpacing: 0.3,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.xs,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.xs,
  },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },

  detailsLink: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },

  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: THEME.spacing.sm,
    marginTop: THEME.spacing.xs,
  },

  compareCheck: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.background,
  },

  compareCheckActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },

  compareLabel: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xxl,
    gap: THEME.spacing.md,
  },

  emptyText: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },

  loadingText: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
  },

  fab: {
    position: 'absolute',
    bottom: THEME.spacing.xl,
    alignSelf: 'center',
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: THEME.spacing.lg,
    ...THEME.shadow.md,
  },
  matchText: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
  },
});