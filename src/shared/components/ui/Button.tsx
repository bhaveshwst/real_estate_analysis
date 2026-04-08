import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { palette, spacing, radius, typography, layout } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const sizeStyles: Record<ButtonSize, { height: number; text: TextStyle }> = {
  sm: { height: 36, text: typography.labelMd },
  md: { height: layout.buttonHeight, text: typography.labelLg },
  lg: { height: 56, text: { ...typography.labelLg, fontSize: 16 } },
};

const variantStyles: Record<
  ButtonVariant,
  { bg: string; border: string; text: string; activeBg: string }
> = {
  primary: { bg: palette.teal, border: palette.teal, text: palette.white, activeBg: palette.teal },
  secondary: { bg: palette.navy, border: palette.navy, text: palette.white, activeBg: palette.navyLight },
  outline: { bg: 'transparent', border: palette.gray300, text: palette.gray700, activeBg: palette.gray100 },
  ghost: { bg: 'transparent', border: 'transparent', text: palette.teal, activeBg: palette.tealLight },
  danger: { bg: 'transparent', border: palette.danger, text: palette.danger, activeBg: palette.dangerBg },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          height: s.height,
          backgroundColor: v.bg,
          borderColor: v.border,
          opacity: disabled ? 0.5 : 1,
        },
        !fullWidth && styles.autoWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <Text style={[s.text, { color: v.text }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  autoWidth: { alignSelf: 'flex-start' },
});
