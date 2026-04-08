/**
 * Analytics data transformers.
 *
 * Raw API data uses decimal precision, inconsistent date formats,
 * and null-heavy fields. Chart libraries need clean arrays with
 * no nulls and pre-formatted labels. This module bridges the gap
 * so components never do data munging inline.
 */

import { formatCurrency, formatPercent } from '@/shared/utils/format';
import type {
  MarketSnapshot,
  PropertyValuation,
  PropertyDetail,
  PropertyTransaction,
  ComparableProperty,
} from '@/types';

// ═══════════════════════════════════════════
//  Chart data point shapes
// ═══════════════════════════════════════════

export interface ChartPoint {
  x: string;     // label (date, month name, etc.)
  y: number;     // numeric value
  label?: string; // formatted display value
}

export interface TrendSeries {
  key: string;
  color: string;
  label: string;
  data: ChartPoint[];
}

export interface MetricCard {
  label: string;
  value: string;
  subtext?: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  color?: string;
}

export interface TaxHistoryRow {
  year: number;
  assessedValue: string;
  taxAmount: string;
  effectiveRate: string;
}

export interface TransactionRow {
  id: string;
  date: string;
  type: string;
  amount: string;
  parties: string;
}

export interface CompRow {
  id: string;
  address: string;
  price: string;
  pricePerSqFt: string;
  date: string;
  distance: string;
  beds: string;
  similarity: number; // 0–100 score for bar visualization
}

// ═══════════════════════════════════════════
//  Market trend transformers
// ═══════════════════════════════════════════

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

export function transformPriceTrend(snapshot: MarketSnapshot): TrendSeries {
  return {
    key: 'medianPrice',
    color: '#0F6E56', // teal
    label: 'Median price',
    data: snapshot.trendData.map((pt) => ({
      x: formatMonthLabel(pt.date),
      y: pt.medianPrice,
      label: formatCurrency(pt.medianPrice, { compact: true }),
    })),
  };
}

export function transformPricePerSqFtTrend(snapshot: MarketSnapshot): TrendSeries {
  return {
    key: 'pricePerSqFt',
    color: '#185FA5', // blue
    label: 'Price / sq ft',
    data: snapshot.trendData.map((pt) => ({
      x: formatMonthLabel(pt.date),
      y: pt.pricePerSqFt,
      label: `$${pt.pricePerSqFt}`,
    })),
  };
}

export function transformListingsTrend(snapshot: MarketSnapshot): TrendSeries {
  return {
    key: 'listings',
    color: '#BA7517', // amber
    label: 'Total listings',
    data: snapshot.trendData.map((pt) => ({
      x: formatMonthLabel(pt.date),
      y: pt.totalListings,
      label: String(pt.totalListings),
    })),
  };
}

/**
 * Build the top-level metric cards from a market snapshot.
 */
export function transformMarketMetrics(snapshot: MarketSnapshot): MetricCard[] {
  return [
    {
      label: 'Median price',
      value: formatCurrency(snapshot.currentMedianPrice, { compact: true }),
      trend: directionOf(snapshot.monthOverMonthChange),
      trendValue: formatPercent(snapshot.monthOverMonthChange) + ' MoM',
      color: '#0F6E56',
    },
    {
      label: 'Price / sq ft',
      value: `$${snapshot.currentAvgPricePerSqFt}`,
      trend: directionOf(snapshot.yearOverYearChange),
      trendValue: formatPercent(snapshot.yearOverYearChange) + ' YoY',
      color: '#185FA5',
    },
    {
      label: 'Active listings',
      value: String(snapshot.currentTotalListings),
      subtext: snapshot.medianDaysOnMarket != null
        ? `${snapshot.medianDaysOnMarket} days avg`
        : undefined,
    },
    {
      label: 'Gross yield',
      value: snapshot.grossYield != null ? `${snapshot.grossYield}%` : '—',
      subtext: snapshot.medianRent != null
        ? `${formatCurrency(snapshot.medianRent)}/mo rent`
        : undefined,
      color: '#BA7517',
    },
  ];
}

// ═══════════════════════════════════════════
//  Property valuation transformers
// ═══════════════════════════════════════════

/**
 * Build valuation metric cards for the property detail view.
 */
