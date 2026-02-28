import React, { JSX, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { NeighborhoodCard, Tag } from '@shared/components';
import { useAuth } from '@shared/context/AuthContext';
import { useToggleFavoriteMutation } from '@features/saved/store/savedApi';
import { useToast } from '@shared/context/ToastContext';
import type { NeighborhoodListItem } from '../types';
import { NeighborhoodCacheEntry, useNeighborhoodCache } from '@shared/context/NeighborhoodCacheContext';

interface NeighborhoodCardItemProps {
  item: NeighborhoodListItem;
  entry: NeighborhoodCacheEntry;
  onPress: (id: string) => void;
}

export function NeighborhoodCardItem({ item, entry, onPress }: NeighborhoodCardItemProps): JSX.Element {
  const { isLoggedIn } = useAuth();
  const { set } = useNeighborhoodCache();
  
  const toast = useToast();
  const [toggleFavorite, { isLoading: isToggling }] = useToggleFavoriteMutation();

  const [localFavorite, setLocalFavorite] = useState(item.isFavorite);
  const [imageLoaded, setImageLoaded] = useState(false);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    set(item.id, entry);
    onPress(item.id);
  };

  useEffect(() => {
    setLocalFavorite(item.isFavorite);
  }, [item.isFavorite]);

  useEffect(() => {
    if (entry) {
      set(item.id, { ...entry, isFavorite: item.isFavorite });
    }
  }, [item.isFavorite]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn || isToggling) return;

    const next = !localFavorite;
    setLocalFavorite(next);

    try {
      await toggleFavorite(item.id).unwrap();
      toast.success(next ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      setLocalFavorite(!next);
      toast.error('Something went wrong, please try again');
    }
  };

  return (
    <NeighborhoodCard onPress={handlePress} style={styles.card}>
      <View style={styles.cardImageContainer}>
        <Image
          source={
            item.photoUrl
              ? { uri: item.photoUrl }
              : require('@assets/miami-bg.png')
          }
          style={styles.image}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
        />

        {!imageLoaded && (
          <Animated.View
            style={[
              styles.imageSkeleton,
              {
                opacity: shimmerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 0.9],
                }),
              },
            ]}
          />
        )}

        <View style={styles.overlay} />

        <View style={styles.scoreContainer}>
          {item.score > 0 && (
            <NeighborhoodCard.Score score={item.score} />
          )}
        </View>

        {isLoggedIn && (
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={handleToggleFavorite}
            disabled={isToggling}
            hitSlop={8}
          >
            <Ionicons
              name={localFavorite ? 'heart' : 'heart-outline'}
              size={30}
              color={localFavorite ? THEME.colors.primary : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}

        <View style={styles.cardOverlayText}>
          <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text style={styles.cardTagline}>{item.tagline}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <NeighborhoodCard.Tags>
          {item.tags.slice(0, 8).map((tag) => (
            <Tag key={tag} variant="neutral">
              <Tag.Label>{tag}</Tag.Label>
            </Tag>
          ))}
        </NeighborhoodCard.Tags>

        <NeighborhoodCard.Footer>
          <View style={styles.matchRow}>
            <View style={styles.matchAvatars}>
              <View style={[styles.avatar, { backgroundColor: THEME.colors.primary }]} />
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: THEME.colors.primaryActive, marginLeft: -6 },
                ]}
              />
            </View>
            <Text style={styles.matchText}>
              {item.matchCount} match your profile
            </Text>
          </View>
          <TouchableOpacity onPress={handlePress}>
            <Text style={styles.detailsLink}>Details &rsaquo;</Text>
          </TouchableOpacity>
        </NeighborhoodCard.Footer>
      </View>
    </NeighborhoodCard>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%' },
  cardImageContainer: { position: 'relative' },
  image: { width: '100%', height: 180 },
  imageSkeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: THEME.colors.border,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  scoreContainer: {
    position: 'absolute',
    top: 12,
    left: 70,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOverlayText: {
    position: 'absolute',
    bottom: THEME.spacing.md,
    left: THEME.spacing.md,
    width: '100%',
  },
  cardName: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: '#FFFFFF',
    width: '92%',
  },
  cardTagline: {
    fontSize: THEME.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  matchAvatars: { flexDirection: 'row' },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  matchText: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
  },
  detailsLink: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },
});