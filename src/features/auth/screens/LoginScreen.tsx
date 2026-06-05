import React, { useCallback, useEffect } from 'react';
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
import { login, selectAuth, clearError } from '@/store/slices/auth.slice';
import { useAuthForm, loginSchema } from '../hooks/use-auth-form';
import { FormField } from '../components/FormField';
import { ScreenAppBar } from '@/components/ScreenAppBar';
import { palette, spacing, radius, typography, layout } from '@/theme';
import type { AuthStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const INITIAL = { email: '', password: '' };

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { isLoading, error: serverError } = useAppSelector(selectAuth);

  const form = useAuthForm(loginSchema, INITIAL);

  // Clear server error when user starts typing
  useEffect(() => {
    if (serverError) dispatch(clearError());
  }, [dispatch, serverError, form.values.email, form.values.password]);

  const handleSubmit = useCallback(() => {
    const validated = form.validate();
    if (!validated) return;

    dispatch(login({
      email: validated.email.toLowerCase().trim(),
      password: validated.password,
    }));
    

    
  }, [form, dispatch]);

  const emailProps = form.getFieldProps('email');
  const passwordProps = form.getFieldProps('password');

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenAppBar />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: spacing['2xl'], paddingBottom: insets.bottom + spacing['2xl'] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand mark ── */}
        <View style={styles.brandMark}>
          <View style={styles.brandDot} />
        </View>

        {/* ── Header ── */}
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Sign in to access your property analytics
        </Text>

        {/* ── Server error ── */}
        {serverError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{serverError}</Text>
          </View>
        )}

        {/* ── Form ── */}
        <View style={styles.form}>
          <FormField
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            {...emailProps}
          />

          <FormField
            label="Password"
            placeholder="Enter your password"
            isPassword
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            {...passwordProps}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
            hitSlop={12}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[styles.submitBtn, (isLoading || !form.isValid) && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitText}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Text>
        </TouchableOpacity>

        {/* ── Divider ── */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Social auth placeholder ── */}
        {/* <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
          <Text style={styles.socialText}>Continue with Apple</Text>
        </TouchableOpacity> */}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: palette.white },
  content: { paddingHorizontal: spacing.xl },

  brandMark: { marginBottom: spacing['2xl'] },
  brandDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.teal,
  },

  title: { ...typography.displayMd, color: palette.navy, marginBottom: spacing.sm },
  subtitle: { ...typography.bodyLg, color: palette.gray500, marginBottom: spacing['2xl'] },

  errorBanner: {
    backgroundColor: palette.dangerBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: palette.danger,
  },
  errorBannerText: { ...typography.bodyMd, color: palette.danger },

  form: { marginBottom: spacing.lg },
  forgotLink: { alignSelf: 'flex-end', marginTop: -spacing.sm },
  forgotText: { ...typography.labelMd, color: palette.teal },

  submitBtn: {
    height: layout.buttonHeight,
    backgroundColor: palette.teal,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.55 },
  submitText: { ...typography.labelLg, color: palette.white, fontSize: 16 },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: palette.gray300 },
  dividerText: { ...typography.bodySm, color: palette.gray400 },

  socialBtn: {
    height: layout.buttonHeight,
    borderWidth: 1.5,
    borderColor: palette.gray300,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  socialText: { ...typography.labelLg, color: palette.gray700 },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: { ...typography.bodyMd, color: palette.gray500 },
  footerLink: { ...typography.labelLg, color: palette.teal },
});
