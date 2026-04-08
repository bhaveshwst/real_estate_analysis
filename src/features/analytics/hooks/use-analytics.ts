import { useMemo } from 'react';
import { useMarketSnapshot, useZipSummary } from '@/features/dashboard/hooks/use-dashboard';
import { usePropertyDetail, usePropertyValuation } from '@/features/property/hooks/use-property';
import type { AnalyticsPeriod } from '@/services/api';
import {
  transformPriceTrend,
  transformPricePerSqFtTrend,
  transformListingsTrend,
  transformMarketMetrics,
  transformValuationMetrics,
  transformComparables,
  transformTransactions,
  transformTransactionChart,
  transformTaxHistory,
  transformTaxChart,
  type TrendSeries,
  type MetricCard,
  type CompRow,
  type TransactionRow,
  type TaxHistoryRow,
} from '../utils/transformers';

// ═══════════════════════════════════════════
//  Market-level analytics (ZIP code)
// ═══════════════════════════════════════════

export function useMarketAnalytics(zipCode: string, period: AnalyticsPeriod) {
  const { data: snapshot, isLoading, isFetching, refetch } = useMarketSnapshot(zipCode, period);

  const metrics = useMemo<MetricCard[]>(
    () => (snapshot ? transformMarketMetrics(snapshot) : []),
    [snapshot],
  );

  const priceTrend = useMemo<TrendSeries | null>(
    () => (snapshot ? transformPriceTrend(snapshot) : null),
    [snapshot],
  );

  const psfTrend = useMemo<TrendSeries | null>(
    () => (snapshot ? transformPricePerSqFtTrend(snapshot) : null),
    [snapshot],
  );

  const listingsTrend = useMemo<TrendSeries | null>(
    () => (snapshot ? transformListingsTrend(snapshot) : null),
    [snapshot],
  );

  return {
    metrics,
    priceTrend,
    psfTrend,
    listingsTrend,
    isLoading,
    isFetching,
    refetch,
    raw: snapshot,
  };
}

// ═══════════════════════════════════════════
//  Property-level analytics
// ═══════════════════════════════════════════

export function usePropertyAnalytics(propertyId: string) {
  const { data: detail, isLoading: detailLoading } = usePropertyDetail(propertyId);
  const { data: valuation, isLoading: valLoading } = usePropertyValuation(propertyId);

  const isLoading = detailLoading || valLoading;

  // ── Valuation metrics ──
  const valuationMetrics = useMemo<MetricCard[]>(
    () => (valuation ? transformValuationMetrics(valuation, detail) : []),
    [valuation, detail],
  );

  // ── Comparables ──
  const comparables = useMemo<CompRow[]>(
    () =>
      valuation
        ? transformComparables(valuation.comparables, detail?.squareFeet ?? null)
        : [],
    [valuation, detail],
  );

  // ── Transaction history ──
  const transactions = useMemo<TransactionRow[]>(
    () => (detail?.transactions ? transformTransactions(detail.transactions) : []),
    [detail],
  );

  const transactionChart = useMemo<TrendSeries | null>(
    () =>
      detail?.transactions && detail.transactions.length >= 2
        ? transformTransactionChart(detail.transactions)
        : null,
    [detail],
  );

  // ── Tax history ──
  const taxHistory = useMemo<TaxHistoryRow[]>(
    () => (detail ? transformTaxHistory(detail) : []),
    [detail],
  );

  const taxChart = useMemo<TrendSeries | null>(
    () => (detail ? transformTaxChart(detail) : null),
    [detail],
  );

  return {
    detail,
    valuation,
    isLoading,
    valuationMetrics,
    comparables,
    transactions,
    transactionChart,
    taxHistory,
    taxChart,
  };
}
