import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectFilters,
  selectActiveFilterCount,
  setBulkFilters,
  clearAllFilters,
} from '@/store/slices/search.slice';
import { palette, spacing, radius, typography, layout, shadow } from '@/theme';
import type { PropertyType, PropertyStatus } from '@/types';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
}

// ── Pill selector for discrete options ──
function PillGroup<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[];
  value: T | null;
  onChange: (v: T | null) => void;
  labels?: Record<T, string>;
}) {
  return (
    <View style={styles.pillRow}>
      {options.map((opt) => {
        const isActive = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onChange(isActive ? null : opt)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {labels?.[opt] ?? opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Number stepper for beds/baths ──
function StepperRow({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
}) {
  const options = useMemo(() => {
    const arr: (number | null)[] = [null]; // "Any"
    for (let i = min; i <= max; i++) arr.push(i);
    return arr;
  }, [min, max]);

  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepperScroll}>
        {options.map((opt) => {
          const isActive = value === opt;
          return (
            <TouchableOpacity
              key={String(opt)}
              style={[styles.stepperBtn, isActive && styles.stepperBtnActive]}
              onPress={() => onChange(opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepperBtnText, isActive && styles.stepperBtnTextActive]}>
                {opt === null ? 'Any' : `${opt}+`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── Price input ──
function PriceInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder: string;
}) {
  const display = value != null ? String(value) : '';

  return (
    <View style={styles.priceInputGroup}>
      <Text style={styles.priceLabel}>{label}</Text>
      <View style={styles.priceInputWrapper}>
        <Text style={styles.priceDollar}>$</Text>
        <TextInput
          style={styles.priceInput}
          value={display}
          onChangeText={(text) => {
            const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
            onChange(isNaN(num) ? null : num);
          }}
          placeholder={placeholder}
          placeholderTextColor={palette.gray400}
          keyboardType="number-pad"
        />
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════
//  Main FilterSheet component
// ═══════════════════════════════════════════

const PROPERTY_TYPES: PropertyType[] = [
  'single_family', 'condo', 'townhouse', 'multi_family', 'land',
];

const TYPE_LABELS: Record<PropertyType, string> = {
  single_family: 'House',
  condo: 'Condo',
  townhouse: 'Townhouse',
  multi_family: 'Multi-family',
  land: 'Land',
  commercial: 'Commercial',
};

const STATUS_OPTIONS: PropertyStatus[] = ['active', 'pending', 'sold'];

export function FilterSheet({ visible, onClose }: FilterSheetProps) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const currentFilters = useAppSelector(selectFilters);
  const filterCount = useAppSelector(selectActiveFilterCount);

  // Local draft state — only committed to Redux on "Apply"
  const [draft, setDraft] = useState(currentFilters);

  // Reset draft when sheet opens
  React.useEffect(() => {
    if (visible) setDraft(currentFilters);
  }, [visible, currentFilters]);

  const updateDraft = useCallback(
    <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleApply = useCallback(() => {
    dispatch(setBulkFilters(draft));
    onClose();
  }, [draft, dispatch, onClose]);

  const handleReset = useCallback(() => {
    dispatch(clearAllFilters());
    onClose();
  }, [dispatch, onClose]);

  const draftCount = Object.values(draft).filter((v) => v !== null).length;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Header */}
        <View style={styles.sheetHeader}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>Filters</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sheetDivider} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
          {/* Property type */}
          <Text style={styles.sectionTitle}>Property type</Text>
          <PillGroup
            options={PROPERTY_TYPES}
            value={draft.propertyType}
            onChange={(v) => updateDraft('propertyType', v)}
            labels={TYPE_LABELS}
          />

          {/* Status */}
          <Text style={styles.sectionTitle}>Status</Text>
          <PillGroup
            options={STATUS_OPTIONS}
            value={draft.status}
            onChange={(v) => updateDraft('status', v)}
          />

          {/* Price range */}
          <Text style={styles.sectionTitle}>Price range</Text>
          <View style={styles.priceRow}>
            <PriceInput
              label="Min"
              value={draft.minPrice}
              onChange={(v) => updateDraft('minPrice', v)}
              placeholder="No min"
            />
            <Text style={styles.priceDash}>—</Text>
            <PriceInput
              label="Max"
              value={draft.maxPrice}
              onChange={(v) => updateDraft('maxPrice', v)}
              placeholder="No max"
            />
          </View>

          {/* Beds */}
          <Text style={styles.sectionTitle}>Bedrooms</Text>
          <StepperRow
            label="Min beds"
            value={draft.minBedrooms}
            onChange={(v) => updateDraft('minBedrooms', v)}
            max={6}
          />

          {/* Baths */}
          <Text style={styles.sectionTitle}>Bathrooms</Text>
          <StepperRow
            label="Min baths"
            value={draft.minBathrooms}
            onChange={(v) => updateDraft('minBathrooms', v)}
            max={5}
          />

          {/* Square footage */}
          <Text style={styles.sectionTitle}>Square footage</Text>
          <View style={styles.priceRow}>
            <PriceInput
              label="Min sqft"
              value={draft.minSqFt}
              onChange={(v) => updateDraft('minSqFt', v)}
              placeholder="No min"
            />
            <Text style={styles.priceDash}>—</Text>
            <PriceInput
              label="Max sqft"
              value={draft.maxSqFt}
              onChange={(v) => updateDraft('maxSqFt', v)}
              placeholder="No max"
            />
          </View>

          {/* Year built */}
          <Text style={styles.sectionTitle}>Year built</Text>
          <PriceInput
            label="Built after"
            value={draft.minYearBuilt}
            onChange={(v) => updateDraft('minYearBuilt', v)}
            placeholder="Any year"
          />
        </ScrollView>

        {/* Apply button */}
        <View style={styles.applyRow}>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
            <Text style={styles.applyText}>
              Show results{draftCount > 0 ? ` (${draftCount} filters)` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    ...shadow.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sheetTitle: { ...typography.headingMd, color: palette.navy },
  resetText: { ...typography.labelLg, color: palette.danger },
  closeText: { ...typography.labelLg, color: palette.gray500 },
  sheetDivider: { height: 0.5, backgroundColor: palette.gray200 },
  sheetContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },

  sectionTitle: { ...typography.labelLg, color: palette.navy, marginTop: spacing.xl, marginBottom: spacing.md },

  // Pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: palette.gray100,
    borderWidth: 1,
    borderColor: palette.gray100,
  },
  pillActive: { backgroundColor: palette.tealLight, borderColor: palette.teal },
  pillText: { ...typography.labelMd, color: palette.gray600, textTransform: 'capitalize' },
  pillTextActive: { color: palette.teal },

  // Stepper
  stepperRow: { gap: spacing.sm },
  stepperLabel: { ...typography.bodySm, color: palette.gray500 },
  stepperScroll: { gap: spacing.sm },
  stepperBtn: {
    width: 48,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: palette.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.gray100,
  },
  stepperBtnActive: { backgroundColor: palette.tealLight, borderColor: palette.teal },
  stepperBtnText: { ...typography.labelMd, color: palette.gray600 },
  stepperBtnTextActive: { color: palette.teal },

  // Price inputs
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  priceDash: { ...typography.bodyLg, color: palette.gray400, paddingBottom: spacing.md },
  priceInputGroup: { flex: 1, gap: spacing.xs },
  priceLabel: { ...typography.labelSm, color: palette.gray500 },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderColor: palette.gray300,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  priceDollar: { ...typography.bodyLg, color: palette.gray400, marginRight: spacing.xs },
  priceInput: {
    flex: 1,
    ...typography.bodyLg,
    lineHeight: 20,
    color: palette.gray800,
    paddingVertical: Platform.select({ ios: spacing.sm, android: 0 }),
    textAlignVertical: 'center',
    includeFontPadding: false,
  },

  // Apply
  applyRow: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  applyBtn: {
    height: layout.buttonHeight,
    backgroundColor: palette.teal,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: { ...typography.labelLg, color: palette.white },
});
