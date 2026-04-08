import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography } from '@/theme';
import type { AnalyticsPeriod } from '@/services/api';

interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}

const PERIODS: { key: AnalyticsPeriod; label: string }[] = [
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: '1y', label: '1Y' },
  { key: '3y', label: '3Y' },
  { key: '5y', label: '5Y' },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <View style={styles.container}>
      {PERIODS.map((p) => {
        const isActive = value === p.key;
        return (
          <TouchableOpacity
            key={p.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onChange(p.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignSelf: 'center',
    backgroundColor: palette.gray100,
    borderRadius: radius.md,
    padding: 3,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  pillActive: {
    backgroundColor: palette.white,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  text: { ...typography.labelMd, color: palette.gray500 },
  textActive: { color: palette.navy, fontWeight: '600' },
});
