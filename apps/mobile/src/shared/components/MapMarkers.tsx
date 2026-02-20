import React, { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { ScoreBadge } from './ScoreBadge';

// ─── Types ────────────────────────────────────────

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface NeighborhoodMarkerProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface IconMarkerProps {
  icon: IoniconName;
  label?: string;
  color?: string;
  backgroundColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface PriceMarkerProps {
  price: string;
  highlighted?: boolean;
}

// ─── Neighborhood Marker ──────────────────────────

export function NeighborhoodMarker({ score, size = 'md' }: NeighborhoodMarkerProps): JSX.Element {
  return (
    <View style={styles.markerContainer}>
      <ScoreBadge score={score} size={size} />
    </View>
  );
}

// ─── Generic Icon Marker ──────────────────────────

export function IconMarker({
  icon,
  label,
  color = THEME.colors.primary,
  backgroundColor = THEME.colors.background,
  size = 'md',
}: IconMarkerProps): JSX.Element {
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const containerSize = size === 'sm' ? 32 : size === 'lg' ? 44 : 38;

  return (
    <View style={styles.markerContainer}>
      <View
        style={[
          styles.iconMarker,
          {
            width: containerSize,
            height: containerSize,
            backgroundColor,
            borderColor: color,
          },
        ]}
      >
        <Ionicons name={icon} size={iconSize} color={color} />
      </View>
      {label ? (
        <View style={[styles.labelBubble, { backgroundColor }]}>
          <Text style={[styles.labelText, { color }]}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── Price Marker ─────────────────────────────────

export function PriceMarker({ price, highlighted = false }: PriceMarkerProps): JSX.Element {
  return (
    <View style={styles.markerContainer}>
      <View
        style={[
          styles.priceBubble,
          highlighted ? styles.priceBubbleHighlighted : styles.priceBubbleDefault,
        ]}
      >
        <Text
          style={[
            styles.priceText,
            highlighted ? styles.priceTextHighlighted : styles.priceTextDefault,
          ]}
        >
          {price}
        </Text>
      </View>
    </View>
  );
}

// ─── Specialized Markers (using IconMarker) ───────

export function SchoolMarker({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }): JSX.Element {
  return (
    <IconMarker
      icon="school-outline"
      color="#F59E0B"
      backgroundColor="#FFFBEB"
      size={size}
    />
  );
}

export function StoreMarker({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }): JSX.Element {
  return (
    <IconMarker
      icon="cart-outline"
      color="#8B5CF6"
      backgroundColor="#F5F3FF"
      size={size}
    />
  );
}

export function RestaurantMarker({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }): JSX.Element {
  return (
    <IconMarker
      icon="restaurant-outline"
      color="#EF4444"
      backgroundColor="#FEF2F2"
      size={size}
    />
  );
}

export function ParkMarker({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }): JSX.Element {
  return (
    <IconMarker
      icon="leaf-outline"
      color="#22C55E"
      backgroundColor="#F0FDF4"
      size={size}
    />
  );
}

export function GymMarker({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }): JSX.Element {
  return (
    <IconMarker
      icon="barbell-outline"
      color="#06B6D4"
      backgroundColor="#ECFEFF"
      size={size}
    />
  );
}

export function HospitalMarker({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }): JSX.Element {
  return (
    <IconMarker
      icon="medical-outline"
      color="#EC4899"
      backgroundColor="#FDF2F8"
      size={size}
    />
  );
}

export function TransitMarker({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }): JSX.Element {
  return (
    <IconMarker
      icon="train-outline"
      color="#3B82F6"
      backgroundColor="#EFF6FF"
      size={size}
    />
  );
}

// ─── Styles ───────────────────────────────────────

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon marker
  iconMarker: {
    borderRadius: 9999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadow.sm,
  },
  labelBubble: {
    marginTop: 4,
    paddingHorizontal: THEME.spacing.xs,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadow.sm,
  },
  labelText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
  },

  // Price marker
  priceBubble: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    ...THEME.shadow.md,
  },
  priceBubbleDefault: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
  },
  priceBubbleHighlighted: {
    backgroundColor: THEME.colors.primary,
  },
  priceText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.bold,
  },
  priceTextDefault: {
    color: THEME.colors.text,
  },
  priceTextHighlighted: {
    color: '#FFFFFF',
  },
});
