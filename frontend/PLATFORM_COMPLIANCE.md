# iOS & Android Platform Compliance Implementation

## Overview

This document describes the iOS App Tracking Transparency (ATT) and AdMob configuration implementation that ensures app store compliance.

## ✅ What's Been Implemented

### 1. iOS App Tracking Transparency (ATT)

#### Files Modified/Created:
- ✅ `package.json` - Added `expo-tracking-transparency` dependency
- ✅ `app.json` - Updated iOS permission descriptions
- ✅ `app/_layout.tsx` - Added ATT permission request on iOS launch
- ✅ `app/utils/tracking.ts` - Created ATT utility functions

#### How It Works:
1. When app launches on iOS, it waits 1 second for the app to fully load
2. Then calls `requestTrackingPermission()` which shows the ATT dialog
3. User can grant or deny - app handles both cases gracefully
4. On Android, no dialog is shown (not required)

#### Permission Description in App:
> "This app uses your data to show you personalized ads that help keep the app free."

### 2. iOS Permission Descriptions

All required iOS privacy descriptions are configured in `app.json`:

```json
{
  "NSCameraUsageDescription": "We need camera access to let you take photos of your prescriptions.",
  "NSPhotoLibraryUsageDescription": "We need access to your photos to help you save and manage prescription images.",
  "NSLocationWhenInUseUsageDescription": "Find nearby optical stores like Sam's Club",
  "NSUserTrackingUsageDescription": "This app uses your data to show you personalized ads that help keep the app free."
}
```

### 3. AdMob Configuration

#### Environment Variables (.env.example):
- Clear documentation about test vs production IDs
- Warnings about app store rejection
- Instructions for getting production IDs from AdMob
- Privacy policy URL configuration
- Admin key configuration

#### Reference Implementation:
- `app/components/AdBanner.tsx` - Example ad component that respects ATT

### 4. Documentation

Created comprehensive guides:
- **ADMOB_SETUP.md** - Complete AdMob setup and configuration guide
- **APP_STORE_SUBMISSION.md** - Updated with ATT implementation status
- **PLATFORM_COMPLIANCE.md** - This file

## 🔧 For Developers

### Using the Tracking Utility

```typescript
import { requestTrackingPermission, getTrackingPermission } from './utils/tracking';

// Request permission (shows dialog on iOS)
const granted = await requestTrackingPermission();

// Check current permission status (no dialog)
const hasPermission = await getTrackingPermission();
```

### Implementing Ad Components

When you're ready to show ads:

1. Install AdMob package:
```bash
npm install expo-ads-admob
# or
npm install react-native-google-mobile-ads
```

2. Get production AdMob IDs from https://admob.google.com/

3. Update `.env`:
```env
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-YOUR_ID~YOUR_IOS_APP_ID
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-YOUR_ID~YOUR_ANDROID_APP_ID
```

4. Use the reference implementation in `app/components/AdBanner.tsx`

### Platform-Specific Code Pattern

The app uses this pattern for platform-specific functionality:

```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS-specific code
  const hasPermission = await getTrackingPermission();
  if (hasPermission) {
    // Show personalized ads
  }
} else if (Platform.OS === 'android') {
  // Android-specific code (no ATT required)
  // Show ads
}
```

## 📋 Pre-Production Checklist

Before building for production:

### AdMob Setup:
- [ ] Create AdMob account at https://admob.google.com/
- [ ] Register iOS app in AdMob
- [ ] Register Android app in AdMob
- [ ] Copy production App IDs
- [ ] Update `.env` with production IDs
- [ ] Test ads in TestFlight/Internal Testing

### iOS Compliance:
- [x] ATT permission implemented
- [x] NSUserTrackingUsageDescription added
- [x] NSCameraUsageDescription added
- [x] NSPhotoLibraryUsageDescription added
- [x] usesNonExemptEncryption set to false
- [ ] Privacy policy URL publicly accessible
- [ ] Test on iOS 14.5+ device

### Android Compliance:
- [x] Camera permission configured
- [x] Photo picker permission configured (Android 13+)
- [ ] Privacy policy URL publicly accessible
- [ ] Test on Android 13+ device

## 🧪 Testing

### iOS Testing:
1. Build with EAS: `eas build --platform ios --profile preview`
2. Install on iOS 14.5+ device (real device required)
3. Launch app - verify ATT dialog appears after ~1 second
4. Test granting permission - app should work normally
5. Reinstall and test denying permission - app should still work
6. When ads are implemented, verify they only show if permission granted

### Android Testing:
1. Build with EAS: `eas build --platform android --profile preview`
2. Install on Android device
3. Verify no ATT dialog (not required on Android)
4. When ads are implemented, verify they show normally

## 🚨 Critical Warnings

### DO NOT:
- ❌ Submit to App Store with test AdMob IDs
- ❌ Skip ATT implementation on iOS (will be rejected)
- ❌ Use ATT for purposes other than ads/tracking
- ❌ Request ATT permission too early (before app is ready)

### DO:
- ✅ Replace test IDs with production IDs before submission
- ✅ Test ATT dialog on real iOS device
- ✅ Provide clear privacy policy
- ✅ Handle permission denial gracefully
- ✅ Test on latest iOS/Android versions

## 📚 Resources

- [ADMOB_SETUP.md](./ADMOB_SETUP.md) - Complete AdMob setup guide
- [APP_STORE_SUBMISSION.md](./APP_STORE_SUBMISSION.md) - App store submission guide
- [Apple ATT Documentation](https://developer.apple.com/documentation/apptrackingtransparency)
- [Expo Tracking Transparency](https://docs.expo.dev/versions/latest/sdk/tracking-transparency/)
- [AdMob Policies](https://support.google.com/admob/answer/6128543)

## 🆘 Troubleshooting

### ATT Dialog Not Showing:
- Must use real iOS device (14.5+), not simulator
- Dialog only shows once - reinstall app to test again
- Check `NSUserTrackingUsageDescription` exists in app.json
- Ensure 1-second delay has passed

### App Store Rejection:
- **"Missing ATT"** → Already implemented ✅
- **"Test AdMob IDs detected"** → Replace with production IDs
- **"Missing privacy policy"** → Ensure URL is publicly accessible
- **"Permission description unclear"** → Already fixed ✅

### Ads Not Loading:
- Verify using production IDs, not test IDs
- Check AdMob account is approved (24-48 hours)
- Ensure app bundle ID matches AdMob configuration
- Check AdMob dashboard for errors

## 🔄 Future Updates

When adding AdMob ads:
1. Follow ADMOB_SETUP.md guide
2. Use reference implementation in AdBanner.tsx
3. Always check ATT permission before showing ads on iOS
4. Test thoroughly in TestFlight before production

## ✨ Summary

This implementation ensures:
- ✅ iOS App Store compliance (ATT implemented)
- ✅ Android Play Store compliance (permissions configured)
- ✅ Privacy-first approach (respects user choices)
- ✅ Platform-specific handling (iOS vs Android)
- ✅ Clear documentation for future development
- ✅ Reference implementations for ads

All changes are minimal, focused, and follow platform best practices.
