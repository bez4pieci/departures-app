/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  icon: "../../assets/images/icon.png",
  entitlements: {
    "com.apple.security.application-groups": ["group.com.bez4pieci.departures"],
  },
});
