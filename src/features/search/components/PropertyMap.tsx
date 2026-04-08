import React, { useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, {
  Marker,
  Callout,
  PROVIDER_GOOGLE,
  type Region,
} from 'react-native-maps';
import { palette, spacing, radius, typography } from '@/theme';
import type { PropertySummary } from '@/types';

interface PropertyMapProps {
  region: Region;
  properties: PropertySummary[];
  isLoading: boolean;
  onRegionChangeComplete: (region: Region) => void;
  onMarkerPress: (property: PropertySummary) => void;
  onCalloutPress: (propertyId: string) => void;
}

// Custom map styling — muted palette so pins stand out
const MAP_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', stylers: [{ color: '#d4e4f1' }] },
  { featureType: 'landscape', stylers: [{ color: '#f0f0ec' }] },
  { featureType: 'road.highway', stylers: [{ color: '#e0ddd8' }] },
  { featureType: 'road.local', stylers: [{ color: '#ffffff' }] },
];

function formatPinPrice(value: number | null): string {
  if (!value) return '?';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return `${Math.round(value / 1000)}K`;
}

export const PropertyMap = React.memo(function PropertyMap({
  region,
  properties,
  isLoading,
  onRegionChangeComplete,
  onMarkerPress,
  onCalloutPress,
}: PropertyMapProps) {
  const mapRef = useRef<MapView>(null);

  const handleRegionChange = useCallback(
    (newRegion: Region) => {
      onRegionChangeComplete(newRegion);
    },
    [onRegionChangeComplete],
  );

  // Memoize markers to prevent re-renders when map pans
  const markers = useMemo(
    () =>
      properties.slice(0, 100).map((p) => (
        <Marker
          key={p.id}
          identifier={p.id}
          coordinate={{ latitude: p.latitude, longitude: p.longitude }}
          onPress={() => onMarkerPress(p)}
          tracksViewChanges={false}
        >
          {/* Custom price pill marker */}
          <View
            style={[
              styles.markerPill,
              p.status === 'sold' ? styles.markerSold : styles.markerActive,
            ]}
          >
            <Text
              style={[
                styles.markerText,
                p.status === 'sold' ? styles.markerTextSold : styles.markerTextActive,
              ]}
            >
              ${formatPinPrice(p.estimatedValue)}
            </Text>
          </View>
          <View style={styles.markerArrow} />

          {/* Callout on tap */}
          <Callout
            tooltip
            onPress={() => onCalloutPress(p.id)}
          >
            <View style={styles.callout}>
              <Text style={styles.calloutPrice}>
                ${p.estimatedValue?.toLocaleString() ?? '—'}
              </Text>
              <Text style={styles.calloutAddress} numberOfLines={1}>
                {p.addressLine1}
              </Text>
              <Text style={styles.calloutDetails}>
                {[
                  p.bedrooms != null ? `${p.bedrooms}bd` : null,
                  p.bathrooms != null ? `${p.bathrooms}ba` : null,
                  p.squareFeet != null ? `${p.squareFeet.toLocaleString()}sqft` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              <Text style={styles.calloutCta}>Tap for details →</Text>
            </View>
          </Callout>
        </Marker>
      )),
    [properties, onMarkerPress, onCalloutPress],
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}
        customMapStyle={MAP_STYLE}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={false}
        pitchEnabled={false}
        loadingEnabled
        loadingIndicatorColor={palette.teal}
        moveOnMarkerPress={false}
      >
        {markers}
      </MapView>

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingPill}>
          <Text style={styles.loadingText}>Searching area...</Text>
        </View>
      )}

      {/* Result count pill */}
      {!isLoading && properties.length > 0 && (
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {properties.length >= 100
              ? '100+ properties'
              : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // Marker
  markerPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: 44,
    alignItems: 'center',
  },
  markerActive: { backgroundColor: palette.white, borderColor: palette.teal },
  markerSold: { backgroundColor: palette.gray100, borderColor: palette.gray400 },
  markerText: { fontSize: 11, fontWeight: '700' },
  markerTextActive: { color: palette.teal },
  markerTextSold: { color: palette.gray500 },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: palette.teal,
    alignSelf: 'center',
    marginTop: -1,
  },

  // Callout
  callout: {
    width: 220,
    backgroundColor: palette.white,
    borderRadius: radius.md,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: palette.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  calloutPrice: { ...typography.headingMd, color: palette.navy },
  calloutAddress: { ...typography.bodyMd, color: palette.gray700, marginTop: 2 },
  calloutDetails: { ...typography.bodySm, color: palette.gray500, marginTop: 4 },
  calloutCta: { ...typography.labelSm, color: palette.teal, marginTop: spacing.sm },

  // Overlay pills
  loadingPill: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: palette.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    ...Platform.select({
      ios: { shadowColor: palette.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  loadingText: { ...typography.labelMd, color: palette.gray600 },

  countPill: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: palette.navy,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  countText: { ...typography.labelMd, color: palette.white },
});
