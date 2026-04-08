import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { palette, spacing, radius, typography, shadow } from '@/theme';
import { formatCurrency } from '@/shared/utils/format';
import type { SavedProperty } from '@/types';

interface SavedPropertiesCarouselProps {
  items: SavedProperty[];
  isLoading: boolean;
  onPropertyPress: (propertyId: string) => void;
  onViewAll: () => void;
}

function SavedPreviewCard({
  item,
  onPress,
}: {
  item: SavedProperty;
  onPress: () => void;
}) {
  const p = item.property;

  return (
    <TouchableOpacity style={styles.previewCard} onPress={onPress} activeOpacity={0.8}>
      {/* Color accent for status */}
      <View style={[
        styles.statusStrip,
        { backgroundColor: p.status === 'active' ? palette.teal : palette.gray400 },
      ]} />

      <Text style={styles.cardPrice}>
        {formatCurrency(p.estimatedValue, { compact: true })}
      </Text>
      <Text style={styles.cardAddress} numberOfLines={1}>{p.addressLine1}</Text>
      <Text style={styles.cardLocation} numberOfLines={1}>
        {p.city}, {p.state}
      </Text>

      <View style={styles.cardStats}>
        {p.bedrooms != null && <Text style={styles.stat}>{p.bedrooms}bd</Text>}
        {p.bathrooms != null && <Text style={styles.stat}>{p.bathrooms}ba</Text>}
        {p.squareFeet != null && (
          <Text style={styles.stat}>{(p.squareFeet / 1000).toFixed(1)}K sqft</Text>
        )}
      </View>

      {item.alertOnPriceChange && (
        <View style={styles.alertDot} />
      )}
    </TouchableOpacity>
  );
}

export function SavedPropertiesCarousel({
  items,
  isLoading,
  onPropertyPress,
  onViewAll,
}: SavedPropertiesCarouselProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color={palette.teal} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No saved properties</Text>
        <Text style={styles.emptyText}>
          Search and save properties you're tracking.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carousel}
      snapToInterval={176 + spacing.md}
      decelerationRate="fast"
      renderItem={({ item }) => (
        <SavedPreviewCard
          item={item}
          onPress={() => onPropertyPress(item.propertyId)}
        />
      )}
      ListFooterComponent={
        items.length >= 3 ? (
          <TouchableOpacity style={styles.viewAllCard} onPress={onViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View all →</Text>
          </TouchableOpacity>
        ) : null
      }
    />
  );
}

const CARD_WIDTH = 176;

const styles = StyleSheet.create({
  carousel: { paddingLeft: spacing.xl, paddingRight: spacing.md },
  loadingRow: { height: 140, justifyContent: 'center', alignItems: 'center' },

  previewCard: {
    width: CARD_WIDTH,
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
    overflow: 'hidden',
    ...shadow.sm,
  },
  statusStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  cardPrice: { ...typography.headingMd, color: palette.navy, marginTop: spacing.xs },
  cardAddress: { ...typography.bodyMd, color: palette.gray700, marginTop: spacing.xs },
  cardLocation: { ...typography.bodySm, color: palette.gray500, marginTop: 1 },
  cardStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: palette.gray100,
  },
  stat: { ...typography.labelSm, color: palette.gray500 },
  alertDot: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.warning,
  },

  viewAllCard: {
    width: 100,
    backgroundColor: palette.gray50,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  viewAllText: { ...typography.labelMd, color: palette.teal },

  emptyCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadow.sm,
  },
  emptyTitle: { ...typography.labelLg, color: palette.gray600 },
  emptyText: { ...typography.bodySm, color: palette.gray400, textAlign: 'center', marginTop: spacing.xs },
});
