import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { palette, spacing, typography } from '@/theme';

interface SectionTitleProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  paddingHorizontal?: boolean;
}

export function SectionTitle({
  title,
  actionLabel,
  onAction,
  paddingHorizontal = true,
}: SectionTitleProps) {
  return (
    <View style={[styles.container, paddingHorizontal && styles.padded]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} hitSlop={12}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  padded: { paddingHorizontal: spacing.xl },
  title: { ...typography.headingMd, color: palette.navy },
  action: { ...typography.labelMd, color: palette.teal },
});
