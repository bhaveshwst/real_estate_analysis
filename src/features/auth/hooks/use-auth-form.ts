import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';

// ═══════════════════════════════════════════
//  Validation schemas
// ═══════════════════════════════════════════

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name is too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

// ═══════════════════════════════════════════
//  Generic form hook
// ═══════════════════════════════════════════

type FieldErrors<T> = Partial<Record<keyof T, string>>;

interface UseFormReturn<T extends Record<string, string>> {
  values: T;
  errors: FieldErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  setValue: (field: keyof T, value: string) => void;
  setTouched: (field: keyof T) => void;
  validate: () => T | null;
  reset: () => void;
  getFieldProps: (field: keyof T) => {
    value: string;
    onChangeText: (text: string) => void;
    onBlur: () => void;
    error: string | undefined;
    showError: boolean;
  };
}

export function useAuthForm<T extends Record<string, string>>(
  schema: z.ZodType<any>,
  initialValues: T,
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Validate all fields
  const errors = useMemo<FieldErrors<T>>(() => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const fieldErrors: FieldErrors<T> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof T;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return fieldErrors;
  }, [values, schema]);

  const isValid = Object.keys(errors).length === 0;

  const setValue = useCallback((field: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setTouched = useCallback((field: keyof T) => {
    setTouchedState((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback((): T | null => {
    setHasSubmitted(true);
    const result = schema.safeParse(values);
    if (result.success) return result.data;
    // Touch all fields to show errors
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>,
    );
    setTouchedState(allTouched);
    return null;
  }, [values, schema]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setTouchedState({});
    setHasSubmitted(false);
  }, [initialValues]);

  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: values[field],
      onChangeText: (text: string) => setValue(field, text),
      onBlur: () => setTouched(field),
      error: errors[field],
      showError: !!(errors[field] && (touched[field] || hasSubmitted)),
    }),
    [values, errors, touched, hasSubmitted, setValue, setTouched],
  );

  return { values, errors, touched, isValid, setValue, setTouched, validate, reset, getFieldProps };
}
