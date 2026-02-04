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
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Paths, File, Directory } from 'expo-file-system';
import { getPrescriptionById, loadPrescriptionImage } from '../../services/localStorage';
import { authenticateUser } from '../../services/authentication';

export default function PrescriptionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [prescription, setPrescription] = useState<any>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    loadPrescriptionData();
  }, [id]);

  const loadPrescriptionData = async () => {
    try {
      // Require authentication
      const authenticated = await authenticateUser("Authenticate to view prescription");
      
      if (!authenticated) {
        Alert.alert("Authentication Failed", "Cannot view prescription");
        router.back();
        return;
      }
      
      // Load prescription data
      const rx = await getPrescriptionById(id);
      if (!rx) {
        Alert.alert("Error", "Prescription not found");
        router.back();
        return;
      }
      
      setPrescription(rx);
      
      // Load encrypted image
      if (rx.image_uri) {
        const decryptedImage = await loadPrescriptionImage(rx.image_uri);
        setImageBase64(decryptedImage);
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      Alert.alert("Error", "Failed to load prescription");
    } finally {
      setLoading(false);
    }
  };

  const shareImage = async () => {
    if (!prescription || !imageBase64) return;

    setSharing(true);
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
        return;
      }

      // Create a temporary file for sharing
      const tempDir = new Directory(Paths.cache, 'temp_shares');
      if (!tempDir.exists) {
        tempDir.create();
      }
      const tempFile = new File(tempDir, `prescription_${prescription.id}.jpg`);
      tempFile.create();
      await tempFile.write(imageBase64, { encoding: 'base64' });

      await Sharing.shareAsync(tempFile.uri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share Prescription',
      });
      
      // Clean up
      if (tempFile.exists) {
        tempFile.delete();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share prescription');
    } finally {
      setSharing(false);
    }
  };

  const printPrescription = async () => {
    if (!prescription || !imageBase64) return;

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
            <h1>${prescription.rx_type === 'eyeglass' ? 'Eyeglass' : 'Contact Lens'} Prescription</h1>
            <p class="info">Date: ${new Date(prescription.date_taken).toLocaleDateString()}</p>
            ${prescription.notes ? `<p class="info">Notes: ${prescription.notes}</p>` : ''}
            <img src="data:image/jpeg;base64,${imageBase64}" />
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

  if (!prescription || !imageBase64) {
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
          title: prescription.rx_type === 'eyeglass' ? 'Eyeglass Rx' : 'Contact Lens Rx',
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name={prescription.rx_type === 'eyeglass' ? 'glasses-outline' : 'eye-outline'}
                size={28}
                color="#4facfe"
              />
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>
                {prescription.rx_type === 'eyeglass' ? 'Eyeglass' : 'Contact Lens'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={28} color="#4facfe" />
              <Text style={styles.infoLabel}>Date Taken</Text>
              <Text style={styles.infoValue}>
                {new Date(prescription.date_taken).toLocaleDateString()}
              </Text>
            </View>
          </View>
          {prescription.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{prescription.notes}</Text>
            </View>
          )}
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
  notesSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(79, 172, 254, 0.2)',
  },
  notesLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
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
