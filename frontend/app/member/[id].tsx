import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  getFamilyMembers, 
  getPrescriptions, 
  deletePrescription as deletePrescriptionService,
  type FamilyMember, 
  type Prescription 
} from '../../services/localStorage';

// Prescription with optional loaded image data
interface PrescriptionWithImage extends Prescription {
  imageBase64?: string;
}

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPrescription, setDeletingPrescription] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load family members using the proper service
      const members = await getFamilyMembers();
      const foundMember = members.find((m) => m.id === id);
      
      if (foundMember) {
        setMember(foundMember);
      } else {
        Alert.alert('Error', 'Family member not found');
        router.back();
        return;
      }

      // Load prescriptions for this specific member using proper service
      const allPrescriptions = await getPrescriptions(id); // Pass family member ID to filter
      
      // Don't preload images - just set prescriptions without image data
      // Images will be loaded on-demand or shown as placeholders
      setPrescriptions(allPrescriptions.map(rx => ({ ...rx, imageBase64: undefined })));
      // Load images for each prescription
      const prescriptionsWithImages = await Promise.all(
        allPrescriptions.map(async (rx) => {
          try {
            const imageBase64 = await(rx.image_uri);
            return { ...rx, imageBase64 };
          } catch (error) {
            console.error(`Failed to load image for prescription ${rx.id}:`, error);
            return { ...rx, imageBase64: '' };
          }
        })
      );
      
      setPrescriptions(prescriptionsWithImages);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const addPrescription = (type: 'eyeglass' | 'contact') => {
    // Navigate to add-rx screen with pre-selected member
    router.push({
      pathname: '/add-rx',
      params: { memberId: id, rxType: type }
    });
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    // Prevent double-tap during deletion
    if (deletingPrescription) return;
    
    Alert.alert(
      'Delete Prescription',
      'Are you sure you want to delete this prescription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingPrescription(true);
            try {
              await deletePrescriptionService(prescriptionId); // Use the proper service
              await loadData(); // Reload prescriptions
            } catch (error) {
              console.error('Error deleting prescription:', error);
              Alert.alert('Error', 'Failed to delete prescription');
            } finally {
              setDeletingPrescription(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderPrescription = ({ item }: { item: PrescriptionWithImage }) => (
    <View style={styles.prescriptionCardWrapper}>
      <TouchableOpacity
        style={styles.prescriptionCard}
        onPress={() =>
          router.push({
            pathname: '/prescription/[id]',
            params: { id: item.id, memberId: id },
          })
        }
        onLongPress={() => handleDeletePrescription(item.id)}
      >
        {item.imageBase64 ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
            style={styles.prescriptionImage}
          />
        ) : (
          <View style={[styles.prescriptionImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color="#666" />
          </View>
        )}
        <View style={styles.prescriptionOverlay}>
          <View style={styles.prescriptionBadge}>
            <Ionicons
              name={item.rx_type === 'eyeglass' ? 'glasses-outline' : 'eye-outline'}
              size={16}
              color="#fff"
            />
            <Text style={styles.prescriptionType}>
              {item.rx_type === 'eyeglass' ? 'Eyeglass' : 'Contact Lens'}
            </Text>
          </View>
          <Text style={styles.prescriptionDate}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePrescription(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color="#4facfe" />
      <Text style={styles.emptyTitle}>No Prescriptions Yet</Text>
      <Text style={styles.emptySubtext}>
        Tap the buttons below to add eyeglass or contact lens prescriptions
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: member?.name || 'Prescriptions',
        }}
      />

      {member && (
        <View style={styles.memberHeader}>
          <View style={styles.memberAvatar}>
            <Ionicons name="person" size={36} color="#4facfe" />
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberStats}>
              {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderPrescription}
        numColumns={2}
        contentContainerStyle={[
          styles.listContainer,
          prescriptions.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={!loading ? EmptyState : null}
        columnWrapperStyle={prescriptions.length > 0 ? styles.row : undefined}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.addButton, styles.eyeglassButton]}
          onPress={() => addPrescription('eyeglass')}
        >
          <Ionicons name="glasses-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Eyeglass Rx</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, styles.contactButton]}
          onPress={() => addPrescription('contact')}
        >
          <Ionicons name="eye-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Contact Rx</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Tap trash icon or long press on a prescription to delete</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 172, 254, 0.2)',
  },
  memberAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberDetails: {
    marginLeft: 16,
  },
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  memberStats: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  listContainer: {
    padding: 12,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
  prescriptionCardWrapper: {
    position: 'relative',
    width: '48%',
    marginBottom: 16,
  },
  prescriptionCard: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  prescriptionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prescriptionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  prescriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prescriptionType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  prescriptionDate: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  eyeglassButton: {
    backgroundColor: '#4facfe',
  },
  contactButton: {
    backgroundColor: '#00c9a7',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    paddingBottom: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});




