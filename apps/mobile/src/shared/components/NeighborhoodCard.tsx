import React, { JSX } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { THEME } from '../theme';
import { ScoreBadge } from './ScoreBadge';
import { ImagePlaceholder } from './ImagePlaceholder';

const NeighborhoodCardContext = React.createContext<null>(null);

interface NeighborhoodCardRootProps {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function NeighborhoodCardRoot({
  onPress,
  children,
  style,
}: NeighborhoodCardRootProps): JSX.Element {
  return (
    <NeighborhoodCardContext.Provider value={null}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[styles.root, style]}
      >
        {children}
      </TouchableOpacity>
    </NeighborhoodCardContext.Provider>
  );
}

function NeighborhoodCardImage({
  height = 160,
  style,
}: {
  height?: number;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  return (
    <ImagePlaceholder
      height={height}
      style={[styles.image, style]}
    />
  );
}

function NeighborhoodCardScore({
  score,
}: {
  score: number;
}): JSX.Element {
  return (
    <View style={styles.scoreContainer}>
      <ScoreBadge score={score} size="md" />
      <Text style={styles.scoreLabel}>SCORE</Text>
    </View>
  );
}

function NeighborhoodCardTags({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  return (
    <View style={[styles.tags, style]}>{children}</View>
  );
}

function NeighborhoodCardFooter({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  return (
    <View style={[styles.footer, style]}>{children}</View>
  );
}

export const NeighborhoodCard = Object.assign(NeighborhoodCardRoot, {
  Image: NeighborhoodCardImage,
  Score: NeighborhoodCardScore,
  Tags: NeighborhoodCardTags,
  Footer: NeighborhoodCardFooter,
});

const styles = StyleSheet.create({
  root: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    ...THEME.shadow.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  image: {
    borderRadius: 0,
  },
  scoreContainer: {
    position: 'absolute',
    top: THEME.spacing.sm,
    right: THEME.spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  scoreLabel: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: THEME.fontWeight.bold,
    letterSpacing: 0.5,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    marginTop: THEME.spacing.sm,
  },
});
