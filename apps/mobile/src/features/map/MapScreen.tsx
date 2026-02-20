import React, { JSX, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '@shared/theme';
import { Button, FilterChips, HeaderBackButton, ImagePlaceholder, Map, NeighborhoodMarker, ScoreBadge, Tag } from '@shared/components';
import { useMapNeighborhoods } from './hooks/useMapNeighborhoods';
import { MAP_FILTERS, type MapFilter, type NeighborhoodPreview } from './types';
import { MIAMI_CONFIG } from '@rent-tracker/config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.42;

export function MapScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: neighborhoods } = useMapNeighborhoods();
  const [activeFilter, setActiveFilter] = useState<MapFilter | null>(null);
  const [selected, setSelected] = useState<NeighborhoodPreview | null>(null);
  const sheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const openSheet = (item: NeighborhoodPreview) => {
    setSelected(item);
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: SHEET_HEIGHT,
      duration: 280,
      useNativeDriver: true,
    }).start(() => setSelected(null));
  };

  return (
    <View style={styles.container}>
      <Map style={styles.map}>
        <Map.Camera
          defaultSettings={{
            centerCoordinate: [MIAMI_CONFIG.center.lng, MIAMI_CONFIG.center.lat],
            zoomLevel: 11,
          }}
        />

        {neighborhoods.map((item) => (
          <Map.Marker
            key={item.id}
            id={item.id}
            coordinate={[item.lng, item.lat]}
            onPress={() => openSheet(item)}
          >
            <NeighborhoodMarker score={item.score} size="sm" />
          </Map.Marker>
        ))}
      </Map>

      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        <View style={styles.topRow}>
          <HeaderBackButton onPress={() => router.back()} variant="overlay" />
          <FilterChips
            options={MAP_FILTERS}
            value={activeFilter}
            onChange={setActiveFilter}
            toggleable
          />
        </View>
      </SafeAreaView>

      {selected ? (
        <>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closeSheet}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              styles.sheet,
              { bottom: insets.bottom, transform: [{ translateY: sheetAnim }] },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetName}>{selected.name}</Text>
                  <Text style={styles.sheetCity}>{selected.city}</Text>
                </View>
                <View style={styles.sheetScoreBlock}>
                  <ScoreBadge score={selected.score} size="lg" />
                  <Text style={styles.sheetScoreLabel}>LIFESTYLE SCORE</Text>
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

              <View style={styles.thumbnails}>
                {[0, 1, 2].map((i) => (
                  <ImagePlaceholder key={i} height={64} style={styles.thumbnail} />
                ))}
              </View>

              <Button
                onPress={() => {
                  closeSheet();
                  router.push(`/neighborhood/${selected.id}`);
                }}
                size="lg"
                style={styles.detailsBtn}
              >
                <Button.Label>View Full Details</Button.Label>
                <Button.Icon name="arrow-forward-outline" />
              </Button>
            </View>
          </Animated.View>
        </>
      ) : null}
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
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.background,
    borderTopLeftRadius: THEME.borderRadius.lg,
    borderTopRightRadius: THEME.borderRadius.lg,
    ...THEME.shadow.md,
    minHeight: SHEET_HEIGHT,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.full,
    alignSelf: 'center',
    marginTop: THEME.spacing.sm,
  },
  sheetContent: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sheetName: {
    fontSize: THEME.fontSize.xl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  sheetCity: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  sheetScoreBlock: {
    alignItems: 'center',
    gap: 3,
  },
  sheetScoreLabel: {
    fontSize: THEME.fontSize.xxs,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  sheetTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.xs,
  },
  thumbnails: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  thumbnail: {
    flex: 1,
    borderRadius: THEME.borderRadius.sm,
  },
  detailsBtn: { width: '100%' },
});
