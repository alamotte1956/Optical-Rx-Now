# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

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

## 📱 Running on Your Device with QR Code

After starting the development server with `npx expo start`, a QR code will appear in your terminal.

### On iOS:
1. Install [Expo Go](https://apps.apple.com/app/expo-go/id982107779) from the App Store
2. Open your **Camera** app and point it at the QR code
3. Tap the notification to open in Expo Go

### On Android:
1. Install [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) from Google Play
2. Open the **Expo Go** app
3. Tap **Scan QR Code** and point your camera at the QR code

### Network Issues?

If the QR code doesn't work (firewall, different networks, etc.), use tunnel mode:

```bash
npx expo start --tunnel
```

This routes traffic through Expo's servers and works in most network configurations.

For more detailed instructions and troubleshooting, see:
- [Quick Start Guide](../QUICK_START.md) - Simple 3-step setup
- [Expo Development Guide](../EXPO_DEV_GUIDE.md) - Comprehensive reference

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
