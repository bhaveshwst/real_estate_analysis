import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography, shadow } from '@/theme';

interface ViewToggleProps {
  mode: 'map' | 'list';
  onChange: (mode: 'map' | 'list') => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, mode === 'map' && styles.btnActive]}
        onPress={() => onChange('map')}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnText, mode === 'map' && styles.btnTextActive]}>Map</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, mode === 'list' && styles.btnActive]}
        onPress={() => onChange('list')}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnText, mode === 'list' && styles.btnTextActive]}>List</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 16,
    flexDirection: 'row',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.md,
    zIndex: 50,
  },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  btnActive: {
    backgroundColor: palette.navy,
  },
  btnText: { ...typography.labelMd, color: palette.gray500 },
  btnTextActive: { color: palette.white },
});
