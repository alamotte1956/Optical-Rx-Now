# Expo Development Server Guide

## Getting Your QR Code to Test the App

This guide will help you start the Expo Metro bundler and get a QR code to test the Optical Rx Now app on your phone.

## Prerequisites

Before you begin, make sure you have:

1. **Node.js installed** (version 18 or higher recommended)
   - Check with: `node --version`
   - Download from: https://nodejs.org/

2. **A smartphone** (iPhone or Android)
   - Download the **Expo Go** app from your app store:
     - iOS: [Expo Go on App Store](https://apps.apple.com/app/expo-go/id982107779)
     - Android: [Expo Go on Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

3. **Same Wi-Fi Network**
   - Your computer and phone must be on the same Wi-Fi network

## Quick Start

### Step 1: Navigate to the Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies (First Time Only)

```bash
npm install
```

This will install all the required packages. This step only needs to be done once, or when dependencies change.

### Step 3: Start the Expo Development Server

```bash
npx expo start
```

Or alternatively:

```bash
npm start
```

### Step 4: You'll See a QR Code!

After running the start command, you should see output like this:

```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› Press o │ open project code in your editor

› Press ? │ show all commands

Logs for your project will appear below. Press Ctrl+C to stop the server.
```

### Step 5: Scan the QR Code

**On iPhone:**
1. Open your Camera app
2. Point it at the QR code in your terminal
3. Tap the notification that appears
4. The app will open in Expo Go

**On Android:**
1. Open the Expo Go app
2. Tap "Scan QR Code"
3. Point your camera at the QR code in your terminal
4. The app will load automatically

## Alternative: Open via URL

If the QR code doesn't work, you can manually enter the URL in Expo Go:

1. Note the URL shown in the terminal (e.g., `exp://192.168.1.100:8081`)
2. Open Expo Go on your phone
3. Tap "Enter URL manually"
4. Type or paste the URL
5. Tap "Connect"

## Common Issues and Solutions

### QR Code Not Appearing

**Problem:** Terminal shows Metro bundler running but no QR code appears.

**Solution:**
```bash
npx expo start --tunnel
```

This creates a public URL that works even if you're not on the same network.

### "Unable to Resolve Module" Error

**Problem:** App crashes with module resolution errors.

**Solution:**
```bash
# Clear the cache and restart
npx expo start --clear
```

### "Network Response Timed Out"

**Problem:** Phone can't connect to your computer.

**Solutions:**
1. Make sure both devices are on the same Wi-Fi network
2. Check your firewall settings (allow port 8081)
3. Use tunnel mode: `npx expo start --tunnel`

### App Loads Slowly

**Problem:** Initial load takes a long time.

**Explanation:** The first load downloads the JavaScript bundle to your phone. This is normal and subsequent loads will be faster.

### Changes Not Appearing

**Problem:** Code changes don't show up in the app.

**Solutions:**
1. Shake your phone to open the developer menu
2. Tap "Reload"
3. Or press `r` in the terminal

## Development Tips

### Fast Refresh
- Changes to your code automatically reload in the app
- No need to manually refresh for most changes

### Developer Menu
Shake your phone or press `m` in the terminal to open the developer menu:
- **Reload:** Refresh the app manually
- **Debug Remote JS:** Debug in Chrome DevTools
- **Show Performance Monitor:** See FPS and memory usage
- **Toggle Inspector:** Inspect UI elements

### Keyboard Shortcuts (Terminal)
- `r` - Reload the app
- `m` - Open developer menu on device
- `j` - Open debugger
- `i` - Open iOS simulator (macOS only)
- `a` - Open Android emulator (if configured)
- `w` - Open in web browser
- `?` - Show all commands

## Testing on Physical Devices

While Expo Go is great for development, this app uses some features that require a custom development build:

- Camera access
- File system access
- Local authentication (biometrics)

### For Full Feature Testing

To test all features on a physical device:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Build a development client for your device
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

Then install the generated build on your device.

## Production Builds

For production builds ready for the App Store or Google Play:

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

See the main [README.md](README.md) for full submission instructions.

## Need Help?

- **Expo Documentation:** https://docs.expo.dev/
- **Expo Forums:** https://forums.expo.dev/
- **Expo Discord:** https://chat.expo.dev/

## Summary

To get your QR code:

1. `cd frontend`
2. `npm install` (first time only)
3. `npx expo start`
4. Scan the QR code with your phone!

That's it! Happy developing! 🚀
