import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { analyticsApi, savedPropertiesApi, type AnalyticsPeriod } from '@/services/api';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/auth.slice';
import {
  transformMarketMetrics,
  transformPriceTrend,
  type MetricCard,
  type TrendSeries,
} from '@/features/analytics/utils/transformers';
import {
  STORAGE_KEYS,
  PAGINATION,
  CACHE_TTL,
} from '@/shared/constants';
import type { SavedProperty, MarketSnapshot } from '@/types';

// ═══════════════════════════════════════════
//  Recent searches (MMKV-persisted)
// ═══════════════════════════════════════════

export interface RecentSearch {
  id: string;
  query: string;
  type: 'address' | 'zip' | 'city';
  timestamp: number;
}

async function loadRecents(): Promise<RecentSearch[]> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEYS.RECENT_SEARCHES);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RecentSearch[];
  } catch {
    return [];
  }
}

async function persistRecents(items: RecentSearch[]): Promise<void> {
  await SecureStore.setItemAsync(
    STORAGE_KEYS.RECENT_SEARCHES,
    JSON.stringify(items.slice(0, PAGINATION.RECENT_SEARCH_MAX)),
  );
}

function detectSearchType(query: string): RecentSearch['type'] {
  if (/^\d{5}(-\d{4})?$/.test(query)) return 'zip';
  if (/,/.test(query)) return 'address';
  return 'city';
}

export function useRecentSearches() {
  const [recents, setRecents] = useState<RecentSearch[]>([]);

  useEffect(() => {
    void (async () => {
      setRecents(await loadRecents());
    })();
  }, []);

  const addRecent = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecents((prev) => {
      const filtered = prev.filter((r) => r.query !== trimmed);
      const updated = [
        { id: `${Date.now()}`, query: trimmed, type: detectSearchType(trimmed), timestamp: Date.now() },
        ...filtered,
      ].slice(0, PAGINATION.RECENT_SEARCH_MAX);
      void persistRecents(updated);
      return updated;
    });
  }, []);

  const removeRecent = useCallback((id: string) => {
    setRecents((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      void persistRecents(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setRecents([]);
    void SecureStore.deleteItemAsync(STORAGE_KEYS.RECENT_SEARCHES);
  }, []);

  return { recents, addRecent, removeRecent, clearAll };
}

// ═══════════════════════════════════════════
//  Market snapshot with pre-transformed data
// ═══════════════════════════════════════════

export const dashboardKeys = {
  market: (zip: string, period: AnalyticsPeriod) => ['dashboard', 'market', zip, period] as const,
  savedPreview: ['dashboard', 'saved-preview'] as const,
};

export function useMarketSnapshot(zipCode: string, period: AnalyticsPeriod = '1y') {
  const query = useQuery<MarketSnapshot>({
    queryKey: dashboardKeys.market(zipCode, period),
    queryFn: () => analyticsApi.getMarketSnapshot(zipCode, period),
    enabled: !!zipCode,
    staleTime: CACHE_TTL.MARKET_SNAPSHOT,
  });

  const metrics = useMemo<MetricCard[]>(
    () => (query.data ? transformMarketMetrics(query.data) : []),
    [query.data],
  );

  const sparkline = useMemo<TrendSeries | null>(
    () => (query.data ? transformPriceTrend(query.data) : null),
    [query.data],
  );

  return { ...query, metrics, sparkline };
}

// ═══════════════════════════════════════════
//  Saved properties preview
// ═══════════════════════════════════════════

export function useDashboardSaved() {
  return useQuery<{ items: SavedProperty[] }>({
    queryKey: dashboardKeys.savedPreview,
    queryFn: () => savedPropertiesApi.getAll(1, PAGINATION.SAVED_PREVIEW_COUNT),
    staleTime: CACHE_TTL.SAVED_PREVIEW,
  });
}

// ═══════════════════════════════════════════
//  Greeting
// ═══════════════════════════════════════════

export function useGreeting(): string {
  const user = useAppSelector(selectUser);
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return user?.firstName ? `${timeGreeting}, ${user.firstName}` : timeGreeting;
}
