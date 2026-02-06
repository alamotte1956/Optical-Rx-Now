# Pre-Submission Testing Checklist

**Last Updated:** February 4, 2026  
**Purpose:** Comprehensive testing requirements before App Store and Play Store submission

---

## 1. Critical Requirements (Blockers)

These items **MUST** be completed before submission. App will be rejected without them.

- [ ] **Privacy policy publicly accessible**
  - URL: https://opticalrxnow.com/privacy
  - Verify URL loads in browser (desktop and mobile)
  - GitHub Pages enabled in repository settings
  - Page displays correctly on all devices

- [ ] **Tested on iOS 15.1+ physical device**
  - NOT just simulator - must be real device
  - iOS 15.1 is the minimum deployment target
  - Test all core functionality on physical iPhone

- [ ] **Tested on Android 14 (API 34) physical device**
  - Target SDK is 34 (required for Play Store 2026)
  - Test all core functionality on physical Android device
  - Verify modern photo picker works on Android 13+

- [ ] **All permissions work correctly**
  - Camera permission grants and denies gracefully
  - Photo library permission grants and denies gracefully
  - Location permission grants and denies gracefully
  - App functions correctly when permissions denied

- [ ] **Encryption/decryption verified**
  - Prescription data encrypted at rest
  - Images encrypted properly
  - Data decrypts correctly on app restart
  - No data corruption or loss

- [ ] **Biometric authentication tested**
  - Face ID works (iOS)
  - Touch ID works (iOS)
  - Fingerprint authentication works (Android)
  - Biometric timeout enforces correctly (5 minutes)

---

## 2. iOS-Specific Testing

### Required iOS Tests
- [ ] **Face ID/Touch ID authentication**
  - Biometric prompt appears correctly
  - Face ID works on devices with Face ID
  - Touch ID works on devices with Touch ID
  - Fallback to passcode works
  - Biometric timeout enforced (5 minutes)

- [ ] **Camera permission flow**
  - Permission request shows proper description
  - Grant permission works
  - Deny permission shows helpful alert
  - Camera launches when permission granted
  - Check-before-request pattern implemented

- [ ] **Photo library permission flow**
  - Permission request shows proper description
  - Grant permission works
  - Deny permission shows helpful alert
  - Photo picker works when permission granted
  - Check-before-request pattern implemented

- [ ] **Location permission flow**
  - Permission request shows proper description
  - "When in use" permission works
  - Grant permission works
  - Deny permission shows helpful alert
  - Store finder works with location permission

### iOS Compliance Items
- [ ] **Privacy Manifest included**
  - PrivacyInfo.xcprivacy file in Xcode project
  - NSPrivacyTracking set to false
  - All required APIs declared with reason codes
  - File included in app bundle (verify in .ipa)

- [ ] **Export compliance prepared**
  - Answer "No" to encryption export compliance
  - usesNonExemptEncryption is false in app.json
  - App uses encryption for local data only
  - No transmission of encrypted data

- [ ] **Health data disclaimers verified**
  - NSHealthShareUsageDescription present
  - NSHealthUpdateUsageDescription present
  - Both state app does not access Health data
  - Prevents App Review questions about HealthKit

### iOS Build Verification
- [ ] **Deployment target is iOS 15.1**
  - Configured in app.json
  - expo-build-properties plugin sets 15.1
  - App runs on iOS 15.1+ devices

- [ ] **Bundle identifier correct**
  - com.alamotte.opticalrxnow
  - Matches App Store Connect

- [ ] **Privacy policy URL in app.json**
  - "privacy" field present
  - URL is https://opticalrxnow.com/privacy

---

## 3. Android-Specific Testing

### Required Android Tests
- [ ] **Fingerprint authentication**
  - Biometric prompt appears correctly
  - Fingerprint authentication works
  - Fallback to PIN/password works
  - Biometric timeout enforced (5 minutes)

