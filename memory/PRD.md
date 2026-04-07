# Optical Rx Now - Product Requirements Document

## Original Problem Statement
Build a mobile app (React Native/Expo) for managing optical prescriptions. The app must:
- Be free, monetized through affiliate marketing and banner ads
- Be HIPAA compliant with all data stored locally on device (no backend communication)
- Allow users to manage family members and their prescriptions
- Send notifications before prescriptions expire
- Allow sharing/printing prescriptions as PDF

## User Personas
- Primary: Adults managing their own and family members' optical prescriptions
- Secondary: Parents tracking children's prescriptions, caregivers for elderly

## Core Requirements
1. **Family Management**: Add, view, delete family members
2. **Prescription Management**: Add, view, delete prescriptions with photos
3. **Manual Expiration Entry**: Users manually enter expiration dates (OCR removed per user request)
4. **PDF Generation**: Share/print prescriptions as PDF with embedded images
5. **Notifications**: Customizable reminders before expiry
6. **HIPAA Compliance**: 100% on-device storage, no cloud communication
7. **Affiliate Shop**: Links to optical retailers with location-based search
8. **Vision Tips & FAQ**: Educational content for users

## Technical Stack
- **Framework**: React Native with Expo SDK 54
- **Routing**: expo-router (file-based)
- **Storage**: AsyncStorage + FileSystem for images
- **Build**: Expo Application Services (EAS)

## What's Been Implemented

### Completed Features (Dec 2025)
- ✅ Family member CRUD operations with delete confirmation modal
- ✅ Prescription CRUD with image capture/gallery import
- ✅ Manual expiration date entry (required field)
- ✅ PDF generation with embedded prescription images
- ✅ Print functionality
- ✅ Share PDF functionality
- ✅ Customizable expiry notifications (30, 14, 7, 2, 0 days)
- ✅ Separate "Add Glasses Rx" and "Add Contacts Rx" buttons
- ✅ Admin panel for affiliate management
- ✅ Analytics dashboard (local tracking)
- ✅ Location-based retail store search
- ✅ Delete buttons for family members and prescriptions
- ✅ Age verification screen
- ✅ HIPAA-compliant local storage
- ✅ Dynamic onboarding walkthrough
- ✅ Privacy Policy and Terms of Service pages
- ✅ Feedback submission (via email)
- ✅ ASO service with smart rate-app prompts
- ✅ Vision Care Tips & FAQ section
- ✅ UI tooltips/hints on key screens (add-rx, add-member)

### Recent Changes (Dec 2025)
- ✅ Added "Vision Care Tips & FAQ" button to welcome screen
- ✅ Added helpful tooltips to add-member screen
- ✅ Enhanced tips section in add-rx screen with icons
- ✅ Removed unused `@react-native-ml-kit/text-recognition` dependency
- ✅ Cleaned up ocrService.ts (now only date formatting utilities)

## File Structure
```
/app/frontend_expo/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home/Dashboard
│   │   ├── family.tsx         # Family members list with delete
│   │   └── ...
│   ├── rx-detail.tsx          # View/share/print/delete prescription
│   ├── add-rx.tsx             # Add new prescription with tooltips
│   ├── add-member.tsx         # Add family member with tooltips
│   ├── admin.tsx              # Admin panel
│   ├── shop.tsx               # Affiliate shop
│   ├── vision-tips.tsx        # Vision care tips & FAQ
│   ├── onboarding.tsx         # Dynamic onboarding
│   ├── privacy-policy.tsx     # Privacy policy
│   ├── terms-of-service.tsx   # Terms of service
│   ├── feedback.tsx           # Feedback form
│   └── ...
├── services/
│   ├── localStorage.ts        # All data storage operations
│   ├── ocrService.ts          # Date formatting utilities (OCR removed)
│   ├── asoService.ts          # ASO & rate prompts
│   ├── analytics.ts           # Local analytics
│   └── dateUtils.ts           # Date formatting utilities
├── app.json                   # Expo configuration
├── eas.json                   # EAS build configuration
└── package.json               # Dependencies
```

## Prioritized Backlog

### P0 (Critical) - All Complete
- [x] Fix PDF sharing with images
- [x] Fix delete family member functionality
- [x] Fix app stability issues
- [x] Production builds for Play Store & App Store

### P1 (High Priority)
- [ ] Integrate Google AdMob for banner ads (user deferred)

### P2 (Medium Priority)
- [x] Vision Care Tips & FAQ section
- [x] UI tooltips/hints for first-time users
- [x] Cleanup unused OCR dependency

### P3 (Future)
- [ ] Multiple prescription images per Rx
- [ ] Prescription history/versioning
- [ ] Export all data feature
- [ ] Dark/light theme toggle

## Build Instructions
```bash
# Navigate to frontend_expo folder
cd frontend_expo

# Install dependencies
npm install --legacy-peer-deps

# Build Android APK
eas build --platform android --profile preview

# Build iOS
eas build --platform ios --profile preview
```

## Notes
- OCR functionality was removed per user request - users now manually enter expiration dates
- App identifiers: `com.opticalrxnow.mobile.v2` (both Android and iOS)
- User is on Windows - always provide Windows CMD compatible commands
