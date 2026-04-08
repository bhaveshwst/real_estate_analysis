import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography } from '@/theme';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading property...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={palette.teal} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn\'t load this property. Check your connection and try again.',
  onRetry,
  onBack,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      {/* Error icon (CSS-drawn X in circle) */}
      <View style={styles.errorIcon}>
        <View style={[styles.errorLine, styles.errorLine1]} />
        <View style={[styles.errorLine, styles.errorLine2]} />
      </View>

      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{message}</Text>

      <View style={styles.actionRow}>
        {onRetry && (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        )}
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.backText}>Go back</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    backgroundColor: palette.white,
  },

  loadingText: {
    ...typography.bodyMd,
    color: palette.gray500,
    marginTop: spacing.lg,
  },

  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.dangerBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  errorLine: {
    position: 'absolute',
    width: 22,
    height: 2.5,
    backgroundColor: palette.danger,
    borderRadius: 2,
  },
  errorLine1: { transform: [{ rotate: '45deg' }] },
  errorLine2: { transform: [{ rotate: '-45deg' }] },

  errorTitle: {
    ...typography.headingLg,
    color: palette.navy,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.bodyMd,
    color: palette.gray500,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },

  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing['2xl'],
  },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: palette.teal,
    borderRadius: radius.md,
  },
  retryText: { ...typography.labelLg, color: palette.white },
  backBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.gray300,
  },
  backText: { ...typography.labelLg, color: palette.gray600 },
});
