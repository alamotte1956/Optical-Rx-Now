const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withNetworkSecurity(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application[0];

    // Allow cleartext traffic (needed for some proxy configurations)
    application.$["android:usesCleartextTraffic"] = "true";

    return config;
  });
};
