/**
 * AdBanner Component
 * 
 * Example implementation of an ad banner component that respects
 * iOS App Tracking Transparency (ATT) permissions.
 * 
 * ⚠️ THIS IS A REFERENCE IMPLEMENTATION ⚠️
 * This component is not currently used in the app.
 * 
 * To use this component:
 * 1. Install expo-ads-admob or react-native-google-mobile-ads
 * 2. Configure your production AdMob IDs in .env
 * 3. Import and use this component where you want to show ads
 * 
 * See ADMOB_SETUP.md for complete setup instructions.
 */

import { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { getTrackingPermission } from '../utils/tracking';

/**
 * Example AdBanner Component
 * 
 * This is a placeholder/example that shows how to:
 * 1. Check ATT permission before showing ads
 * 2. Handle iOS vs Android differences
 * 3. Gracefully handle permission denial
 */
export default function AdBanner() {
  const [hasPermission, setHasPermission] = useState(Platform.OS === 'android');
  const [isLoading, setIsLoading] = useState(Platform.OS === 'ios');

  useEffect(() => {
    if (Platform.OS === 'ios') {
      // Check if user has granted tracking permission
      getTrackingPermission().then((granted) => {
        setHasPermission(granted);
        setIsLoading(false);
      });
    }
  }, []);

  // Don't show anything while checking permission on iOS
  if (isLoading) {
    return null;
  }

  // Don't show ads if tracking permission not granted on iOS
  if (Platform.OS === 'ios' && !hasPermission) {
    // Option 1: Show nothing (recommended for privacy)
    return null;

    // Option 2: Show non-personalized ads (requires additional setup)
    // return <NonPersonalizedAdBanner />;

    // Option 3: Show a message (not recommended)
    // return (
    //   <View style={styles.messageContainer}>
    //     <Text style={styles.messageText}>
    //       Enable ad tracking in Settings to support this free app
    //     </Text>
    //   </View>
    // );
  }

  // ⚠️ PLACEHOLDER: Replace with actual ad component when ready
  // Example with expo-ads-admob (install separately):
  // 
  // import { AdMobBanner } from 'expo-ads-admob';
  // 
  // const adUnitId = Platform.select({
  //   ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS_ID,
  //   android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID_ID,
  // });
  //
  // return (
  //   <View style={styles.container}>
  //     <AdMobBanner
  //       bannerSize="banner"
  //       adUnitID={adUnitId}
  //       servePersonalizedAds={hasPermission}
  //       onDidFailToReceiveAdWithError={(error) =>
  //         console.error('Ad failed to load:', error)
  //       }
  //     />
  //   </View>
  // );

  // Placeholder showing where ad would appear
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>
        [Ad Banner Placeholder]
      </Text>
      <Text style={styles.placeholderSubtext}>
        Install AdMob package and configure to enable
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  messageContainer: {
    padding: 12,
    backgroundColor: '#1a2d45',
    borderRadius: 8,
    margin: 8,
  },
  messageText: {
    color: '#8899a6',
    fontSize: 12,
    textAlign: 'center',
  },
  placeholderContainer: {
    padding: 16,
    backgroundColor: '#1a2d45',
    borderRadius: 8,
    margin: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a9eff',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderSubtext: {
    color: '#8899a6',
    fontSize: 11,
    marginTop: 4,
  },
});
