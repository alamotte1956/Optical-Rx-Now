# App Review Notes for Optical Rx Now

**Important information for Apple App Store and Google Play Store reviewers**

---

## App Information

**App Name:** Optical Rx Now
**Version:** 1.0.0
**Category:** Medical / Health & Fitness
**Age Rating:** 4+ (iOS) / Everyone (Android)
**Age Verification:** Required (18+) on first launch
**Bundle ID (iOS):** com.alamotte.opticalrxnow
**Package Name (Android):** com.alamotte.opticalrxnow

---

## Age Verification Instructions

**IMPORTANT:** The app requires age verification on first launch.

### How to Proceed:
1. Launch the app for the first time
2. You will see an age verification screen
3. **Select "Yes, I'm 18+" to proceed** (required for testing)
4. This is a one-time verification that persists for the lifetime of the app installation

### Why Age Verification is Required:
The app stores medical information (optical prescriptions), and we require users to be 18+ to ensure they have the legal capacity to manage their own medical data and the medical data of their family members.

---

## Test Account Information

**NOT REQUIRED** - The app does not require login or account creation.

All features are immediately accessible after completing age verification. No authentication, no server, no account needed.

---

## Key Features to Test

### 1. Add a Family Member
1. Tap "Add Family Member" or "+" button
2. Enter a name (e.g., "John Doe")
3. Tap "Save"
4. Family member appears in the list

### 2. Add an Eyeglass Prescription
1. Select a family member
2. Tap "Add Prescription"
3. Select "Eyeglasses"
4. Fill in prescription details (OD/OS values)
5. Optionally add a photo (camera or library)
6. Tap "Save"
7. Prescription appears in the list

### 3. Add a Contact Lens Prescription
1. Select a family member
2. Tap "Add Prescription"
3. Select "Contact Lenses"
4. Fill in prescription details (base curve, diameter, power)
5. Optionally add a photo
6. Tap "Save"
7. Prescription appears in the list

### 4. View Prescription Details
1. Tap on any prescription in the list
2. View all prescription information
3. View prescription image (if added)
4. Check prescription date and expiration

### 5. Share or Print Prescription
1. Open a prescription
2. Tap "Share" or "Print" button
3. Select sharing method (email, messages, etc.)
4. Prescription information is formatted for sharing

### 6. Find Nearby Stores (Optional - requires location permission)
1. Navigate to "Find Stores" or store finder feature
2. Grant location permission when prompted (optional)
3. See list of nearby optical retailers
4. You can deny location permission - this feature is optional

---

## Privacy & Data Handling

**CRITICAL INFORMATION FOR REVIEWERS:**

### Local Storage Only
- **ALL data is stored locally on the device**
- **NO backend servers or databases**
- **NO cloud synchronization**
- **NO data transmission to external servers**
- **NO third-party services**

### What We Do NOT Do:
- ❌ No data collection
- ❌ No user tracking
- ❌ No analytics services
- ❌ No advertising networks
- ❌ No crash reporting services
- ❌ No cloud storage
- ❌ No user accounts or authentication
- ❌ No server-side storage

### Data Storage Method:
- **AsyncStorage** for prescription metadata (local SQLite database)
- **Device file system** for prescription images (base64 encoded, encrypted)
- **AES-256 encryption** for stored data
- **Device security** (PIN/biometrics) protects all data

### Data Deletion:
- Users can delete individual prescriptions within the app
- Users can delete family members and all associated prescriptions
- Uninstalling the app removes all data from the device
- No data remains on any server because none exists

---

## Permissions Usage

### Camera (iOS: NSCameraUsageDescription / Android: CAMERA)
**Purpose:** Take photos of physical prescription documents
**When Used:** Only when user taps "Take Photo" button
**Data Handling:** Photos are stored locally on device, never uploaded

### Photo Library (iOS: NSPhotoLibraryUsageDescription / Android: READ_MEDIA_IMAGES)
**Purpose:** Select existing prescription photos from device
**When Used:** Only when user taps "Choose Photo" button
**Data Handling:** Selected photos are copied locally, never uploaded

