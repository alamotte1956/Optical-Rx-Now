# ⚠️ CRITICAL: AdMob Configuration Warning

## 🚨 REPLACE TEST IDS BEFORE PRODUCTION DEPLOYMENT

The AdMob IDs currently configured in `app.json` are **Google's official test IDs** and **WILL CAUSE APP REJECTION** if submitted to the App Store or Play Store.

### Current Test IDs (DO NOT USE IN PRODUCTION)

**In `app.json`:**
- Android: `ca-app-pub-3940256099942544~3347511713`
- iOS: `ca-app-pub-3940256099942544~1458002511`

### Action Required

1. **Create an AdMob account** at https://admob.google.com/
2. **Register your app** in the AdMob console
3. **Get your production App IDs** for both iOS and Android
4. **Replace the test IDs** in both locations in `app.json`:
   - Under `expo.plugins` → `react-native-google-mobile-ads`
   - Under `react-native-google-mobile-ads` (root level)

### Why This Matters

- Test IDs are for development only
- Using test IDs in production violates AdMob policies
- Apps with test IDs will be rejected during app store review
- You could face AdMob account suspension

### See Also

- [APP_STORE_COMPLIANCE.md](./APP_STORE_COMPLIANCE.md) for complete submission checklist
- [AdMob Get Started Guide](https://developers.google.com/admob/ios/quick-start)
