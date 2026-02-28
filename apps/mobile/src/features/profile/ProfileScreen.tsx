import React, { JSX, useState } from 'react';
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
import { useAuth } from '@shared/context/AuthContext';
import { useOnboarding } from '@features/onboarding/context/OnboardingContext';
import { AvatarEditor } from './components/AvatarEditor';
import { EditNameModal } from './components/EditNameModal';
import { useAnalysis } from '@features/analysis/context/AnalysisContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  icon: IoniconName;
  label: string;
  onPress?: () => void;
}

export function ProfileScreen(): JSX.Element {
  const { reset: resetAnalysis } = useAnalysis();
  const { logout, user } = useAuth();
  const { reset } = useOnboarding();

  const [name, setName] = useState(user?.user_metadata?.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.user_metadata?.avatar_url ?? null
  );
  const [editNameVisible, setEditNameVisible] = useState(false);

  const MENU_ITEMS: MenuItem[] = [
    {
      icon: 'shield-checkmark-outline',
      label: 'Change Password',
      onPress: () => router.push('/change-password'),
    },
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'help-circle-outline', label: 'Help & Support' },
  ];

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
            resetAnalysis();
            AsyncStorage.clear();
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
          <AvatarEditor
            userId={user?.id ?? ''}
            avatarUrl={avatarUrl}
            onUpdated={setAvatarUrl}
          />

          <TouchableOpacity
            onPress={() => setEditNameVisible(true)}
            style={styles.nameRow}
          >
            <Text style={styles.profileName}>{name || 'Add your name'}</Text>
            <Ionicons name="pencil-outline" size={14} color={THEME.colors.primary} />
          </TouchableOpacity>

          <Text style={styles.profileEmail}>
            {user?.email ?? ''}
          </Text>
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

        <Text style={styles.version}>VERSION 1.0.0</Text>
      </ScrollView>

      <EditNameModal
        visible={editNameVisible}
        currentName={name}
        onClose={() => setEditNameVisible(false)}
        onSaved={setName}
      />
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
    marginTop: THEME.spacing.xs,
  },
  profileName: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  profileEmail: {
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