import React, { useMemo } from 'react';
import { Text, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import Constants from 'expo-constants';
import { palette, typography } from '@/theme';

export function getAppVersionLabel(): string {
  const v = Constants.expoConfig?.version;
  if (typeof v === 'string' && v.trim().length > 0) {
    const t = v.trim();
    return t.startsWith('v') ? t : `v${t}`;
  }
  return '';
}

type Props = {
  style?: StyleProp<TextStyle>;
};

/**
 * Small grey app version (from expo config) for app bars.
 */
export function AppVersionBadge({ style }: Props) {
  const label = useMemo(() => getAppVersionLabel(), []);
  if (!label) {
    return null;
  }
  return <Text style={[styles.text, style]}>{label}</Text>;
}

const styles = StyleSheet.create({
  text: {
    ...typography.labelSm,
    fontSize: 11,
    lineHeight: 14,
    color: palette.gray400,
  },
});
