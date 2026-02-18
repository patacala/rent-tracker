import React, { JSX } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

interface CategoryCardContextValue {
  selected: boolean;
}

const CategoryCardContext = React.createContext<CategoryCardContextValue | null>(null);

function useCategoryCardContext(): CategoryCardContextValue {
  const ctx = React.useContext(CategoryCardContext);
  if (!ctx) throw new Error('CategoryCard sub-components must be used within CategoryCard.Root');
  return ctx;
}

interface CategoryCardRootProps {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function CategoryCardRoot({
  selected,
  onPress,
  children,
  style,
}: CategoryCardRootProps): JSX.Element {
  return (
    <CategoryCardContext.Provider value={{ selected }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.root,
          selected ? styles.rootSelected : styles.rootUnselected,
          style,
        ]}
      >
        {selected ? (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={10} color="#FFFFFF" />
          </View>
        ) : null}
        {children}
      </TouchableOpacity>
    </CategoryCardContext.Provider>
  );
}

function CategoryCardIcon({
  name,
  size = 28,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
}): JSX.Element {
  const { selected } = useCategoryCardContext();
  return (
    <Ionicons
      name={name}
      size={size}
      color={selected ? THEME.colors.primary : THEME.colors.textSecondary}
    />
  );
}

function CategoryCardLabel({ children }: { children: string }): JSX.Element {
  const { selected } = useCategoryCardContext();
  return (
    <Text
      style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}
      numberOfLines={2}
      textBreakStrategy="simple"
    >
      {children}
    </Text>
  );
}

export const CategoryCard = Object.assign(CategoryCardRoot, {
  Icon: CategoryCardIcon,
  Label: CategoryCardLabel,
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    gap: THEME.spacing.xs,
    minHeight: 90,
    position: 'relative',
  },
  rootSelected: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  rootUnselected: {
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
  },
  checkmark: {
    position: 'absolute',
    top: THEME.spacing.xs,
    right: THEME.spacing.xs,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.medium,
    textAlign: 'center',
  },
  labelSelected: {
    color: THEME.colors.primary,
  },
  labelUnselected: {
    color: THEME.colors.textSecondary,
  },
});
