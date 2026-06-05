import 'dotenv/config';

export default {
  expo: {
    name: 'Real Estate Analytics',
    slug: 'real-estate-analytics',
    version: '1.0.0',
    orientation: 'portrait',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.realestate.analytics',
      googleServicesFile: './GoogleService-Info.plist',
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'We use your location to find nearby properties.',
        ...(process.env.APP_ENV === 'development'
          ? { NSAppTransportSecurity: { NSAllowsArbitraryLoads: true } }
          : {}),
      },
    },
    android: {
      package: 'com.realestate.analytics',
      googleServicesFile: './google-services.json',
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: ['ACCESS_FINE_LOCATION'],
    },
    extra: {
      apiBaseUrl: (process.env.API_BASE_URL || 'http://localhost:3003/api/v1').trim(),
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      env: process.env.APP_ENV || 'development',
      /** Numeric App Store ID (e.g. 1234567890) for force-update deep link on iOS */
      iosAppStoreId: (process.env.IOS_APP_STORE_ID || '').trim(),
    },
    plugins: [
      'expo-asset',
      'expo-location',
      'expo-secure-store',
      '@react-native-firebase/app',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            deploymentTarget: '15.1',
          },
        },
      ],
    ],
  },
};
