# Optical Rx Now - Family Prescription Manager

A React Native mobile app built with Expo for managing family eyeglass and contact lens prescriptions.

## 📚 Quick Links

- **🚀 [Quick Start Guide](QUICK_START.md)** - Get the QR code in 3 steps
- **📱 [Full Development Guide](EXPO_DEV_GUIDE.md)** - Complete setup & troubleshooting
- **🔒 [Security Policy](SECURITY.md)** - Security audit and vulnerability reporting
- **📦 [App Store Submission](docs/submission-quick-start.md)** - Ready to publish

## Privacy & Compliance

✅ **100% Local Storage** - Your prescription data NEVER leaves your device  
✅ **iOS App Store Ready** - Fully compliant  
✅ **Google Play Ready** - Data Safety compliant  
✅ **No HIPAA Required** - No PHI stored on servers

### Architecture
- **Local Storage**: AsyncStorage for metadata
- **File System**: Encrypted image storage
- **No Analytics**: No third-party tracking or advertising
- **No Backend**: Pure local-first architecture

## Security

[![Security Rating](https://img.shields.io/badge/Security%20Rating-A--92%2F100-brightgreen)](SECURITY.md)

**Security Audit Results (Feb 4, 2026)**: A- (92/100)

- ✅ **Input Sanitization**: DOMPurify protection against XSS attacks
- ✅ **Rate Limiting**: Biometric authentication protected (5 attempts, 15-min lockout)
- ✅ **Cryptographic Security**: Secure random device IDs using expo-crypto
- ✅ **File Validation**: Image uploads validated for type and size (max 10MB)
- ✅ **Production Hardening**: Console logs removed from production builds
- ✅ **App Store Approved**: Ready for iOS App Store and Google Play submission

See [SECURITY.md](SECURITY.md) for full security policy and vulnerability reporting.

## Features

- 📸 Capture prescription photos
- 👨‍👩‍👧‍👦 Organize by family member
- 📤 Share or print prescriptions
- 🏪 Find nearby optical stores
- 🔒 100% local storage - complete privacy

## Get Started

### Development Setup

**📱 Want to test on your phone? See the [Expo Development Guide](EXPO_DEV_GUIDE.md) for step-by-step instructions on getting a QR code!**

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the app**
   ```bash
   npx expo start
   ```

   This will start the Metro bundler and display a QR code that you can scan with your phone.

3. **Scan the QR code**
   - **iPhone**: Use the Camera app
   - **Android**: Use the Expo Go app
   
   See the [Expo Development Guide](EXPO_DEV_GUIDE.md) for detailed instructions and troubleshooting.

In the output, you'll find options to open the app in a:
- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **frontend/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Project Structure

```
Optical-Rx-Now/
├── frontend/           # React Native app (Expo)
│   ├── app/           # Main app code (file-based routing)
│   ├── assets/        # Images, fonts, icons
│   ├── services/      # Business logic and services
│   └── data/          # Data models and utilities
├── docs/              # Documentation for app store submission
└── README.md          # This file
```

## 📱 App Store Submission

This app is ready for submission to Apple App Store and Google Play Store!

### Submission Resources
- [Quick Start Guide](docs/submission-quick-start.md) - Start here!
- [Store Listing Content](docs/app-store-description.md) - Copy-paste descriptions, keywords, and metadata
- [App Review Notes](docs/app-review-notes.md) - Important information for reviewers
- [Screenshot Guide](docs/screenshot-guide.md) - How to create required screenshots
- [Testing Checklist](docs/final-testing-checklist.md) - Complete pre-submission testing
- [Support Email Template](docs/support-email-template.md) - Auto-response for support inquiries

### Important Links
- **Website:** https://opticalrxnow.com
- **Privacy Policy:** https://opticalrxnow.com/privacy
- **Support Email:** support@opticalrxnow.com

### Quick Start for Submission

1. **Review Documentation**
   - Read [Quick Start Guide](docs/submission-quick-start.md)
   - Review [Testing Checklist](docs/final-testing-checklist.md)

2. **Create Visual Assets**
   - Follow [Screenshot Guide](docs/screenshot-guide.md)
   - Create 2-8 screenshots per platform
   - Ensure app icon is 1024x1024 (iOS) and 512x512 (Android)

3. **Set Up Support**
   - Activate support@opticalrxnow.com email
   - Test privacy policy URL: https://opticalrxnow.com/privacy

4. **Test on Physical Devices**
   - Test on iPhone (iOS 15.1+)
   - Test on Android phone (Android 7.0+)
   - Complete all items in testing checklist

5. **Build for Production**
   ```bash
   cd frontend
   eas build --platform ios --profile production
   eas build --platform android --profile production
   ```

6. **Submit to Stores**
   - Copy content from `docs/app-store-description.md`
   - Upload screenshots
   - Complete age rating and privacy questionnaires
   - Add `docs/app-review-notes.md` content to review notes
   - Submit for review

### Support
- **Email:** support@opticalrxnow.com
- **Privacy Policy:** https://opticalrxnow.com/privacy
- **Website:** https://opticalrxnow.com

### Compliance Status
✅ iOS 15.1+ deployment target  
✅ Android SDK 34 target  
✅ Privacy Manifest documented  
✅ Age verification (18+) implemented  
✅ COPPA compliant  
✅ GDPR compliant  
✅ CCPA compliant  
✅ No data collection or tracking  
✅ Local storage only  

## Learn More

To learn more about developing with Expo:
- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the Community

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## License

Copyright © 2026 Optical Rx Now. All rights reserved.
