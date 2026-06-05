import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenAppBar } from '@/components/ScreenAppBar';
import { usePropertyAnalytics } from '../hooks/use-analytics';
import {
  AreaChart,
  BarChart,
  MetricGrid,
  ComparablesTable,
  SectionHeader,
} from '../components';
import { palette, spacing, radius, typography, shadow } from '@/theme';
import type { DashboardStackParamList } from '@/types';

type Route = RouteProp<DashboardStackParamList, 'PropertyDetail'>;
type Nav = NativeStackNavigationProp<DashboardStackParamList, 'PropertyDetail'>;

export function PropertyAnalyticsScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const {
    detail,
    isLoading,
    valuationMetrics,
    comparables,
    transactions,
    transactionChart,
    taxHistory,
    taxChart,
  } = usePropertyAnalytics(params.propertyId);

  if (isLoading || !detail) {
    return (
      <View style={styles.loadingRoot}>
        <ScreenAppBar backgroundColor={palette.gray50} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.teal} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing['3xl'] }]}
    >
      <View style={styles.headerBlock}>
        <ScreenAppBar
          backgroundColor={palette.white}
          leading={
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          }
          center={
            <View style={styles.headerInfo}>
              <Text style={styles.headerAddress} numberOfLines={1}>
                {detail.addressLine1}
              </Text>
              <Text style={styles.headerLocation}>
                {detail.city}, {detail.state} {detail.zipCode}
              </Text>
            </View>
          }
        />
      </View>

      {/* ══════════════════════════════════════ */}
      {/*  Valuation metrics                    */}
      {/* ══════════════════════════════════════ */}
      <SectionHeader
        title="Valuation"
        subtitle="Estimated value and investment metrics"
      />
      <MetricGrid metrics={valuationMetrics} />

      {/* ══════════════════════════════════════ */}
      {/*  Price history chart                  */}
      {/* ══════════════════════════════════════ */}
      {transactionChart && transactionChart.data.length >= 2 && (
        <>
          <SectionHeader title="Price history" subtitle="Based on recorded sales" />
          <View style={styles.chartCard}>
            <AreaChart series={transactionChart} height={200} showArea />
          </View>
        </>
      )}

      {/* ══════════════════════════════════════ */}
      {/*  Comparable properties                */}
      {/* ══════════════════════════════════════ */}
      {comparables.length > 0 && (
        <>
          <SectionHeader
            title="Comparables"
            subtitle={`${comparables.length} similar properties nearby`}
          />
          <ComparablesTable
            comparables={comparables}
            onPress={(id) =>
              navigation.push('PropertyDetail', { propertyId: id })
            }
          />
        </>
      )}

      {/* ══════════════════════════════════════ */}
      {/*  Tax history                          */}
      {/* ══════════════════════════════════════ */}
      {taxHistory.length > 0 && (
        <>
          <SectionHeader title="Tax history" subtitle="Assessed value and annual tax" />

          {taxChart && taxChart.data.length >= 2 && (
            <View style={styles.chartCard}>
              <BarChart series={taxChart} height={180} barWidth={32} />
            </View>
          )}

          <View style={styles.taxTable}>
            {/* Table header */}
            <View style={styles.taxHeaderRow}>
              <Text style={[styles.taxHeaderCell, styles.taxColYear]}>Year</Text>
              <Text style={[styles.taxHeaderCell, styles.taxColAssessed]}>Assessed</Text>
              <Text style={[styles.taxHeaderCell, styles.taxColTax]}>Tax</Text>
              <Text style={[styles.taxHeaderCell, styles.taxColRate]}>Rate</Text>
            </View>

            {taxHistory.map((row, i) => (
              <View
                key={row.year}
                style={[styles.taxRow, i % 2 === 0 && styles.taxRowEven]}
              >
                <Text style={[styles.taxCell, styles.taxColYear, styles.taxBold]}>
                  {row.year}
                </Text>
                <Text style={[styles.taxCell, styles.taxColAssessed]}>
                  {row.assessedValue}
                </Text>
                <Text style={[styles.taxCell, styles.taxColTax]}>{row.taxAmount}</Text>
                <Text style={[styles.taxCell, styles.taxColRate]}>{row.effectiveRate}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* ══════════════════════════════════════ */}
      {/*  Transaction history table            */}
      {/* ══════════════════════════════════════ */}
      {transactions.length > 0 && (
        <>
          <SectionHeader
            title="Transaction history"
            subtitle={`${transactions.length} recorded transactions`}
          />
          <View style={styles.txTable}>
            {transactions.map((tx, i) => (
              <View
                key={tx.id}
                style={[styles.txRow, i < transactions.length - 1 && styles.txBorder]}
              >
                <View style={styles.txLeft}>
                  <Text style={styles.txType}>{tx.type}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                  {tx.parties !== '—' && (
                    <Text style={styles.txParties} numberOfLines={1}>
                      {tx.parties}
                    </Text>
                  )}
                </View>
                <Text style={styles.txAmount}>{tx.amount}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  content: { paddingHorizontal: spacing.xl },
  loadingRoot: { flex: 1, backgroundColor: palette.gray50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerBlock: { marginBottom: spacing.md },
  backText: { ...typography.labelLg, color: palette.teal },
  headerInfo: { alignItems: 'center' },
  headerAddress: { ...typography.headingLg, color: palette.navy },
  headerLocation: { ...typography.bodyMd, color: palette.gray500, marginTop: 2 },

  chartCard: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    ...shadow.sm,
  },

  // Tax table
  taxTable: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: spacing.md,
    ...shadow.sm,
  },
  taxHeaderRow: {
    flexDirection: 'row',
    backgroundColor: palette.gray50,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: palette.gray200,
  },
  taxHeaderCell: {
    ...typography.labelSm,
    color: palette.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taxRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  taxRowEven: { backgroundColor: palette.gray50 },
  taxCell: { ...typography.bodyMd, color: palette.gray700 },
  taxBold: { fontWeight: '600', color: palette.navy },
  taxColYear: { width: 60 },
  taxColAssessed: { flex: 1 },
  taxColTax: { width: 80, textAlign: 'right' },
  taxColRate: { width: 60, textAlign: 'right' },

  // Transaction table
  txTable: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.sm,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  txBorder: { borderBottomWidth: 0.5, borderBottomColor: palette.gray100 },
  txLeft: { flex: 1 },
  txType: { ...typography.labelLg, color: palette.gray700 },
  txDate: { ...typography.bodySm, color: palette.gray500, marginTop: 2 },
  txParties: { ...typography.bodySm, color: palette.gray400, marginTop: 2 },
  txAmount: { ...typography.headingSm, color: palette.navy },
});
