import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@shared/theme';
import { useLocalSearchParams } from 'expo-router';

export function PurchaseDetailScreen(): JSX.Element {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');

  const { plan, price, period } = useLocalSearchParams<{
    plan: string;
    price: string;
    period: string;
  }>();

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    return digits;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={THEME.colors.text} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Complete Your Purchase</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subscription summary */}
          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryLabel}>Subscription</Text>
              <Text style={styles.summaryPlan}>{plan}</Text>
            </View>
            <View style={styles.summaryPriceWrap}>
              <Text style={styles.summaryPrice}>{price}</Text>
              <Text style={styles.summaryPriceSub}>{period}</Text>
            </View>
          </View>

          {/* Card form */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Ionicons name="card-outline" size={20} color={THEME.colors.primary} />
              <Text style={styles.formTitle}>Credit Card Details</Text>
            </View>

            {/* Card Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Card Number</Text>
              <View style={styles.fieldRow}>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={cardNumber}
                  onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                  keyboardType="numeric"
                  maxLength={19}
                />
                <Ionicons name="card-outline" size={18} color={THEME.colors.textMuted} />
              </View>
            </View>

            {/* Expiry + CVC */}
            <View style={styles.fieldRowDouble}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Expiry (MM/YY)</Text>
                <View style={styles.fieldRow}>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="MM / YY"
                    placeholderTextColor={THEME.colors.textMuted}
                    value={expiry}
                    onChangeText={(v) => setExpiry(formatExpiry(v))}
                    keyboardType="numeric"
                    maxLength={7}
                  />
                </View>
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>CVC</Text>
                <View style={styles.fieldRow}>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="123"
                    placeholderTextColor={THEME.colors.textMuted}
                    value={cvc}
                    onChangeText={(v) => setCvc(v.replace(/\D/g, '').slice(0, 3))}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                  <Ionicons name="help-circle-outline" size={16} color={THEME.colors.textMuted} />
                </View>
              </View>
            </View>

            {/* Zip */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Zip Code</Text>
              <View style={styles.fieldRow}>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="12345"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={zip}
                  onChangeText={(v) => setZip(v.replace(/\D/g, '').slice(0, 5))}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>

            {/* Security note */}
            <View style={styles.secureRow}>
              <Ionicons name="lock-closed-outline" size={13} color={THEME.colors.textMuted} />
              <Text style={styles.secureText}>Secure 256-bit encrypted payment</Text>
            </View>

            {/* Pay button */}
            <TouchableOpacity style={styles.payBtn} activeOpacity={0.9}>
              <Text style={styles.payBtnText}>Pay {price} Now</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Card brands */}
          <View style={styles.brandsRow}>
            {['VISA', 'MC', 'AMEX'].map((b) => (
              <Text key={b} style={styles.brandText}>{b}</Text>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.surface },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  container: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
    paddingBottom: THEME.spacing.xxl,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadow.sm,
  },
  summaryLabel: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
    marginBottom: 2,
  },
  summaryPlan: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  summaryPriceWrap: { alignItems: 'flex-end' },
  summaryPrice: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.primary,
  },
  summaryPriceSub: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
  },
  formCard: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadow.sm,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
  },
  formTitle: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  fieldGroup: { gap: THEME.spacing.xs },
  fieldLabel: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.medium,
    color: THEME.colors.text,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    gap: THEME.spacing.sm,
  },
  fieldInput: {
    flex: 1,
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.text,
    padding: 0,
  },
  fieldRowDouble: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.xs,
  },
  secureText: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.full,
    paddingVertical: THEME.spacing.md,
    marginTop: THEME.spacing.xs,
    ...THEME.shadow.md,
  },
  payBtnText: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.bold,
    color: '#FFFFFF',
  },
  brandsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.lg,
  },
  brandText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.textMuted,
    letterSpacing: 1,
  },
});