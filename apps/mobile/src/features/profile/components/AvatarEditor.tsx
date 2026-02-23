import React, { JSX, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@shared/lib/supabase';
import { THEME } from '@shared/theme';

interface AvatarEditorProps {
  userId: string;
  avatarUrl: string | null;
  onUpdated: (url: string) => void;
}

export function AvatarEditor({ userId, avatarUrl, onUpdated }: AvatarEditorProps): JSX.Element {
  const [isUploading, setIsUploading] = useState(false);

  const handlePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    setIsUploading(true);
    try {
      const file = result.assets[0];
      const fileExt = (file.uri.split('.').pop() ?? 'jpg').toLowerCase();
      const fileName = `${userId}.${fileExt}`;
      const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) { console.warn('Upload error:', uploadError); return; }

      // Fuerza cache-bust para que la imagen nueva se muestre
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      onUpdated(publicUrl);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handlePick} style={styles.container} disabled={isUploading}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="person-outline" size={36} color={THEME.colors.textMuted} />
        </View>
      )}
      <View style={styles.cameraBtn}>
        {isUploading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="camera-outline" size={12} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', width: 88, height: 88 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  placeholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.background,
  },
});