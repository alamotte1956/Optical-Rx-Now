# My Optical Wallet - Product Requirements Document

## Original Problem Statement
Build a deployable mobile app (Android + iOS) for storing eyeglass and contact lens prescriptions offline on-device. The app must comply with Google Play and Apple App Store policies.

## App Identity
- **Name:** My Optical Wallet
- **Package (Android):** com.opticalrxnow.mobile.v1
- **Bundle ID (iOS):** com.opticalrxnow.mobile.v1
- **Owner:** alamotte1956
- **Contact:** alamotte1956@gmail.com
- **Website:** MyOpticalWallet.com

## Architecture
- **Framework:** React Native (Expo SDK 53, RN 0.79.6)
- **Storage (Optical Documents):** 100% offline, AsyncStorage (local-only)
- **Storage (Admin/Business):** FastAPI backend + MongoDB (for affiliates, banners, invoices, analytics)
- **Build System:** EAS Build (cloud)
- **Deployment:** Google Play Store + Apple App Store

## Core Features (Implemented)
- Store eyeglass and contact lens prescription photos
- Family member management
- Prescription expiration tracking & reminders
- Photo capture via camera or gallery (Android Photo Picker)
- Age verification gate
- Privacy Policy & Terms of Service (in-app)
- Admin area (long-press logo access)
- Share app functionality
- Find Retail Optical Stores
- Responsive layout for all device sizes (iPhone SE through Max, all Android)

## Compliance
- No broad media permissions (READ_MEDIA_IMAGES blocked)
- NSPrivacyAccessedAPITypes declared for iOS
- Health Apps Declaration: "No health features"
- App Category: Productivity/Tools
- Privacy Policy URL: MyOpticalWallet.com/privacy
- Xcode 26.2 build image for iOS 26 SDK compliance

## Current Version
- **Version:** 1.0.2
- **Android versionCode:** auto-increment (currently ~9+)
- **iOS buildNumber:** auto-increment
- **EAS iOS Image:** macos-sequoia-15.6-xcode-26.2

## What's Been Accomplished
- [x] Full app functionality (offline prescription storage)
- [x] Google Play Store approved and published
- [x] Apple App Store submitted
- [x] All tester feedback implemented (Privacy, ToS, Tooltips, Onboarding)
- [x] Name change to "My Optical Wallet"
- [x] New logo applied
- [x] Responsive formatting for all devices
- [x] Admin analytics links (App Store Connect + Play Console)
- [x] Media permissions fully stripped
- [x] Edge-to-edge and orientation warnings addressed
- [x] Admin Panel connected to FastAPI backend with full CRUD for:
  - Analytics Dashboard (app opens, shares, clicks, banner performance)
  - Financial Overview (revenue, commission potential, invoice summary)
  - Affiliate Management (create, edit, toggle, delete, seed defaults)
  - Banner Management (create, edit, schedule, toggle, delete)
  - Invoicing (create, edit status cycle, delete)
  - App Management (store links)
  - Data Management (clear data, reset verification)

## Upcoming Tasks
- [ ] P0: Multi-language support (Spanish, French, Chinese Simplified) with auto-detect + manual override
- [ ] P1: Verify Google Play production rollout
- [ ] P1: Verify Apple App Store review approval

## Backlog
- [ ] Backup & Restore (Google Drive/iCloud)
- [ ] Prescription Photo Zoom & Crop
- [ ] Export all prescriptions to PDF
- [ ] Search & Filter prescriptions
- [ ] Expiration Countdown Widget
- [ ] Dark/Light Mode Toggle
- [ ] Share Prescription with Doctor
