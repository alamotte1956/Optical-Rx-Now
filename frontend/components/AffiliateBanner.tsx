import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { getAffiliates, type Affiliate } from '../services/affiliateStorage';

export default function AffiliateBanner() {
  const [featuredAffiliate, setFeaturedAffiliate] = useState<Affiliate | null>(null);

  useEffect(() => {
    loadFeaturedAffiliate();
  }, []);

  const loadFeaturedAffiliate = async () => {
    try {
      const affiliates = await getAffiliates();
      const featured = affiliates.find(a => a.is_featured && a.is_active);
      if (featured) {
        setFeaturedAffiliate(featured);
      }
    } catch (error) {
      console.error('Error loading featured affiliate:', error);
    }
  };

  const handlePress = async () => {
    if (featuredAffiliate) {
      await WebBrowser.openBrowserAsync(featuredAffiliate.url);
    }
  };

  if (!featuredAffiliate) return null;

  return (
    <TouchableOpacity style={styles.banner} onPress={handlePress}>
      <View style={styles.content}>
        <Ionicons name="star" size={20} color="#f5a623" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{featuredAffiliate.name}</Text>
          <Text style={styles.discount}>{featuredAffiliate.discount}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#8899a6" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1a2d45',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(74, 158, 255, 0.2)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  discount: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '500',
  },
});
