/**
 * Application-wide constants.
 *
 * Rule: if a value appears in more than one file, or if changing
 * it would require searching the codebase, it belongs here.
 */

// ── Timing (milliseconds) ──
export const DEBOUNCE = {
  AUTOCOMPLETE_MS: 350,
  MAP_REGION_MS: 600,
  SEARCH_SUBMIT_MS: 100,
} as const;

// ── Cache TTL (milliseconds, used by React Query) ──
export const CACHE_TTL = {
  SEARCH_RESULTS: 3 * 60 * 1000,       // 3 min
  PROPERTY_DETAIL: 60 * 60 * 1000,      // 1 hour
  PROPERTY_VALUATION: 6 * 60 * 60 * 1000, // 6 hours
  MARKET_SNAPSHOT: 4 * 60 * 60 * 1000,  // 4 hours
  AUTOCOMPLETE: 24 * 60 * 60 * 1000,    // 24 hours
  IS_SAVED: 30 * 1000,                   // 30 seconds
  SAVED_PREVIEW: 60 * 1000,              // 1 min
  GC_TIME: 30 * 60 * 1000,              // 30 min
} as const;

// ── Pagination ──
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAP_MARKER_LIMIT: 100,
  SAVED_PREVIEW_COUNT: 5,
  RECENT_SEARCH_MAX: 8,
  INFINITE_SCROLL_THRESHOLD: 0.4,
} as const;

// ── Map defaults ──
export const MAP_DEFAULTS = {
  // Austin, TX — used when location permission is denied
  LATITUDE: 30.2672,
  LONGITUDE: -97.7431,
  LATITUDE_DELTA: 0.08,
  LONGITUDE_DELTA: 0.08,
  FOCUSED_DELTA: 0.04,
  RADIUS_MILES: 5,
} as const;

// ── User's default market context ──
// In production, derive from user profile or last-known location
export const USER_DEFAULTS = {
  ZIP_CODE: '78701',
  CITY: 'Austin',
  STATE: 'TX',
} as const;

// ── Animation ──
export const ANIMATION = {
  COMPACT_HEADER_START: 140,
  COMPACT_HEADER_END: 200,
  SAVE_BOUNCE_DAMPING: 6,
  SAVE_SETTLE_DAMPING: 8,
  SAVE_BOUNCE_SCALE: 1.2,
} as const;

// ── Validation ──
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 72, // bcrypt limit
  MIN_AUTOCOMPLETE_CHARS: 2,
  MAX_EMAIL_LENGTH: 255,
  MAX_NAME_LENGTH: 100,
} as const;

// ── API retry ──
export const RETRY = {
  DEFAULT_COUNT: 2,
  MUTATION_COUNT: 1,
  MAX_DELAY_MS: 10000,
  BASE_DELAY_MS: 1000,
} as const;

// ── Logger ──
export const LOGGER = {
  FLUSH_INTERVAL_MS: 30000,
  SENSITIVE_FIELDS: [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
  ],
} as const;

// ── Storage keys ──
export const STORAGE_KEYS = {
  AUTH_ID: 'auth-storage',
  DASHBOARD_ID: 'dashboard-storage',
  ACCESS_TOKEN: 'auth.accessToken',
  REFRESH_TOKEN: 'auth.refreshToken',
  USER_PROFILE: 'auth.userProfile',
  RECENT_SEARCHES: 'recent_searches',
} as const;
