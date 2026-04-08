import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import * as Location from 'expo-location';
import { propertiesApi } from '@/services/api';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  selectSearchParams,
  selectSearchState,
  setMapRegion,
} from '@/store/slices/search.slice';
import {
  DEBOUNCE,
  CACHE_TTL,
  PAGINATION,
  VALIDATION,
  MAP_DEFAULTS,
} from '@/shared/constants';
import type {
  PropertySearchParams,
  PropertySummary,
  PaginationMeta,
  AutocompleteResult,
} from '@/types';

// ═══════════════════════════════════════════
//  Query key factory
// ═══════════════════════════════════════════

export const searchKeys = {
  all: ['search'] as const,
  list: (params: PropertySearchParams) => ['search', 'list', params] as const,
  infinite: (params: PropertySearchParams) => ['search', 'infinite', params] as const,
  autocomplete: (input: string) => ['search', 'autocomplete', input] as const,
};

// ═══════════════════════════════════════════
//  useAutocomplete
// ═══════════════════════════════════════════

export function useAutocomplete() {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(input), DEBOUNCE.AUTOCOMPLETE_MS);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    return () => { abortRef.current?.abort(); };
  }, [debouncedInput]);

  const query = useQuery<AutocompleteResult[]>({
    queryKey: searchKeys.autocomplete(debouncedInput),
    queryFn: () => propertiesApi.autocomplete(debouncedInput),
    enabled: debouncedInput.length >= VALIDATION.MIN_AUTOCOMPLETE_CHARS && isOpen,
    staleTime: CACHE_TTL.AUTOCOMPLETE,
    gcTime: CACHE_TTL.PROPERTY_DETAIL,
    placeholderData: (prev) => prev,
  });

  const onChangeText = useCallback((text: string) => {
    setInput(text);
    setIsOpen(text.length >= VALIDATION.MIN_AUTOCOMPLETE_CHARS);
  }, []);

  const clear = useCallback(() => {
    setInput('');
    setDebouncedInput('');
    setIsOpen(false);
  }, []);

  const dismiss = useCallback(() => { setIsOpen(false); }, []);

  return {
    input,
    onChangeText,
    suggestions: isOpen ? query.data ?? [] : [],
    isLoading: query.isFetching && debouncedInput.length >= VALIDATION.MIN_AUTOCOMPLETE_CHARS,
    isOpen,
    clear,
    dismiss,
  };
}

// ═══════════════════════════════════════════
//  usePropertySearch
// ═══════════════════════════════════════════

export function usePropertySearch(): UseQueryResult<{
  items: PropertySummary[];
  meta: PaginationMeta;
}> {
  const params = useAppSelector(selectSearchParams);

  return useQuery({
    queryKey: searchKeys.list(params),
    queryFn: () => propertiesApi.search(params),
    enabled: hasSearchCriteria(params),
    staleTime: CACHE_TTL.SEARCH_RESULTS,
    placeholderData: (prev) => prev,
  });
}

// ═══════════════════════════════════════════
//  useInfinitePropertySearch
// ═══════════════════════════════════════════

export function useInfinitePropertySearch() {
  const params = useAppSelector(selectSearchParams);

  return useInfiniteQuery({
    queryKey: searchKeys.infinite(params),
    queryFn: ({ pageParam }) => propertiesApi.search({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: hasSearchCriteria(params),
    staleTime: CACHE_TTL.SEARCH_RESULTS,
  });
}

// ═══════════════════════════════════════════
//  useMapSearch
// ═══════════════════════════════════════════

export function useMapSearch() {
  const dispatch = useAppDispatch();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const { mapRegion, radiusMiles } = useAppSelector(selectSearchState);

  const onRegionChangeComplete = useCallback(
    (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { dispatch(setMapRegion(region)); }, DEBOUNCE.MAP_REGION_MS);
    },
    [dispatch],
  );

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const searchResult = usePropertySearch();

  return {
    onRegionChangeComplete,
    mapRegion,
    properties: searchResult.data?.items ?? [],
    total: searchResult.data?.meta.total ?? 0,
    isLoading: searchResult.isLoading,
    isFetching: searchResult.isFetching,
  };
}

// ═══════════════════════════════════════════
//  useLocationPermission
// ═══════════════════════════════════════════

export function useLocationPermission() {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  const requestLocation = useCallback(async () => {
    try {
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
      if (permStatus !== 'granted') { setStatus('denied'); return; }
      setStatus('granted');

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      dispatch(setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: MAP_DEFAULTS.FOCUSED_DELTA,
        longitudeDelta: MAP_DEFAULTS.FOCUSED_DELTA,
      }));
    } catch {
      setStatus('denied');
    }
  }, [dispatch]);

  return { status, requestLocation };
}

// ═══════════════════════════════════════════
//  usePrefetchProperty
// ═══════════════════════════════════════════

export function usePrefetchProperty() {
  const queryClient = useQueryClient();

  return useCallback(
    (propertyId: string) => {
      queryClient.prefetchQuery({
        queryKey: ['properties', 'detail', propertyId],
        queryFn: () => propertiesApi.getDetail(propertyId),
        staleTime: CACHE_TTL.PROPERTY_DETAIL,
      });
    },
    [queryClient],
  );
}

function hasSearchCriteria(params: PropertySearchParams): boolean {
  return !!(params.latitude || params.zipCode || params.city || params.address);
}
