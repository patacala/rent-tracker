import React, { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { Map, PriceMarker } from '@shared/components';

interface PriceWalkSectionProps {
  medianPrice: string;
  walkScore: number;
  walkScoreLabel: string;
  lat?: number;
  lng?: number;
}

export function PriceWalkSection({
  medianPrice,
  walkScore,
  walkScoreLabel,
  lat,
  lng,
}: PriceWalkSectionProps): JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Price & Walkability</Text>
      <View style={styles.priceWalkRow}>
        <View style={styles.priceCard}>
          <Ionicons name="camera-outline" size={18} color={THEME.colors.primary} />
          <Text style={styles.priceCardLabel}>MEDIAN PRICE</Text>
          <Text style={styles.priceCardValue}>{medianPrice}</Text>
        </View>
        <View style={styles.priceCard}>
          <Ionicons name="walk-outline" size={18} color={THEME.colors.primary} />
          <Text style={styles.priceCardLabel}>WALK SCORE</Text>
          <Text style={styles.priceCardValue}>{walkScore}</Text>
          <View style={styles.walkBadge}>
            <Text style={styles.walkBadgeText}>{walkScoreLabel}</Text>
          </View>
        </View>
      </View>
      {lat && lng ? (
        <View style={styles.mapPriceContainer}>
          <Map style={styles.miniMap}>
            <Map.Camera
              defaultSettings={{
                centerCoordinate: [lng, lat],
                zoomLevel: 13,
              }}
            />
            <Map.Marker id="neighborhood-price" coordinate={[lng, lat]}>
              <PriceMarker price={medianPrice} highlighted />
            </Map.Marker>
          </Map>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
    gap: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  priceWalkRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  priceCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  priceCardLabel: {
    fontSize: THEME.fontSize.xxs,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  priceCardValue: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  walkBadge: {
    backgroundColor: THEME.colors.successLight,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
  },
  walkBadgeText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.success,
  },
  mapPriceContainer: {
    position: 'relative',
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  miniMap: {
    height: 120,
  },
  priceBubble: {
    position: 'absolute',
    top: THEME.spacing.md,
    left: THEME.spacing.md,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  priceBubbleText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.bold,
    color: '#FFFFFF',
  },
});
