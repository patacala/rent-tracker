import React, { useEffect, useRef, JSX } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Toast } from '@shared/context/ToastContext';

const CONFIG: Record<Toast['type'], { icon: string; bg: string; border: string; color: string }> = {
  success: {
    icon: 'checkmark-circle',
    bg: '#F0FDF4',
    border: '#86EFAC',
    color: '#16A34A',
  },
  error: {
    icon: 'close-circle',
    bg: '#FEF2F2',
    border: '#FCA5A5',
    color: '#DC2626',
  },
  info: {
    icon: 'information-circle',
    bg: '#EFF6FF',
    border: '#93C5FD',
    color: '#2563EB',
  },
  warning: {
    icon: 'warning',
    bg: '#FFFBEB',
    border: '#FCD34D',
    color: '#D97706',
  },
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export function ToastItem({ toast, onRemove }: ToastItemProps): JSX.Element {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const config = CONFIG[toast.type];

  useEffect(() => {
    // Entrada
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 150,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => dismiss(), toast.duration ?? 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onRemove(toast.id));
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Ionicons name={config.icon as any} size={20} color={config.color} />
      <Text style={[styles.message, { color: config.color }]} numberOfLines={2}>
        {toast.message}
      </Text>
      <TouchableOpacity onPress={dismiss} hitSlop={8}>
        <Ionicons name="close" size={16} color={config.color} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
  },
});