import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PropertyType, PropertyStatus, PropertySearchParams } from '@/types';

// ── Map viewport ──
interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// ── Filter state ──
interface SearchFilters {
  propertyType: PropertyType | null;
  status: PropertyStatus | null;
  minBedrooms: number | null;
  maxBedrooms: number | null;
  minBathrooms: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  minSqFt: number | null;
  maxSqFt: number | null;
  minYearBuilt: number | null;
}

export interface SearchState {
  // Text input
  query: string;
  // Geo search
  mapRegion: MapRegion;
  radiusMiles: number;
  // Filters
  filters: SearchFilters;
  // Pagination
  page: number;
  limit: number;
  // UI
  viewMode: 'map' | 'list';
  activeFilterCount: number;
}

const DEFAULT_REGION: MapRegion = {
  latitude: 30.2672,
  longitude: -97.7431,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const DEFAULT_FILTERS: SearchFilters = {
  propertyType: null,
  status: null,
  minBedrooms: null,
  maxBedrooms: null,
  minBathrooms: null,
  minPrice: null,
  maxPrice: null,
  minSqFt: null,
  maxSqFt: null,
  minYearBuilt: null,
};

const initialState: SearchState = {
  query: '',
  mapRegion: DEFAULT_REGION,
  radiusMiles: 5,
  filters: DEFAULT_FILTERS,
  page: 1,
  limit: 20,
  viewMode: 'map',
  activeFilterCount: 0,
};

function countActiveFilters(filters: SearchFilters): number {
  return Object.values(filters).filter((v) => v !== null).length;
}

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
      state.page = 1; // Reset pagination on new search
    },

    setMapRegion(state, action: PayloadAction<MapRegion>) {
      state.mapRegion = action.payload;
    },

    setRadius(state, action: PayloadAction<number>) {
      state.radiusMiles = action.payload;
      state.page = 1;
    },

    setFilter<K extends keyof SearchFilters>(
      state: SearchState,
      action: PayloadAction<{ key: K; value: SearchFilters[K] }>,
    ) {
      state.filters[action.payload.key] = action.payload.value;
      state.activeFilterCount = countActiveFilters(state.filters);
      state.page = 1;
    },

    setBulkFilters(state, action: PayloadAction<Partial<SearchFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.activeFilterCount = countActiveFilters(state.filters);
      state.page = 1;
    },

    clearAllFilters(state) {
      state.filters = DEFAULT_FILTERS;
      state.activeFilterCount = 0;
      state.page = 1;
    },

    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },

    nextPage(state) {
      state.page += 1;
    },

    setViewMode(state, action: PayloadAction<'map' | 'list'>) {
      state.viewMode = action.payload;
    },

    resetSearch() {
      return initialState;
    },
  },
});

export const {
  setQuery,
  setMapRegion,
  setRadius,
  setFilter,
  setBulkFilters,
  clearAllFilters,
  setPage,
  nextPage,
  setViewMode,
  resetSearch,
} = searchSlice.actions;

// ── Selectors ──

export const selectSearchState = (state: { search: SearchState }) => state.search;

export const selectFilters = (state: { search: SearchState }) => state.search.filters;

export const selectActiveFilterCount = (state: { search: SearchState }) =>
  state.search.activeFilterCount;

/**
 * Derives the API query params from the current search state.
 * Used by React Query as the cache key + request params.
 */
export const selectSearchParams = (state: { search: SearchState }): PropertySearchParams => {
  const { query, mapRegion, radiusMiles, filters, page, limit } = state.search;

  const params: PropertySearchParams = { page, limit };

  // Geo-radius search when using map
  if (!query && mapRegion) {
    params.latitude = mapRegion.latitude;
    params.longitude = mapRegion.longitude;
    params.radiusMiles = radiusMiles;
  }

  // Text search
  if (query) {
    const trimmedQuery = query.trim();

    // Detect if query looks like a ZIP code
    if (/^\d{5}(-\d{4})?$/.test(trimmedQuery)) {
      params.zipCode = trimmedQuery;
    } else if (/^[a-zA-Z\s]+$/.test(trimmedQuery)) {
      // City-only queries like "new york" should map to city, not address.
      params.city = trimmedQuery;
    } else {
      params.address = trimmedQuery;
    }
  }

  // Apply active filters
  if (filters.propertyType) params.propertyType = filters.propertyType;
  if (filters.status) params.status = filters.status;
  if (filters.minBedrooms != null) params.minBedrooms = filters.minBedrooms;
  if (filters.maxBedrooms != null) params.maxBedrooms = filters.maxBedrooms;
  if (filters.minBathrooms != null) params.minBathrooms = filters.minBathrooms;
  if (filters.minPrice != null) params.minPrice = filters.minPrice;
  if (filters.maxPrice != null) params.maxPrice = filters.maxPrice;
  if (filters.minSqFt != null) params.minSqFt = filters.minSqFt;
  if (filters.maxSqFt != null) params.maxSqFt = filters.maxSqFt;
  if (filters.minYearBuilt != null) params.minYearBuilt = filters.minYearBuilt;

  return params;
};
