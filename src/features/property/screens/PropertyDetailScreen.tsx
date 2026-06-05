import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { usePropertyDetail, usePropertyValuation } from '../hooks/use-property';
import { usePropertyAnalytics } from '@/features/analytics/hooks/use-analytics';
import {
  PropertyHero,
  ValuationCard,
  TransactionTimeline,
  TaxHistoryTable,
  SaveButton,
  LoadingState,
  ErrorState,
} from '../components';
import {
  AreaChart,
  BarChart,
  ComparablesTable,
  SectionHeader,
} from '@/features/analytics';
import { ANIMATION } from '@/shared/constants';
import { formatCurrency, formatAddress } from '@/shared/utils/format';
import { logger } from '@/shared/utils/logger';
import { AppVersionBadge } from '@/components/AppVersionBadge';
import { palette, spacing, radius, typography, shadow } from '@/theme';
import type { DashboardStackParamList } from '@/types';

// Typed route and navigation — no 'as never' casts needed
type DetailRoute = RouteProp<DashboardStackParamList, 'PropertyDetail'>;
type DetailNav = NativeStackNavigationProp<DashboardStackParamList, 'PropertyDetail'>;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function PropertyDetailScreen() {
  const { params } = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNav>();
  const insets = useSafeAreaInsets();

  const {
    data: property,
    isLoading: detailLoading,
    isError: detailError,
    refetch: refetchDetail,
  } = usePropertyDetail(params.propertyId);

  const { data: valuation } = usePropertyValuation(params.propertyId);

  const {
    comparables,
    transactions,
    transactionChart,
    taxHistory,
    taxChart,
  } = usePropertyAnalytics(params.propertyId);

  // Scroll-driven compact header
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const compactHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [ANIMATION.COMPACT_HEADER_START, ANIMATION.COMPACT_HEADER_END],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{
      translateY: interpolate(
        scrollY.value,
        [ANIMATION.COMPACT_HEADER_START, ANIMATION.COMPACT_HEADER_END],
        [-10, 0],
        Extrapolation.CLAMP,
      ),
    }],
  }));

  const handleShare = useCallback(async () => {
    if (!property) return;
    try {
      await Share.share({
        message: `Check out this property: ${formatAddress(property.addressLine1, property.city, property.state, property.zipCode)} — ${formatCurrency(property.estimatedValue)}`,
        url: `https://app.realestate.com/property/${property.id}`,
      });
    } catch (error: unknown) {
      // Share was cancelled by user — this is not an error worth reporting
      logger.debug('Share dismissed', { propertyId: property.id });
    }
  }, [property]);

  const handleCompPress = useCallback(
    (compId: string) => {
      navigation.push('PropertyDetail', { propertyId: compId });
    },
    [navigation],
  );

  if (detailLoading) return <LoadingState />;

  if (detailError || !property) {
    return (
      <ErrorState
        title="Property not found"
        message="This property may have been removed or the link is invalid."
        onRetry={refetchDetail}
        onBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.screen}>
      {/* Sticky compact header */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.navBtnText}>←</Text>
          </TouchableOpacity>
          <Animated.View style={[styles.compactTitle, compactHeaderStyle]}>
            <Text style={styles.compactPrice} numberOfLines={1}>
              {formatCurrency(property.estimatedValue, { compact: true })}
            </Text>
            <Text style={styles.compactAddress} numberOfLines={1}>{property.addressLine1}</Text>
          </Animated.View>
          <AppVersionBadge style={styles.navVersion} />
          <View style={styles.navActions}>
            <TouchableOpacity style={styles.navBtn} onPress={handleShare} hitSlop={12}>
              <Text style={styles.navBtnText}>↗</Text>
            </TouchableOpacity>
            <SaveButton propertyId={property.id} variant="icon" />
          </View>
        </View>
      </View>

      {/* Content */}
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + spacing['3xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PropertyHero property={property} />

        <View style={styles.savePillRow}>
          <SaveButton propertyId={property.id} variant="pill" />
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.7}>
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Valuation */}
        <View style={styles.section}>
          {valuation ? (
            <>
              <SectionHeader title="Valuation" subtitle="Automated market estimate" />
              <ValuationCard valuation={valuation} />
            </>
          ) : (
            <>
              <SectionHeader title="Valuation" />
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Computing valuation...</Text>
              </View>
            </>
          )}
        </View>

        {/* Price history */}
        {transactionChart && transactionChart.data.length >= 2 && (
          <View style={styles.section}>
            <SectionHeader title="Price history" subtitle={`${transactionChart.data.length} recorded sales`} />
            <View style={styles.chartCard}>
              <AreaChart series={transactionChart} height={200} showArea />
            </View>
          </View>
        )}

        {/* Comparables */}
        {comparables.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Comparables" subtitle={`${comparables.length} similar nearby sales`} />
            <ComparablesTable comparables={comparables} onPress={handleCompPress} />
          </View>
        )}

        {/* Tax history */}
        {taxHistory.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Tax history" />
            {taxChart && taxChart.data.length >= 2 && (
              <View style={[styles.chartCard, { marginBottom: spacing.md }]}>
                <BarChart series={taxChart} height={160} barWidth={32} />
              </View>
            )}
            <TaxHistoryTable rows={taxHistory} />
          </View>
        )}

        {/* Transactions */}
        {transactions.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Transactions" subtitle="Complete ownership history" />
            <TransactionTimeline transactions={transactions} />
          </View>
        )}

        {property.attomSyncedAt && (
          <Text style={styles.freshness}>
            Data last updated {new Date(property.attomSyncedAt).toLocaleDateString()}
          </Text>
        )}
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.gray50 },
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomWidth: 0.5, borderBottomColor: palette.gray200,
  },
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 56, paddingHorizontal: spacing.lg,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: palette.gray100, justifyContent: 'center', alignItems: 'center',
  },
  navBtnText: { fontSize: 18, color: palette.gray700, marginTop: -1 },
  compactTitle: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.md },
  compactPrice: { ...typography.labelLg, color: palette.navy },
  compactAddress: { ...typography.bodySm, color: palette.gray500 },
  navVersion: { marginRight: spacing.xs, alignSelf: 'center' },
  navActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  scrollContent: {},
  savePillRow: {
    flexDirection: 'row', gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: palette.white, borderBottomWidth: 0.5, borderBottomColor: palette.gray200,
  },
  shareBtn: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: palette.gray300,
  },
  shareBtnText: { ...typography.labelMd, color: palette.gray700 },
  section: { paddingHorizontal: spacing.xl },
  chartCard: {
    backgroundColor: palette.white, borderRadius: radius.lg,
    paddingVertical: spacing.md, ...shadow.sm,
  },
  placeholder: {
    backgroundColor: palette.white, borderRadius: radius.lg,
    padding: spacing['2xl'], alignItems: 'center', ...shadow.sm,
  },
  placeholderText: { ...typography.bodyMd, color: palette.gray500 },
  freshness: {
    ...typography.bodySm, color: palette.gray400,
    textAlign: 'center', marginTop: spacing['2xl'], paddingHorizontal: spacing.xl,
  },
});
