import React, { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@shared/theme';
import { AmenityRow } from '@shared/components';
import type { NeighborhoodAmenity } from '../types';

interface AmenitiesSectionProps {
  amenities: NeighborhoodAmenity[];
}

export function AmenitiesSection({ amenities }: AmenitiesSectionProps): JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Local Amenities</Text>
      <View style={styles.amenitiesList}>
        {amenities.map((amenity) => (
          <AmenityRow key={amenity.name}>
            <AmenityRow.Icon name={amenity.icon} />
            <AmenityRow.Name>{amenity.name}</AmenityRow.Name>
            <AmenityRow.Distance>{amenity.distance}</AmenityRow.Distance>
          </AmenityRow>
        ))}
      </View>
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
  amenitiesList: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: THEME.spacing.md,
  },
});
