import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography, shadow } from '@/theme';
import type { CompRow } from '../utils/transformers';

interface ComparablesTableProps {
  comparables: CompRow[];
  onPress?: (propertyId: string) => void;
}

export function ComparablesTable({ comparables, onPress }: ComparablesTableProps) {
  if (comparables.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.colAddress]}>Address</Text>
            <Text style={[styles.headerCell, styles.colPrice]}>Price</Text>
            <Text style={[styles.headerCell, styles.colPsf]}>$/sqft</Text>
            <Text style={[styles.headerCell, styles.colDate]}>Date</Text>
            <Text style={[styles.headerCell, styles.colDist]}>Dist</Text>
            <Text style={[styles.headerCell, styles.colSim]}>Match</Text>
          </View>

          {/* Rows */}
          {comparables.map((comp, i) => (
            <TouchableOpacity
              key={comp.id}
              style={[styles.row, i % 2 === 0 && styles.rowEven]}
              onPress={() => onPress?.(comp.id)}
              activeOpacity={0.7}
              disabled={!onPress}
            >
              <Text style={[styles.cell, styles.colAddress]} numberOfLines={1}>
                {comp.address}
              </Text>
              <Text style={[styles.cell, styles.colPrice, styles.bold]}>
                {comp.price}
              </Text>
              <Text style={[styles.cell, styles.colPsf]}>{comp.pricePerSqFt}</Text>
              <Text style={[styles.cell, styles.colDate]}>{comp.date}</Text>
              <Text style={[styles.cell, styles.colDist]}>{comp.distance}</Text>
              <View style={styles.colSim}>
                <View style={styles.simBarBg}>
                  <View
                    style={[
                      styles.simBarFill,
                      {
                        width: `${comp.similarity}%`,
                        backgroundColor:
                          comp.similarity >= 70
                            ? palette.success
                            : comp.similarity >= 40
                            ? palette.warning
                            : palette.danger,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.simText}>{comp.similarity}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const COL = { address: 180, price: 80, psf: 70, date: 80, dist: 50, sim: 80 };

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.sm,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: palette.gray50,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: palette.gray200,
  },
  headerCell: {
    ...typography.labelSm,
    color: palette.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: palette.gray100,
    alignItems: 'center',
  },
  rowEven: { backgroundColor: palette.gray50 },
  cell: { ...typography.bodyMd, color: palette.gray700 },
  bold: { fontWeight: '600', color: palette.navy },

  colAddress: { width: COL.address },
  colPrice: { width: COL.price },
  colPsf: { width: COL.psf },
  colDate: { width: COL.date },
  colDist: { width: COL.dist, textAlign: 'center' },
  colSim: { width: COL.sim, alignItems: 'center', gap: 3 },

  simBarBg: {
    width: 50,
    height: 4,
    backgroundColor: palette.gray200,
    borderRadius: 2,
  },
  simBarFill: { height: 4, borderRadius: 2 },
  simText: { ...typography.labelSm, color: palette.gray500 },
});
