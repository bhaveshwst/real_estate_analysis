import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useIsSaved } from '../hooks/use-property';
import { useSaveProperty } from '@/features/saved/hooks/use-saved';
import { palette, spacing, radius, typography } from '@/theme';

interface SaveButtonProps {
  propertyId: string;
  variant?: 'icon' | 'pill';
}

export function SaveButton({ propertyId, variant = 'pill' }: SaveButtonProps) {
  const { data: isSaved, isLoading: checking } = useIsSaved(propertyId);
  const saveProperty = useSaveProperty();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    if (checking) return;

    if (isSaved) {
      Alert.alert('Saved', 'This property is already in your saved list.');
      return;
    }

    // Bounce animation
    scale.value = withSequence(
      withSpring(1.2, { damping: 6 }),
      withSpring(1, { damping: 8 }),
    );

    saveProperty.mutate(
      { propertyId },
      {
        onError: () => {
          Alert.alert('Error', 'Could not save property. Please try again.');
        },
      },
    );
  }, [isSaved, checking, propertyId, saveProperty, scale]);

  if (variant === 'icon') {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[styles.iconBtn, isSaved && styles.iconBtnSaved]}
          onPress={handlePress}
          activeOpacity={0.7}
          hitSlop={12}
        >
          <Text style={styles.heartIcon}>{isSaved ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.pillBtn, isSaved && styles.pillBtnSaved]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.heartSmall}>{isSaved ? '♥' : '♡'}</Text>
        <Text style={[styles.pillText, isSaved && styles.pillTextSaved]}>
          {saveProperty.isPending ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Icon variant
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBtnSaved: { backgroundColor: palette.dangerBg },
  heartIcon: { fontSize: 20, color: palette.danger, marginTop: -1 },

  // Pill variant
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.gray300,
    backgroundColor: palette.white,
  },
  pillBtnSaved: {
    borderColor: palette.danger,
    backgroundColor: palette.dangerBg,
  },
  heartSmall: { fontSize: 16, color: palette.danger, marginTop: -1 },
  pillText: { ...typography.labelMd, color: palette.gray700 },
  pillTextSaved: { color: palette.danger },
});
