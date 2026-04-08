import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AnalyticsPeriod } from '@/services/api';
import { useMarketAnalytics } from '../hooks/use-analytics';
import {
  AreaChart,
  BarChart,
  MetricGrid,
  PeriodSelector,
  SectionHeader,
} from '../components';
import { palette, spacing, typography, radius, shadow } from '@/theme';
import type { DashboardStackParamList } from '@/types';

type Route = RouteProp<DashboardStackParamList, 'MarketAnalytics'>;

export function MarketAnalyticsScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [period, setPeriod] = useState<AnalyticsPeriod>('1y');
  const [activeChart, setActiveChart] = useState<'price' | 'psf' | 'listings'>('price');

  const {
    metrics,
    priceTrend,
    psfTrend,
    listingsTrend,
    isLoading,
    isFetching,
    refetch,
  } = useMarketAnalytics(params.zipCode, period);

  const chartMap = { price: priceTrend, psf: psfTrend, listings: listingsTrend };
  const activeSeries = chartMap[activeChart];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.teal} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing['3xl'] }]}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={palette.teal} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Market analytics</Text>
          <Text style={styles.headerSubtitle}>{params.zipCode}</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      {/* Period selector */}
      <View style={styles.periodRow}>
        <PeriodSelector value={period} onChange={setPeriod} />
      </View>

      {/* Metric cards */}
      <SectionHeader title="Key metrics" />
      <MetricGrid metrics={metrics} />

      {/* Chart selector tabs */}
      <SectionHeader title="Trends" />
      <View style={styles.chartTabs}>
        {(['price', 'psf', 'listings'] as const).map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.chartTab, activeChart === key && styles.chartTabActive]}
            onPress={() => setActiveChart(key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chartTabText, activeChart === key && styles.chartTabTextActive]}>
              {key === 'price' ? 'Median price' : key === 'psf' ? 'Price/sqft' : 'Listings'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active chart */}
      {activeSeries && activeSeries.data.length > 1 && (
        <View style={styles.chartCard}>
          <AreaChart
            series={activeSeries}
            height={240}
            showArea={activeChart !== 'listings'}
          />
        </View>
      )}

      {/* Listings as bar chart alternative */}
      {activeChart === 'listings' && listingsTrend && listingsTrend.data.length > 1 && (
        <View style={styles.chartCard}>
          <BarChart series={listingsTrend} height={200} />
        </View>
      )}

      {/* No data state */}
      {activeSeries && activeSeries.data.length <= 1 && (
        <View style={styles.noData}>
          <Text style={styles.noDataText}>
            Not enough data for this time period. Try a longer range.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  content: { paddingHorizontal: spacing.xl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backText: { ...typography.labelLg, color: palette.teal, width: 50 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { ...typography.headingMd, color: palette.navy },
  headerSubtitle: { ...typography.bodySm, color: palette.gray500 },

  periodRow: { marginBottom: spacing.lg },

  chartTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chartTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: palette.gray100,
  },
  chartTabActive: { backgroundColor: palette.navy },
  chartTabText: { ...typography.labelMd, color: palette.gray500 },
  chartTabTextActive: { color: palette.white },

  chartCard: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    ...shadow.sm,
  },

  noData: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing['2xl'],
    alignItems: 'center',
    ...shadow.sm,
  },
  noDataText: { ...typography.bodyMd, color: palette.gray500, textAlign: 'center' },
});