- [ ] **Camera permission (Android 13+ photo picker)**
  - Modern photo picker works on Android 13+
  - Legacy permission works on Android 12 and below
  - Camera launches correctly
  - Check-before-request pattern implemented

- [ ] **Location permission**
  - Permission request shows proper description
  - Fine location permission works
  - Coarse location permission works
  - Store finder works with location

### Android Compliance Items
- [ ] **Edge-to-edge display**
  - edgeToEdgeEnabled set to true
  - App uses full screen properly
  - No UI cutoff or overlap issues
  - Status bar and navigation bar handled correctly

- [ ] **Compiles with SDK 34**
  - compileSdkVersion is 34
  - No build errors
  - All dependencies compatible with SDK 34

- [ ] **Target SDK 34 verified**
  - targetSdkVersion is 34
  - Required for Play Store 2026
  - App functions correctly with target 34

### Android Build Verification
- [ ] **Package name correct**
  - com.alamotte.opticalrxnow
  - Matches Google Play Console

- [ ] **Minimum SDK 24**
  - minSdkVersion is 24 (Android 7.0)
  - App runs on Android 7.0+

- [ ] **Permissions declared**
  - CAMERA permission in manifest
  - READ_MEDIA_IMAGES permission in manifest
  - ACCESS_FINE_LOCATION permission in manifest
  - ACCESS_COARSE_LOCATION permission in manifest

---

## 4. Functional Testing

Test all core app functionality on both iOS and Android:

### Family Member Management
- [ ] **Add family member**
  - Form validation works
  - Member saved successfully
  - Member appears in list

- [ ] **Edit family member**
  - Edit form pre-populates
  - Changes save successfully
  - Changes reflect in UI

- [ ] **Delete family member**
  - Confirmation prompt appears
  - Member and prescriptions deleted
  - UI updates correctly

### Prescription Management
- [ ] **Add prescription (camera)**
  - Camera permission requested
  - Camera launches
  - Photo captured
  - Prescription saved with image

- [ ] **Add prescription (photo library)**
  - Photo library permission requested
  - Photo picker opens
  - Photo selected
  - Prescription saved with image

- [ ] **View prescription**
  - Prescription details display
  - Image displays correctly
  - All fields show correct data

- [ ] **View encrypted prescription**
  - Biometric prompt appears
  - Authentication required
  - Prescription decrypts correctly
  - Image decrypts and displays

- [ ] **Edit prescription**
  - Edit form pre-populates
  - Changes save successfully
  - Image persists correctly

- [ ] **Delete prescription**
  - Confirmation prompt appears
  - Prescription deleted
  - UI updates correctly

### Backup and Export
- [ ] **Export backup**
  - Export function works
  - Data exports completely
  - File format correct

- [ ] **Print prescription**
  - Print dialog appears
  - Prescription formats correctly
  - All data included

- [ ] **Share prescription**
  - Share sheet appears
  - Prescription data included
  - Image included (if present)

### Security Features
- [ ] **Biometric lock/unlock**
  - Biometric prompt on app launch
  - Lock enforces after 5 minutes
  - Re-authentication required
  - Timeout works correctly

- [ ] **Offline functionality**
  - App works without internet
  - All features accessible offline
  - No network errors
  - Data persists locally

---

## 5. Security Testing

### Data Encryption Verification
- [ ] **Prescription data encrypted**
  - Data stored encrypted in AsyncStorage
  - Cannot read raw data from device storage
  - Encryption key secure

- [ ] **Biometric timeout works**
  - App locks after 5 minutes inactive
  - Re-authentication required
  - Timer resets on app use

- [ ] **SecureStore key generation**
  - Encryption keys generated securely
  - Keys stored in SecureStore (iOS Keychain/Android Keystore)
  - Keys persist across app restarts

- [ ] **Image encryption verified**
  - Prescription images encrypted
  - Base64 encoding secure
  - Images decrypt correctly

- [ ] **No sensitive data in logs**
  - Review console logs
  - No prescription data logged
  - No encryption keys logged
  - No personal information exposed

