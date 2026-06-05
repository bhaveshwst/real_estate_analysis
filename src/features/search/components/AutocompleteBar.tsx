import React, { useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  ActivityIndicator,
  Platform,
  type TextInput as TextInputType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppVersionBadge } from '@/components/AppVersionBadge';
import { palette, spacing, radius, typography, layout, shadow } from '@/theme';
import type { AutocompleteResult } from '@/types';

interface AutocompleteBarProps {
  input: string;
  onChangeText: (text: string) => void;
  suggestions: AutocompleteResult[];
  isLoading: boolean;
  isOpen: boolean;
  onSelect: (item: AutocompleteResult) => void;
  onSubmit: () => void;
  onClear: () => void;
  onFilterPress: () => void;
  activeFilterCount: number;
}

export function AutocompleteBar({
  input,
  onChangeText,
  suggestions,
  isLoading,
  isOpen,
  onSelect,
  onSubmit,
  onClear,
  onFilterPress,
  activeFilterCount,
}: AutocompleteBarProps) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInputType>(null);

  const handleSelect = useCallback(
    (item: AutocompleteResult) => {
      Keyboard.dismiss();
      onSelect(item);
    },
    [onSelect],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.chrome}>
        {/* ── Input row ── */}
        <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          {/* Search icon */}
          <View style={styles.searchIcon}>
            <View style={styles.searchCircle} />
            <View style={styles.searchHandle} />
          </View>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            placeholder="Address, city, or ZIP..."
            placeholderTextColor={palette.gray400}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="never"
          />

          {/* Loading / clear */}
          {isLoading ? (
            <ActivityIndicator size="small" color={palette.teal} style={styles.trailing} />
          ) : input.length > 0 ? (
            <TouchableOpacity onPress={onClear} style={styles.trailing} hitSlop={12}>
              <View style={styles.clearBtn}>
                <Text style={styles.clearX}>×</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter button */}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={onFilterPress}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <View style={styles.filterIcon}>
            <View style={[styles.filterLine, { width: 16 }]} />
            <View style={[styles.filterLine, { width: 12 }]} />
            <View style={[styles.filterLine, { width: 8 }]} />
          </View>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        </View>

        <View style={styles.versionRow}>
          <AppVersionBadge />
        </View>
      </View>

      {/* ── Autocomplete dropdown ── */}
      {isOpen && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.suggestionItem,
                  index === suggestions.length - 1 && styles.lastItem,
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.6}
              >
                <View style={styles.pinIcon}>
                  <View style={styles.pinDot} />
                  <View style={styles.pinStem} />
                </View>
                <View style={styles.suggestionText}>
                  <Text style={styles.mainText} numberOfLines={1}>
                    {item.mainText}
                  </Text>
                  <Text style={styles.secondaryText} numberOfLines={1}>
                    {item.secondaryText}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  chrome: {
    backgroundColor: palette.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray200,
    paddingBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.inputHeight,
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    ...shadow.md,
  },

  // Search icon (CSS-drawn magnifying glass)
  searchIcon: { width: 18, height: 18, marginRight: spacing.sm },
  searchCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: palette.gray400,
  },
  searchHandle: {
    width: 5,
    height: 1.5,
    backgroundColor: palette.gray400,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    bottom: 2,
    right: 2,
  },

  input: {
    flex: 1,
    ...typography.bodyLg,
    lineHeight: 20,
    color: palette.gray800,
    paddingVertical: Platform.select({ ios: spacing.sm, android: 0 }),
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  trailing: { paddingLeft: spacing.sm },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearX: { fontSize: 14, color: palette.gray600, lineHeight: 18, marginTop: -1 },

  // Filter button
  filterBtn: {
    width: layout.inputHeight,
    height: layout.inputHeight,
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.md,
  },
  filterIcon: { gap: 3, alignItems: 'center' },
  filterLine: {
    height: 2,
    backgroundColor: palette.gray600,
    borderRadius: 1,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: { ...typography.labelSm, color: palette.white, fontSize: 9 },

  // Dropdown
  dropdown: {
    marginHorizontal: spacing.lg,
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    maxHeight: 280,
    ...shadow.lg,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: palette.gray100,
  },
  lastItem: { borderBottomWidth: 0 },

  // Pin icon
  pinIcon: { width: 20, alignItems: 'center', marginRight: spacing.md },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.teal,
  },
  pinStem: {
    width: 2,
    height: 6,
    backgroundColor: palette.teal,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    marginTop: -1,
  },

  suggestionText: { flex: 1 },
  mainText: { ...typography.bodyLg, color: palette.gray800 },
  secondaryText: { ...typography.bodySm, color: palette.gray500, marginTop: 1 },
});
