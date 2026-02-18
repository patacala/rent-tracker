import React, { JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { THEME } from '../theme';
import { ProgressBar } from './ProgressBar';

function percentageToColor(value: number): string {
  if (value >= 80) return THEME.colors.scoreExcellent;
  if (value >= 60) return THEME.colors.scoreGood;
  if (value >= 40) return THEME.colors.scoreFair;
  return THEME.colors.scorePoor;
}

interface MatchBarContextValue {
  value: number;
}

const MatchBarContext = React.createContext<MatchBarContextValue | null>(null);

function useMatchBarContext(): MatchBarContextValue {
  const ctx = React.useContext(MatchBarContext);
  if (!ctx) throw new Error('MatchBar sub-components must be used within MatchBar.Root');
  return ctx;
}

interface MatchBarRootProps {
  value: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function MatchBarRoot({ value, children, style }: MatchBarRootProps): JSX.Element {
  return (
    <MatchBarContext.Provider value={{ value }}>
      <View style={[styles.root, style]}>
        {children ?? (
          <>
            <MatchBarLabel>Match</MatchBarLabel>
            <MatchBarBar />
            <MatchBarPercentage />
          </>
        )}
      </View>
    </MatchBarContext.Provider>
  );
}

function MatchBarLabel({ children }: { children: string }): JSX.Element {
  return <Text style={styles.label}>{children}</Text>;
}

function MatchBarBar({ style }: { style?: StyleProp<ViewStyle> }): JSX.Element {
  const { value } = useMatchBarContext();
  return (
    <ProgressBar
      progress={value}
      color={percentageToColor(value)}
      style={[styles.bar, style]}
    />
  );
}

function MatchBarPercentage({ style }: { style?: StyleProp<ViewStyle> }): JSX.Element {
  const { value } = useMatchBarContext();
  const color = percentageToColor(value);
  return (
    <Text style={[styles.percentage, { color }, style as object]}>{value}%</Text>
  );
}

export const MatchBar = Object.assign(MatchBarRoot, {
  Label: MatchBarLabel,
  Bar: MatchBarBar,
  Percentage: MatchBarPercentage,
});

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  label: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.text,
    width: 110,
  },
  bar: {
    flex: 1,
    height: 8,
  },
  percentage: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    width: 40,
    textAlign: 'right',
  },
});
