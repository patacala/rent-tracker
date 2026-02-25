import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@shared/lib/supabase';
import { THEME } from '@shared/theme';
import { Button, Input } from '@shared/components';
import { useUpdateProfileMutation } from '@features/auth/store/authApi';
import { useToast } from '@shared/context/ToastContext';

interface EditNameModalProps {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSaved: (name: string) => void;
}

export function EditNameModal({
  visible,
  currentName,
  onClose,
  onSaved,
}: EditNameModalProps): JSX.Element {
  const [name, setName] = useState(currentName);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const toast = useToast();

  const handleSave = async () => {
    if (!name.trim() || name === currentName) { onClose(); return; }

    try {
      await updateProfile({ name: name.trim() }).unwrap();

      await supabase.auth.updateUser({
        data: { full_name: name.trim() },
      });

      onSaved(name.trim());
      onClose();
      toast.success('Name updated successfully');
    } catch {
      toast.error('Failed to update name, please try again');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Name</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Input>
            <Input.Label>Full name</Input.Label>
            <Input.Field>
              <Input.Icon name="person-outline" />
              <Input.TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                autoCapitalize="words"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </Input.Field>
          </Input>

          <Button onPress={handleSave} disabled={isLoading || !name.trim()}>
            <Button.Label>{isLoading ? 'Saving...' : 'Save'}</Button.Label>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: THEME.colors.background,
    borderTopLeftRadius: THEME.borderRadius.lg,
    borderTopRightRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
    paddingBottom: THEME.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
});