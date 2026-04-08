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
    },
    plugins: [
      'expo-asset',
      'expo-location',
      'expo-secure-store',
    ],
  },
};
