import { QueryClient } from '@tanstack/react-query';
import { CACHE_TTL, RETRY } from '@/shared/constants';

/**
 * React Query client — handles ALL server state.
 *
 * staleTime: 5 min default — repeated navigations serve instantly
 *   from cache; background refetch happens silently. Individual
 *   query hooks override with tighter values from CACHE_TTL.
 * gcTime: 30 min — unmounted data stays for back-navigation.
 * retry: 2 — network blips get two more attempts with exponential backoff.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TTL.SEARCH_RESULTS,
      gcTime: CACHE_TTL.GC_TIME,
      retry: RETRY.DEFAULT_COUNT,
      retryDelay: (attemptIndex: number) =>
        Math.min(RETRY.BASE_DELAY_MS * 2 ** attemptIndex, RETRY.MAX_DELAY_MS),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: RETRY.MUTATION_COUNT,
    },
  },
});
