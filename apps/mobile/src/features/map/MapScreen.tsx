import React, { JSX, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@shared/theme';
import {
  Button,
  FilterChips,
  HeaderBackButton,
  Map,
  MapPolygon,
  NeighborhoodMarker,
  ScoreBadge,
  Tag,
} from '@shared/components';
import { BottomSheet } from '@shared/components/BottomSheet';
import { useMapNeighborhoods } from './hooks/useMapNeighborhoods';
import type { MapFilter, NeighborhoodPreview } from './types';
import { useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { getEffectivePriorityTerms, isRelevantCategory } from '@rent-tracker/utils';

export function MapScreen(): JSX.Element {
  const router = useRouter();
  const { data: neighborhoods, isochrone, center } = useMapNeighborhoods();
  const [activeFilters, setActiveFilters] = useState<MapFilter[]>(['All']);
  const [selected, setSelected] = useState<NeighborhoodPreview | null>(null);
  const { data: onboardingData } = useOnboarding();

  const availableFilters = useMemo(() => {
    const allTags = neighborhoods.flatMap((n) => n.tags);
    const uniqueTags = Array.from(new Set(allTags));

    const priorityTerms = getEffectivePriorityTerms(
      onboardingData.priorities,
      onboardingData.hasChildren === 'yes',
      onboardingData.hasPets === 'yes',
    );

    const matched = uniqueTags
      .filter((tag) => isRelevantCategory(tag.toLowerCase(), priorityTerms))
      .sort((a, b) => a.localeCompare(b));

    const unmatched = uniqueTags
      .filter((tag) => !isRelevantCategory(tag.toLowerCase(), priorityTerms))
      .sort((a, b) => a.localeCompare(b));

    return ['All', ...matched, ...unmatched] as MapFilter[];
  }, [neighborhoods, onboardingData]);

  const filteredNeighborhoods = useMemo(() => {
    if (selected) return neighborhoods.filter((n) => n.id === selected.id);

    const hasBestMatch = activeFilters.length === 0 || activeFilters.includes('All' as MapFilter);
    if (hasBestMatch) return neighborhoods;

    return neighborhoods.filter((n) =>
      activeFilters.every((f) =>
        n.tags.some((t) => t.toLowerCase() === f.toLowerCase()),
      ),
    );
  }, [neighborhoods, activeFilters, selected]);

  const handleFilterChange = (v: MapFilter | null | MapFilter[]) => {
    const selected = (Array.isArray(v) ? v : [v]).filter(Boolean) as MapFilter[];

    if (selected.length === 0) {
      setActiveFilters(['All'] as MapFilter[]);
      return;
    }

    if (selected.includes('All' as MapFilter) && !activeFilters.includes('All' as MapFilter)) {
      setActiveFilters(['All'] as MapFilter[]);
      return;
    }

    setActiveFilters(selected.filter((f) => f !== 'All'));
  };

  return (
    <View style={styles.container}>
      <Map style={styles.map}>
        <Map.Camera
          defaultSettings={{
            centerCoordinate: center,
            zoomLevel: 11,
          }}
        />

        {isochrone ? (
          <MapPolygon id="isochrone" polygon={isochrone} />
        ) : null}

        {filteredNeighborhoods.map((item) => (
          <Map.Marker
            key={item.id}
            id={item.id}
            coordinate={[item.lng, item.lat]}
            onPress={() => setSelected(item)}
          >
            <NeighborhoodMarker score={item.score} size="sm" />
          </Map.Marker>
        ))}
      </Map>

      {/* Top overlay con back + filtros */}
      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        <View style={styles.topRow}>
          <HeaderBackButton onPress={() => router.back()} variant="overlay" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            <FilterChips
              options={availableFilters}
              value={activeFilters}
              onChange={handleFilterChange}
              multiSelect
            />
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* BottomSheet del neighborhood seleccionado */}
      <BottomSheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        snapHeight="37%"
        title="Neighborhood Details"
      >
        {selected ? (
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <Image
                source={
                  (selected as any).photoUrl
                    ? { uri: (selected as any).photoUrl }
                    : require('@assets/miami-bg.png')
                }
                style={styles.sheetImage}
                resizeMode="cover"
              />
              <View style={styles.sheetOverlay} />
              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetName}>{selected.name}</Text>
              </View>
              <View style={styles.sheetScore}>
                <ScoreBadge score={selected.score} size="lg" />
                <Text style={styles.sheetScoreLabel}>SCORE</Text>
              </View>
            </View>

            <View style={styles.sheetTags}>
              {selected.tags.map((tag) => (
                <Tag key={tag} variant="default">
                  <Tag.Label>{tag}</Tag.Label>
                </Tag>
              ))}
              <Tag variant="neutral">
                <Tag.Icon name="time-outline" />
                <Tag.Label>{`${selected.commuteMinutes}m Commute`}</Tag.Label>
              </Tag>
            </View>

            <Button
              onPress={() => {
                setSelected(null);
                router.push(`/neighborhood/${selected.id}`);
              }}
              size="lg"
              style={styles.detailsBtn}
            >
              <Button.Label>View Full Details</Button.Label>
              <Button.Icon name="arrow-forward-outline" />
            </Button>
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
  },
  filtersScroll: {
    flexGrow: 1,
  },
  sheetContent: {
    gap: THEME.spacing.md,
  },
  sheetHeader: {
    position: 'relative',
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    height: 110,
  },
  sheetImage: {
    width: '100%',
    height: '100%',
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },
  sheetHeaderText: {
    position: 'absolute',
    bottom: THEME.spacing.md,
    left: THEME.spacing.md,
  },
  sheetName: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: '#FFFFFF',
  },
  sheetScore: {
    position: 'absolute',
    top: THEME.spacing.md,
    right: THEME.spacing.md,
    alignItems: 'center',
    gap: 3,
  },
  sheetScoreLabel: {
    fontSize: THEME.fontSize.xxs,
    color: '#FFFFFF',
    fontWeight: THEME.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  sheetTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.xs,
  },
  detailsBtn: { width: '100%', marginTop: 10 },
});