import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { VictoryLine, VictoryGroup } from 'victory-native';
import { palette, spacing, radius, typography, shadow } from '@/theme';
import { formatCurrency, formatPercent } from '@/shared/utils/format';
import type { MetricCard, TrendSeries } from '@/features/analytics/utils/transformers';

interface MarketSnapshotCardProps {
  zipCode: string;
  metrics: MetricCard[];
  sparkline: TrendSeries | null;
  onViewFull: () => void;
}

const SPARK_WIDTH = Dimensions.get('window').width - 80;

export function MarketSnapshotCard({
  zipCode,
  metrics,
  sparkline,
  onViewFull,
}: MarketSnapshotCardProps) {
  const primary = metrics[0]; // Median price
  const secondary = metrics.slice(1, 4);

  return (
    <TouchableOpacity style={styles.card} onPress={onViewFull} activeOpacity={0.85}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Market snapshot</Text>
          <Text style={styles.zip}>{zipCode}</Text>
        </View>
        <Text style={styles.viewAll}>View details →</Text>
      </View>

      {/* Primary metric + sparkline */}
      {primary && (
        <View style={styles.primaryRow}>
          <View>
            <Text style={styles.primaryValue}>{primary.value}</Text>
            {primary.trendValue && (
              <View style={styles.trendRow}>
                <View style={[
                  styles.trendDot,
                  { backgroundColor: primary.trend === 'up' ? palette.success : primary.trend === 'down' ? palette.danger : palette.gray400 },
                ]} />
                <Text style={[
                  styles.trendText,
                  { color: primary.trend === 'up' ? palette.success : primary.trend === 'down' ? palette.danger : palette.gray500 },
                ]}>
                  {primary.trendValue}
                </Text>
              </View>
            )}
          </View>

          {/* Sparkline */}
          {sparkline && sparkline.data.length > 2 && (
            <View style={styles.sparkContainer}>
              <VictoryGroup
                width={SPARK_WIDTH * 0.45}
                height={48}
                padding={0}
              >
                <VictoryLine
                  data={sparkline.data.map((d, i) => ({ x: i, y: d.y }))}
                  style={{
                    data: {
                      stroke: sparkline.color,
                      strokeWidth: 2,
                      strokeLinecap: 'round',
                    },
                  }}
                  interpolation="monotoneX"
                />
              </VictoryGroup>
            </View>
          )}
        </View>
      )}

      {/* Secondary metrics row */}
      <View style={styles.secondaryRow}>
        {secondary.map((m) => (
          <View key={m.label} style={styles.secondaryItem}>
            <Text style={styles.secondaryLabel}>{m.label}</Text>
            <Text style={styles.secondaryValue}>{m.value}</Text>
            {m.subtext && <Text style={styles.secondarySubtext}>{m.subtext}</Text>}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadow.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  label: { ...typography.labelSm, color: palette.gray500, textTransform: 'uppercase', letterSpacing: 0.5 },
  zip: { ...typography.labelLg, color: palette.navy, marginTop: 2 },
  viewAll: { ...typography.labelMd, color: palette.teal },

  primaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  primaryValue: { ...typography.displayMd, color: palette.navy },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  trendDot: { width: 6, height: 6, borderRadius: 3 },
  trendText: { ...typography.labelSm },

  sparkContainer: { overflow: 'hidden' },

  secondaryRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: palette.gray100,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  secondaryItem: { flex: 1 },
  secondaryLabel: { ...typography.labelSm, color: palette.gray500 },
  secondaryValue: { ...typography.headingSm, color: palette.navy, marginTop: 2 },
  secondarySubtext: { ...typography.bodySm, color: palette.gray400, marginTop: 1, fontSize: 11 },
});
