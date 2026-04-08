import React, { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography, layout } from '@/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled React render errors.
 *
 * Without this, a crash in any component shows a white screen
 * on production builds. This boundary catches the error,
 * reports it, and shows a recovery UI.
 *
 * Place at the top of the component tree (wrapping RootNavigator)
 * and optionally around individual screens for granular recovery.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report to Sentry (if available)
    try {
      const Sentry = require('@sentry/react-native');
      Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    } catch {
      // Sentry not installed — log to console
      console.error('ErrorBoundary caught:', error, errorInfo.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <View style={[styles.xLine, styles.xLine1]} />
            <View style={[styles.xLine, styles.xLine2]} />
          </View>

          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app encountered an unexpected error. This has been reported to our team.
          </Text>

          {__DEV__ && this.state.error && (
            <View style={styles.debugBox}>
              <Text style={styles.debugText}>
                {this.state.error.message}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.retryBtn}
            onPress={this.handleReset}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.white,
    paddingHorizontal: spacing['2xl'],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.dangerBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  xLine: {
    position: 'absolute',
    width: 24,
    height: 3,
    backgroundColor: palette.danger,
    borderRadius: 2,
  },
  xLine1: { transform: [{ rotate: '45deg' }] },
  xLine2: { transform: [{ rotate: '-45deg' }] },
  title: { ...typography.headingLg, color: palette.navy, textAlign: 'center' },
  message: {
    ...typography.bodyMd,
    color: palette.gray500,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  debugBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: palette.gray50,
    borderRadius: radius.md,
    maxWidth: '100%',
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: palette.danger,
  },
  retryBtn: {
    height: layout.buttonHeight,
    paddingHorizontal: spacing['2xl'],
    backgroundColor: palette.teal,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  retryText: { ...typography.labelLg, color: palette.white },
});
