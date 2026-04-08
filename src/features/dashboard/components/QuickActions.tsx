import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { palette, spacing, radius, typography, shadow } from '@/theme';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  bgColor: string;
}

interface QuickActionsProps {
  onAction: (actionId: string) => void;
}

const ACTIONS: QuickAction[] = [
  { id: 'search', icon: '⌕', label: 'Search area', sublabel: 'Explore the map', color: palette.teal, bgColor: palette.tealLight },
  { id: 'analytics', icon: '◈', label: 'Market data', sublabel: 'Trends & stats', color: palette.info, bgColor: palette.infoBg },
  { id: 'saved', icon: '♥', label: 'Saved list', sublabel: 'Your properties', color: palette.danger, bgColor: palette.dangerBg },
  { id: 'alerts', icon: '⚡', label: 'Price alerts', sublabel: 'Get notified', color: palette.warning, bgColor: palette.warningBg },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <View style={styles.grid}>
      {ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.card}
          onPress={() => onAction(action.id)}
          activeOpacity={0.75}
        >
          <View style={[styles.iconCircle, { backgroundColor: action.bgColor }]}>
            <Text style={[styles.icon, { color: action.color }]}>{action.icon}</Text>
          </View>
          <Text style={styles.label}>{action.label}</Text>
          <Text style={styles.sublabel}>{action.sublabel}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '47%',
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: { fontSize: 18 },
  label: { ...typography.labelLg, color: palette.navy },
  sublabel: { ...typography.bodySm, color: palette.gray500, marginTop: 2 },
});
