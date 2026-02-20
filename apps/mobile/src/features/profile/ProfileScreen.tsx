import React, { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { THEME } from '@shared/theme';
import { ImagePlaceholder } from '@shared/components';
import { useAuth } from '@shared/context/AuthContext';
import { useOnboarding } from '@features/onboarding/context/OnboardingContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  icon: IoniconName;
  label: string;
  onPress?: () => void;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'search-outline', label: 'Search Preferences' },
  { icon: 'people-outline', label: 'Family Profiles' },
  { icon: 'shield-checkmark-outline', label: 'Account Security' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
];

export function ProfileScreen(): JSX.Element {
  const { logout } = useAuth();
  const { reset } = useOnboarding();

  const handleSignOut = () => {
    Alert.alert(
      'Confirm Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await reset();
            await logout();
            router.replace('/welcome');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <ImagePlaceholder height={88} style={styles.avatar} label="" />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.profileName}>Alexandra Hamilton</Text>
          <Text style={styles.profileRole}>Senior Architect</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={THEME.colors.textSecondary} />
            <Text style={styles.profileLocation}>New York, NY</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, index < MENU_ITEMS.length - 1 && styles.menuRowBorder]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={18} color={THEME.colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.7} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>VERSION 2.4.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  scroll: { flex: 1 },
  content: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
    gap: THEME.spacing.xl,
  },
  headerTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  avatarSection: {
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: THEME.spacing.xs,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.background,
  },
  profileName: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  profileRole: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.medium,
    color: THEME.colors.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  profileLocation: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
  },
  menuCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.medium,
    color: THEME.colors.text,
  },
  signOutBtn: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  signOutText: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.medium,
    color: THEME.colors.error,
  },
  version: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: THEME.fontWeight.medium,
  },
});
