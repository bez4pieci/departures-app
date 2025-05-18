const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { mergeConfig } = require('metro-config');

const config = mergeConfig(getDefaultConfig(__dirname), {
    watchFolders: [require('node:path').resolve(__dirname, '..')],
    resolver: {
    },
});

module.exports = withNativeWind(config, {
    input: './global.css',
});
