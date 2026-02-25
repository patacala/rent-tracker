import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@shared/lib/supabase';
import { THEME } from '@shared/theme';
import { Button, HeaderBackButton, Input } from '@shared/components';
import { useToast } from '@shared/context/ToastContext';

export function ChangePasswordScreen(): JSX.Element {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleChange = async () => {
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email ?? '';

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        setError('Current password is incorrect.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        toast.error(updateError.message);
        return;
      }

      toast.success('Password updated successfully');
      router.back();
    } catch {
      toast.error('Something went wrong, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || !currentPassword || !newPassword || !confirmPassword;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => router.back()} />
        <Text style={styles.title}>Change Password</Text>
      </View>

      <View style={styles.content}>
        <Input>
          <Input.Label>Current Password</Input.Label>
          <Input.Field secureTextEntry>
            <Input.Icon name="lock-closed-outline" />
            <Input.TextInput
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              returnKeyType="next"
            />
          </Input.Field>
        </Input>

        <Input>
          <Input.Label>New Password</Input.Label>
          <Input.Field secureTextEntry>
            <Input.Icon name="lock-closed-outline" />
            <Input.TextInput
              placeholder="Min. 6 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              returnKeyType="next"
            />
          </Input.Field>
        </Input>

        <Input>
          <Input.Label>Confirm New Password</Input.Label>
          <Input.Field secureTextEntry>
            <Input.Icon name="lock-closed-outline" />
            <Input.TextInput
              placeholder="Repeat new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleChange}
            />
          </Input.Field>
        </Input>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button onPress={handleChange} disabled={isDisabled}>
          <Button.Label>{isLoading ? 'Updating...' : 'Update Password'}</Button.Label>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
  },
  title: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  content: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  errorText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.error,
  },
});