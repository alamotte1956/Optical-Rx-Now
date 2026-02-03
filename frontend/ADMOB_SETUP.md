# AdMob Setup & Configuration Guide

## ⚠️ CRITICAL WARNING

The app currently uses **Google's test AdMob IDs** in `.env.example`. These MUST be replaced with your production IDs before submitting to the App Store or Play Store.

### Why This Matters:
- ✗ **App Store/Play Store will REJECT your app** if using test IDs
- ✗ **Zero revenue** - test IDs don't generate real ad revenue
- ✗ **Potential account suspension** - using test IDs in production violates AdMob policies

## Step-by-Step Setup

### 1. Create AdMob Account

1. Go to https://admob.google.com/
2. Sign in with your Google account
3. Complete the AdMob account setup

### 2. Register Your Apps

#### For iOS:
1. Click "Apps" in the left sidebar
2. Click "Add App"
3. Select "iOS"
4. Enter app name: "Optical Rx Now"
5. Enter App Store ID (if already published) or select "No" if not yet published
6. Copy the **App ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)

#### For Android:
1. Click "Apps" in the left sidebar
2. Click "Add App"
3. Select "Android"
4. Enter app name: "Optical Rx Now"
5. Enter package name: `com.alamotte.opticalrxnow`
6. Copy the **App ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)

### 3. Update Configuration Files

#### Update `.env` file (create from `.env.example`):

```env
# Replace with your actual AdMob IDs
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-YOUR_PUBLISHER_ID~YOUR_IOS_APP_ID
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-YOUR_PUBLISHER_ID~YOUR_ANDROID_APP_ID
```

#### Update `app.json`:

If you add the AdMob plugin to `app.json`, update it with your production IDs:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "androidAdMobAppId": "ca-app-pub-YOUR_PUBLISHER_ID~YOUR_ANDROID_APP_ID",
          "iosAdMobAppId": "ca-app-pub-YOUR_PUBLISHER_ID~YOUR_IOS_APP_ID"
        }
      ]
    ]
  }
}
```

### 4. Create Ad Units (When Ready to Show Ads)

For each ad placement (banner, interstitial, rewarded):

1. In AdMob, go to "Apps" → Select your app → "Ad units"
2. Click "Add ad unit"
3. Select ad format (Banner, Interstitial, Rewarded, etc.)
4. Configure ad unit settings
5. Copy the **Ad Unit ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

### 5. Implement AdBanner Component (Example)

When you're ready to show ads, create a component like this:

```typescript
// app/components/AdBanner.tsx
import { useState, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { AdMobBanner } from 'expo-ads-admob'; // You'll need to install this
import { getTrackingPermission } from '../utils/tracking';

export default function AdBanner() {
  const [hasPermission, setHasPermission] = useState(Platform.OS === 'android');

  useEffect(() => {
    if (Platform.OS === 'ios') {
      getTrackingPermission().then(setHasPermission);
    }
  }, []);

  // Don't show ads if tracking permission not granted on iOS
  if (Platform.OS === 'ios' && !hasPermission) {
    return null;
  }

  const adUnitId = Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS_ID,
    android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID_ID,
  });

  return (
    <View>
      <AdMobBanner
        bannerSize="banner"
        adUnitID={adUnitId}
        servePersonalizedAds={hasPermission}
        onDidFailToReceiveAdWithError={(error) =>
          console.error('Ad failed to load:', error)
        }
      />
    </View>
  );
}
```

## App Tracking Transparency (ATT) Integration

### ✅ Already Implemented

The app has been configured with ATT support:

1. **Permission Request**: Automatically requests tracking permission on iOS launch
2. **User-Friendly Message**: "This app uses your data to show you personalized ads that help keep the app free."
3. **Graceful Handling**: App works normally whether permission is granted or denied
4. **Android Compatibility**: No permission request on Android (not required)

### How It Works:

1. On iOS 14.5+, the ATT dialog appears ~1 second after app launch
2. If user grants permission → personalized ads can be shown
3. If user denies permission → show non-personalized ads or no ads
4. On Android → no ATT dialog, ads work normally

### Implementation Files:
- `app/utils/tracking.ts` - ATT permission utility functions
- `app/_layout.tsx` - Requests permission on app launch
- `app.json` - Contains `NSUserTrackingUsageDescription`

## Testing

### Test IDs (Development Only)

Use these Google-provided test IDs **ONLY** for development:

```env
# iOS Test App ID
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-3940256099942544~1458002511

# Android Test App ID
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-3940256099942544~3347511713

# Banner Test Unit IDs
iOS Banner: ca-app-pub-3940256099942544/2934735716
Android Banner: ca-app-pub-3940256099942544/6300978111
```

### Testing Checklist:

#### iOS Testing:
- [ ] ATT dialog appears on first launch
- [ ] Grant permission → ads load successfully
- [ ] Deny permission → app doesn't crash, appropriate handling
- [ ] Test on iOS 14.5+ (real device required, simulator limited)

#### Android Testing:
- [ ] No ATT dialog (not required)
- [ ] Ads load successfully
- [ ] Test on Android 13+ device

## Production Deployment

### Before Submitting to App Stores:

1. ✅ Replace all test IDs with production IDs in `.env`
2. ✅ Test with production IDs in TestFlight (iOS) / Internal Testing (Android)
3. ✅ Verify ATT permission dialog works correctly
4. ✅ Verify ads load and display properly
5. ✅ Check AdMob dashboard shows impressions

### Common Issues:

**Ads Not Loading:**
- Check you're using production IDs, not test IDs
- Verify AdMob account is approved (can take 24-48 hours)
- Check app bundle ID matches AdMob configuration
- Ensure privacy policy URL is set and publicly accessible

**ATT Dialog Not Showing:**
- Must test on real iOS device (iOS 14.5+)
- Dialog only shows once - reset by reinstalling app
- Check `NSUserTrackingUsageDescription` is in `app.json`

**App Store Rejection:**
- Using test IDs → replace with production IDs
- Missing privacy policy → add URL to app.json
- Missing ATT → already implemented in this app ✅

## Revenue & Analytics

Monitor your ad performance at:
- AdMob Dashboard: https://admob.google.com/
- Check metrics: Impressions, Clicks, eCPM, Revenue

## Resources

- [AdMob Help Center](https://support.google.com/admob/)
- [AdMob Policies](https://support.google.com/admob/answer/6128543)
- [Apple ATT Guidelines](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- [Expo AdMob Documentation](https://docs.expo.dev/versions/latest/sdk/admob/)
- [iOS ATT Documentation](https://developer.apple.com/documentation/apptrackingtransparency)

## Support

If you encounter issues:
1. Check [AdMob Help Center](https://support.google.com/admob/)
2. Review [Expo Forums](https://forums.expo.dev/)
3. Check AdMob account approval status
4. Verify all IDs match between AdMob console and app configuration
