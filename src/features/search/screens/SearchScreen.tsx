import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectSearchState,
  selectActiveFilterCount,
  setQuery,
  setViewMode,
} from '@/store/slices/search.slice';
import {
  useAutocomplete,
  usePropertySearch,
  useMapSearch,
  useLocationPermission,
  usePrefetchProperty,
} from '../hooks/use-search';
import {
  AutocompleteBar,
  PropertyMap,
  FilterSheet,
  PropertyListCard,
  ViewToggle,
} from '../components';
import { palette, spacing, typography } from '@/theme';
import { DEBOUNCE } from '@/shared/constants';
import type { SearchStackParamList, AutocompleteResult, PropertySummary } from '@/types';

type Nav = NativeStackNavigationProp<SearchStackParamList, 'Search'>;

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const prefetchProperty = usePrefetchProperty();

  // ── State ──
  const { viewMode, mapRegion } = useAppSelector(selectSearchState);
  const filterCount = useAppSelector(selectActiveFilterCount);
  const [filterVisible, setFilterVisible] = useState(false);

  // ── Hooks ──
  const autocomplete = useAutocomplete();
  const mapSearch = useMapSearch();
  const searchResult = usePropertySearch();
  const { status: locStatus, requestLocation } = useLocationPermission();

  // Request location on first mount
  useEffect(() => {
    if (locStatus === 'idle') {
      requestLocation();
    }
  }, [locStatus, requestLocation]);

  // Keep property results responsive while user types by syncing
  // the address query after a short debounce.
  useEffect(() => {
    const timer = setTimeout(() => {
      const nextQuery = autocomplete.input.trim();
      dispatch(setQuery(nextQuery));
    }, DEBOUNCE.AUTOCOMPLETE_MS);

    return () => clearTimeout(timer);
  }, [autocomplete.input, dispatch]);

  // ── Autocomplete selection ──
  // Geocodes the selected place and centers the map
  const handleAutocompleteSelect = useCallback(
    async (item: AutocompleteResult) => {
      autocomplete.dismiss();

      // Set the address as the active query
      dispatch(setQuery(item.description));

      // Use the description to trigger a text-based search
      // In production, you'd geocode via Google Places getDetail
      // to get lat/lng and center the map. For now, trigger
      // the text search which the backend handles.

      // If we had the geocode coords we'd do:
      // dispatch(setMapRegion({ latitude, longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 }));
    },
    [autocomplete, dispatch],
  );

  // ── Search submit (keyboard "Search" key) ──
  const handleSearchSubmit = useCallback(() => {
    if (autocomplete.input.trim()) {
      dispatch(setQuery(autocomplete.input.trim()));
      autocomplete.dismiss();
    }
  }, [autocomplete, dispatch]);

  // ── Map marker press ──
  const handleMarkerPress = useCallback(
    (property: PropertySummary) => {
      // Prefetch detail for snappy navigation
      prefetchProperty(property.id);
    },
    [prefetchProperty],
  );

  // ── Callout press → navigate to detail ──
  const handleCalloutPress = useCallback(
    (propertyId: string) => {
      navigation.navigate('PropertyDetail', { propertyId });
    },
    [navigation],
  );

  // ── View mode toggle ──
  const handleViewModeChange = useCallback(
    (mode: 'map' | 'list') => {
      dispatch(setViewMode(mode));
    },
    [dispatch],
  );

  // ── List card press ──
  const handleCardPress = useCallback(
    (propertyId: string) => {
      navigation.navigate('PropertyDetail', { propertyId });
    },
    [navigation],
  );

  // ── Derive data ──
  const properties = searchResult.data?.items ?? mapSearch.properties;
  const total = searchResult.data?.meta.total ?? mapSearch.total;
  const isLoading = searchResult.isLoading || mapSearch.isLoading;

  return (
    <View style={styles.container}>
      {/* ══════════════════════════════════════════ */}
      {/*  Map view                                 */}
      {/* ══════════════════════════════════════════ */}
      {viewMode === 'map' && (
        <PropertyMap
          region={mapRegion}
          properties={properties}
          isLoading={mapSearch.isFetching}
          onRegionChangeComplete={mapSearch.onRegionChangeComplete}
          onMarkerPress={handleMarkerPress}
          onCalloutPress={handleCalloutPress}
        />
      )}

      {/* ══════════════════════════════════════════ */}
      {/*  List view                                */}
      {/* ══════════════════════════════════════════ */}
      {viewMode === 'list' && (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PropertyListCard
              property={item}
              onPress={() => handleCardPress(item.id)}
              onLongPress={() => prefetchProperty(item.id)}
            />
          )}
          ListHeaderComponent={
            total > 0 ? (
              <Text style={styles.resultCount}>
                {total.toLocaleString()} {total === 1 ? 'property' : 'properties'}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No properties found</Text>
                <Text style={styles.emptySubtitle}>
                  Try expanding your search area or adjusting filters
                </Text>
              </View>
            ) : (
              <ActivityIndicator
                size="large"
                color={palette.teal}
                style={styles.listLoader}
              />
            )
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* ══════════════════════════════════════════ */}
      {/*  Floating overlays                        */}
      {/* ══════════════════════════════════════════ */}

      {/* Autocomplete bar (always on top) */}
      <AutocompleteBar
        input={autocomplete.input}
        onChangeText={autocomplete.onChangeText}
        suggestions={autocomplete.suggestions}
        isLoading={autocomplete.isLoading}
        isOpen={autocomplete.isOpen}
        onSelect={handleAutocompleteSelect}
        onSubmit={handleSearchSubmit}
        onClear={autocomplete.clear}
        onFilterPress={() => setFilterVisible(true)}
        activeFilterCount={filterCount}
      />

      {/* Map/List toggle (below search bar, right-aligned) */}
      <View style={styles.togglePosition}>
        <ViewToggle mode={viewMode} onChange={handleViewModeChange} />
      </View>

      {/* My location button (map mode only) */}
      {viewMode === 'map' && (
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={requestLocation}
          activeOpacity={0.8}
        >
          <View style={styles.locationIcon}>
            <View style={styles.locationDot} />
            <View style={styles.locationRing} />
          </View>
        </TouchableOpacity>
      )}

      {/* Filter sheet */}
      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },

  // Toggle positioning
  togglePosition: {
    position: 'absolute',
    top: 110, // below search bar
    right: spacing.lg,
    zIndex: 50,
  },

  // List view
  listContent: {
    paddingTop: 130, // space for floating search bar
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  resultCount: {
    ...typography.labelMd,
    color: palette.gray500,
    marginBottom: spacing.md,
  },
  separator: { height: spacing.md },
  listLoader: { marginTop: spacing['4xl'] },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['4xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { ...typography.headingMd, color: palette.gray700 },
  emptySubtitle: {
    ...typography.bodyMd,
    color: palette.gray500,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // My location button
  locationBtn: {
    position: 'absolute',
    bottom: 24,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  locationIcon: { width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.teal,
  },
  locationRing: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: palette.teal,
    opacity: 0.4,
  },
});
