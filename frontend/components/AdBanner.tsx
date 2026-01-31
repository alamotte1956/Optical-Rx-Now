import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// AdMob Test Ad Unit IDs from Google
// Replace these with your actual Ad Unit IDs when ready for production
export const AD_UNIT_IDS = {
  BANNER: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/9214589741',
    default: 'ca-app-pub-3940256099942544/9214589741',
  }),
};

interface AdBannerProps {
  style?: any;
}

// Note: AdMob requires a development build to work on mobile devices.
// In web preview and Expo Go, we show a placeholder.
// On actual mobile builds, the real ads will display.
const AdBanner: React.FC<AdBannerProps> = ({ style }) => {
  const [adLoaded, setAdLoaded] = useState(false);

  // Check if we're in a native environment where ads can load
  const isNativeEnv = Platform.OS === 'ios' || Platform.OS === 'android';

  // For web preview, show a placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Ad Banner</Text>
        <Text style={styles.placeholderSubtext}>(Ads display on mobile devices)</Text>
      </View>
    );
  }

  // For native, try to load actual ads
  // Note: This requires a development build, not Expo Go
  try {
    const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');
    
    return (
      <View style={[styles.container, style]}>
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdLoaded={() => setAdLoaded(true)}
          onAdFailedToLoad={(error: any) => {
            console.log('Ad failed to load:', error);
          }}
        />
      </View>
    );
  } catch (error) {
    // If native module not available (e.g., in Expo Go), show placeholder
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Ad Banner</Text>
        <Text style={styles.placeholderSubtext}>(Requires development build)</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: 'rgba(79, 172, 254, 0.2)',
  },
  placeholder: {
    paddingVertical: 12,
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
  },
  placeholderText: {
    color: '#4facfe',
    fontSize: 12,
    fontWeight: '600',
  },
  placeholderSubtext: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
  },
});

export default AdBanner;
