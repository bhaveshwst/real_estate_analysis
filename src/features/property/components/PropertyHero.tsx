import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography } from '@/theme';
import type { PropertyDetail } from '@/types';
import { formatCurrency, formatNumber } from '@/shared/utils/format';

interface PropertyHeroProps {
  property: PropertyDetail;
}

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: '#E1F5EE', text: '#0F6E56', label: 'Active' },
  pending: { bg: '#FAEEDA', text: '#BA7517', label: 'Pending' },
  sold: { bg: '#F1F3F5', text: '#6C757D', label: 'Sold' },
  off_market: { bg: '#F1F3F5', text: '#6C757D', label: 'Off market' },
};

const TYPE_LABELS: Record<string, string> = {
  single_family: 'Single family',
  condo: 'Condo',
  townhouse: 'Townhouse',
  multi_family: 'Multi-family',
  land: 'Land',
  commercial: 'Commercial',
};

export function PropertyHero({ property }: PropertyHeroProps) {
  const status = STATUS_MAP[property.status] ?? STATUS_MAP.active;
  const stats = buildStats(property);

  return (
    <View style={styles.container}>
      {/* Status + type badges */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: palette.infoBg }]}>
          <Text style={[styles.badgeText, { color: palette.info }]}>
            {TYPE_LABELS[property.propertyType] ?? property.propertyType}
          </Text>
        </View>
      </View>

      {/* Price */}
      <Text style={styles.price}>
        {formatCurrency(property.estimatedValue)}
      </Text>

      {/* Price per sqft */}
      {property.pricePerSqFt != null && (
        <Text style={styles.pricePsf}>
          ${property.pricePerSqFt}/sqft
        </Text>
      )}

      {/* Address */}
      <Text style={styles.address}>{property.addressLine1}</Text>
      {property.addressLine2 && (
        <Text style={styles.addressLine2}>{property.addressLine2}</Text>
      )}
      <Text style={styles.location}>
        {property.city}, {property.state} {property.zipCode}
        {property.county ? ` · ${property.county} County` : ''}
      </Text>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

interface StatItem {
  label: string;
  value: string;
}

function buildStats(p: PropertyDetail): StatItem[] {
  const stats: StatItem[] = [];

  if (p.bedrooms != null) stats.push({ label: 'Beds', value: String(p.bedrooms) });
  if (p.bathrooms != null) stats.push({ label: 'Baths', value: String(p.bathrooms) });
  if (p.squareFeet != null) stats.push({ label: 'Sq ft', value: formatNumber(p.squareFeet) });
  if (p.yearBuilt != null) stats.push({ label: 'Built', value: String(p.yearBuilt) });
  if (p.lotSizeAcres != null) stats.push({ label: 'Lot', value: `${p.lotSizeAcres} ac` });
  if (p.stories != null) stats.push({ label: 'Stories', value: String(p.stories) });
  if (p.garageSpaces != null && p.garageSpaces > 0) stats.push({ label: 'Garage', value: `${p.garageSpaces} car` });
  if (p.hasPool) stats.push({ label: 'Pool', value: 'Yes' });

  return stats.slice(0, 8); // Max 8 to fit 2 rows of 4
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: palette.white,
  },

  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.labelSm, fontWeight: '600' },

  price: { ...typography.displayLg, color: palette.navy, letterSpacing: -0.5 },
  pricePsf: {
    ...typography.labelMd,
    color: palette.gray500,
    marginTop: 2,
  },

  address: {
    ...typography.headingMd,
    color: palette.gray800,
    marginTop: spacing.lg,
  },
  addressLine2: { ...typography.bodyMd, color: palette.gray600, marginTop: 2 },
  location: {
    ...typography.bodyMd,
    color: palette.gray500,
    marginTop: 4,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
    borderTopWidth: 0.5,
    borderTopColor: palette.gray200,
    paddingTop: spacing.lg,
  },
  statItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statValue: { ...typography.headingMd, color: palette.navy },
  statLabel: { ...typography.labelSm, color: palette.gray500, marginTop: 2 },
});
