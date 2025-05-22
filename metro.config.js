
// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  // Add support for `react-native-svg-transformer`
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };

  // Update resolver extensions
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg", "cjs"], // Include `cjs` extension
  };

  config.resolver.unstable_enablePackageExports = false;


  // Wrap with Reanimated Metro Config
  return wrapWithReanimatedMetroConfig(config);
})();
