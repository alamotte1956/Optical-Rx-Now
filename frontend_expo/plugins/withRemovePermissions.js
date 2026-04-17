const { withAndroidManifest } = require("@expo/config-plugins");

const PERMISSIONS_TO_REMOVE = [
  "android.permission.READ_MEDIA_IMAGES",
  "android.permission.READ_MEDIA_VIDEO",
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.RECORD_AUDIO",
  "android.permission.SYSTEM_ALERT_WINDOW",
  "android.permission.READ_APP_BADGE",
];

const withRemovePermissions = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Filter out unwanted permissions
    if (manifest["uses-permission"]) {
      manifest["uses-permission"] = manifest["uses-permission"].filter(
        (perm) => {
          const name = perm.$?.["android:name"];
          return !PERMISSIONS_TO_REMOVE.includes(name);
        }
      );
    }

    // Also add tools:node="remove" entries to block library-injected permissions
    if (!manifest.$) {
      manifest.$ = {};
    }
    manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    PERMISSIONS_TO_REMOVE.forEach((permission) => {
      manifest["uses-permission"].push({
        $: {
          "android:name": permission,
          "tools:node": "remove",
        },
      });
    });

    return config;
  });
};

module.exports = withRemovePermissions;
