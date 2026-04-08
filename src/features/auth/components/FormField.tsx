import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  type TextInputProps,
} from 'react-native';
import { palette, spacing, radius, typography, layout } from '@/theme';

interface FormFieldProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  showError?: boolean;
  isPassword?: boolean;
  helperText?: string;
}

export function FormField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  showError,
  isPassword = false,
  helperText,
  ...inputProps
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const hasError = showError && !!error;

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
  }, [onBlur]);

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={[styles.label, hasError && styles.labelError]}>
        {label}
      </Text>

      {/* Input wrapper */}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          hasError && styles.inputError,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !passwordVisible}
          placeholderTextColor={palette.gray400}
          autoCorrect={false}
          {...inputProps}
        />

        {/* Password toggle */}
        {isPassword && value.length > 0 && (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.toggleBtn}
            hitSlop={12}
          >
            <Text style={styles.toggleText}>
              {passwordVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error or helper text */}
      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { ...typography.labelLg, color: palette.gray700, marginBottom: spacing.xs },
  labelError: { color: palette.danger },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.inputHeight,
    borderWidth: 1.5,
    borderColor: palette.gray300,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.white,
  },
  inputFocused: { borderColor: palette.teal },
  inputError: { borderColor: palette.danger, backgroundColor: '#FFF8F8' },
  input: {
    flex: 1,
    ...typography.bodyLg,
    lineHeight: 20,
    color: palette.gray800,
    paddingVertical: Platform.select({ ios: spacing.sm, android: 0 }),
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  toggleBtn: { paddingLeft: spacing.sm },
  toggleText: { ...typography.labelMd, color: palette.teal },
  errorText: { ...typography.bodySm, color: palette.danger, marginTop: spacing.xs },
  helperText: { ...typography.bodySm, color: palette.gray500, marginTop: spacing.xs },
});
