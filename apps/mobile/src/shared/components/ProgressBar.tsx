import React, { JSX, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { THEME } from '../theme';

interface ProgressBarContextValue {
  progress: number;
  color: string;
  animate: boolean;
}

const ProgressBarContext = React.createContext<ProgressBarContextValue | null>(null);

function useProgressBarContext(): ProgressBarContextValue {
  const ctx = React.useContext(ProgressBarContext);
  if (!ctx) throw new Error('ProgressBar sub-components must be used within ProgressBar.Root');
  return ctx;
}

interface ProgressBarRootProps {
  progress: number;
  color?: string;
  animate?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function ProgressBarRoot({
  progress,
  color = THEME.colors.primary,
  animate = true,
  children,
  style,
}: ProgressBarRootProps): JSX.Element {
  return (
    <ProgressBarContext.Provider value={{ progress, color, animate }}>
      <View style={[styles.track, style]}>{children ?? <ProgressBarFill />}</View>
    </ProgressBarContext.Provider>
  );
}

function ProgressBarFill({ style }: { style?: StyleProp<ViewStyle> }): JSX.Element {
  const { progress, color, animate } = useProgressBarContext();
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate) {
      Animated.timing(widthAnim, {
        toValue: Math.min(100, Math.max(0, progress)),
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(Math.min(100, Math.max(0, progress)));
    }
  }, [progress, animate, widthAnim]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[styles.fill, { width, backgroundColor: color }, style]}
    />
  );
}

function ProgressBarLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}): JSX.Element {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export const ProgressBar = Object.assign(ProgressBarRoot, {
  Fill: ProgressBarFill,
  Label: ProgressBarLabel,
});

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: THEME.borderRadius.full,
  },
  label: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
  },
});
