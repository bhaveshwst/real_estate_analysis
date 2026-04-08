import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography, shadow } from '@/theme';
import type { MetricCard } from '../utils/transformers';

interface MetricGridProps {
  metrics: MetricCard[];
  columns?: 2 | 3;
}

const TREND_ARROWS = { up: '↑', down: '↓', flat: '→' } as const;
const TREND_COLORS = {
  up: palette.success,
  down: palette.danger,
  flat: palette.gray500,
} as const;

export function MetricGrid({ metrics, columns = 2 }: MetricGridProps) {
  return (
    <View style={styles.grid}>
      {metrics.map((m, i) => (
        <View
          key={m.label}
          style={[
            styles.card,
            columns === 3 && styles.cardThird,
            // Color accent bar on left edge
            m.color ? { borderLeftWidth: 3, borderLeftColor: m.color } : null,
          ]}
        >
          <Text style={styles.label}>{m.label}</Text>
          <Text style={styles.value}>{m.value}</Text>

          {m.trend && m.trendValue && (
            <View style={styles.trendRow}>
              <Text style={[styles.trendArrow, { color: TREND_COLORS[m.trend] }]}>
                {TREND_ARROWS[m.trend]}
              </Text>
              <Text style={[styles.trendText, { color: TREND_COLORS[m.trend] }]}>
                {m.trendValue}
              </Text>
            </View>
          )}

          {m.subtext && !m.trend && (
            <Text style={styles.subtext}>{m.subtext}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '48%',
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.sm,
  },
  cardThird: { width: '31%', padding: spacing.md },
  label: {
    ...typography.labelSm,
    color: palette.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  value: { ...typography.displaySm, color: palette.navy },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: spacing.xs,
  },
  trendArrow: { fontSize: 12, fontWeight: '700' },
  trendText: { ...typography.labelSm },
  subtext: {
    ...typography.bodySm,
    color: palette.gray500,
    marginTop: spacing.xs,
  },
});
