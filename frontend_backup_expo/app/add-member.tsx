import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@rx_vault_members';

export default function AddMemberScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const saveMember = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    setSaving(true);
    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      const members = existingData ? JSON.parse(existingData) : [];

      const newMember = {
        id: Date.now().toString(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
        prescriptionCount: 0,
      };

      members.push(newMember);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      router.back();
    } catch (error) {
      console.error('Error saving member:', error);
      Alert.alert('Error', 'Failed to save family member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add" size={60} color="#4facfe" />
          </View>

          <Text style={styles.title}>Add Family Member</Text>
          <Text style={styles.subtitle}>
            Enter the name of the family member whose prescriptions you want to store
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveMember}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={saveMember}
            disabled={saving || !name.trim()}
          >
            {saving ? (
              <Text style={styles.buttonText}>Saving...</Text>
            ) : (
              <>
                <Ionicons name="checkmark" size={24} color="#fff" />
                <Text style={styles.buttonText}>Add Member</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 18,
    color: '#fff',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4facfe',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#333',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#888',
  },
});
