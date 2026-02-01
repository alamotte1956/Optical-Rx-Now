# App Store Compliance Checklist

## 🚨 CRITICAL - Complete Before Submission

### AdMob Configuration
- [ ] Replace test AdMob IDs in `app.json` with production IDs
  - Current: `ca-app-pub-3940256099942544~3347511713` (Android)
  - Current: `ca-app-pub-3940256099942544~1458002511` (iOS)
  - Get production IDs from: https://admob.google.com/
  - See [ADMOB_WARNING.md](./ADMOB_WARNING.md) for details

### Privacy Policy
- [ ] Create and host privacy policy
- [ ] Add privacy policy URL to App Store Connect
- [ ] Add privacy policy URL to Google Play Console
- [ ] Privacy policy must cover:
  - Data collection (family member names, prescription images)
  - Local storage explanation (AsyncStorage)
  - Camera/photo access usage
  - Ad tracking and personalization
  - No third-party data sharing (currently)

### iOS App Tracking Transparency (ATT)
- [ ] Add `expo-tracking-transparency` package: `npx expo install expo-tracking-transparency`
- [ ] Implement ATT request before showing ads (see implementation guide below)

### Store Metadata
- [ ] Complete App Store Connect listing
- [ ] Complete Google Play Console listing
- [ ] Upload app screenshots (required: various device sizes)
- [ ] Write app description
- [ ] Complete content rating questionnaire
- [ ] Complete data safety questionnaire

### Testing
- [ ] Test on iOS 17+
- [ ] Test on Android 13+ (photo picker)
- [ ] Test ATT dialog flow (iOS)
- [ ] Test with real AdMob account in TestFlight/Internal Testing
- [ ] Verify permissions work correctly on both platforms

## 📋 Data Safety & Privacy Declarations

### Data We Collect
- **Family member names**: Stored locally, not shared
- **Prescription images**: Stored locally as base64, not shared
- **Ad tracking identifiers**: Only if user consents (iOS ATT)

### Data We DON'T Collect
- No server-side storage
- No analytics (unless added)
- No personal health information beyond images
- No sharing with third parties (except AdMob)

### Google Play Data Safety Form
Answer as follows:
- "Does your app collect or share user data?" → **Yes**
- Data types collected:
  - Personal info → Name (optional, locally stored)
  - Photos → Prescription images (locally stored)
- Data sharing: AdMob for advertising (if user consents)
- Data security: Stored locally on device, not transmitted

### Apple Privacy Nutrition Labels
Declare:
- **Data Linked to User**: None (all local)
- **Data Not Linked to User**: 
  - Identifiers (for advertising, with consent)
- **Data Used to Track You**: Advertising identifier (with ATT consent)

## 🔧 Implementation Guide

### iOS App Tracking Transparency

1. Install package:
   ```bash
   cd frontend
   npx expo install expo-tracking-transparency
   ```

2. Update `components/AdBanner.native.tsx` to request tracking permission before showing ads:
   ```typescript
   import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
   import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

   const AdBanner: React.FC<AdBannerProps> = ({ style }) => {
     const [hasTrackingPermission, setHasTrackingPermission] = useState(false);

     useEffect(() => {
       (async () => {
         const { status } = await requestTrackingPermissionsAsync();
         setHasTrackingPermission(status === 'granted');
       })();
     }, []);

     // Only show ads if tracking permitted or on Android
     if (Platform.OS === 'ios' && !hasTrackingPermission) {
       return null;
     }

     return (
       <BannerAd
         unitId={TestIds.BANNER}
         size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
       />
     );
   };
   ```

### Content Rating
Medical app - Rate as:
- ESRB: Everyone
- PEGI: 3
- Note: App does not provide medical advice

### Export Compliance
Set in `app.json`:
```json
"ios": {
  "config": {
    "usesNonExemptEncryption": false
  }
}
```

## 📱 Platform-Specific Notes

### iOS
- TestFlight testing required before submission
- Review typically takes 24-48 hours
- Medical disclaimers may be required

### Android
- Internal testing track recommended
- Review typically takes hours to days
- Photo picker auto-enabled on Android 13+

## 🔗 Resources

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [AdMob Policy](https://support.google.com/admob/answer/6128543)
- [Expo App Store Deployment](https://docs.expo.dev/distribution/app-stores/)
