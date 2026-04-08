/**
 * Formatting utilities — centralized so "$350K" is never
 * formatted differently across two screens.
 */

export function formatCurrency(
  value: number | null | undefined,
  opts?: { compact?: boolean; decimals?: number },
): string {
  if (value == null) return '—';
  const { compact = false, decimals = 0 } = opts ?? {};

  if (compact) {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  }

  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '—';
  return value.toLocaleString('en-US');
}

export function formatPercent(
  value: number | null | undefined,
  opts?: { showSign?: boolean },
): string {
  if (value == null) return '—';
  const { showSign = true } = opts ?? {};
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatSqFt(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value.toLocaleString('en-US')} sqft`;
}

export function formatAddress(
  line1: string,
  city: string,
  state: string,
  zip?: string,
): string {
  const parts = [line1, `${city}, ${state}`];
  if (zip) parts[1] += ` ${zip}`;
  return parts.join(', ');
}