### Location (iOS: NSLocationWhenInUseUsageDescription / Android: ACCESS_FINE_LOCATION)
**Purpose:** Find nearby optical stores (Sam's Club, LensCrafters, etc.)
**When Used:** Only when user opens "Find Stores" feature
**Data Handling:** Location used momentarily for search, not stored or transmitted
**Optional:** User can deny permission and still use all other features

---

## Privacy Manifest Details (iOS)

**Tracking:** None
**Data Collection:** None
**Data Types:** None (all data local only)

### Required Reason APIs Used:
The app uses AsyncStorage (UserDefaults) for local data storage:
- **Reason Code:** CA92.1 - Access info from same app
- **Purpose:** Store prescription data locally on device
- **No data leaves the device**

### File Timestamp APIs:
Used for prescription date tracking:
- **Reason Code:** C617.1 - Display file timestamps to user
- **Purpose:** Show prescription creation and expiration dates

---

## Platform Compliance

### iOS Requirements
- **Minimum iOS Version:** 15.1+
- **Target iOS Version:** 17.0+
- **Deployment Target:** iOS 15.1
- **Privacy Manifest:** Included in build (PrivacyInfo.xcprivacy)
- **Encryption:** usesNonExemptEncryption = false (no custom encryption algorithms)

### Android Requirements
- **Minimum SDK:** 24 (Android 7.0)
- **Target SDK:** 34 (Android 14)
- **Compile SDK:** 34
- **Permissions:** CAMERA, READ_MEDIA_IMAGES, ACCESS_FINE_LOCATION (all optional except camera)

---

## COPPA Compliance

The app complies with Children's Online Privacy Protection Act (COPPA):
- Age verification required (18+)
- No data collection from users of any age
- All data stored locally on device
- No transmission of personal information
- Parental consent not required because no data is collected

---

## Medical Disclaimer

**NOT A MEDICAL DEVICE**

Optical Rx Now is for storing and organizing prescription information only. The app:
- Does NOT provide medical advice, diagnosis, or treatment
- Is NOT a substitute for professional eye care
- Is NOT regulated as a medical device
- Does NOT validate prescription accuracy

Users are responsible for:
- Accurately entering prescription data
- Consulting qualified eye care professionals for medical advice
- Verifying prescription information with their doctor

---

## Privacy Policy

**URL:** https://opticalrxnow.com/privacy

The privacy policy is hosted on GitHub Pages and is publicly accessible. It details:
- Local-only data storage
- No data collection or transmission
- Device permissions usage
- User rights and data deletion
- Compliance with COPPA, CCPA, GDPR

---

## Support Contact

**Email:** support@opticalrxnow.com
**Response Time:** Within 48 hours
**Support Hours:** Monday-Friday, 9 AM - 5 PM PST

For review-related questions, please contact support@opticalrxnow.com with "APP REVIEW" in the subject line.

---

## Common Review Questions

### Q: Why does the app need camera access?
A: To take photos of physical prescription documents. Users can also manually enter prescription data without using the camera.

### Q: Why does the app need location access?
A: To find nearby optical stores. This feature is completely optional - users can deny location permission and still use all prescription management features.

### Q: Where is the user data stored?
A: 100% locally on the user's device using AsyncStorage (SQLite) and the device file system. No data ever leaves the device.

### Q: How is data backed up?
A: Data is NOT backed up to any cloud service. Users are responsible for their device backups (iCloud/Google backup may back up app data as part of device backup).

### Q: Is the app HIPAA compliant?
A: The app is not a HIPAA-covered entity because it does not transmit Protected Health Information (PHI). All data stays on the user's device.

### Q: Can users export their data?
A: Yes, users can share/print individual prescriptions via email, messaging, or other sharing methods supported by the OS.

### Q: What happens when the app is uninstalled?
A: All data is permanently deleted from the device. There is no server-side backup.

---

## Testing Notes

### Recommended Test Flow:
1. ✅ Complete age verification (select "Yes, I'm 18+")
2. ✅ Add a family member
3. ✅ Add an eyeglass prescription with photo
4. ✅ Add a contact lens prescription
5. ✅ View prescription details
6. ✅ Share a prescription
7. ✅ Delete a prescription
8. ✅ Find nearby stores (optional location permission)
9. ✅ Close app and reopen (verify data persists)
10. ✅ Deny location permission (verify app still works)

### Expected Behavior:
- App works completely offline
- All data persists between app launches
- Location permission can be denied without affecting core features
- Camera permission required only for photo capture
- No network requests to external servers

---

## Build Information

### iOS Build
- Built with Expo (React Native)
- EAS Build production profile
- Bundle identifier: com.alamotte.opticalrxnow
- Provisioning: App Store distribution

### Android Build
- Built with Expo (React Native)
- EAS Build production profile
- Package name: com.alamotte.opticalrxnow
- Signing: Google Play signing

---

## Additional Notes for Reviewers

1. **First Launch:** Age verification is required and only shown once
2. **No Login:** No authentication or account creation required
3. **Offline First:** App works without internet connection
4. **Privacy Focus:** Zero data collection, zero tracking, zero analytics
5. **Family Friendly:** Despite 18+ verification, app can store prescriptions for family members of all ages
6. **Medical Disclaimer:** Clearly stated that app is not for medical advice

---

**Review Version:** 1.0.0
**Last Updated:** February 4, 2026
**Submission Date:** TBD

Thank you for reviewing Optical Rx Now! 👓
