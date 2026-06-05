import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing, typography } from '@/theme';

type Props = {
  children: React.ReactNode;
};

function useIsOffline(): boolean {
  const { isConnected, isInternetReachable } = useNetInfo();
  if (isConnected === false) {
    return true;
  }
  if (isConnected === true && isInternetReachable === false) {
    return true;
  }
  return false;
}

export function OfflineConnectivityBanner({ children }: Props) {
  const insets = useSafeAreaInsets();
  const offline = useIsOffline();

  return (
    <View style={styles.root}>
      {children}
      {offline ? (
        <View
          style={[styles.banner, { paddingTop: Math.max(insets.top, spacing.md) }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.title}>No internet connection</Text>
          <Text style={styles.subtitle}>
            Turn on Wi‑Fi or mobile data. This message will disappear when you are back online.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10000,
    elevation: 12,
    backgroundColor: palette.warningBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.warning,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.headingSm,
    color: palette.navy,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySm,
    color: palette.gray600,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
