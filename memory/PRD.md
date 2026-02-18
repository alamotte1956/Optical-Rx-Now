# Optical Rx Now - Product Requirements Document

## Original Problem Statement
Build a mobile app (React Native/Expo) for managing optical prescriptions. The app must:
- Be free, monetized through affiliate marketing and banner ads
- Be HIPAA compliant with all data stored locally on device (no backend communication)
- Allow users to manage family members and their prescriptions
- Automatically read prescription expiration dates from photos using on-device OCR
- Send notifications before prescriptions expire
- Allow sharing/printing prescriptions as PDF

## User Personas
- Primary: Adults managing their own and family members' optical prescriptions
- Secondary: Parents tracking children's prescriptions, caregivers for elderly

## Core Requirements
1. **Family Management**: Add, view, delete family members
2. **Prescription Management**: Add, view, delete prescriptions with photos
3. **OCR Detection**: On-device text recognition to auto-detect expiration dates
4. **PDF Generation**: Share/print prescriptions as PDF with embedded images
5. **Notifications**: Reminders at 30, 14, 7, 2, and 0 days before expiry
6. **HIPAA Compliance**: 100% on-device storage, no cloud communication
7. **Affiliate Shop**: Links to optical retailers with location-based search

## Technical Stack
- **Framework**: React Native with Expo SDK 54
- **Routing**: expo-router (file-based)
- **Storage**: AsyncStorage + FileSystem for images
- **OCR**: @react-native-ml-kit/text-recognition (on-device)
- **Build**: Expo Application Services (EAS)

## What's Been Implemented (Feb 2026)

### Completed Features
- ✅ Family member CRUD operations with delete confirmation modal
- ✅ Prescription CRUD with image capture/gallery import
- ✅ On-device OCR for expiration date detection
- ✅ Manual expiration date entry (required field)
- ✅ PDF generation with embedded prescription images
- ✅ Print functionality
- ✅ Share PDF functionality
- ✅ Expiry notifications scheduling
- ✅ Separate "Add Glasses Rx" and "Add Contacts Rx" buttons
- ✅ Admin panel for affiliate management
- ✅ Analytics dashboard (local tracking)
- ✅ Location-based retail store search
- ✅ Delete buttons for family members and prescriptions
- ✅ Age verification screen
- ✅ HIPAA-compliant local storage

### Bug Fixes Applied (Latest)
- Fixed PDF/print not showing images (added base64 conversion)
- Fixed delete family member not working (proper cleanup of associated prescriptions)
- Fixed app crashes when viewing prescriptions (null safety checks)
- Fixed app.json configuration issues (androidStatusBar placement, splash colors)
- Fixed dependency version mismatches for EAS build
- Added react-native-worklets for reanimated compatibility

## File Structure
```
/app/frontend_expo/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── family.tsx     # Family members list with delete
│   │   └── ...
│   ├── rx-detail.tsx      # View/share/print/delete prescription
│   ├── add-rx.tsx         # Add new prescription
│   ├── add-member.tsx     # Add family member
│   ├── admin.tsx          # Admin panel
│   ├── shop.tsx           # Affiliate shop
│   └── ...
├── services/
│   ├── localStorage.ts    # All data storage operations
│   ├── ocrService.ts      # On-device OCR
│   ├── analytics.ts       # Local analytics
│   └── dateUtils.ts       # Date formatting utilities
├── app.json               # Expo configuration
├── eas.json               # EAS build configuration
└── package.json           # Dependencies
```

## Prioritized Backlog

### P0 (Critical)
- [x] Fix PDF sharing with images
- [x] Fix delete family member functionality
- [x] Fix app stability issues

### P1 (High Priority)
- [ ] Integrate Google AdMob for banner ads
- [ ] iOS build and testing
- [ ] App store submission preparation

### P2 (Medium Priority)
- [ ] Add HIPAA compliance notice in settings
- [ ] Enhanced error messages for users
- [ ] Offline indicator

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

## Next Steps
1. User to clone fresh from GitHub
2. Run `npm install --legacy-peer-deps`
3. Build APK: `eas build --platform android --profile preview`
4. Test all functionality on device
5. Report any remaining issues
