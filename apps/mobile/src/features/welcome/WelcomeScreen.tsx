import React, { JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@shared/theme';
import { Button, MapPlaceholder, Tag } from '@shared/components';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function WelcomeScreen(): JSX.Element {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MapPlaceholder style={styles.map} />

      <SafeAreaView style={styles.content} edges={['bottom']}>
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
            <Button onPress={() => router.push('/auth')}>
              <Button.Label>Find My Neighborhood</Button.Label>
              <Button.Icon name="arrow-forward-outline" />
            </Button>
            <Button variant="outline" onPress={() => router.push('/auth')} style={styles.secondaryBtn}>
              <Button.Label>Browse Top Rated Areas</Button.Label>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  map: {
    height: SCREEN_HEIGHT * 0.45,
  },
  content: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
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
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
  },
  socialProof: {
    alignItems: 'flex-start',
  },
  actions: {
    gap: THEME.spacing.sm,
  },
  secondaryBtn: {
    backgroundColor: THEME.colors.background,
  },
});
