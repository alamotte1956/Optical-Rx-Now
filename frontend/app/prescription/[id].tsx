import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Paths, File } from 'expo-file-system';

interface Prescription {
  id: string;
  type: 'eyeglass' | 'contact';
  imageBase64: string;
  createdAt: string;
  notes?: string;
}

export default function PrescriptionDetailScreen() {
  const { id, memberId } = useLocalSearchParams<{ id: string; memberId: string }>();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  const PRESCRIPTIONS_KEY = `@rx_vault_prescriptions_${memberId}`;

  useEffect(() => {
    loadPrescription();
  }, [id, memberId]);

  const loadPrescription = async () => {
    try {
      const data = await AsyncStorage.getItem(PRESCRIPTIONS_KEY);
      if (data) {
        const prescriptions: Prescription[] = JSON.parse(data);
        const found = prescriptions.find((p) => p.id === id);
        if (found) {
          setPrescription(found);
        }
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shareImage = async () => {
    if (!prescription) return;

    setSharing(true);
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
        return;
      }

      // Create a temporary file for sharing
      const tempFile = new File(Paths.cache, `prescription_${prescription.id}.jpg`);
      await tempFile.write(prescription.imageBase64, { encoding: 'base64' });

      await Sharing.shareAsync(tempFile.uri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share Prescription',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share prescription');
    } finally {
      setSharing(false);
    }
  };

  const printPrescription = async () => {
    if (!prescription) return;

    try {
      const html = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                text-align: center;
              }
              h1 {
                color: #333;
              }
              .info {
                color: #666;
                margin-bottom: 20px;
              }
              img {
                max-width: 100%;
                height: auto;
                border: 1px solid #ddd;
                border-radius: 8px;
              }
            </style>
          </head>
          <body>
            <h1>${prescription.type === 'eyeglass' ? 'Eyeglass' : 'Contact Lens'} Prescription</h1>
            <p class="info">Date: ${formatDate(prescription.createdAt)}</p>
            <img src="data:image/jpeg;base64,${prescription.imageBase64}" />
          </body>
        </html>
      `;

      await Print.printAsync({ html });
    } catch (error) {
      console.error('Error printing:', error);
      Alert.alert('Error', 'Failed to print prescription');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4facfe" />
      </SafeAreaView>
    );
  }

  if (!prescription) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
          <Text style={styles.errorText}>Prescription not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: prescription.type === 'eyeglass' ? 'Eyeglass Rx' : 'Contact Lens Rx',
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${prescription.imageBase64}` }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name={prescription.type === 'eyeglass' ? 'glasses-outline' : 'eye-outline'}
                size={28}
                color="#4facfe"
              />
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>
                {prescription.type === 'eyeglass' ? 'Eyeglass' : 'Contact Lens'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={28} color="#4facfe" />
              <Text style={styles.infoLabel}>Saved On</Text>
              <Text style={styles.infoValue}>
                {new Date(prescription.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={shareImage}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="share-outline" size={24} color="#fff" />
          )}
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.printButton]}
          onPress={printPrescription}
        >
          <Ionicons name="print-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Print</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  imageContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: width * 1.2,
  },
  infoCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(79, 172, 254, 0.2)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#4facfe',
  },
  printButton: {
    backgroundColor: '#00c9a7',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
