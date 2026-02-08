import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type Prescription } from '../services/localStorage';

interface PrescriptionCardProps {
  prescription: Prescription;
  onPress?: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
  size?: 'normal' | 'compact';
}

export default function PrescriptionCard({
  prescription,
  onPress,
  onDelete,
  showDelete = false,
  size = 'normal',
}: PrescriptionCardProps) {
  const isEyeglass = prescription.rx_type === 'eyeglass';
  
  const getTypeIcon = () => {
    return isEyeglass ? 'glasses' : 'eye';
  };

  const getTypeLabel = () => {
    return isEyeglass ? 'Eyeglasses' : 'Contact Lenses';
  };

  const getDaysUntilExpiry = () => {
    const expiry = new Date(prescription.expiry_date);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = () => {
    const days = getDaysUntilExpiry();
    if (days < 0) return { text: 'Expired', color: '#ff6b6b' };
    if (days < 30) return { text: `${days} days left`, color: '#ffa500' };
    if (days < 90) return { text: `${days} days left`, color: '#4a9eff' };
    return { text: 'Valid', color: '#4CAF50' };
  };

  const getPDInfo = () => {
    if (!prescription.pd) return null;
    
    if (prescription.pd_type === 'monocular') {
      return `PD: ${prescription.left_pd}/${prescription.right_pd}`;
    }
    
    return `PD: ${prescription.pd}`;
  };

  const expiryStatus = getExpiryStatus();

  if (size === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: prescription.image_uri }}
          style={styles.compactImage}
          resizeMode="cover"
        />
        <View style={styles.compactContent}>
          <View style={styles.compactHeader}>
            <Ionicons name={getTypeIcon() as any} size={16} color="#4a9eff" />
            <Text style={styles.compactType}>{getTypeLabel()}</Text>
          </View>
          <Text style={styles.compactDate}>{prescription.date_taken}</Text>
          <View style={[styles.expiryBadge, { backgroundColor: expiryStatus.color + '20' }]}>
            <Text style={[styles.expiryText, { color: expiryStatus.color }]}>
              {expiryStatus.text}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7c8f" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: prescription.image_uri }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.typeOverlay}>
            <Ionicons name={getTypeIcon() as any} size={20} color="#fff" />
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.header}>
            <Text style={styles.type}>{getTypeLabel()}</Text>
            <View style={[styles.expiryBadge, { backgroundColor: expiryStatus.color + '20' }]}>
              <Text style={[styles.expiryText, { color: expiryStatus.color }]}>
                {expiryStatus.text}
              </Text>
            </View>
          </View>

          <Text style={styles.date}>{prescription.date_taken}</Text>

          {prescription.pd && (
            <Text style={styles.pd}>{getPDInfo()}</Text>
          )}

          {prescription.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {prescription.notes}
            </Text>
          )}
        </View>

        {showDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a2d45',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 158, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  expiryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    fontSize: 13,
    color: '#8899a6',
    marginBottom: 4,
  },
  pd: {
    fontSize: 13,
    color: '#4a9eff',
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    color: '#6b7c8f',
    fontStyle: 'italic',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2d45',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 10,
  },
  compactContent: {
    flex: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  compactType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  compactDate: {
    fontSize: 12,
    color: '#8899a6',
    marginBottom: 4,
  },
});