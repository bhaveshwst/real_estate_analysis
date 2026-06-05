module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@features': './src/features',
            '@shared': './src/shared',
            '@services': './src/services',
            '@store': './src/store',
            '@navigation': './src/navigation',
            '@config': './src/config',
            '@theme': './src/theme',
            '@types': './src/types',
          },
        },
      ],
      'react-native-reanimated/plugin', // must be last
    ],
  };
};
