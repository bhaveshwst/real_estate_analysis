import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography, shadow } from '@/theme';
import type { PropertySummary } from '@/types';

interface PropertyListCardProps {
  property: PropertySummary;
  onPress: () => void;
  onLongPress?: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: palette.successBg, text: palette.success },
  pending: { bg: palette.warningBg, text: palette.warning },
  sold: { bg: palette.gray100, text: palette.gray500 },
  off_market: { bg: palette.gray100, text: palette.gray500 },
};

export const PropertyListCard = React.memo(function PropertyListCard({
  property,
  onPress,
  onLongPress,
}: PropertyListCardProps) {
  const statusColor = STATUS_COLORS[property.status] ?? STATUS_COLORS.active;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      {/* Price + status row */}
      <View style={styles.topRow}>
        <Text style={styles.price}>
          {property.estimatedValue
            ? `$${property.estimatedValue >= 1_000_000
                ? `${(property.estimatedValue / 1_000_000).toFixed(2)}M`
                : `${Math.round(property.estimatedValue / 1000)}K`}`
            : '—'}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {property.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Address */}
      <Text style={styles.address} numberOfLines={1}>
        {property.addressLine1}
      </Text>
      <Text style={styles.location}>
        {property.city}, {property.state} {property.zipCode}
      </Text>

      {/* Details row */}
      <View style={styles.detailsRow}>
        {property.bedrooms != null && (
          <View style={styles.detailChip}>
            <Text style={styles.detailValue}>{property.bedrooms}</Text>
            <Text style={styles.detailLabel}>bd</Text>
          </View>
        )}
        {property.bathrooms != null && (
          <View style={styles.detailChip}>
            <Text style={styles.detailValue}>{property.bathrooms}</Text>
            <Text style={styles.detailLabel}>ba</Text>
          </View>
        )}
        {property.squareFeet != null && (
          <View style={styles.detailChip}>
            <Text style={styles.detailValue}>{property.squareFeet.toLocaleString()}</Text>
            <Text style={styles.detailLabel}>sqft</Text>
          </View>
        )}
        {property.distanceMiles != null && (
          <View style={styles.detailChip}>
            <Text style={styles.detailValue}>{property.distanceMiles}</Text>
            <Text style={styles.detailLabel}>mi</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  price: { ...typography.headingLg, color: palette.navy },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusText: {
    ...typography.labelSm,
    textTransform: 'capitalize',
  },
  address: { ...typography.bodyLg, color: palette.gray800 },
  location: { ...typography.bodySm, color: palette.gray500, marginTop: 2 },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: palette.gray100,
  },
  detailChip: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  detailValue: { ...typography.labelLg, color: palette.gray700 },
  detailLabel: { ...typography.bodySm, color: palette.gray400 },
});
