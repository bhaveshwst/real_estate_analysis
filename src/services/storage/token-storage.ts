import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/shared/constants';

/**
 * Synchronous encrypted token storage via MMKV.
 *
 * Architecture decision: MMKV over AsyncStorage/SecureStore because
 * the Axios request interceptor needs synchronous token access.
 * See services/api/client.ts interceptor for the race condition
 * this prevents.
 *
 * Security: MMKV encrypts at rest using AES. The encryption key
 * should be derived from a device-unique value in production
 * (e.g. via expo-secure-store for the key itself).
 */
// Expo Go does not support `react-native-mmkv`, so we fall back to SecureStore.
// To avoid race conditions with the Axios interceptor, we keep a synchronous in-memory cache
// that gets hydrated once during app startup.
type SyncStorage = {
  getString: (key: string) => string | null;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

let storage: SyncStorage | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mmkvModule = require('react-native-mmkv') as typeof import('react-native-mmkv');
  storage = new mmkvModule.MMKV({
    id: STORAGE_KEYS.AUTH_ID,
    encryptionKey: 're-analytics-v1',
  }) as unknown as SyncStorage;
} catch {
  // Intentionally ignore. SecureStore fallback will be used.
}

let accessTokenCache: string | null = null;
let refreshTokenCache: string | null = null;
let userProfileCacheRaw: string | null = null;
let hydrated = false;

export const tokenStorage = {
  async hydrate(): Promise<void> {
    if (hydrated) return;

    if (storage) {
      accessTokenCache = storage.getString(STORAGE_KEYS.ACCESS_TOKEN) ?? null;
      refreshTokenCache = storage.getString(STORAGE_KEYS.REFRESH_TOKEN) ?? null;
      userProfileCacheRaw = storage.getString(STORAGE_KEYS.USER_PROFILE) ?? null;
      hydrated = true;
      return;
    }

    accessTokenCache = (await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN)) ?? null;
    refreshTokenCache = (await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN)) ?? null;
    userProfileCacheRaw = (await SecureStore.getItemAsync(STORAGE_KEYS.USER_PROFILE)) ?? null;
    hydrated = true;
  },

  getAccessToken(): string | null {
    return accessTokenCache;
  },

  getRefreshToken(): string | null {
    return refreshTokenCache;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    accessTokenCache = accessToken;
    refreshTokenCache = refreshToken;

    if (storage) {
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      return;
    }

    // Fire-and-forget persistence for SecureStore (async). The cache is updated synchronously.
    void SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    void SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  clearTokens(): void {
    accessTokenCache = null;
    refreshTokenCache = null;
    userProfileCacheRaw = null;
    hydrated = true;

    if (storage) {
      storage.delete(STORAGE_KEYS.ACCESS_TOKEN);
      storage.delete(STORAGE_KEYS.REFRESH_TOKEN);
      storage.delete(STORAGE_KEYS.USER_PROFILE);
      return;
    }

    void SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    void SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    void SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PROFILE);
  },

  setUserProfile(profile: Record<string, unknown>): void {
    userProfileCacheRaw = JSON.stringify(profile);

    if (storage) {
      storage.set(STORAGE_KEYS.USER_PROFILE, userProfileCacheRaw);
      return;
    }

    void SecureStore.setItemAsync(STORAGE_KEYS.USER_PROFILE, userProfileCacheRaw);
  },

  getUserProfile<T>(): T | null {
    const raw = userProfileCacheRaw;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
} as const;
