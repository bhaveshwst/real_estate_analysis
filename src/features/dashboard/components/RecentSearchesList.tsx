import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography } from '@/theme';
import type { RecentSearch } from '../hooks/use-dashboard';

interface RecentSearchesListProps {
  recents: RecentSearch[];
  onSelect: (query: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const TYPE_ICONS: Record<RecentSearch['type'], string> = {
  address: '⌂',
  zip: '#',
  city: '◎',
};

function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentSearchesList({
  recents,
  onSelect,
  onRemove,
  onClearAll,
}: RecentSearchesListProps) {
  if (recents.length === 0) return null;

  return (
    <View>
      <FlatList
        data={recents}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chip}
            onPress={() => onSelect(item.query)}
            onLongPress={() => onRemove(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipIcon}>{TYPE_ICONS[item.type]}</Text>
            <View style={styles.chipContent}>
              <Text style={styles.chipQuery} numberOfLines={1}>{item.query}</Text>
              <Text style={styles.chipTime}>{timeAgo(item.timestamp)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          recents.length > 2 ? (
            <TouchableOpacity style={styles.clearBtn} onPress={onClearAll}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingLeft: spacing.xl, paddingRight: spacing.md, gap: spacing.sm },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 0.5,
    borderColor: palette.gray200,
    maxWidth: 200,
  },
  chipIcon: {
    fontSize: 14,
    width: 22,
    height: 22,
    lineHeight: 22,
    textAlign: 'center',
    backgroundColor: palette.gray100,
    borderRadius: 11,
    color: palette.gray600,
    overflow: 'hidden',
  },
  chipContent: { flex: 1 },
  chipQuery: { ...typography.labelMd, color: palette.gray800 },
  chipTime: { ...typography.bodySm, color: palette.gray400, fontSize: 10, marginTop: 1 },

  clearBtn: {
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  clearText: { ...typography.labelSm, color: palette.danger },
});
