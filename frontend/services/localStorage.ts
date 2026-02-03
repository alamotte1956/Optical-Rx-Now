import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Storage Keys
const FAMILY_MEMBERS_KEY = '@optical_rx_family_members';
const PRESCRIPTIONS_KEY = '@optical_rx_prescriptions';
const PRESCRIPTION_IMAGES_DIR = `${FileSystem.documentDirectory}prescription_images/`;

// Ensure images directory exists
const ensureImageDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(PRESCRIPTION_IMAGES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PRESCRIPTION_IMAGES_DIR, { intermediates: true });
  }
};

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  family_member_id: string;
  rx_type: 'eyeglass' | 'contact';
  image_uri: string; // Local file path
  notes: string;
  date_taken: string;
  expiry_date: string;
  created_at: string;
}

// Family Members CRUD
export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  try {
    const data = await AsyncStorage.getItem(FAMILY_MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading family members:', error);
    return [];
  }
};

export const createFamilyMember = async (
  member: Omit<FamilyMember, 'id' | 'created_at'>
): Promise<FamilyMember> => {
  const newMember: FamilyMember = {
    ...member,
    id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
  };
  const members = await getFamilyMembers();
  members.push(newMember);
  await AsyncStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(members));
  return newMember;
};

export const deleteFamilyMember = async (id: string): Promise<void> => {
  const members = await getFamilyMembers();
  const filtered = members.filter(m => m.id !== id);
  await AsyncStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(filtered));
  
  // Delete all prescriptions for this member
  const prescriptions = await getPrescriptions();
  const remainingPrescriptions = prescriptions.filter(p => p.family_member_id !== id);
  await AsyncStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(remainingPrescriptions));
  
  // Delete prescription images
  const deletedPrescriptions = prescriptions.filter(p => p.family_member_id === id);
  for (const rx of deletedPrescriptions) {
    await deletePrescriptionImage(rx.id);
  }
};

// Prescriptions CRUD
export const getPrescriptions = async (familyMemberId?: string): Promise<Prescription[]> => {
  try {
    const data = await AsyncStorage.getItem(PRESCRIPTIONS_KEY);
    const prescriptions: Prescription[] = data ? JSON.parse(data) : [];
    return familyMemberId ? prescriptions.filter(p => p.family_member_id === familyMemberId) : prescriptions;
  } catch (error) {
    console.error('Error loading prescriptions:', error);
    return [];
  }
};

export const getPrescriptionById = async (id: string): Promise<Prescription | null> => {
  const prescriptions = await getPrescriptions();
  return prescriptions.find(p => p.id === id) || null;
};

export const createPrescription = async (
  prescription: Omit<Prescription, 'id' | 'created_at' | 'image_uri'> & { imageBase64: string }
): Promise<Prescription> => {
  await ensureImageDirExists();
  
  const id = `rx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const imageFileName = `${id}.jpg`;
  const imageUri = `${PRESCRIPTION_IMAGES_DIR}${imageFileName}`;
  
  // Save image to file system
  const base64Data = prescription.imageBase64.includes(',') 
    ? prescription.imageBase64.split(',')[1] 
    : prescription.imageBase64;
    
  await FileSystem.writeAsStringAsync(imageUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  // Calculate expiry date (1 year from date_taken)
  const dateTaken = new Date(prescription.date_taken);
  const expiryDate = new Date(dateTaken);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  
  const newPrescription: Prescription = {
    id,
    family_member_id: prescription.family_member_id,
    rx_type: prescription.rx_type,
    image_uri: imageUri,
    notes: prescription.notes || '',
    date_taken: prescription.date_taken,
    expiry_date: expiryDate.toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };
  
  const prescriptions = await getPrescriptions();
  prescriptions.push(newPrescription);
  await AsyncStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
  
  return newPrescription;
};

export const deletePrescription = async (id: string): Promise<void> => {
  const prescriptions = await getPrescriptions();
  const filtered = prescriptions.filter(p => p.id !== id);
  await AsyncStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(filtered));
  await deletePrescriptionImage(id);
};

const deletePrescriptionImage = async (prescriptionId: string): Promise<void> => {
  const imageUri = `${PRESCRIPTION_IMAGES_DIR}${prescriptionId}.jpg`;
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(imageUri);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Stats
export const getStats = async () => {
  const members = await getFamilyMembers();
  const prescriptions = await getPrescriptions();
  
  return {
    family_members: members.length,
    total_prescriptions: prescriptions.length,
    eyeglass_prescriptions: prescriptions.filter(p => p.rx_type === 'eyeglass').length,
    contact_prescriptions: prescriptions.filter(p => p.rx_type === 'contact').length,
  };
};
