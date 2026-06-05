import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppVersionBadge } from '@/components/AppVersionBadge';
import { palette, spacing } from '@/theme';

type Props = {
  /** Back button or other leading control */
  leading?: React.ReactNode;
  /** Title / subtitle area (centered when leading is set) */
  center?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Background; default white */
  backgroundColor?: string;
};

/**
 * Top app bar: optional leading + center, version on the right, bottom hairline border.
 */
export function ScreenAppBar({
  leading,
  center,
  style,
  backgroundColor = palette.white,
}: Props) {
  const insets = useSafeAreaInsets();
  const hasToolbar = leading != null || center != null;

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + spacing.sm,
          backgroundColor,
        },
        style,
      ]}
    >
      {hasToolbar ? (
        <View style={styles.row}>
          <View style={styles.leading}>{leading}</View>
          <View style={styles.center}>{center}</View>
          <View style={styles.version}>
            <AppVersionBadge />
          </View>
        </View>
      ) : (
        <View style={styles.minimalRow}>
          <View style={styles.flex} />
          <AppVersionBadge />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray200,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
  },
  leading: {
    minWidth: 56,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  version: {
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  minimalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 22,
  },
  flex: { flex: 1 },
});
