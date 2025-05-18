/**
 * Polyfills for Node.js modules in React Native
 * Required for hafas-client to work properly
 */

// Import globals polyfills

// Setup specific polyfills from node-libs-react-native
// import { URL, URLSearchParams } from "url";
// import { ReadableStream } from "web-streams-polyfill";

// import * as p_base64 from "react-native-polyfill-globals/src/base64";
// import * as p_crypto from "react-native-polyfill-globals/src/crypto";
// import * as p_encoding from "react-native-polyfill-globals/src/encoding";
// import * as p_fetch from "react-native-polyfill-globals/src/fetch";
// import * as p_url from "react-native-polyfill-globals/src/url";

// polyfillGlobal("ReadableStream", () => ReadableStream);
// p_base64.polyfill();
// p_crypto.polyfill();
// p_encoding.polyfill();
// p_fetch.polyfill();
// p_url.polyfill();

// global.Buffer = Buffer;
// global.originalFetch = global.fetch;
// global.URL = URL;
// global.URLSearchParams = URLSearchParams;

// Need to handle process.nextTick for various async operations
// if (!global.process) {
//   global.process = {};
// }
// if (!global.process.nextTick) {
//   global.process.nextTick = setImmediate;
// }

// // Ensure platform detection works correctly
// if (!global.process.version) {
//   global.process.version = "";
// }
// if (!global.process.env) {
//   global.process.env = {};
// }

// Polyfill for crypto if not provided by node-libs-react-native
// if (!global.crypto) {
//   global.crypto = require("crypto");
// }

export default {};
