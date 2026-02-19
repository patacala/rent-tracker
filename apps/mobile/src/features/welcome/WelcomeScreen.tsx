import React, { JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@shared/theme';
import { Button, Tag } from '@shared/components';

export function WelcomeScreen(): JSX.Element {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('@assets/family_01.png')}
      style={styles.background}
      resizeMode="cover"
      imageStyle={{ left: -90 }}
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.inner}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark} />
            <Text style={styles.brandName}>Relocation Intelligence</Text>
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.headline}>
              Welcome home,{'\n'}
              <Text style={styles.headlineAccent}>before you even</Text>
              {'\n'}move.
            </Text>
            <Text style={styles.subheadline}>
              Stop guessing, start knowing. Discover neighborhoods that match your
              lifestyle, commute, and family needs with AI-driven insights.
            </Text>
          </View>

          <View style={styles.socialProof}>
            <Tag variant="default">
              <Tag.Label>Helping 5,000+ families find their perfect fit</Tag.Label>
            </Tag>
          </View>

          <View style={styles.actions}>
            <Button onPress={() => router.push('/onboarding/step1')}>
              <Button.Label>Find My Neighborhood</Button.Label>
              <Button.Icon name="arrow-forward-outline" />
            </Button>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.27)',
  },
  safe: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  inner: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
    gap: THEME.spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: THEME.colors.primary,
  },
  brandName: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textBlock: {
    gap: THEME.spacing.sm,
  },
  headline: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
    lineHeight: 38,
  },
  headlineAccent: {
    color: THEME.colors.primaryActive,
  },
  subheadline: {
    fontSize: THEME.fontSize.md,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
  },
  socialProof: {
    alignItems: 'flex-start',
  },
  actions: {
    marginTop: THEME.spacing.sm,
    gap: THEME.spacing.md,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
  },
  loginLink: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },
});