---

## 6. Compliance Verification

### Privacy Policy
- [ ] **Privacy policy URL accessible**
  - https://opticalrxnow.com/privacy
  - Page loads on desktop
  - Page loads on mobile
  - Content accurate and complete

- [ ] **Privacy policy in app.json**
  - "privacy" field present
  - URL correct

### Permissions
- [ ] **All permission descriptions accurate**
  - NSCameraUsageDescription clear and accurate
  - NSPhotoLibraryUsageDescription clear and accurate
  - NSLocationWhenInUseUsageDescription clear and accurate
  - Android permission descriptions match

- [ ] **No tracking without consent**
  - App does not track users
  - No analytics services
  - No advertising identifiers
  - NSPrivacyTracking is false

### Export Compliance
- [ ] **Export compliance documented**
  - usesNonExemptEncryption is false
  - Encryption for local data only
  - No encrypted data transmitted
  - Export compliance answer prepared

### GDPR Compliance
- [ ] **Right to delete**
  - Users can delete individual prescriptions
  - Users can delete family members
  - Uninstall removes all data

- [ ] **Right to export**
  - Users can export prescriptions
  - Users can print prescriptions
  - Users can share prescriptions

---

## 7. Pre-Production Steps

Complete these steps in order before final submission:

### GitHub Pages Setup
- [ ] **Enable GitHub Pages**
  - Go to repository Settings > Pages
  - Set source to "Deploy from a branch"
  - Select branch: main
  - Select folder: /docs
  - Click Save

- [ ] **Verify privacy policy URL loads**
  - Wait 2-5 minutes for deployment
  - Open https://opticalrxnow.com/privacy
  - Verify page loads correctly
  - Test on desktop browser
  - Test on mobile browser

### Environment Configuration
- [ ] **Update environment variables for production**
  - Review .env.example
  - Set production values (if any)
  - No test/debug values in production

### Build Testing
- [ ] **Test EAS build (development profile)**
  ```bash
  eas build --platform ios --profile development
  eas build --platform android --profile development
  ```
  - Build completes successfully
  - Install and test on device

- [ ] **Test EAS build (preview profile)**
  ```bash
  eas build --platform ios --profile preview
  eas build --platform android --profile preview
  ```
  - Build completes successfully
  - Install and test on device
  - Test with production-like settings

- [ ] **Final production build test**
  ```bash
  eas build --platform ios --profile production
  eas build --platform android --profile production
  ```
  - Build completes without errors
  - No warnings in build logs
  - App size reasonable (under 200MB)

---

## 8. Final Pre-Submission Verification

### Documentation Review
- [ ] All iOS references are iOS 15.1 (not 15.0)
- [ ] Privacy policy URL correct everywhere
- [ ] No BackHandler references in iOS sections
- [ ] Permission descriptions consistent

### Build Artifacts
- [ ] iOS .ipa file generated
- [ ] Android .aab file generated
- [ ] Files under size limits
- [ ] No debug symbols in production builds

### App Store Connect / Play Console
- [ ] Account access verified
- [ ] App created in portal
- [ ] Bundle ID / Package name matches
- [ ] All metadata prepared
- [ ] Screenshots ready
- [ ] App description written
- [ ] Privacy policy URL added

---

## Success Criteria

All checkboxes above must be checked before submission. If any critical item fails:

1. **STOP** - Do not submit
2. Fix the issue
3. Re-test the affected area
4. Update this checklist
5. Only proceed when all items pass

---

## Emergency Contacts

If you encounter blockers:

- **Expo Support:** https://forums.expo.dev/
- **Apple Developer Support:** https://developer.apple.com/support/
- **Google Play Support:** https://support.google.com/googleplay/android-developer/

---

**Remember:** Thorough testing prevents app rejection and ensures a great user experience.

**Final Step:** Review this entire checklist one more time before clicking "Submit for Review"
