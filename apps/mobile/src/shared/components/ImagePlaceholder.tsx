import React, { JSX } from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

interface ImagePlaceholderProps {
  width?: number | string;
  height: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function ImagePlaceholder({
  width,
  height,
  label,
  style,
}: ImagePlaceholderProps): JSX.Element {
  return (
    <View
      style={[
        styles.container,
        { height, width: width as number | undefined },
        style,
      ]}
    >
      <Ionicons name="image-outline" size={32} color={THEME.colors.textMuted} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.xs,
    overflow: 'hidden',
  },
  label: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
  },
});
