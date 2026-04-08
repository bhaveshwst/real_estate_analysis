import type { AppError } from '@/services/api/client';

/**
 * Safely extracts a displayable error message from unknown catch values.
 *
 * Usage:
 *   try { ... } catch (error) {
 *     const message = extractErrorMessage(error);
 *   }
 *
 * Handles: AppError (from our API client), Error instances,
 * string throws, and completely unknown values.
 */
export function extractErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (isAppError(error)) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}

/**
 * Type guard for our normalized API error shape.
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'status' in error
  );
}

/**
 * Type guard for network-level errors (no response from server).
 */
export function isNetworkError(error: unknown): boolean {
  if (isAppError(error)) return error.code === 'NETWORK_ERROR' || error.status === 0;
  return false;
}

/**
 * Type guard for timeout errors.
 */
export function isTimeoutError(error: unknown): boolean {
  if (isAppError(error)) return error.code === 'TIMEOUT';
  return false;
}
