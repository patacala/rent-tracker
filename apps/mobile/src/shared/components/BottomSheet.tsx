import React, { JSX, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  PanResponder,
  Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type SnapHeight = number | `${number}%`;

function resolveHeight(value: SnapHeight): number {
  if (typeof value === 'string' && value.endsWith('%')) {
    const pct = parseFloat(value) / 100;
    return SCREEN_HEIGHT * pct;
  }
  return value as number;
}

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapHeight?: SnapHeight;
  blur?: boolean;
  blurIntensity?: number;
  overlayOpacity?: number;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  snapHeight = '50%',
  blur = false,
  blurIntensity = 25,
  overlayOpacity,
}: BottomSheetProps): JSX.Element {
  const height = resolveHeight(snapHeight);
  const translateY = useRef(new Animated.Value(height)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  const resolvedOpacity = overlayOpacity ?? (blur ? 0.5 : 0.45);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      translateY.setValue(height);
      overlayAnim.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 140,
          mass: 1,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setModalVisible(false);
      });
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 8,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > height * 0.6 || vy > 1.2) {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: height,
              duration: 280,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(overlayAnim, {
              toValue: 0,
              duration: 230,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start(({ finished }) => {
            if (finished) onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 18,
            stiffness: 140,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal transparent visible={modalVisible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayAnim }]}>
          {blur ? (
            <BlurView
              intensity={blurIntensity}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: `rgba(0,0,0,${resolvedOpacity})` },
              ]}
            />
          )}
        </Animated.View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { height, transform: [{ translateY }] },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />

        {title ? (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : null}

        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.border,
    alignSelf: 'center',
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
});