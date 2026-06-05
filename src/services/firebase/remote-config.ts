import { NativeModules, TurboModuleRegistry } from 'react-native';

/**
 * True when this binary includes @react-native-firebase/app native code.
 * Always false in Expo Go; use a dev/prod build from `expo run:ios` / EAS.
 */
function isReactNativeFirebaseNativeLinked(): boolean {
  if (NativeModules.RNFBAppModule != null) {
    return true;
  }
  return TurboModuleRegistry.get('RNFBAppModule') != null;
}

/** Keys configured in Firebase Remote Config (must match console). */
export const REMOTE_CONFIG_KEYS = {
  forceUpdate: 'real_estate_analysis_force_update',
  androidMinVersion: 'real_estate_analysis_android',
  iosMinVersion: 'real_estate_analysis_ios',
} as const;

const DEFAULTS: Record<string, string> = {
  [REMOTE_CONFIG_KEYS.forceUpdate]: '0',
  [REMOTE_CONFIG_KEYS.androidMinVersion]: '1.0.0',
  [REMOTE_CONFIG_KEYS.iosMinVersion]: '1.0.0',
};

/**
 * Fetches Remote Config and returns whether the user must update (force flag === "1").
 * Fails open (returns false) when native Firebase is unavailable (e.g. Expo Go).
 */
export async function fetchRemoteConfigAndCheckForceUpdate(): Promise<boolean> {
  if (!isReactNativeFirebaseNativeLinked()) {
    return false;
  }
  try {
    await import('@react-native-firebase/app');
    const { default: remoteConfig } = await import(
      '@react-native-firebase/remote-config'
    );
    const rc = remoteConfig();
    await rc.setConfigSettings({
      minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60 * 1000,
    });
    await rc.setDefaults(DEFAULTS);
    await rc.fetchAndActivate();
    const raw = rc.getValue(REMOTE_CONFIG_KEYS.forceUpdate).asString();
    return raw.trim() === '1';
  } catch {
    return false;
  }
}
