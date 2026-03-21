import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface AdBannerProps {
  style?: any;
}

// AdMob requires a development build to work on mobile devices.
// In web preview and Expo Go, we show a placeholder.
// On actual mobile builds with EAS, the real ads will display.
const AdBanner: React.FC<AdBannerProps> = ({ style }) => {
  // Always show placeholder on web - AdMob doesn't support web
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Ad Banner</Text>
        <Text style={styles.placeholderSubtext}>(Ads display on mobile devices)</Text>
      </View>
    );
  }

  // For native platforms, return the placeholder for now
  // Real ads will work when app is built with EAS (not in Expo Go)
  return (
    <View style={[styles.container, styles.placeholder, style]}>
      <Text style={styles.placeholderText}>Ad Banner</Text>
      <Text style={styles.placeholderSubtext}>(Requires EAS development build)</Text>
    </View>
  );
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
