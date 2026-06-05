import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/store';
import { register, selectAuth, clearError } from '@/store/slices/auth.slice';
import { useAuthForm, registerSchema } from '../hooks/use-auth-form';
import { FormField } from '../components/FormField';
import { ScreenAppBar } from '@/components/ScreenAppBar';
import { palette, spacing, radius, typography, layout } from '@/theme';
import type { AuthStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

// Password strength calculator
function getPasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Too weak', color: palette.danger },
    { label: 'Weak', color: palette.danger },
    { label: 'Fair', color: palette.warning },
    { label: 'Good', color: palette.teal },
    { label: 'Strong', color: palette.teal },
  ];

  return { score, ...levels[score] };
}

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { isLoading, error: serverError } = useAppSelector(selectAuth);

  const form = useAuthForm(registerSchema, INITIAL);
  const strength = useMemo(() => getPasswordStrength(form.values.password), [form.values.password]);

  useEffect(() => {
    if (serverError) dispatch(clearError());
  }, [form.values.email]);

  const handleSubmit = useCallback(() => {
    const validated = form.validate();
    if (!validated) return;

    dispatch(register({
      firstName: validated.firstName.trim(),
      lastName: validated.lastName.trim(),
      email: validated.email.toLowerCase().trim(),
      password: validated.password,
    }));
  }, [form, dispatch]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenAppBar />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: spacing.xl, paddingBottom: insets.bottom + spacing['2xl'] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start analyzing real estate markets</Text>

        {serverError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{serverError}</Text>
          </View>
        )}

        {/* Name row */}
        <View style={styles.nameRow}>
          <View style={styles.nameCol}>
            <FormField
              label="First name"
              placeholder="Jane"
              autoComplete="given-name"
              textContentType="givenName"
              {...form.getFieldProps('firstName')}
            />
          </View>
          <View style={styles.nameCol}>
            <FormField
              label="Last name"
              placeholder="Doe"
              autoComplete="family-name"
              textContentType="familyName"
              {...form.getFieldProps('lastName')}
            />
          </View>
        </View>

        <FormField
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          {...form.getFieldProps('email')}
        />

        <FormField
          label="Password"
          placeholder="Min 8 characters"
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
          {...form.getFieldProps('password')}
        />

        {/* Password strength bar */}
        {form.values.password.length > 0 && (
          <View style={styles.strengthRow}>
            <View style={styles.strengthTrack}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthSegment,
                    i < strength.score
                      ? { backgroundColor: strength.color }
                      : { backgroundColor: palette.gray200 },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>
              {strength.label}
            </Text>
          </View>
        )}

        <FormField
          label="Confirm password"
          placeholder="Re-enter password"
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
          {...form.getFieldProps('confirmPassword')}
        />

        {/* Terms */}
        <Text style={styles.terms}>
          By creating an account, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitText}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: palette.white },
  content: { paddingHorizontal: spacing.xl },

  backBtn: { marginBottom: spacing.xl },
  backText: { ...typography.labelLg, color: palette.teal },

  title: { ...typography.displayMd, color: palette.navy, marginBottom: spacing.sm },
  subtitle: { ...typography.bodyLg, color: palette.gray500, marginBottom: spacing.xl },

  errorBanner: {
    backgroundColor: palette.dangerBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: palette.danger,
  },
  errorBannerText: { ...typography.bodyMd, color: palette.danger },

  nameRow: { flexDirection: 'row', gap: spacing.md },
  nameCol: { flex: 1 },

  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  strengthTrack: { flex: 1, flexDirection: 'row', gap: 4, height: 4 },
  strengthSegment: { flex: 1, borderRadius: 2 },
  strengthLabel: { ...typography.labelSm, width: 50 },

  terms: {
    ...typography.bodySm,
    color: palette.gray500,
    marginBottom: spacing.xl,
    lineHeight: 18,
  },
  termsLink: { color: palette.teal },

  submitBtn: {
    height: layout.buttonHeight,
    backgroundColor: palette.teal,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.55 },
  submitText: { ...typography.labelLg, color: palette.white, fontSize: 16 },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: { ...typography.bodyMd, color: palette.gray500 },
  footerLink: { ...typography.labelLg, color: palette.teal },
});
