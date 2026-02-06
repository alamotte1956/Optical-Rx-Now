# Optical Rx Now - Family Prescription Manager

A React Native mobile app built with Expo for managing family eyeglass and contact lens prescriptions.

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

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Features

- 📸 Capture prescription photos
- 👨‍👩‍👧‍👦 Organize by family member
- 📤 Share or print prescriptions
- 🏪 Find nearby optical stores
- 🔒 100% local storage - complete privacy

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---

## 📱 App Store Submission

This app is ready for submission to Apple App Store and Google Play Store!

### Submission Resources
- [Store Listing Content](../docs/app-store-description.md) - Copy-paste descriptions, keywords, and metadata
- [App Review Notes](../docs/app-review-notes.md) - Important information for reviewers
- [Screenshot Guide](../docs/screenshot-guide.md) - How to create required screenshots
- [Testing Checklist](../docs/final-testing-checklist.md) - Complete pre-submission testing
- [Support Email Template](../docs/support-email-template.md) - Auto-response for support inquiries
- [Privacy Policy](https://opticalrxnow.com/privacy) - Live privacy policy

### Quick Start for Submission

1. **Review Documentation**
   - Read `docs/app-review-notes.md`
   - Review `docs/final-testing-checklist.md`

2. **Create Visual Assets**
   - Follow `docs/screenshot-guide.md`
   - Create 2-8 screenshots per platform
   - Ensure app icon is 1024x1024 (iOS) and 512x512 (Android)

3. **Set Up Support**
   - Activate support@opticalrxnow.com email
   - Enable GitHub Pages for privacy policy
   - Test privacy policy URL is accessible

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
