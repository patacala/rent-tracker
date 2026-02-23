import React, { JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { THEME } from '@shared/theme';
import { Button } from '@shared/components';

interface AuthPromptModalProps {
  onClose: () => void;
}

export function AuthPromptModal({ onClose }: AuthPromptModalProps): JSX.Element {
  const handleSignUp = () => {
    onClose();
    router.push('/auth');
  };

  const handleLogIn = () => {
    onClose();
    router.push('/auth?mode=login');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Ionicons name="close" size={18} color={THEME.colors.textMuted} />
      </TouchableOpacity>

      <View style={styles.iconWrap}>
        <Ionicons name="compass-outline" size={30} color={THEME.colors.primary} />
      </View>

      <Text style={styles.title}>Discover More Neighborhoods</Text>
      <Text style={styles.subtitle}>
        Create an account to unlock all neighborhoods, save your favorites, and get personalized recommendations.
      </Text>

      <View style={styles.perks}>
        {[
          { icon: 'star-outline', text: 'Personalized neighborhood scores' },
          { icon: 'heart-outline', text: 'Save your favorite places' },
          { icon: 'analytics-outline', text: 'Full relocation analysis' },
        ].map((perk) => (
          <View key={perk.text} style={styles.perkRow}>
            <View style={styles.perkIcon}>
              <Ionicons name={perk.icon as any} size={15} color={THEME.colors.primary} />
            </View>
            <Text style={styles.perkText}>{perk.text}</Text>
          </View>
        ))}
      </View>

      <Button onPress={handleSignUp} style={styles.signUpBtn}>
        <Button.Label>Create Account</Button.Label>
      </Button>

      <TouchableOpacity onPress={handleLogIn} style={styles.loginBtn}>
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={styles.loginLink}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  perks: {
    width: '100%',
    gap: THEME.spacing.sm,
    marginVertical: THEME.spacing.xs,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  perkIcon: {
    width: 30,
    height: 30,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.text,
    fontWeight: THEME.fontWeight.medium,
  },
  signUpBtn: { width: '100%' },
  loginBtn: { paddingVertical: THEME.spacing.xs },
  loginText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
  },
  loginLink: {
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },
});