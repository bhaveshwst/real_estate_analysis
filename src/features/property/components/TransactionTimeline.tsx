import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography, shadow } from '@/theme';
import type { TransactionRow } from '@/features/analytics/utils/transformers';

interface TransactionTimelineProps {
  transactions: TransactionRow[];
}

const TYPE_COLORS: Record<string, string> = {
  Sale: palette.teal,
  Foreclosure: palette.danger,
  Refinance: palette.info,
  Transfer: palette.gray500,
};

export function TransactionTimeline({ transactions }: TransactionTimelineProps) {
  if (transactions.length === 0) return null;

  return (
    <View style={styles.container}>
      {transactions.map((tx, index) => {
        const isLast = index === transactions.length - 1;
        const dotColor = TYPE_COLORS[tx.type] ?? palette.gray400;

        return (
          <View key={tx.id} style={styles.row}>
            {/* Timeline spine */}
            <View style={styles.spine}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Content */}
            <View style={[styles.content, isLast && styles.contentLast]}>
              <View style={styles.topRow}>
                <View style={styles.leftCol}>
                  <View style={styles.typeRow}>
                    <Text style={styles.type}>{tx.type}</Text>
                    <Text style={styles.date}>{tx.date}</Text>
                  </View>
                  {tx.parties !== '—' && (
                    <Text style={styles.parties} numberOfLines={1}>{tx.parties}</Text>
                  )}
                </View>
                <Text style={styles.amount}>{tx.amount}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    paddingLeft: spacing.md,
    ...shadow.sm,
  },
  row: { flexDirection: 'row' },

  // Spine
  spine: { width: 28, alignItems: 'center' },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    zIndex: 1,
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: palette.gray200,
    marginTop: -1,
  },

  // Content
  content: {
    flex: 1,
    paddingBottom: spacing.xl,
    paddingLeft: spacing.sm,
  },
  contentLast: { paddingBottom: 0 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftCol: { flex: 1 },
  typeRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  type: { ...typography.labelLg, color: palette.gray800 },
  date: { ...typography.bodySm, color: palette.gray500 },
  parties: { ...typography.bodySm, color: palette.gray400, marginTop: 3 },
  amount: { ...typography.headingSm, color: palette.navy },
});
