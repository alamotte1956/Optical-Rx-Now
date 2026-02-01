import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import AdBanner from '../../components/AdBanner';

interface Prescription {
  id: string;
  type: 'eyeglass' | 'contact';
  imageBase64: string;
  createdAt: string;
  notes?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  createdAt: string;
  prescriptionCount: number;
}

const MEMBERS_KEY = '@rx_vault_members';

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const PRESCRIPTIONS_KEY = `@rx_vault_prescriptions_${id}`;

  const loadData = async () => {
    try {
      // Load member info
      const membersData = await AsyncStorage.getItem(MEMBERS_KEY);
      if (membersData) {
        const members: FamilyMember[] = JSON.parse(membersData);
        const foundMember = members.find((m) => m.id === id);
        if (foundMember) {
          setMember(foundMember);
        }
      }

      // Load prescriptions
      const prescriptionsData = await AsyncStorage.getItem(PRESCRIPTIONS_KEY);
      if (prescriptionsData) {
        setPrescriptions(JSON.parse(prescriptionsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please enable camera and photo library permissions in your device settings to add prescriptions.'
        );
        return false;
      }
    }
    return true;
  };

  const addPrescription = async (type: 'eyeglass' | 'contact') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Add Prescription',
      'How would you like to add the prescription?',
      [
        {
          text: 'Take Photo',
          onPress: () => captureImage(type, 'camera'),
        },
        {
          text: 'Choose from Library',
          onPress: () => captureImage(type, 'library'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const captureImage = async (type: 'eyeglass' | 'contact', source: 'camera' | 'library') => {
    try {
      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets[0].base64) {
        const newPrescription: Prescription = {
          id: Date.now().toString(),
          type,
          imageBase64: result.assets[0].base64,
          createdAt: new Date().toISOString(),
        };

        const updatedPrescriptions = [...prescriptions, newPrescription];
        await AsyncStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(updatedPrescriptions));
        setPrescriptions(updatedPrescriptions);

        // Update member prescription count
        await updateMemberCount(updatedPrescriptions.length);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const updateMemberCount = async (count: number) => {
    try {
      const membersData = await AsyncStorage.getItem(MEMBERS_KEY);
      if (membersData) {
        const members: FamilyMember[] = JSON.parse(membersData);
        const updatedMembers = members.map((m) =>
          m.id === id ? { ...m, prescriptionCount: count } : m
        );
        await AsyncStorage.setItem(MEMBERS_KEY, JSON.stringify(updatedMembers));
        setMember((prev) => (prev ? { ...prev, prescriptionCount: count } : null));
      }
    } catch (error) {
      console.error('Error updating member count:', error);
    }
  };

  const deletePrescription = async (prescriptionId: string) => {
    Alert.alert(
      'Delete Prescription',
      'Are you sure you want to delete this prescription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPrescriptions = prescriptions.filter(
                (p) => p.id !== prescriptionId
              );
              await AsyncStorage.setItem(
                PRESCRIPTIONS_KEY,
                JSON.stringify(updatedPrescriptions)
              );
              setPrescriptions(updatedPrescriptions);
              await updateMemberCount(updatedPrescriptions.length);
            } catch (error) {
              console.error('Error deleting prescription:', error);
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

  const renderPrescription = ({ item }: { item: Prescription }) => (
    <TouchableOpacity
      style={styles.prescriptionCard}
      onPress={() =>
        router.push({
          pathname: '/prescription/[id]',
          params: { id: item.id, memberId: id },
        })
      }
      onLongPress={() => deletePrescription(item.id)}
    >
      <Image
        source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
        style={styles.prescriptionImage}
      />
      <View style={styles.prescriptionOverlay}>
        <View style={styles.prescriptionBadge}>
          <Ionicons
            name={item.type === 'eyeglass' ? 'glasses-outline' : 'eye-outline'}
            size={16}
            color="#fff"
          />
          <Text style={styles.prescriptionType}>
            {item.type === 'eyeglass' ? 'Eyeglass' : 'Contact Lens'}
          </Text>
        </View>
        <Text style={styles.prescriptionDate}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
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

      <Text style={styles.hint}>Long press on a prescription to delete</Text>
      
      {/* AdMob Banner */}
      <AdBanner />
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
  prescriptionCard: {
    width: '48%',
    aspectRatio: 0.75,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#1a1a2e',
  },
  prescriptionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
});
