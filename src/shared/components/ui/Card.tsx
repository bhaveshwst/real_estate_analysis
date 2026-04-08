import React, { type ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { palette, spacing, radius, shadow } from '@/theme';

interface CardProps {
  children: ReactNode;
  variant?: 'elevated' | 'flat' | 'outlined';
  padding?: keyof typeof spacing;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'lg',
  style,
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { padding: spacing[padding] },
        variant === 'elevated' && styles.elevated,
        variant === 'flat' && styles.flat,
        variant === 'outlined' && styles.outlined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg },
  elevated: {
    backgroundColor: palette.white,
    ...shadow.md,
  },
  flat: {
    backgroundColor: palette.gray50,
  },
  outlined: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
});
