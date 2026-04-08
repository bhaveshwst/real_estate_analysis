import React, { useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet, StatusBar, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/store';
import { setQuery } from '@/store/slices/search.slice';
import { selectUser } from '@/store/slices/auth.slice';
import {
  useGreeting,
  useMarketSnapshot,
  useDashboardSaved,
  useRecentSearches,
} from '../hooks/use-dashboard';
import { useRefreshOnFocus } from '@/shared/hooks';
import {
  MarketSnapshotCard,
  SavedPropertiesCarousel,
  RecentSearchesList,
  QuickActions,
  SectionTitle,
} from '../components';
import { USER_DEFAULTS } from '@/shared/constants';
import { palette, spacing, typography } from '@/theme';
import type { DashboardScreenProps } from '@/types';

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const greeting = useGreeting();

  const {
    metrics,
    sparkline,
    isFetching: marketFetching,
    refetch: refetchMarket,
  } = useMarketSnapshot(USER_DEFAULTS.ZIP_CODE);

  const {
    data: savedData,
    isLoading: savedLoading,
    refetch: refetchSaved,
  } = useDashboardSaved();

  const { recents, addRecent, removeRecent, clearAll } = useRecentSearches();
  useRefreshOnFocus(refetchSaved);

  const handleRefresh = useCallback(() => {
    refetchMarket();
    refetchSaved();
  }, [refetchMarket, refetchSaved]);

  // Typed cross-tab navigation — no 'as any' needed
  const handleRecentSelect = useCallback(
    (query: string) => {
      dispatch(setQuery(query));
      navigation.navigate('SearchTab', { screen: 'SearchResults' });
    },
    [dispatch, navigation],
  );

  const handleQuickAction = useCallback(
    (actionId: string) => {
      switch (actionId) {
        case 'search':
          navigation.navigate('SearchTab', { screen: 'Search' });
          break;
        case 'analytics':
          navigation.navigate('MarketAnalytics', { zipCode: USER_DEFAULTS.ZIP_CODE });
          break;
        case 'saved':
        case 'alerts':
          navigation.navigate('SavedTab', { screen: 'SavedList' });
          break;
      }
    },
    [navigation],
  );

  const handlePropertyPress = useCallback(
    (propertyId: string) => {
      navigation.navigate('PropertyDetail', { propertyId });
    },
    [navigation],
  );

  const handleViewAllSaved = useCallback(() => {
    navigation.navigate('SavedTab', { screen: 'SavedList' });
  }, [navigation]);

  const handleViewMarket = useCallback(() => {
    navigation.navigate('MarketAnalytics', { zipCode: USER_DEFAULTS.ZIP_CODE });
  }, [navigation]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing['3xl'] },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={marketFetching || savedLoading}
          onRefresh={handleRefresh}
          tintColor={palette.teal}
          progressViewOffset={insets.top}
        />
      }
    >
      <StatusBar barStyle="dark-content" />

      {/* Greeting */}
      <View style={styles.headerSection}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subtitle}>Your real estate analytics at a glance</Text>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
        </View>
      </View>

      {/* Market snapshot */}
      <View style={styles.padded}>
        <MarketSnapshotCard
          zipCode={USER_DEFAULTS.ZIP_CODE}
          metrics={metrics}
          sparkline={sparkline}
          onViewFull={handleViewMarket}
        />
      </View>

      {/* Recent searches */}
      {recents.length > 0 && (
        <>
          <SectionTitle title="Recent searches" actionLabel="Clear all" onAction={clearAll} />
          <RecentSearchesList
            recents={recents}
            onSelect={handleRecentSelect}
            onRemove={removeRecent}
            onClearAll={clearAll}
          />
        </>
      )}

      {/* Saved properties */}
      <SectionTitle
        title="Saved properties"
        actionLabel={savedData?.items?.length ? 'View all' : undefined}
        onAction={handleViewAllSaved}
      />
      <SavedPropertiesCarousel
        items={savedData?.items ?? []}
        isLoading={savedLoading}
        onPropertyPress={handlePropertyPress}
        onViewAll={handleViewAllSaved}
      />

      {/* Quick actions */}
      <SectionTitle title="Quick actions" />
      <QuickActions onAction={handleQuickAction} />

      <Text style={styles.attribution}>
        Market data powered by ATTOM · Updated every 4 hours
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  content: {},
  padded: { paddingHorizontal: spacing.xl },
  headerSection: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl, position: 'relative' },
  greeting: { ...typography.displaySm, color: palette.navy },
  subtitle: { ...typography.bodyMd, color: palette.gray500, marginTop: spacing.xs },
  avatarRow: { position: 'absolute', right: spacing.xl, top: 0 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: palette.tealLight, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { ...typography.labelLg, color: palette.teal },
  attribution: {
    ...typography.bodySm, color: palette.gray400,
    textAlign: 'center', marginTop: spacing['3xl'], paddingHorizontal: spacing.xl,
  },
});
