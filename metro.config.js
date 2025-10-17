// const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
// const config = {};
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs', 'mjs', 'json'],
    extraNodeModules: {
      'react-dom': require.resolve('react-native'),
    },
  },
};

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);
module.exports = mergeConfig(defaultConfig, config);
