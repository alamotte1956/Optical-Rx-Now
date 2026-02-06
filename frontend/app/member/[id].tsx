import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  useLocalSearchParams, 
  useRouter, 
  useFocusEffect, 
  Stack 
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ✅ TRIPLE-STEP RELATIVE PATHS (Confirmed for your structure)
import { 
  getFamilyMembers, 
  getPrescriptions, 
  deletePrescription as deletePrescriptionService 
} from '../../../services/localStorage';

import { FamilyMember, Prescription } from '../../../types';

import PrescriptionCard from '../../../components/PrescriptionCard';

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const members = await getFamilyMembers();
      const foundMember = members.find((m) => m.id === id);
      
      if (foundMember) {
        setMember(foundMember);
      } else {
        // Fallback for your "Al" member if navigation param is wonky
        const al = members.find(m => m.name === 'Al');
        if (al) setMember(al);
      }

      const allPrescriptions = await getPrescriptions(id);
      setPrescriptions(allPrescriptions || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (id) loadData();
    }, [id])
  );

  const handleDeletePrescription = async (prescriptionId: string) => {
    Alert.alert(
      'Delete Prescription',
      'Are you sure you want to delete this prescription? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePrescriptionService(prescriptionId);
              // Reload prescriptions after deletion
              await loadData();
            } catch (error) {
              console.error('Error deleting prescription:', error);
              Alert.alert('Error', 'Failed to delete prescription. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Prescription }) => (
    <PrescriptionCard
      item={item}
      onPress={() =>
        router.push({
          pathname: '/prescription/[id]',
          params: { id: item.id, memberId: id },
        })
      }
      onDelete={() => handleDeletePrescription(item.id)}
    />
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color="#4facfe" />
      <Text style={styles.emptyTitle}>No Prescriptions for {member?.name}</Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/add-rx')}
      >
        <Text style={styles.addButtonText}>Add Your First Rx</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: member?.name || 'Details' }} />

      {member && (
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Managing Rx for {member.name}</Text>
        </View>
      )}

      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  welcomeText: { fontSize: 18, fontWeight: '600', color: '#333' },
  listContainer: { padding: 15, flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, color: '#666', marginTop: 20, marginBottom: 20 },
  addButton: { backgroundColor: '#4facfe', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  addButtonText: { color: '#fff', fontWeight: 'bold' }
});