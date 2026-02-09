# 📖 Expo Development Guide

Comprehensive guide for developing the Optical Rx Now mobile app with Expo.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Environment Setup](#development-environment-setup)
- [Starting the Metro Bundler](#starting-the-metro-bundler)
- [Running on Devices](#running-on-devices)
- [Development Workflow](#development-workflow)
- [Developer Tools](#developer-tools)
- [Expo Go vs Development Builds](#expo-go-vs-development-builds)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or later)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (v8 or later)
   - Comes with Node.js
   - Verify installation: `npm --version`

3. **Git**
   - For cloning the repository
   - Download from [git-scm.com](https://git-scm.com/)

### Mobile Device Setup

Choose one of the following options:

#### Option 1: Physical Device (Recommended for Testing)

**iOS:**
- Install [Expo Go](https://apps.apple.com/app/expo-go/id982107779) from the App Store
- iOS 13.4 or later required

**Android:**
- Install [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) from Google Play
- Android 5+ required

#### Option 2: Emulator/Simulator

**iOS Simulator (macOS only):**
- Install [Xcode](https://apps.apple.com/us/app/xcode/id497799835)
- Install Xcode Command Line Tools: `xcode-select --install`

**Android Emulator:**
- Install [Android Studio](https://developer.android.com/studio)
- Set up an Android Virtual Device (AVD)

---

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/alamotte1956/Optical-Rx-Now.git
cd Optical-Rx-Now/frontend
```

### 2. Install Dependencies

```bash
npm install
```

This installs all packages defined in `package.json`, including:
- Expo SDK
- React Native
- Navigation libraries
- UI components
- And more...

### 3. Verify Installation

Check that Expo CLI is available:

```bash
npx expo --version
```

---

## Starting the Metro Bundler

The Metro bundler is the JavaScript bundler that powers React Native. It compiles your code and serves it to your app.

### Basic Start

```bash
cd frontend
npx expo start
```

**What you'll see:**
- A QR code in your terminal
- Local development server URL (typically `exp://192.168.x.x:8081`)
- List of keyboard shortcuts
- Connection options

### Alternative Start Methods

#### Using npm script

```bash
npm start
```

This is an alias for `npx expo start` defined in `package.json`.

#### Tunnel Mode

```bash
npx expo start --tunnel
```

**When to use tunnel mode:**
- Your phone and computer are on different networks
- Corporate firewall blocks local connections
- Working from a restrictive network
- Need to share your development server publicly

**How it works:**
- Uses `@expo/ngrok` to create a secure tunnel
- Routes traffic through Expo's servers
- Slightly slower than LAN mode
- Requires internet connection

#### Development Build Mode

```bash
npx expo start --dev-client
```

Use this when working with a custom development build instead of Expo Go.

#### Platform-Specific Launch

```bash
npx expo start --ios      # Launch iOS simulator
npx expo start --android  # Launch Android emulator
npx expo start --web      # Launch in web browser
```

---

## Running on Devices

### Scanning the QR Code

Once the Metro bundler is running, you'll see a QR code in your terminal.

#### iOS Device

**Method 1: Camera App (iOS 11+)**
1. Open the built-in **Camera** app
2. Point the camera at the QR code
3. A notification will appear at the top
4. Tap the notification to open in Expo Go

**Method 2: Expo Go App**
1. Open **Expo Go**
2. Tap the **+** icon or **Scan QR Code**
3. Point your camera at the QR code

#### Android Device

**Using Expo Go:**
1. Open **Expo Go** app
2. Tap **Scan QR Code** button
3. Point your camera at the QR code in the terminal

**Note:** Android's Camera app does not natively scan QR codes for Expo. You must use the Expo Go app.

### Connection Requirements

For successful connection:

1. **Same Network:** Your phone and computer must be on the same Wi-Fi network
   - Both on the same local network (e.g., "Home-WiFi-5G")
   - Not one on Wi-Fi and one on cellular
   
2. **Network Permissions:** Some networks block device-to-device communication
   - University/corporate networks may restrict this
   - Public Wi-Fi may block local connections
   - **Solution:** Use `--tunnel` mode

3. **Firewall Settings:** Ensure your computer's firewall allows incoming connections
   - Port 8081 should be accessible
   - Allow Node.js through firewall if prompted

### Manual Connection

If QR code scanning fails, you can manually enter the URL:

1. In Expo Go, tap **Enter URL manually**
2. Enter the URL shown in your terminal (e.g., `exp://192.168.1.5:8081`)

---

## Development Workflow

### Fast Refresh

Expo uses **Fast Refresh** (React Native's hot reloading):

- **Automatic:** Save a file → Changes appear instantly on device
- **Preserves State:** Component state is retained during refresh
- **Syntax Error Recovery:** Automatically reloads when you fix errors

**What triggers Fast Refresh:**
- Editing React components
- Modifying styles
- Changing function implementations

**What requires full reload:**
- Installing new packages
- Modifying `app.json`
- Adding native modules
- Changing entry point file

### Manual Reload

Sometimes you need to manually reload:

**In Terminal:**
- Press `r` - Reload app
- Press `m` - Toggle developer menu
- Press `j` - Open debugger
- Press `i` - Launch iOS simulator
- Press `a` - Launch Android emulator

**On Device:**
- **Shake device** - Opens developer menu
- Select **Reload** from developer menu

### Developer Menu

Access on device by shaking or using keyboard shortcut.

**Options include:**
- Reload
- Debug Remote JS (deprecated, use Hermes debugger)
- Enable/Disable Fast Refresh
- Show Performance Monitor
- Show Element Inspector
- Toggle Element Inspector

---

## Developer Tools

### Metro Bundler Shortcuts

When Metro is running in your terminal:

| Key | Action |
|-----|--------|
| `r` | Reload app |
| `m` | Toggle developer menu on device |
| `j` | Open debugger |
| `i` | Open iOS simulator |
| `a` | Open Android emulator |
| `w` | Open in web browser |
| `c` | Clear Metro bundler cache |
| `d` | Open developer tools |

### Debugging

**React DevTools:**
```bash
npx react-devtools
```

Then, in your app's developer menu, select "Connect to React DevTools"

**Console Logs:**
- All `console.log()` statements appear in your terminal
- Also visible in React DevTools console

**Network Inspection:**
- Use React DevTools Network tab
- Or Flipper for advanced debugging

### Clearing Cache

If you encounter strange behavior:

```bash
npx expo start --clear
```

This clears:
- Metro bundler cache
- Watchman cache (if installed)
- Temporary build files

---

## Expo Go vs Development Builds

### Expo Go

**What it is:**
- Pre-built app with Expo SDK included
- Available on App Store / Google Play
- Sandbox environment for development

**Pros:**
- ✅ Instant setup - no build required
- ✅ Perfect for prototyping
- ✅ Access to most Expo APIs
- ✅ Quick iteration

**Cons:**
- ❌ Limited to Expo SDK modules
- ❌ Cannot use custom native code
- ❌ Some third-party libraries incompatible
- ❌ Not suitable for production

**Use Expo Go when:**
- Starting a new project
- Rapid prototyping
- Learning React Native
- Using only Expo SDK modules

### Development Builds

**What it is:**
- Custom build of your app with `expo-dev-client`
- Installed directly on device/simulator
- Includes your custom native code

**Pros:**
- ✅ Full control over native code
- ✅ Any React Native library
- ✅ Custom native modules
- ✅ Closer to production app

**Cons:**
- ❌ Requires building before testing
- ❌ Longer setup time
- ❌ Need to rebuild when adding native modules

**Use Development Builds when:**
- Need custom native modules
- Using libraries incompatible with Expo Go
- Preparing for production
- Advanced customization needed

**Creating a development build:**
```bash
npx expo install expo-dev-client
npx expo run:ios    # For iOS
npx expo run:android # For Android
```

---

## Troubleshooting

### Common Issues and Solutions

#### ❌ QR Code Won't Scan

**Symptoms:**
- QR code appears but scanning does nothing
- Connection attempt fails

**Solutions:**
1. **Use Tunnel Mode:**
   ```bash
   npx expo start --tunnel
   ```

2. **Check Network:**
   - Ensure phone and computer on same Wi-Fi
   - Disable VPN on both devices
   - Try different Wi-Fi network

3. **Manual URL Entry:**
   - Copy URL from terminal
   - In Expo Go: "Enter URL manually"

4. **Restart Metro:**
   - Press `Ctrl+C` to stop
   - Run `npx expo start` again

#### ❌ "Unable to Resolve Module"

**Symptoms:**
- Error: "Unable to resolve module X from Y"

**Solutions:**
1. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules
   npm install
   npx expo start --clear
   ```

2. **Check import path:**
   - Verify file path is correct
   - Check for typos in import statement

#### ❌ "Network Request Failed"

**Symptoms:**
- App opens but API calls fail
- Network errors in console

**Solutions:**
1. **Check API URL:**
   - Verify backend is running
   - Check environment variables
   - Use correct IP for localhost (not `localhost` or `127.0.0.1` on device)

2. **Enable network permissions:**
   - Check `app.json` permissions
   - Verify device has internet access

#### ❌ Metro Bundler Won't Start

**Symptoms:**
- Error: "Port 8081 already in use"
- Metro fails to start

**Solutions:**
1. **Kill existing process:**
   ```bash
   # Find process on port 8081
   lsof -i :8081
   # Kill it
   kill -9 <PID>
   ```

2. **Use different port:**
   ```bash
   npx expo start --port 8082
   ```

#### ❌ "Error: EMFILE: too many open files"

**Symptoms:**
- Metro bundler crashes with file limit error

**Solutions:**
1. **Install Watchman (macOS/Linux):**
   ```bash
   # macOS
   brew install watchman
   
   # Linux
   # Follow: https://facebook.github.io/watchman/docs/install
   ```

2. **Increase file limit (temporary):**
   ```bash
   ulimit -n 4096
   ```

#### ❌ White Screen on Device

**Symptoms:**
- App loads but shows blank white screen

**Solutions:**
1. **Check for JavaScript errors:**
   - Look at terminal output
   - Check for red error boxes on device

2. **Clear cache:**
   ```bash
   npx expo start --clear
   ```

3. **Reload app:**
   - Shake device → Reload
   - Or press `r` in terminal

#### ❌ Slow Performance

**Symptoms:**
- App is slow or laggy during development

**Solutions:**
1. **Use production mode:**
   ```bash
   npx expo start --no-dev --minify
   ```

2. **Disable Remote JS Debugging:**
   - Modern Hermes debugger is faster

3. **Reduce console.log statements:**
   - Too many logs can slow down the app

---

## Performance Tips

1. **Enable Hermes Engine:**
   - Already enabled in this project via `app.json`
   - Faster startup, lower memory usage

2. **Use Memoization:**
   - Use `React.memo`, `useMemo`, `useCallback` appropriately

3. **Optimize Images:**
   - Use appropriate image sizes
   - Consider using `expo-image` for better performance

4. **Profile Performance:**
   - Use React DevTools Profiler
   - Monitor bundle size

---

## Additional Resources

- **Expo Documentation:** [docs.expo.dev](https://docs.expo.dev)
- **React Native Docs:** [reactnative.dev](https://reactnative.dev)
- **Expo Forums:** [forums.expo.dev](https://forums.expo.dev)
- **Discord Community:** [chat.expo.dev](https://chat.expo.dev)
- **Expo GitHub:** [github.com/expo/expo](https://github.com/expo/expo)

---

## Quick Reference Commands

```bash
# Start development server
npx expo start

# Start with tunnel mode
npx expo start --tunnel

# Start with cache cleared
npx expo start --clear

# Start and open iOS simulator
npx expo start --ios

# Start and open Android emulator
npx expo start --android

# Start in production mode
npx expo start --no-dev --minify

# Install dependencies
npm install

# Update Expo SDK
npx expo install expo@latest

# Check for outdated packages
npm outdated

# Run linter
npm run lint
```

---

**Happy Coding! 🎉**

For quick start instructions, see [QUICK_START.md](./QUICK_START.md)
