import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '@/store';
import { selectSearchState } from '@/store/slices/search.slice';
import { useInfinitePropertySearch, usePrefetchProperty } from '../hooks/use-search';
import { PropertyListCard } from '../components';
import { palette, spacing, typography } from '@/theme';
import type { SearchStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<SearchStackParamList, 'SearchResults'>;

export function SearchResultsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { query } = useAppSelector(selectSearchState);
  const prefetch = usePrefetchProperty();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfinitePropertySearch();

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerQuery} numberOfLines={1}>
            {query || 'Search results'}
          </Text>
          {total > 0 && (
            <Text style={styles.headerCount}>
              {total.toLocaleString()} results
            </Text>
          )}
        </View>
        <View style={{ width: 50 }} />
      </View>

      {/* Results */}
      <FlatList
        data={allItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PropertyListCard
            property={item}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
            onLongPress={() => prefetch(item.id)}
          />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              size="small"
              color={palette.teal}
              style={styles.footer}
            />
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              size="large"
              color={palette.teal}
              style={styles.loader}
            />
          ) : isError ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Something went wrong</Text>
              <TouchableOpacity onPress={() => refetch()}>
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No properties found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or adjust your filters
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: palette.white,
    borderBottomWidth: 0.5,
    borderBottomColor: palette.gray200,
  },
  backText: { ...typography.labelLg, color: palette.teal, width: 50 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerQuery: { ...typography.labelLg, color: palette.navy },
  headerCount: { ...typography.bodySm, color: palette.gray500, marginTop: 1 },
  listContent: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  separator: { height: spacing.md },
  footer: { paddingVertical: spacing.xl },
  loader: { marginTop: spacing['4xl'] },
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
  retryText: {
    ...typography.labelLg,
    color: palette.teal,
    marginTop: spacing.md,
  },
});
