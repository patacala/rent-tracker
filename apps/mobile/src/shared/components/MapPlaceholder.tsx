import React, { JSX } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

interface MapPlaceholderProps {
  style?: StyleProp<ViewStyle>;
}

export function MapPlaceholder({ style }: MapPlaceholderProps): JSX.Element {
  return (
    <View style={[styles.container, style]}>
      {/* Grid lines hint */}
      <View style={styles.gridH1} />
      <View style={styles.gridH2} />
      <View style={styles.gridV1} />
      <View style={styles.gridV2} />
      <View style={styles.center}>
        <Ionicons name="map-outline" size={40} color={THEME.colors.textMuted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surfaceElevated,
    overflow: 'hidden',
    position: 'relative',
  },
  gridH1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  gridH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66%',
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  gridV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    width: 1,
    backgroundColor: THEME.colors.border,
  },
  gridV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66%',
    width: 1,
    backgroundColor: THEME.colors.border,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
