import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography, shadow } from '@/theme';
import { formatCurrency } from '@/shared/utils/format';
import type { PropertyValuation } from '@/types';

interface ValuationCardProps {
  valuation: PropertyValuation;
}

export function ValuationCard({ valuation }: ValuationCardProps) {
  const { estimatedValue, confidenceRange, investmentMetrics: im, pricePerSqFt } = valuation;

  // Calculate confidence bar positions (0–100%)
  const rangeSpan = confidenceRange.high - confidenceRange.low;
  const valuePct = rangeSpan > 0
    ? ((estimatedValue - confidenceRange.low) / rangeSpan) * 100
    : 50;

  return (
    <View style={styles.card}>
      {/* Main value */}
      <Text style={styles.sectionLabel}>Estimated market value</Text>
      <Text style={styles.mainValue}>{formatCurrency(estimatedValue)}</Text>

      {pricePerSqFt != null && (
        <Text style={styles.psf}>${pricePerSqFt}/sqft</Text>
      )}

      {/* Confidence range bar */}
      <View style={styles.rangeContainer}>
        <View style={styles.rangeBar}>
          <View style={styles.rangeTrack}>
            <View style={[styles.rangeFill, { left: '0%', right: '0%' }]} />
          </View>
          {/* Pointer for estimated value */}
          <View style={[styles.rangePointer, { left: `${Math.min(Math.max(valuePct, 5), 95)}%` }]}>
            <View style={styles.rangePointerDot} />
          </View>
        </View>
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>
            {formatCurrency(confidenceRange.low, { compact: true })}
          </Text>
          <Text style={styles.rangeLabelCenter}>Estimate</Text>
          <Text style={styles.rangeLabel}>
            {formatCurrency(confidenceRange.high, { compact: true })}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Investment metrics grid */}
      <Text style={styles.metricsTitle}>Investment analysis</Text>
      <View style={styles.metricsGrid}>
        <MetricItem
          label="Cap rate"
          value={im.capRate != null ? `${im.capRate}%` : '—'}
          color={
            im.capRate == null ? undefined
            : im.capRate >= 6 ? palette.success
            : im.capRate >= 4 ? palette.warning
            : palette.danger
          }
        />
        <MetricItem
          label="Cash-on-cash"
          value={im.cashOnCashReturn != null ? `${im.cashOnCashReturn}%` : '—'}
          color={
            im.cashOnCashReturn == null ? undefined
            : im.cashOnCashReturn > 0 ? palette.success : palette.danger
          }
        />
        <MetricItem
          label="Monthly cash flow"
          value={im.monthlyCashFlow != null ? formatCurrency(im.monthlyCashFlow) : '—'}
          color={
            im.monthlyCashFlow == null ? undefined
            : im.monthlyCashFlow >= 0 ? palette.success : palette.danger
          }
        />
        <MetricItem
          label="Gross rent mult."
          value={im.grossRentMultiplier != null ? `${im.grossRentMultiplier}x` : '—'}
        />
      </View>

      {/* Mortgage estimate */}
      {im.monthlyMortgage != null && (
        <View style={styles.mortgageRow}>
          <View style={styles.mortgageDot} />
          <Text style={styles.mortgageText}>
            Est. mortgage: {formatCurrency(im.monthlyMortgage)}/mo
          </Text>
          <Text style={styles.mortgageTerms}>25% down · 7% rate · 30yr</Text>
        </View>
      )}
    </View>
  );
}

function MetricItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadow.sm,
  },

  sectionLabel: {
    ...typography.labelSm,
    color: palette.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  mainValue: { ...typography.displayMd, color: palette.navy },
  psf: { ...typography.labelMd, color: palette.gray500, marginTop: 2 },

  // Confidence range
  rangeContainer: { marginTop: spacing.xl },
  rangeBar: { height: 20, justifyContent: 'center' },
  rangeTrack: {
    height: 6,
    backgroundColor: palette.gray100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  rangeFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: palette.tealMuted,
    borderRadius: 3,
  },
  rangePointer: {
    position: 'absolute',
    top: 0,
    marginLeft: -8,
  },
  rangePointerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.teal,
    borderWidth: 3,
    borderColor: palette.white,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  rangeLabel: { ...typography.bodySm, color: palette.gray500 },
  rangeLabelCenter: { ...typography.labelSm, color: palette.teal },

  divider: {
    height: 0.5,
    backgroundColor: palette.gray200,
    marginVertical: spacing.xl,
  },

  metricsTitle: { ...typography.labelLg, color: palette.navy, marginBottom: spacing.md },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricItem: {
    width: '47%',
    backgroundColor: palette.gray50,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  metricLabel: { ...typography.labelSm, color: palette.gray500 },
  metricValue: { ...typography.headingSm, color: palette.navy, marginTop: spacing.xs },

  mortgageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: palette.gray100,
    gap: spacing.sm,
  },
  mortgageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.gray400,
  },
  mortgageText: { ...typography.bodyMd, color: palette.gray700 },
  mortgageTerms: { ...typography.bodySm, color: palette.gray400 },
});
