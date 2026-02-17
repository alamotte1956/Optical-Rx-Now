# App Store Deployment Guide for Optical Rx Now

## Overview
Your Expo/React Native app is ready for deployment to both Apple App Store and Google Play Store using **EAS Build** (Expo Application Services).

## Prerequisites

### 1. Expo Account
- Create an account at [expo.dev](https://expo.dev)
- Install EAS CLI: `npm install -g eas-cli`
- Login: `eas login`

### 2. Apple Developer Account (for iOS)
- Cost: $99/year
- Register at [developer.apple.com](https://developer.apple.com)
- Required for App Store submission

### 3. Google Play Developer Account (for Android)
- One-time fee: $25
- Register at [play.google.com/console](https://play.google.com/console)
- Required for Play Store submission

---

## Step-by-Step Deployment

### Step 1: Configure Your Project

Your `app.json` is already configured with:
- ✅ `bundleIdentifier` (iOS): `com.opticalrxnow.app`
- ✅ `package` (Android): `com.opticalrxnow.app`
- ✅ App icons and splash screens
- ✅ Required permissions

### Step 2: Link to Expo Project

```bash
cd frontend_expo
eas init --id your-project-id
```

Or update `app.json` > `expo.extra.eas.projectId` with your actual Expo project ID.

### Step 3: Build for Production

#### iOS Build (App Store)
```bash
# First time - configure credentials
eas credentials

# Build for App Store
eas build --platform ios --profile production
```

#### Android Build (Play Store)
```bash
# Build AAB for Play Store
eas build --platform android --profile production
```

### Step 4: Submit to Stores

#### iOS - App Store Connect
```bash
# Submit to App Store (requires Apple Developer credentials)
eas submit --platform ios --latest
```

Or manually:
1. Download the `.ipa` from [expo.dev](https://expo.dev)
2. Use **Transporter** app (Mac) to upload to App Store Connect
3. Complete app listing in App Store Connect

#### Android - Google Play Console
```bash
# Submit to Play Store (requires service account key)
eas submit --platform android --latest
```

Or manually:
1. Download the `.aab` from [expo.dev](https://expo.dev)
2. Upload to Google Play Console > Production

---

## App Store Listing Requirements

### iOS App Store
- **App Name**: Optical Rx Now
- **Description**: Store and manage your family's eyeglass and contact lens prescriptions
- **Category**: Health & Fitness or Medical
- **Age Rating**: 4+ (no mature content)
- **Screenshots**: 
  - iPhone 6.7" (1290 × 2796)
  - iPhone 6.5" (1242 × 2688)
  - iPad Pro 12.9" (2048 × 2732)
- **Privacy Policy URL**: Required - host on your website
- **Support URL**: support@OpticalRxNow.com

### Google Play Store
- **App Name**: Optical Rx Now
- **Short Description** (80 chars): Store & manage your family's eyeglass & contact lens prescriptions
- **Full Description**: (up to 4000 chars)
- **Category**: Health & Fitness or Medical
- **Content Rating**: Everyone
- **Screenshots**:
  - Phone (min 2 screenshots)
  - Tablet (optional)
- **Feature Graphic**: 1024 × 500
- **Privacy Policy URL**: Required

---

## Privacy Policy Requirements

Create a privacy policy that covers:
1. **Data Collection**: Local device storage only (no server data)
2. **Permissions Used**:
   - Camera: To photograph prescriptions
   - Photo Library: To import existing prescription images
   - Location: To find nearby optical stores
   - Notifications: For prescription expiry reminders
3. **Data Storage**: All data stored locally on user's device
4. **Third-Party Services**: None (data stays on device)
5. **HIPAA Disclaimer**: Not a substitute for medical records

---

## Common Commands

```bash
# Check EAS configuration
eas config

# Build preview (internal testing)
eas build --platform all --profile preview

# Build production
eas build --platform all --profile production

# Check build status
eas build:list

# Submit latest build
eas submit --platform ios --latest
eas submit --platform android --latest

# Update OTA (Over-The-Air)
eas update --branch production --message "Bug fixes"
```

---

## Testing Before Submission

### iOS TestFlight
1. Build with `eas build --platform ios --profile production`
2. Submit to App Store Connect
3. Distribute via TestFlight for beta testing

### Android Internal Testing
1. Build with `eas build --platform android --profile preview` (APK)
2. Or use Internal Testing track in Play Console

---

## Estimated Timeline

1. **Account Setup**: 1-2 days
2. **Build Process**: 15-30 minutes per platform
3. **App Store Review**: 1-3 days (iOS), 1-7 days (Android)

---

## Support

- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction
- EAS Submit: https://docs.expo.dev/submit/introduction
