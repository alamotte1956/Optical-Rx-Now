# App Review Notes

Important information for App Store and Google Play reviewers.

---

## App Information

- **App Name:** Optical Rx Now
- **Version:** 1.0.0
- **Category:** Medical
- **Age Rating:** 17+ (iOS) / Teen (Android)
- **Privacy Policy:** https://opticalrxnow.com/privacy
- **Support Email:** support@opticalrxnow.com
- **Website:** https://opticalrxnow.com

---

## Age Verification Instructions

On the first launch of the app, you will see an age verification screen:

1. The screen displays: "You must be 18 years or older to use this app"
2. **Select "Yes, I'm 18+" to proceed**
3. This is a one-time verification that persists for future app launches
4. Age verification is required due to medical information storage

---

## Test Account Information

**NOT REQUIRED** - This app does not require login or account creation.

All functionality is available immediately after age verification. No authentication or registration is needed.

---

## Key Features to Test

### 1. Add Family Member
- Tap "Add Family Member" button
- Enter name and relationship
- Save the family member

### 2. Add Prescription (Eyeglass)
- Select a family member
- Tap "Add Prescription"
- Choose "Eyeglass"
- Enter prescription details (OD, OS, PD)
- Optionally add a photo (camera or photo library)
- Save the prescription

### 3. Add Prescription (Contact Lens)
- Select a family member
- Tap "Add Prescription"
- Choose "Contact Lens"
- Enter prescription details
- Save the prescription

### 4. View Prescription
- Tap on any prescription to view details
- View prescription photo if added
- Check prescription date and expiration

### 5. Share/Print Prescription
- Open a prescription
- Tap the share button
- Choose sharing method (email, messaging, etc.)

### 6. Find Stores (Optional Location Access)
- Navigate to Store Finder
- If prompted, allow location access (optional)
- View nearby optical stores on map
- Tap on store for details

---

## Privacy & Data Handling

### Local Storage Only
- **All data stored locally** on the device using AsyncStorage and file system
- **No backend servers** - the app is 100% offline-capable
- **No cloud sync** - data never transmitted to any server
- **No tracking/analytics** - no third-party SDKs for tracking
- **AES-256 encryption** - prescription images encrypted at rest

### No Data Collection
- No personal data is collected by the developer
- No usage analytics or crash reporting
- No advertising networks
- No third-party data sharing

---

## Permissions Usage

### Camera (Required for Photo Capture)
**Purpose:** Take photos of prescription documents
- Used when user taps "Add Photo" and selects "Take Photo"
- Only activated when explicitly requested by user
- Photos are stored locally and encrypted

### Photo Library (Required for Photo Selection)
**Purpose:** Select existing photos of prescriptions
- Used when user taps "Add Photo" and selects "Choose from Library"
- Only activated when explicitly requested by user
- Photos are copied locally and encrypted

### Location (Optional)
**Purpose:** Find nearby optical stores
- Only used in Store Finder feature
- Completely optional - app works without location access
- User can deny permission and manually search by city/zip code
- No location tracking or history stored

---

## Privacy Manifest Details (iOS)

### No Tracking
- `NSPrivacyTracking` = `false`
- No third-party analytics or advertising SDKs
- No user tracking across apps or websites

### No Data Collection
- `NSPrivacyCollectedDataTypes` = `[]` (empty array)
- Zero data collected or transmitted

### Local Storage Only
- **AsyncStorage** used for prescription metadata (JSON)
- **File System** used for encrypted prescription images
- All data remains on device

### Required API Usage
The following required reason APIs are used:

1. **UserDefaults API** (`NSPrivacyAccessedAPICategoryUserDefaults`)
   - **Reason Code:** CA92.1
   - **Purpose:** Store age verification preference
   - **Justification:** One-time storage of user's age verification status

2. **File Timestamp API** (`NSPrivacyAccessedAPICategoryFileTimestamp`)
   - **Reason Code:** C617.1
   - **Purpose:** Display prescription creation dates
   - **Justification:** Show when prescriptions were added for user reference

---

## Platform Compliance

### iOS Requirements
- **Deployment Target:** iOS 15.1+
- **Privacy Manifest:** Included in bundle (`PrivacyInfo.xcprivacy`)
- **Required Device Capabilities:** `armv7`
- **App Transport Security:** Configured for HTTPS only

### Android Requirements
- **Target SDK:** 34 (Android 14)
- **Minimum SDK:** 24 (Android 7.0)
- **Permissions:** Camera, Read External Storage (for photo picker)
- **Data Safety:** Completed with "No data shared with third parties"

---

## Medical Disclaimer

**Important:** Optical Rx Now is for storing and organizing prescription information only. It is NOT intended to:
- Provide medical advice
- Diagnose medical conditions
- Provide medical treatment
- Replace professional eye care

Always consult with a qualified eye care professional (optometrist or ophthalmologist) for medical advice, diagnosis, or treatment.

---

## Compliance & Regulations

### COPPA Compliance
- Age verification (18+) prevents use by children under 13
- No data collection from users of any age

### HIPAA
- NOT a HIPAA-covered entity
- No PHI stored on servers (all local)
- User is custodian of their own data

### GDPR/CCPA Compliance
- No data collection = automatic compliance
- No data transmitted to any servers
- User has full control and can delete all data

---

## Testing Recommendations

1. **Initial Launch:** Verify age gate appears and works correctly
2. **Permissions:** Test camera and photo library when adding prescription photos
3. **Core Features:** Add family members, prescriptions, view, share
4. **Data Persistence:** Close app and reopen to verify data is saved
5. **Offline Mode:** Test with airplane mode enabled
6. **Privacy:** Verify no network requests (use network monitoring tools)

---

## Expected User Experience

### First-Time User Flow
1. App launches → Splash screen
2. Age verification screen appears
3. User confirms 18+ → Proceeds to app
4. Empty state with "Add Family Member" prompt
5. User adds family member
6. User adds prescription with photo
7. User can view, share, and manage prescriptions

### Returning User Flow
1. App launches → Splash screen
2. Age verification already confirmed → Direct to main screen
3. Existing family members and prescriptions displayed
4. User can add more or manage existing data

---

## Support Contact

- **Email:** support@opticalrxnow.com
- **Response Time:** Within 48 hours
- **Privacy Policy:** https://opticalrxnow.com/privacy
- **Website:** https://opticalrxnow.com

---

## Additional Notes

- The app works completely offline
- No internet connection required for core functionality
- Store finder requires internet for map data
- All user data can be deleted by uninstalling the app
- No backup or restore functionality (by design for privacy)

Thank you for reviewing Optical Rx Now!
