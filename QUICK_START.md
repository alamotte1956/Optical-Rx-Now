# 🚀 Quick Start Guide

Get the Optical Rx Now app running on your mobile device in 3 simple steps!

## Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Expo Go** app on your mobile device
  - [📱 iOS - Download from App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [🤖 Android - Download from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 3 Steps to Get Started

### Step 1️⃣: Install Dependencies

Open your terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

This will install all necessary packages. It may take a few minutes.

### Step 2️⃣: Start the Development Server

Start the Expo Metro bundler:

```bash
npx expo start
```

You should see a QR code appear in your terminal along with connection options.

### Step 3️⃣: Scan the QR Code

**On iOS:**
1. Open the **Camera** app
2. Point it at the QR code in your terminal
3. Tap the notification that appears to open in Expo Go

**On Android:**
1. Open the **Expo Go** app
2. Tap **Scan QR Code**
3. Point your camera at the QR code in your terminal

The app will now load on your device! 🎉

## 🛠️ Troubleshooting

### QR Code Not Working?

**Problem:** Can't scan the QR code or connection fails

**Solution:** Use tunnel mode:
```bash
npx expo start --tunnel
```

This uses a cloud connection that works through most firewalls and network restrictions.

### "Network Response Timed Out"

**Problem:** Connection hangs or times out

**Solutions:**
1. Make sure your phone and computer are on the **same Wi-Fi network**
2. Try disabling any VPN or firewall temporarily
3. Use tunnel mode (see above)

### Metro Bundler Won't Start

**Problem:** Port already in use or error starting

**Solutions:**
1. Close any other Metro bundler instances
2. Try a different port:
   ```bash
   npx expo start --port 8082
   ```

## 📚 Need More Help?

- See the full [Expo Development Guide](./EXPO_DEV_GUIDE.md) for detailed information
- Visit the [frontend README](./frontend/README.md) for project-specific details
- Check [Expo Documentation](https://docs.expo.dev/) for official guides

## ⚡ Pro Tips

- **Shake your device** to open the developer menu
- Changes you make to the code will **automatically reload** on your device
- Press `r` in the terminal to manually reload the app
- Press `m` to toggle the developer menu
