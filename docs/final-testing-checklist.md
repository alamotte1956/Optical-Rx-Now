# Final Testing Checklist

**Complete this checklist before submitting to Apple App Store and Google Play Store**

---

## Pre-Testing Setup

- [ ] Build app in production mode (not development)
- [ ] Test on physical devices (not just simulators/emulators)
- [ ] Create fresh install (uninstall previous versions first)
- [ ] Prepare test data (sample family members and prescriptions)
- [ ] Disable any debug settings or test modes

---

## iOS Testing (Apple App Store)

### Initial Launch & Setup
- [ ] App installs successfully from TestFlight or build
- [ ] Splash screen displays correctly
- [ ] Age verification screen appears on first launch
- [ ] "Yes, I'm 18+" button works and proceeds
- [ ] "No, I'm under 18" button works and blocks access
- [ ] Age verification persists (doesn't appear on subsequent launches)
- [ ] App reaches main screen after age verification

### Permissions (iOS)
- [ ] Camera permission request appears when taking photo
- [ ] Camera permission request text matches Info.plist (NSCameraUsageDescription)
- [ ] Photo library permission request appears when selecting photo
- [ ] Photo library permission text matches Info.plist (NSPhotoLibraryUsageDescription)
- [ ] Location permission request appears when finding stores (optional)
- [ ] Location permission text matches Info.plist (NSLocationWhenInUseUsageDescription)
- [ ] App works correctly when camera permission denied
- [ ] App works correctly when photo library permission denied
- [ ] App works correctly when location permission denied
- [ ] Permissions can be changed in iOS Settings

### Core Functionality
- [ ] **Add Family Member:**
  - [ ] Can add new family member with name
  - [ ] Family member appears in list
  - [ ] Can view family member details
  - [ ] Input validation works (no empty names)
- [ ] **Add Eyeglass Prescription:**
  - [ ] Can create new eyeglass prescription
  - [ ] Can enter OD (Right Eye) values (sphere, cylinder, axis)
  - [ ] Can enter OS (Left Eye) values
  - [ ] Can enter PD (Pupillary Distance)
  - [ ] Can enter prescription date
  - [ ] Can enter expiration date
  - [ ] Can add doctor information
  - [ ] Can take photo with camera
  - [ ] Can select photo from library
  - [ ] Photo displays correctly in prescription
  - [ ] Prescription saves successfully
- [ ] **Add Contact Lens Prescription:**
  - [ ] Can create new contact lens prescription
  - [ ] Can enter base curve, diameter
  - [ ] Can enter power/sphere values
  - [ ] Can enter brand and type
  - [ ] Can add prescription date and expiration
  - [ ] Can add photo
  - [ ] Prescription saves successfully
- [ ] **View Prescription:**
  - [ ] Can open prescription details
  - [ ] All entered data displays correctly
  - [ ] Photos display at full quality
  - [ ] Can zoom/pan on prescription photo (if supported)
  - [ ] Date formatting is correct
- [ ] **Edit Prescription:**
  - [ ] Can edit existing prescription
  - [ ] Changes save correctly
  - [ ] Can add/change photo
  - [ ] Can remove photo
- [ ] **Delete Prescription:**
  - [ ] Can delete prescription
  - [ ] Confirmation dialog appears
  - [ ] Prescription is removed from list
  - [ ] Associated photo is deleted
- [ ] **Share/Print Prescription:**
  - [ ] Share button works
  - [ ] iOS share sheet appears
  - [ ] Can share via email (formatted correctly)
  - [ ] Can share via Messages
  - [ ] Can save to Files
  - [ ] Can print prescription (if printer available)
  - [ ] Shared content includes all prescription details
  - [ ] Photo included in share (if prescription has photo)
- [ ] **Find Stores:**
  - [ ] Store finder feature is accessible
  - [ ] Location permission requested (if not granted)
  - [ ] Nearby stores display correctly
  - [ ] Store information accurate (name, address, distance)
  - [ ] Can tap store to view details or get directions
  - [ ] Works without location (shows generic store list or message)

### Data Persistence
- [ ] Data saves after adding prescription
- [ ] Data persists after closing app completely
- [ ] Data persists after device restart
- [ ] Multiple prescriptions can be stored
- [ ] Multiple family members can be stored
- [ ] Photos persist correctly
- [ ] No data loss during normal usage
- [ ] Age verification persists (doesn't reappear)

### Privacy & Security
- [ ] No data sent to external servers (verify with network monitor)
- [ ] App works in airplane mode (except store finder)
- [ ] No analytics or tracking requests (verify with network monitor)
- [ ] No crash reporting requests
- [ ] Privacy Manifest included in build (check with Xcode)
- [ ] Encryption working for stored data (verify AsyncStorage)
- [ ] No sensitive data in logs or console

### UI/UX (iOS)
- [ ] Navigation works correctly (back buttons, gestures)
- [ ] All buttons respond to taps
- [ ] Keyboard appears/dismisses correctly
- [ ] Input fields accept text properly
- [ ] Scroll views work smoothly
- [ ] Loading indicators appear when appropriate
- [ ] Error messages are clear and helpful
- [ ] Success confirmations appear when appropriate
- [ ] App follows iOS Human Interface Guidelines
- [ ] Dark mode support (if implemented)
- [ ] Dynamic Type support (font scaling)
- [ ] Safe area insets respected (notch, home indicator)
- [ ] Landscape orientation support (if applicable)

### iOS Specific Features
- [ ] Face ID/Touch ID works for app security (if implemented)
- [ ] Widget displays correctly (if implemented)
- [ ] Spotlight search finds app
- [ ] App icon appears correctly on home screen
- [ ] App name displays correctly
- [ ] Launch screen appears properly

### iOS Device Testing Matrix
Test on at least these devices/iOS versions:
- [ ] iPhone with notch (iPhone 12+) - iOS 15.1+
- [ ] iPhone SE or older (home button) - iOS 15.1+
- [ ] iPad (if supporting tablets) - iOS 15.1+
- [ ] Latest iOS version (17.x or 18.x)
- [ ] Minimum supported iOS version (15.1)

---

## Android Testing (Google Play Store)

### Initial Launch & Setup
- [ ] App installs successfully from APK or AAB
- [ ] Splash screen displays correctly
- [ ] Age verification screen appears on first launch
- [ ] "Yes, I'm 18+" button works and proceeds
- [ ] "No, I'm under 18" button works and blocks access
- [ ] Age verification persists (doesn't appear on subsequent launches)
- [ ] App reaches main screen after age verification

### Permissions (Android)
- [ ] Camera permission request appears when taking photo
- [ ] Camera permission request text matches AndroidManifest.xml
- [ ] Photo/Media permission request appears when selecting photo
- [ ] Photo permission text matches AndroidManifest.xml
- [ ] Location permission request appears when finding stores (optional)
- [ ] Location permission text matches AndroidManifest.xml
- [ ] App works correctly when camera permission denied
- [ ] App works correctly when photo permission denied
- [ ] App works correctly when location permission denied
- [ ] Permissions can be changed in Android Settings
- [ ] Runtime permissions handled correctly (Android 6.0+)

### Core Functionality
- [ ] **Add Family Member:**
  - [ ] Can add new family member with name
  - [ ] Family member appears in list
  - [ ] Can view family member details
  - [ ] Input validation works (no empty names)
- [ ] **Add Eyeglass Prescription:**
  - [ ] Can create new eyeglass prescription
  - [ ] Can enter all prescription values
  - [ ] Can take photo with camera
  - [ ] Can select photo from library/gallery
  - [ ] Photo displays correctly
  - [ ] Prescription saves successfully
- [ ] **Add Contact Lens Prescription:**
  - [ ] Can create new contact lens prescription
  - [ ] Can enter all required fields
  - [ ] Can add photo
  - [ ] Prescription saves successfully
- [ ] **View Prescription:**
  - [ ] Can open prescription details
  - [ ] All data displays correctly
  - [ ] Photos display at full quality
  - [ ] Can zoom/pan on photo (if supported)
- [ ] **Edit Prescription:**
  - [ ] Can edit existing prescription
  - [ ] Changes save correctly
  - [ ] Can add/change photo
- [ ] **Delete Prescription:**
  - [ ] Can delete prescription
  - [ ] Confirmation dialog appears
  - [ ] Prescription is removed
- [ ] **Share/Print Prescription:**
  - [ ] Share button works
  - [ ] Android share sheet appears
  - [ ] Can share via email, messaging, etc.
  - [ ] Shared content formatted correctly
  - [ ] Photo included in share
- [ ] **Find Stores:**
  - [ ] Store finder accessible
  - [ ] Location permission requested
  - [ ] Nearby stores display
  - [ ] Can view store details

### Data Persistence
- [ ] Data saves after adding prescription
- [ ] Data persists after closing app
- [ ] Data persists after device restart
- [ ] Multiple prescriptions and family members stored correctly
- [ ] Photos persist correctly
- [ ] Age verification persists

### Privacy & Security
- [ ] No data sent to external servers (verify with network monitor)
- [ ] App works in airplane mode (except store finder)
- [ ] No analytics or tracking requests
- [ ] No crash reporting requests
- [ ] Encryption working for stored data
- [ ] No sensitive data in logs

### UI/UX (Android)
- [ ] Navigation works correctly (back button, drawer, etc.)
- [ ] All buttons respond to taps
- [ ] Keyboard appears/dismisses correctly
- [ ] Input fields work properly
- [ ] Scroll views work smoothly
- [ ] Loading indicators appear when appropriate
- [ ] Error messages are clear
- [ ] Success confirmations appear
- [ ] Follows Material Design guidelines
- [ ] Dark theme support (if implemented)
- [ ] Accessibility features work (TalkBack)

### Android Specific Features
- [ ] Back button behavior correct throughout app
- [ ] Hardware back button works (if device has one)
- [ ] Recent apps/multitasking works correctly
- [ ] App icon appears correctly in launcher
- [ ] App name displays correctly
- [ ] Splash screen follows Android 12+ guidelines (if applicable)
- [ ] Photo picker uses Android Photo Picker (Android 13+) if implemented

### Android Device Testing Matrix
Test on at least these devices/Android versions:
- [ ] Phone with Android 7.0 (API 24) - minimum supported
- [ ] Phone with Android 14 (API 34) - target version
- [ ] Phone with latest Android version (15 if available)
- [ ] Tablet (if supporting tablets)
- [ ] Different screen sizes (small, medium, large)
- [ ] Different manufacturers (Samsung, Google, etc.)

---

## Cross-Platform Testing

### Offline Mode
- [ ] App works completely offline (except store finder)
- [ ] No errors when network unavailable
- [ ] All core features functional offline
- [ ] Graceful handling of network unavailable for store finder

### Performance
- [ ] App launches in under 3 seconds
- [ ] Smooth scrolling (60fps)
- [ ] No lag when entering text
- [ ] Photos load quickly
- [ ] No memory leaks (test with long usage session)
- [ ] Battery usage reasonable
- [ ] App size reasonable (under 50MB preferred)

### Edge Cases
- [ ] Handles empty states (no family members, no prescriptions)
- [ ] Handles very long names (50+ characters)
- [ ] Handles special characters in names (ñ, é, etc.)
- [ ] Handles large numbers of prescriptions (20+)
- [ ] Handles large numbers of family members (10+)
- [ ] Handles very old prescription dates (5+ years ago)
- [ ] Handles future prescription dates
- [ ] Handles invalid dates gracefully
- [ ] Handles decimal values in prescription fields
- [ ] Handles negative values where appropriate
- [ ] Handles photos of various sizes (small, large, very large)
- [ ] Handles low storage situations
- [ ] Handles low memory situations
- [ ] Handles interrupted operations (app killed mid-save)

### Accessibility
- [ ] VoiceOver works (iOS) / TalkBack works (Android)
- [ ] All interactive elements have labels
- [ ] Sufficient color contrast
- [ ] Text size scales appropriately
- [ ] Works with system accessibility settings
- [ ] Keyboard navigation works (if applicable)

### Localization (if supporting multiple languages)
- [ ] All text displays correctly in target languages
- [ ] Date formatting correct for locale
- [ ] Number formatting correct for locale
- [ ] RTL languages work correctly (if supported)
- [ ] No truncated text in any language

---

## Build Verification

### iOS Build Checks
- [ ] **Xcode Organizer Validation:**
  - [ ] Archive built successfully
  - [ ] No build warnings
  - [ ] Validate app passes all checks
  - [ ] Privacy Manifest included
  - [ ] No App Store Connect upload errors
- [ ] **Build Configuration:**
  - [ ] Production build (not development)
  - [ ] Correct bundle identifier
  - [ ] Correct version number and build number
  - [ ] All required icons present (1024x1024 and all sizes)
  - [ ] Launch screen configured
  - [ ] Info.plist correct (all permission descriptions)
- [ ] **App Store Connect:**
  - [ ] Build appears in TestFlight
  - [ ] TestFlight build installs on device
  - [ ] No missing compliance information
  - [ ] Export compliance set correctly (usesNonExemptEncryption = false)

### Android Build Checks
- [ ] **EAS Build Validation:**
  - [ ] AAB/APK built successfully
  - [ ] No build warnings or errors
  - [ ] Signed with correct keystore
  - [ ] ProGuard/R8 not breaking functionality (if using)
- [ ] **Build Configuration:**
  - [ ] Production build
  - [ ] Correct package name
  - [ ] Correct version code and version name
  - [ ] Target SDK 34 (Android 14)
  - [ ] Minimum SDK 24 (Android 7.0)
  - [ ] All required icons present (512x512 and all sizes)
  - [ ] AndroidManifest.xml correct
- [ ] **Google Play Console:**
  - [ ] Build uploads successfully
  - [ ] Internal testing track works
  - [ ] No pre-launch report errors
  - [ ] App bundle optimized

---

## App Store Readiness

### Metadata Complete
- [ ] App name set correctly
- [ ] App subtitle (iOS) / Short description (Android)
- [ ] Full description written
- [ ] Keywords set (iOS) / Tags selected (Android)
- [ ] Screenshots uploaded (2-8 per platform/size)
- [ ] App icon uploaded (1024x1024 for iOS, 512x512 for Android)
- [ ] Privacy policy URL set
- [ ] Support URL set (if different from privacy policy)
- [ ] Marketing URL set (optional)
- [ ] Promotional text set (iOS)

### Store Compliance
- [ ] **Age Rating Completed:**
  - [ ] iOS: Rated 4+ (no objectionable content)
  - [ ] Android: Rated Everyone
  - [ ] Age verification (18+) explained in review notes
- [ ] **Privacy Information:**
  - [ ] Data collection practices declared (none for this app)
  - [ ] Third-party data sharing declared (none)
  - [ ] Data Safety form completed (Android)
  - [ ] Privacy Nutrition Labels completed (iOS)
- [ ] **Content Rights:**
  - [ ] No copyrighted content used without permission
  - [ ] All images and assets original or properly licensed
  - [ ] No trademark violations
- [ ] **App Review Information:**
  - [ ] Contact information provided
  - [ ] Review notes added (see app-review-notes.md)
  - [ ] Demo account info (N/A - no login required)
  - [ ] Special instructions for age verification included

### Legal & Compliance
- [ ] Privacy policy URL live and accessible
- [ ] Privacy policy accurate and complete
- [ ] Support email active (support@opticalrxnow.com)
- [ ] Terms of service (if required)
- [ ] COPPA compliant (age verification, no data collection)
- [ ] CCPA compliant (local storage only)
- [ ] GDPR compliant (local storage only)
- [ ] Medical disclaimer clear and visible

---

## Final Checks Before Submission

### Documentation
- [ ] README.md updated with submission info
- [ ] All documentation files reviewed
- [ ] Links in documentation verified (privacy policy, support email)
- [ ] Version numbers consistent across all files

### Quality Assurance
- [ ] No placeholder text in app
- [ ] No "TODO" or "FIXME" comments in user-visible areas
- [ ] No debug logs or console.log in production
- [ ] All features working as documented
- [ ] No known critical bugs
- [ ] Performance acceptable on minimum spec devices

### Team Alignment
- [ ] Developer has reviewed submission
- [ ] Designer has approved screenshots and visuals
- [ ] Legal has approved privacy policy and disclaimers
- [ ] Support email is monitored and ready
- [ ] Team prepared to respond to review questions

### Submission Package
- [ ] All required screenshots created and uploaded
- [ ] App icon uploaded in all required sizes
- [ ] Build uploaded and processed
- [ ] All metadata fields completed
- [ ] Age rating questionnaire completed
- [ ] Privacy questionnaire completed
- [ ] Review notes comprehensive and clear
- [ ] Contact information up to date

---

## Post-Submission Monitoring

### After Submitting to Review
- [ ] Monitor App Store Connect / Play Console for status updates
- [ ] Check support email daily for reviewer questions
- [ ] Be prepared to respond within 24 hours
- [ ] Have team available for urgent fixes if needed
- [ ] Monitor for rejection reasons (if applicable)

### If Rejected
- [ ] Read rejection reason carefully
- [ ] Address all issues mentioned
- [ ] Test fixes thoroughly
- [ ] Submit updated build
- [ ] Respond to reviewer in Resolution Center
- [ ] Update review notes if necessary

### When Approved
- [ ] Verify app appears in store correctly
- [ ] Test download from App Store / Play Store
- [ ] Verify all metadata displays correctly
- [ ] Monitor reviews and ratings
- [ ] Respond to user feedback
- [ ] Plan for updates and improvements

---

## Testing Sign-Off

**Tested By:** ___________________________  
**Date:** ___________________________  
**iOS Version Tested:** ___________________________  
**Android Version Tested:** ___________________________  
**Devices Tested:** ___________________________  

**Critical Issues Found:** ___________________________  
**Status:** ☐ Ready for Submission  ☐ Not Ready (Issues to Fix)

---

**Notes:**

_Use this space to document any issues found during testing, workarounds, or special considerations for reviewers._

---

**Last Updated:** February 4, 2026  
**Version:** 1.0
