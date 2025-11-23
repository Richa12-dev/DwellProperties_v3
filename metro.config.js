const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    ...defaultConfig.resolver,
    // Add 'mjs' to sourceExts and remove from assetExts
    sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs'],
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'mjs'),
    extraNodeModules: {
      'react-dom': require.resolve('react-native'),
    },
  },
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    // Disable source maps for node_modules to avoid the .mjs error
    unstable_disableES6Transforms: false,
  },
  watchFolders: [path.resolve(__dirname, 'node_modules')],
};

module.exports = mergeConfig(defaultConfig, config);
