const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { mergeConfig } = require("metro-config");

// Exports from "node-libs-react-native", listed here for reference when new polyfills are needed

// exports.assert						= require.resolve('assert/');
// exports.buffer						= require.resolve('buffer/');
// exports.child_process				= null;
// exports.cluster						= null;
// exports.console						= require.resolve('console-browserify');
// exports.constants					= require.resolve('constants-browserify');
// exports.crypto						= require.resolve('react-native-crypto');
// exports.dgram						= null;
// exports.dns							= null;
// exports.domain						= require.resolve('domain-browser');
// exports.events						= require.resolve('events/');
// exports.fs							= null;
// exports.http						= require.resolve('stream-http');
// exports.https						= require.resolve('https-browserify');
// exports.module						= null;
// exports.net							= null;
// exports.os							= require.resolve('os-browserify/browser.js');
// exports.path						= require.resolve('path-browserify');
// exports.punycode					= require.resolve('punycode/');
// exports.process						= require.resolve('process/browser.js');
// exports.querystring					= require.resolve('querystring-es3/');
// exports.readline					= null;
// exports.repl						= null;
// exports.stream						= require.resolve('readable-stream');
// exports._stream_duplex				= require.resolve('readable-stream/duplex.js');
// exports._stream_passthrough			= require.resolve('readable-stream/passthrough.js');
// exports._stream_readable			= require.resolve('readable-stream/readable.js');
// exports._stream_transform			= require.resolve('readable-stream/transform.js');
// exports._stream_writable			= require.resolve('readable-stream/writable.js');
// exports.string_decoder				= require.resolve('string_decoder/');
// exports.sys							= require.resolve('util/util.js');
// exports.timers						= require.resolve('timers-browserify');
// exports.tls							= null;
// exports.tty							= require.resolve('tty-browserify');
// exports.url							= require.resolve('url/');
// exports.util						= require.resolve('util/util.js');
// exports.vm							= null;
// exports.zlib						= require.resolve('browserify-zlib');

const extra = {
  stream: require.resolve("web-streams-polyfill"),
  // assert: require.resolve("assert"),
  http: require.resolve("stream-http"),
  https: require.resolve("https-browserify"),

  buffer: require.resolve("buffer"),
  "node:buffer": require.resolve("./node_modules/buffer/index.js"),

  "https-proxy-agent": require.resolve("./lib/shims/https-proxy-agent.ts"),
  net: require.resolve("./lib/shims/net.ts"),
  tls: require.resolve("./lib/shims/tls.ts"),
  crypto: require.resolve("./lib/shims/crypto.ts"),
};

const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    extraNodeModules: extra,
  },
});

module.exports = withNativeWind(config, {
  input: "./global.css",
});