export function transformValuationMetrics(
  val: PropertyValuation,
  detail?: PropertyDetail | null,
): MetricCard[] {
  const im = val.investmentMetrics;

  const cards: MetricCard[] = [
    {
      label: 'Estimated value',
      value: formatCurrency(val.estimatedValue),
      subtext: `${formatCurrency(val.confidenceRange.low, { compact: true })} – ${formatCurrency(val.confidenceRange.high, { compact: true })}`,
      color: '#0F6E56',
    },
    {
      label: 'Price / sq ft',
      value: val.pricePerSqFt != null ? `$${val.pricePerSqFt}` : '—',
    },
  ];

  if (im.capRate != null) {
    cards.push({
      label: 'Cap rate',
      value: `${im.capRate}%`,
      color: im.capRate >= 5 ? '#0F6E56' : im.capRate >= 3 ? '#BA7517' : '#A32D2D',
    });
  }

  if (im.monthlyCashFlow != null) {
    cards.push({
      label: 'Monthly cash flow',
      value: formatCurrency(im.monthlyCashFlow),
      trend: im.monthlyCashFlow >= 0 ? 'up' : 'down',
      color: im.monthlyCashFlow >= 0 ? '#0F6E56' : '#A32D2D',
    });
  }

  if (im.cashOnCashReturn != null) {
    cards.push({
      label: 'Cash-on-cash',
      value: `${im.cashOnCashReturn}%`,
    });
  }

  if (im.monthlyMortgage != null) {
    cards.push({
      label: 'Est. mortgage',
      value: `${formatCurrency(im.monthlyMortgage)}/mo`,
      subtext: '25% down, 7% rate, 30yr',
    });
  }

  return cards;
}

/**
 * Transform comparables into table-ready rows with similarity scores.
 */
export function transformComparables(
  comps: ComparableProperty[],
  subjectSqFt: number | null,
): CompRow[] {
  const maxPrice = Math.max(...comps.map((c) => c.salePrice), 1);

  return comps.map((c) => {
    // Similarity based on proximity (closer = more similar)
    const distScore = Math.max(0, 100 - c.distanceMiles * 40);
    // Size similarity
    const sizeScore = subjectSqFt && c.squareFeet
      ? Math.max(0, 100 - Math.abs(subjectSqFt - c.squareFeet) / subjectSqFt * 100)
      : 50;
    const similarity = Math.round((distScore * 0.6 + sizeScore * 0.4));

    return {
      id: c.id,
      address: c.address,
      price: formatCurrency(c.salePrice, { compact: true }),
      pricePerSqFt: c.squareFeet
        ? `$${Math.round(c.salePrice / c.squareFeet)}`
        : '—',
      date: c.saleDate ? formatShortDate(c.saleDate) : '—',
      distance: `${c.distanceMiles}mi`,
      beds: c.bedrooms != null ? `${c.bedrooms}bd` : '—',
      similarity,
    };
  });
}

// ═══════════════════════════════════════════
//  Transaction / tax history transformers
// ═══════════════════════════════════════════

export function transformTransactions(txns: PropertyTransaction[]): TransactionRow[] {
  return txns
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
    .map((tx) => ({
      id: tx.id,
      date: formatShortDate(tx.transactionDate),
      type: tx.transactionType.charAt(0).toUpperCase() + tx.transactionType.slice(1),
      amount: formatCurrency(tx.amount),
      parties: [tx.seller, tx.buyer].filter(Boolean).join(' → ') || '—',
    }));
}

/**
 * Build a price history chart from transactions.
 * Shows how the property's sale price has changed over time.
 */
export function transformTransactionChart(txns: PropertyTransaction[]): TrendSeries {
  const sales = txns
    .filter((t) => t.transactionType === 'sale' && t.amount > 0)
    .sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());

  return {
    key: 'saleHistory',
    color: '#0C2340', // navy
    label: 'Sale price',
    data: sales.map((tx) => ({
      x: formatShortDate(tx.transactionDate),
      y: tx.amount,
      label: formatCurrency(tx.amount, { compact: true }),
    })),
  };
}

/**
 * Simulate tax history from property detail.
 * In production this would come from a dedicated API endpoint.
 */
export function transformTaxHistory(detail: PropertyDetail): TaxHistoryRow[] {
  if (!detail.taxAssessedValue || !detail.annualTaxAmount || !detail.taxYear) {
    return [];
  }

  // Generate 5 years of simulated history (3% annual increase, going backwards)
  const rows: TaxHistoryRow[] = [];
  for (let i = 0; i < 5; i++) {
    const year = detail.taxYear - i;
    const factor = Math.pow(0.97, i);
    const assessed = Math.round(detail.taxAssessedValue * factor);
    const tax = Math.round(detail.annualTaxAmount * factor);
    const rate = assessed > 0 ? ((tax / assessed) * 100).toFixed(2) : '0';

    rows.push({
      year,
      assessedValue: formatCurrency(assessed, { compact: true }),
      taxAmount: formatCurrency(tax),
      effectiveRate: `${rate}%`,
    });
  }

  return rows;
}

export function transformTaxChart(detail: PropertyDetail): TrendSeries {
  const history = transformTaxHistory(detail);

  return {
    key: 'taxHistory',
    color: '#A32D2D', // red
    label: 'Annual tax',
    data: history
      .reverse()
      .map((row) => ({
        x: String(row.year),
        y: parseFloat(row.taxAmount.replace(/[$,]/g, '')) || 0,
        label: row.taxAmount,
      })),
  };
}

// ═══════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════

function directionOf(value: number | null): 'up' | 'down' | 'flat' {
  if (value == null || value === 0) return 'flat';
  return value > 0 ? 'up' : 'down';
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
