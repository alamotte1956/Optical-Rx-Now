# iOS Privacy Manifest (PrivacyInfo.xcprivacy)

## Overview
As of 2026, Apple requires apps to include a Privacy Manifest file that declares tracking status, collected data types, and accessed APIs. This file must be manually added to the iOS build during the Xcode configuration process.

## What is a Privacy Manifest?
A Privacy Manifest is an XML property list file (`PrivacyInfo.xcprivacy`) that declares:
- Whether the app tracks users
- Tracking domains used (if any)
- Types of data collected
- System APIs that require privacy declarations

## Privacy Manifest for Optical Rx Now

### File Location
When building the iOS app with Xcode, create the file at:
```
ios/YourAppName/PrivacyInfo.xcprivacy
```

### Privacy Manifest Content

Create a file named `PrivacyInfo.xcprivacy` with the following content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Tracking Status -->
    <key>NSPrivacyTracking</key>
    <false/>
    
    <!-- Tracking Domains (empty - no tracking) -->
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    
    <!-- Collected Data Types (empty - local storage only) -->
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
    
    <!-- Accessed API Types -->
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <!-- UserDefaults API -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
        
        <!-- File Timestamp API -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>C617.1</string>
            </array>
        </dict>
        
        <!-- System Boot Time API -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategorySystemBootTime</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>35F9.1</string>
            </array>
        </dict>
        
        <!-- Disk Space API -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryDiskSpace</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>E174.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

## API Reason Codes Explained

### UserDefaults (CA92.1)
**Reason:** Access app-specific data stored locally
**Usage in Optical Rx Now:** Storing user preferences and settings locally on device

### File Timestamp (C617.1)
**Reason:** Access timestamps of files created by the app
**Usage in Optical Rx Now:** Managing prescription photo files and their metadata

### System Boot Time (35F9.1)
**Reason:** Measure elapsed time for app functionality
**Usage in Optical Rx Now:** Used by React Native framework for performance monitoring

### Disk Space (E174.1)
**Reason:** Check available disk space for app functionality
**Usage in Optical Rx Now:** Ensure sufficient space before saving prescription photos

## How to Add the Privacy Manifest

### Using EAS Build (Recommended)
1. Create the `PrivacyInfo.xcprivacy` file in your iOS project
2. Ensure it's included in your Xcode project
3. Build with EAS: `eas build --platform ios --profile production`

### Manual Addition During Build
If building locally with Xcode:
1. Open the `.xcworkspace` file in Xcode
2. Right-click on your app target in the Project Navigator
3. Select "New File"
4. Choose "Property List" 
5. Name it `PrivacyInfo.xcprivacy`
6. Replace the contents with the XML above
7. Ensure it's added to the app target (check Target Membership)

## Verification

### Check if Privacy Manifest is Included
After building your app:
1. Extract the `.ipa` file (rename to `.zip` and extract)
2. Navigate to `Payload/YourApp.app/`
3. Verify `PrivacyInfo.xcprivacy` is present

### App Store Connect Validation
When uploading to App Store Connect:
- The system will validate the Privacy Manifest
- Any issues will be reported in the upload feedback
- Missing required APIs will trigger warnings

## Common Issues

### Privacy Manifest Not Found
**Solution:** Ensure the file is:
- Named exactly `PrivacyInfo.xcprivacy`
- In the root of your app bundle
- Added to the app target in Xcode

### Missing API Declarations
**Error:** "Missing NSPrivacyAccessedAPITypes"
**Solution:** Add all APIs your app uses (see template above)

### Tracking Declaration Issues
**Error:** "App appears to track but NSPrivacyTracking is false"
**Solution:** Optical Rx Now doesn't track users, so this should remain `false`

## Updates and Maintenance

### When to Update
Update the Privacy Manifest when:
- Adding new system APIs that require declarations
- Adding any tracking or analytics
- Apple announces new required API types
- App Store review requests additional information

### Current Status (2026)
- ✅ No tracking implemented
- ✅ No data collection to external servers
- ✅ Local storage only (AsyncStorage)
- ✅ Required APIs declared (UserDefaults, FileTimestamp, etc.)

## Resources

- [Apple Privacy Manifest Documentation](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)
- [Required Reason API Reference](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api)
- [App Store Review Guidelines - Privacy](https://developer.apple.com/app-store/review/guidelines/#privacy)

## Support

For issues with Privacy Manifest implementation:
1. Check the App Store Connect upload feedback
2. Review Apple's Privacy Manifest documentation
3. Consult the Expo documentation for iOS builds
4. Contact Apple Developer Support if needed

---

**Last Updated:** February 4, 2026
**Compatible with:** iOS 15.0+
**Required for:** App Store submission in 2026
