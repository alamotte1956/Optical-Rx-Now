# App Store Submission Guide

## Pre-Submission Checklist

### ✅ iOS App Store (Apple)

#### Required Information
- [ ] App name: "Optical Rx Now"
- [ ] Bundle identifier: `com.alamotte.opticalrxnow`
- [ ] Version: 1.0.0
- [ ] Privacy policy URL: https://opticalrxnow.com/privacy

#### App Store Connect
- [ ] Complete app metadata
- [ ] Upload screenshots (iPhone and iPad)
- [ ] Write app description
- [ ] Select app category: Medical or Health & Fitness
- [ ] Complete content rating questionnaire
- [ ] Set pricing (Free)

#### Testing
- [ ] Test on iOS 17+
- [ ] Test all permission requests work properly
- [ ] TestFlight beta testing (recommended)
- [ ] Verify camera and photo library access
- [ ] Verify location services work

### ✅ Google Play Store (Android)

#### Required Information
- [ ] App name: "Optical Rx Now"
- [ ] Package name: `com.alamotte.opticalrxnow`
- [ ] Version: 1.0.0
- [ ] Privacy policy URL: https://opticalrxnow.com/privacy

#### Google Play Console
- [ ] Complete store listing
- [ ] Upload screenshots (phone and tablet)
- [ ] Write app description
- [ ] Select app category: Medical or Health & Fitness
- [ ] Complete content rating questionnaire
- [ ] Complete Data Safety form
- [ ] Set pricing (Free)

#### Data Safety Declaration
Answer as follows:
- **Does your app collect or share user data?** → No
- **Is all data encrypted in transit?** → N/A (no data transmitted)
- **Can users request data deletion?** → Yes (uninstall app)
- **Data handling:** All data stored locally on device

#### Testing
- [ ] Test on Android 13+ (modern photo picker)
- [ ] Test on Android 10+ (older photo picker)
- [ ] Internal testing track (recommended)
- [ ] Verify all permissions work correctly

## Permissions Explained

### Camera (Both Platforms)
- **Purpose:** Capture photos of prescriptions
- **User-facing description:** "Take photos of your eyeglass and contact lens prescriptions"

### Photo Library (Both Platforms)
- **Purpose:** Select existing prescription photos
- **User-facing description:** "Select prescription photos from your gallery"

### Location (Both Platforms, Optional)
- **Purpose:** Find nearby optical stores
- **User-facing description:** "Find nearby optical stores like Sam's Club"
- **Note:** Only used when user actively searches for stores

## Medical Disclaimer

Consider adding a disclaimer in your app description:

> "Optical Rx Now is for storing and organizing prescription information only. It is not intended to provide medical advice, diagnosis, or treatment. Always consult with a qualified eye care professional for medical advice."

## Build Commands

### iOS Build
```bash
cd frontend
eas build --platform ios --profile production
```

### Android Build
```bash
cd frontend
eas build --platform android --profile production
```

## Review Timeline
- **Apple App Store:** Typically 24-48 hours
- **Google Play Store:** Typically hours to a few days

## Common Rejection Reasons

### Apple
- Missing privacy policy
- Unclear permission descriptions
- Incomplete app metadata
- Missing iPad screenshots (if supporting tablets)

### Google
- Incomplete Data Safety form
- Missing privacy policy
- Unclear permission usage
- Incomplete content rating

## Resources
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Expo App Store Deployment Guide](https://docs.expo.dev/distribution/app-stores/)

## Support
If you encounter issues during submission, refer to:
- [Expo Forums](https://forums.expo.dev/)
- [Apple Developer Support](https://developer.apple.com/support/)
- [Google Play Support](https://support.google.com/googleplay/android-developer/)
