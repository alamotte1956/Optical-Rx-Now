# App Store Submission Guide

## Pre-Submission Checklist

### ✅ iOS App Store (Apple)

#### Required Information
- [ ] App name: "Optical Rx Now"
- [ ] Bundle identifier: `com.alamotte.opticalrxnow`
- [ ] Version: 1.0.0
- [ ] Privacy policy URL: https://alamotte1956.github.io/Optical-Rx-Now/privacy-policy.html

#### iOS Privacy & Permissions (✅ Already Configured)
- [x] **NSPhotoLibraryUsageDescription**: "We need access to your photos to help you save and manage prescription images."
- [x] **NSCameraUsageDescription**: "We need camera access to let you take photos of your prescriptions."
- [x] **NSLocationWhenInUseUsageDescription**: "Find nearby optical stores like Sam's Club"
- [x] **usesNonExemptEncryption**: false (configured in app.json)

#### App Store Connect
- [ ] Complete app metadata
- [ ] Upload screenshots (iPhone and iPad)
- [ ] Write app description
- [ ] Select app category: Medical or Health & Fitness
- [ ] Complete content rating questionnaire
- [ ] Set pricing (Free)

#### Testing
- [ ] Test on iOS 15.1+ (required for 2026 submissions)
- [ ] Test all permission requests work properly
- [ ] TestFlight beta testing (recommended)
- [ ] Verify camera and photo library access
- [ ] Verify location services work
- [ ] Confirm Privacy Manifest is included in build (see frontend/ios/PrivacyInfo.md)

### ✅ Google Play Store (Android)

#### Required Information
- [ ] App name: "Optical Rx Now"
- [ ] Package name: `com.alamotte.opticalrxnow`
- [ ] Version: 1.0.0
- [ ] Privacy policy URL: https://alamotte1956.github.io/Optical-Rx-Now/privacy-policy.html

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
- [ ] Test on Android 13+ (API 33+, required for 2026)
- [ ] Test with target SDK 34 (Android 14)
- [ ] Internal testing track (recommended)
- [ ] Verify all permissions work correctly
- [ ] Test modern photo picker (Android 13+)
- [ ] Test on Android 10+ for compatibility

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

## Note About Ads and Tracking

This app **launches without ads or tracking**. App Tracking Transparency (ATT) and AdMob have been removed to ensure App Store compliance. The app does not request tracking permission as it does not track users or show ads.

**Future Monetization**: AdMob and ATT can be added in a future version if you decide to monetize with ads. At that time, you would need to:
1. Add `expo-tracking-transparency` package back
2. Implement ATT permission request
3. Add `NSUserTrackingUsageDescription` to `app.json`
4. Configure AdMob with production ad units

## Medical Disclaimer

Consider adding a disclaimer in your app description:

> "Optical Rx Now is for storing and organizing prescription information only. It is not intended to provide medical advice, diagnosis, or treatment. Always consult with a qualified eye care professional for medical advice."

## GitHub Pages Setup for Privacy Policy

### Prerequisites
Before submitting to app stores, you must host the privacy policy publicly using GitHub Pages:

#### Step 1: Enable GitHub Pages
1. Go to your repository on GitHub: https://github.com/alamotte1956/Optical-Rx-Now
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Select branch: **main** (or your default branch)
6. Select folder: **/docs**
7. Click **Save**

#### Step 2: Wait for Deployment
- GitHub will automatically build and deploy your site
- Wait 2-5 minutes for the deployment to complete
- Your privacy policy will be available at: https://alamotte1956.github.io/Optical-Rx-Now/privacy-policy.html

#### Step 3: Verify Privacy Policy URL
Before app submission:
1. Open https://alamotte1956.github.io/Optical-Rx-Now/privacy-policy.html in your browser
2. Verify the page loads correctly
3. Confirm all content is visible and properly formatted
4. Test on both desktop and mobile browsers

#### Step 4: Update App Store Listings
Use this URL in both app stores:
- **Privacy Policy URL:** https://alamotte1956.github.io/Optical-Rx-Now/privacy-policy.html
- This URL is already configured in `frontend/app.json`

### Troubleshooting GitHub Pages
If the privacy policy URL doesn't load:
- Check that GitHub Pages is enabled in repository Settings
- Verify the /docs folder exists with index.html and privacy-policy.html
- Wait a few more minutes for deployment to complete
- Check the Actions tab for deployment status
- Ensure the repository is public (required for GitHub Pages on free accounts)

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

## Platform Requirements (2026)

### iOS Requirements
- **Minimum iOS Version:** 15.1+ (Apple requirement as of April 2025)
- **Deployment Target:** iOS 15.1
- **Privacy Manifest:** Required (see frontend/ios/PrivacyInfo.md)
- **Build Number:** Incremental for updates

### Android Requirements
- **Target SDK:** 34 (Android 14) - Required for Play Store 2026
- **Compile SDK:** 34
- **Minimum SDK:** 24 (Android 7.0)
- **Build Tools:** 34.0.0

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
