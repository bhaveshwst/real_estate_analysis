import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSavedProperties, useSavedListNames } from '../hooks/use-saved';
import { ScreenAppBar } from '@/components/ScreenAppBar';
import { palette, spacing, radius, typography, shadow } from '@/theme';
import type { SavedStackParamList, SavedProperty } from '@/types';

type Nav = NativeStackNavigationProp<SavedStackParamList, 'SavedList'>;

export function SavedListScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [activeList, setActiveList] = useState<string | undefined>();
  const { data: lists } = useSavedListNames();
  const { data, isLoading } = useSavedProperties(1, activeList);

  return (
    <View style={styles.container}>
      <ScreenAppBar backgroundColor={palette.gray50} />
      <Text style={[styles.title, { paddingTop: spacing.md }]}>
        Saved properties
      </Text>

      {/* List name pills */}
      {lists && lists.length > 0 && (
        <FlatList
          horizontal
          data={[undefined, ...lists]}
          keyExtractor={(item) => item ?? '__all'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pill, activeList === item && styles.pillActive]}
              onPress={() => setActiveList(item)}
            >
              <Text style={[styles.pillText, activeList === item && styles.pillTextActive]}>
                {item ?? 'All'}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing['3xl'] }]}
        renderItem={({ item }: { item: SavedProperty }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.propertyId })}
            activeOpacity={0.8}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardPrice}>
                  ${item.property.estimatedValue ? (item.property.estimatedValue / 1000).toFixed(0) + 'K' : '—'}
                </Text>
                <Text style={styles.cardAddress} numberOfLines={1}>{item.property.addressLine1}</Text>
                <Text style={styles.cardLocation}>{item.property.city}, {item.property.state}</Text>
              </View>
              {item.alertOnPriceChange && (
                <View style={styles.alertBadge}>
                  <Text style={styles.alertText}>Alert on</Text>
                </View>
              )}
            </View>
            {item.notes && <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.empty}>No saved properties yet. Search and save properties you're interested in.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  title: { ...typography.displaySm, color: palette.navy, paddingHorizontal: spacing.xl },
  pillsRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.sm },
  pill: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: palette.gray100 },
  pillActive: { backgroundColor: palette.teal },
  pillText: { ...typography.labelMd, color: palette.gray600 },
  pillTextActive: { color: palette.white },
  listContent: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: palette.white, borderRadius: radius.lg, padding: spacing.lg, ...shadow.sm },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1 },
  cardPrice: { ...typography.headingLg, color: palette.navy },
  cardAddress: { ...typography.bodyMd, color: palette.gray800, marginTop: spacing.xs },
  cardLocation: { ...typography.bodySm, color: palette.gray500, marginTop: 2 },
  alertBadge: { backgroundColor: palette.warningBg, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  alertText: { ...typography.labelSm, color: palette.warning },
  notes: { ...typography.bodySm, color: palette.gray500, marginTop: spacing.md, fontStyle: 'italic' },
  empty: { ...typography.bodyLg, color: palette.gray500, textAlign: 'center', paddingTop: spacing['3xl'], paddingHorizontal: spacing.xl },
});
