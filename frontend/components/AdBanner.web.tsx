import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AdBannerProps {
  style?: any;
}

// Web placeholder component - AdMob doesn't support web
const AdBanner: React.FC<AdBannerProps> = ({ style }) => {
  return (
    <View style={[styles.container, styles.placeholder, style]}>
      <Text style={styles.placeholderText}>Ad Banner</Text>
      <Text style={styles.placeholderSubtext}>(Ads display on mobile devices)</Text>
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
