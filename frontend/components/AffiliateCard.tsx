import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

export interface AffiliatePartner {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'eyeglasses' | 'contacts' | 'both';
  discount: string;
  is_featured?: boolean;
  is_active?: boolean;
  order?: number;
  commission_percent?: number;
  commission_tier?: string;
  specialOffer?: string;
}

interface AffiliateCardProps {
  partner: AffiliatePartner;
  onPress?: (partner: AffiliatePartner) => void;
  showCommission?: boolean;
  size?: 'normal' | 'compact';
}

export default function AffiliateCard({ 
  partner, 
  onPress,
  showCommission = false,
  size = 'normal'
}: AffiliateCardProps) {
  const handlePress = async () => {
    try {
      await WebBrowser.openBrowserAsync(partner.url);
      onPress?.(partner);
    } catch (error) {
      console.error('Error opening affiliate link:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'eyeglasses':
        return 'glasses';
      case 'contacts':
        return 'eye';
      case 'both':
        return 'medical';
      default:
        return 'cart';
    }
  };

  const getCommissionBadge = () => {
    if (!showCommission || !partner.commission_percent) return null;
    
    const color = getCommissionColor(partner.commission_percent);
    return (
      <View style={[styles.commissionBadge, { backgroundColor: color }]}>
        <Text style={styles.commissionText}>{partner.commission_percent}%</Text>
      </View>
    );
  };

  const getCommissionColor = (percent: number) => {
    if (percent >= 15) return '#4CAF50'; // Green - highest
    if (percent >= 10) return '#2196F3'; // Blue - high
    if (percent >= 5) return '#FF9800';  // Orange - medium
    return '#9E9E9E';                   // Gray - low
  };

  if (size === 'compact') {
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactIconContainer}>
          <Ionicons name={getCategoryIcon(partner.category) as any} size={20} color="#4a9eff" />
        </View>
        <Text style={styles.compactName}>{partner.name}</Text>
        <Ionicons name="chevron-forward" size={16} color="#6b7c8f" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={getCategoryIcon(partner.category) as any} size={24} color="#4a9eff" />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{partner.name}</Text>
          {partner.is_featured && (
            <Ionicons name="star" size={14} color="#FFA500" />
          )}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {partner.description}
        </Text>
        <View style={styles.badgesRow}>
          <View style={styles.discountBadge}>
            <Ionicons name="pricetag" size={12} color="#4CAF50" />
            <Text style={styles.discountText}>{partner.discount}</Text>
          </View>
          {getCommissionBadge()}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6b7c8f" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2d45',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 158, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: '#8899a6',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  commissionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  commissionText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2d45',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  compactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 158, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
});