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
import { Button, FilterChips, ImagePlaceholder, Tag } from '@shared/components';
import { useSavedNeighborhoods } from './hooks/useSavedNeighborhoods';
import { SORT_OPTIONS, type SortOption } from './types';

export function SavedScreen(): JSX.Element {
  const router = useRouter();
  const { data: saved, remove } = useSavedNeighborhoods();
  const [activeSort, setActiveSort] = useState<SortOption>('Highest Match');
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Saved Neighborhoods</Text>
            <Text style={styles.headerSubtitle}>{saved.length} locations found</Text>
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

      <FlatList
        data={saved}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <ImagePlaceholder height={90} style={styles.cardImage} />

            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardNameBlock}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardCity}>{item.city}</Text>
                </View>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchBadgeText}>{item.matchPercent}%</Text>
                  <Text style={styles.matchBadgeLabel}>match</Text>
                </View>
              </View>

              <Tag variant="neutral">
                <Tag.Label>{item.tag}</Tag.Label>
              </Tag>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.priceLabel}>AVG. PRICE</Text>
                  <Text style={styles.priceValue}>{item.avgPrice}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => router.push(`/neighborhood/${item.id}`)}>
                    <Text style={styles.detailsLink}>View details</Text>
                  </TouchableOpacity>
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
            <Ionicons name="bookmark-outline" size={40} color={THEME.colors.textMuted} />
            <Text style={styles.emptyText}>No saved neighborhoods yet.</Text>
          </View>
        }
      />

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
  cardImage: { borderRadius: 0 },
  cardBody: {
    padding: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardNameBlock: { flex: 1, gap: 2 },
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
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.xs,
  },
  priceLabel: {
    fontSize: THEME.fontSize.xxs,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
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
  },

  fab: {
    position: 'absolute',
    bottom: THEME.spacing.xl,
    alignSelf: 'center',
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: THEME.spacing.lg,
    ...THEME.shadow.md,
  },
});
