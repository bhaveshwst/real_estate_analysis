import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography, shadow } from '@/theme';
import type { TaxHistoryRow } from '@/features/analytics/utils/transformers';

interface TaxHistoryTableProps {
  rows: TaxHistoryRow[];
}

export function TaxHistoryTable({ rows }: TaxHistoryTableProps) {
  if (rows.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.colYear]}>Year</Text>
        <Text style={[styles.headerCell, styles.colAssessed]}>Assessed</Text>
        <Text style={[styles.headerCell, styles.colTax]}>Tax</Text>
        <Text style={[styles.headerCell, styles.colRate]}>Rate</Text>
      </View>

      {/* Body */}
      {rows.map((row, i) => (
        <View key={row.year} style={[styles.bodyRow, i % 2 === 0 && styles.bodyRowAlt]}>
          <Text style={[styles.bodyCell, styles.colYear, styles.yearText]}>{row.year}</Text>
          <Text style={[styles.bodyCell, styles.colAssessed]}>{row.assessedValue}</Text>
          <Text style={[styles.bodyCell, styles.colTax]}>{row.taxAmount}</Text>
          <Text style={[styles.bodyCell, styles.colRate]}>{row.effectiveRate}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.sm,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.gray50,
    borderBottomWidth: 0.5,
    borderBottomColor: palette.gray200,
  },
  headerCell: {
    ...typography.labelSm,
    color: palette.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bodyRowAlt: { backgroundColor: palette.gray50 },
  bodyCell: { ...typography.bodyMd, color: palette.gray700 },
  yearText: { fontWeight: '600', color: palette.navy },
  colYear: { width: 56 },
  colAssessed: { flex: 1 },
  colTax: { width: 80, textAlign: 'right' },
  colRate: { width: 56, textAlign: 'right' },
});
