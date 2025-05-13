const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { mergeConfig } = require('metro-config');

const config = mergeConfig(getDefaultConfig(__dirname), {});

module.exports = withNativeWind(config, {
    input: './global.css',
});
