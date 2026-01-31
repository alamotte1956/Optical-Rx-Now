import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FamilyMember {
  id: string;
  name: string;
  createdAt: string;
  prescriptionCount: number;
}

const STORAGE_KEY = '@rx_vault_members';

export default function HomeScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setMembers(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [])
  );

  const deleteMember = async (id: string, name: string) => {
    Alert.alert(
      'Delete Member',
      `Are you sure you want to delete ${name} and all their prescriptions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedMembers = members.filter((m) => m.id !== id);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMembers));
              // Also delete prescriptions for this member
              await AsyncStorage.removeItem(`@rx_vault_prescriptions_${id}`);
              setMembers(updatedMembers);
            } catch (error) {
              console.error('Error deleting member:', error);
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }: { item: FamilyMember }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => router.push(`/member/${item.id}`)}
      onLongPress={() => deleteMember(item.id, item.name)}
    >
      <View style={styles.memberIcon}>
        <Ionicons name="person" size={32} color="#4facfe" />
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberSubtext}>
          {item.prescriptionCount} prescription{item.prescriptionCount !== 1 ? 's' : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={80} color="#4facfe" />
      <Text style={styles.emptyTitle}>No Family Members Yet</Text>
      <Text style={styles.emptySubtext}>
        Tap the + button to add a family member and start storing their prescriptions
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="glasses-outline" size={28} color="#4facfe" />
          <Text style={styles.headerTitle}>Optical Rx Now</Text>
        </View>
        <Text style={styles.headerSubtitle}>Store and Share Optical Prescriptions</Text>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={[
          styles.listContainer,
          members.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={!loading ? EmptyState : null}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-member')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.hint}>Long press on a member to delete</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 172, 254, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    marginLeft: 38,
  },
  listContainer: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  memberIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  memberSubtext: {
    fontSize: 14,
    color: '#888',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    paddingBottom: 10,
  },
});
