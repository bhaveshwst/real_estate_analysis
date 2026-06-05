import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '@/services/api';
import { useAuthForm, forgotPasswordSchema } from '../hooks/use-auth-form';
import { FormField } from '../components/FormField';
import { extractErrorMessage } from '@/shared/utils/error';
import { ScreenAppBar } from '@/components/ScreenAppBar';
import { palette, spacing, radius, typography, layout } from '@/theme';

const INITIAL = { email: '' };

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const form = useAuthForm(forgotPasswordSchema, INITIAL);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const validated = form.validate();
    if (!validated) return;

    setSending(true);
    setError(null);
    try {
      await authApi.forgotPassword(validated.email.toLowerCase().trim());
      setSent(true);
    } catch (caughtError: unknown) {
      setError(extractErrorMessage(caughtError, 'Could not send reset email. Please try again.'));
    } finally {
      setSending(false);
    }
  }, [form]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenAppBar />
      <View style={[styles.content, { paddingTop: spacing.lg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← Back to login</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reset password</Text>

        {sent ? (
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <View style={styles.checkmark} />
            </View>
            <Text style={styles.successTitle}>Check your inbox</Text>
            <Text style={styles.successText}>
              We sent a password reset link to{'\n'}
              <Text style={styles.emailHighlight}>{form.values.email}</Text>
            </Text>
            <TouchableOpacity style={styles.backToLoginBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={styles.backToLoginText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>Enter your email and we'll send a link to reset your password.</Text>

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <FormField
              label="Email address"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              {...form.getFieldProps('email')}
            />

            <TouchableOpacity
              style={[styles.submitBtn, sending && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={sending}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>{sending ? 'Sending...' : 'Send reset link'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: palette.white },
  content: { flex: 1, paddingHorizontal: spacing.xl },
  backText: { ...typography.labelLg, color: palette.teal, marginBottom: spacing['2xl'] },
  title: { ...typography.displayMd, color: palette.navy, marginBottom: spacing.sm },
  subtitle: { ...typography.bodyLg, color: palette.gray500, marginBottom: spacing.xl },
  errorBanner: {
    backgroundColor: palette.dangerBg, padding: spacing.md, borderRadius: radius.md,
    marginBottom: spacing.lg, borderLeftWidth: 3, borderLeftColor: palette.danger,
  },
  errorText: { ...typography.bodyMd, color: palette.danger },
  submitBtn: {
    height: layout.buttonHeight, backgroundColor: palette.teal,
    borderRadius: radius.md, justifyContent: 'center', alignItems: 'center',
  },
  submitDisabled: { opacity: 0.55 },
  submitText: { ...typography.labelLg, color: palette.white },
  successCard: { alignItems: 'center', paddingTop: spacing['3xl'] },
  successIcon: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: palette.tealLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl,
  },
  checkmark: {
    width: 20, height: 10, borderLeftWidth: 3, borderBottomWidth: 3,
    borderColor: palette.teal, transform: [{ rotate: '-45deg' }], marginTop: -4,
  },
  successTitle: { ...typography.headingLg, color: palette.navy, marginBottom: spacing.md },
  successText: { ...typography.bodyMd, color: palette.gray500, textAlign: 'center', lineHeight: 22 },
  emailHighlight: { fontWeight: '600', color: palette.gray800 },
  backToLoginBtn: {
    height: layout.buttonHeight, paddingHorizontal: spacing['2xl'],
    borderWidth: 1.5, borderColor: palette.teal, borderRadius: radius.md,
    justifyContent: 'center', alignItems: 'center', marginTop: spacing['2xl'],
  },
  backToLoginText: { ...typography.labelLg, color: palette.teal },
});
