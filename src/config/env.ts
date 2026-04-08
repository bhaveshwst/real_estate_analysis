import { z } from 'zod';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Environment schema — Zod validates at startup so
 * typos in .env surface immediately, not at runtime.
 */
const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  GOOGLE_MAPS_API_KEY: z.string().min(1),
  ENV: z.enum(['development', 'staging', 'production']),
});

function extractHost(hostUri?: string | null): string | null {
  if (!hostUri) return null;

  // Examples we might see:
  // - "192.168.1.5:8081"
  // - "192.168.1.5:19000"
  // - "exp://192.168.1.5:19000"
  // - "http://192.168.1.5:19000"
  const cleaned = hostUri
    .replace(/^https?:\/\//, '')
    .replace(/^exp:\/\//, '')
    .split('/')[0];

  const host = cleaned.split(':')[0]?.trim();
  return host ? host : null;
}

function replaceLocalhostApiBaseUrl(baseUrl: string): string {
  const host =
    extractHost(Constants.expoConfig?.hostUri) ??
    extractHost((Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost) ??
    extractHost(
      (Constants as unknown as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } }).manifest2?.extra
        ?.expoClient?.hostUri,
    );

  if (!host) return baseUrl;

  // iOS simulator can reach the Mac via 127.0.0.1, Android emulator needs 10.0.2.2.
  if (host === 'localhost' || host === '127.0.0.1') {
    return Platform.OS === 'android'
      ? baseUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2')
      : baseUrl.replace('localhost', '127.0.0.1');
  }

  return baseUrl.replace('localhost', host).replace('127.0.0.1', host);
}

const rawEnv = {
  API_BASE_URL: replaceLocalhostApiBaseUrl(
    (Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:3003/api/v1').trim(),
  ),
  GOOGLE_MAPS_API_KEY: Constants.expoConfig?.extra?.googleMapsApiKey ?? '',
  ENV: Constants.expoConfig?.extra?.env ?? 'development',
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  // Logger isn't available yet during bootstrap — console.error is intentional here
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = Object.freeze(parsed.data);

/**
 * Feature flags — toggle per environment
 */
export const features = Object.freeze({
  enableAnalytics: env.ENV === 'production',
  enableCrashReporting: env.ENV !== 'development',
  enableMockData: env.ENV === 'development',
  maxSavedProperties: env.ENV === 'production' ? 100 : 500,
});
