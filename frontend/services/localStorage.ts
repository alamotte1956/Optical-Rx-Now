import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paths, File, Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { encryptData, decryptData, encryptImage, decryptImage } from './encryption';
import { 
  safeGetItem, 
  safeSetItem, 
  getItemWithRecovery, 
  StorageError, 
  handleStorageError 
} from '../app/utils/storage';

// Storage Keys
const FAMILY_MEMBERS_KEY = '@optical_rx_family_members';
const PRESCRIPTIONS_KEY = '@optical_rx_prescriptions';

// Queue for preventing concurrent write operations
let operationQueue: Promise<void> = Promise.resolve();

const queueOperation = <T>(operation: () => Promise<T>): Promise<T> => {
  const queued = operationQueue.then(operation).catch(error => {
    console.error('Queued operation failed:', error);
    throw error;
  });
  operationQueue = queued.catch(() => {}); // Prevent queue blocking on errors
  return queued;
};

// Prescription images directory
const getImagesDirectory = () => {
  return new Directory(Paths.document, 'prescription_images');
};

// Ensure images directory exists
const ensureImageDirExists = async () => {
  const imagesDir = getImagesDirectory();
  if (!imagesDir.exists) {
    imagesDir.create();
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
  return queueOperation(async () => {
    try {
      console.log('Getting family members from storage...');
      
      // Use safe storage with recovery
      const members = await getItemWithRecovery<FamilyMember[]>(
        FAMILY_MEMBERS_KEY,
        []
      );
      
      // If data is encrypted, decrypt it
      if (typeof members === 'string') {
        console.log('Decrypting family members data...');
        const decrypted = await decryptData(members);
        console.log(`Family members retrieved successfully: ${decrypted.length}`);
        return decrypted;
      }
      
      console.log(`Family members retrieved successfully: ${members.length}`);
      return members;
    } catch (error) {
      console.error('Error getting family members:', error);
      
      // Handle storage errors gracefully
      if (error instanceof StorageError) {
        handleStorageError(error);
      }
      
      // Return empty array to prevent the app from getting stuck
      return [];
    }
  });
};

export const createFamilyMember = async (
  member: Omit<FamilyMember, 'id' | 'created_at'>
): Promise<FamilyMember> => {
  return queueOperation(async () => {
    try {
      console.log('Creating family member:', member);
      const members = await getFamilyMembers();
      console.log(`Current members count: ${members.length}`);
      
      const newMember: FamilyMember = {
        ...member,
        id: `member_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        created_at: new Date().toISOString(),
      };
      
      members.push(newMember);
      console.log(`New members count: ${members.length}`);
      
      const encrypted = await encryptData(members);
      console.log('Data encrypted successfully');
      
      // Use safe storage with backup
      await safeSetItem(FAMILY_MEMBERS_KEY, encrypted, true);
      console.log('Data saved to AsyncStorage successfully');
      
      return newMember;
    } catch (error) {
      console.error('Error creating family member:', error);
      
      // Handle storage errors
      if (error instanceof StorageError) {
        handleStorageError(error);
      }
      
      throw error;
    }
  });
};

export const deleteFamilyMember = async (id: string): Promise<void> => {
  return queueOperation(async () => {
    try {
      const members = await getFamilyMembers();
      const filtered = members.filter(m => m.id !== id);
      const encrypted = await encryptData(filtered);
      await safeSetItem(FAMILY_MEMBERS_KEY, encrypted, true);
      
      // Delete all prescriptions for this member
      const prescriptions = await getPrescriptions();
      const remainingPrescriptions = prescriptions.filter(p => p.family_member_id !== id);
      const encryptedPrescriptions = await encryptData(remainingPrescriptions);
      await safeSetItem(PRESCRIPTIONS_KEY, encryptedPrescriptions, true);
      
      // Delete prescription images
      const deletedPrescriptions = prescriptions.filter(p => p.family_member_id === id);
      for (const rx of deletedPrescriptions) {
        await deletePrescriptionImage(rx.id);
      }
    } catch (error) {
      console.error('Error deleting family member:', error);
      
      if (error instanceof StorageError) {
        handleStorageError(error);
      }
      
      throw error;
    }
  });
};

// Prescriptions CRUD
export const getPrescriptions = async (familyMemberId?: string): Promise<Prescription[]> => {
  return queueOperation(async () => {
    try {
      // Use safe storage with recovery
      const prescriptions = await getItemWithRecovery<Prescription[]>(
        PRESCRIPTIONS_KEY,
        []
      );
      
      // If data is encrypted, decrypt it
      if (typeof prescriptions === 'string') {
        const decrypted = await decryptData(prescriptions);
        return familyMemberId ? decrypted.filter(p => p.family_member_id === familyMemberId) : decrypted;
      }
      
      return familyMemberId ? prescriptions.filter(p => p.family_member_id === familyMemberId) : prescriptions;
    } catch (error) {
      console.error('Error getting prescriptions:', error);
      
      if (error instanceof StorageError) {
        handleStorageError(error);
      }
      
      return [];
    }
  });
};

export const getPrescriptionById = async (id: string): Promise<Prescription | null> => {
  const prescriptions = await getPrescriptions();
  return prescriptions.find(p => p.id === id) || null;
};

export const createPrescription = async (
  prescription: Omit<Prescription, 'id' | 'created_at' | 'image_uri' | 'expiry_date'> & { imageBase64: string }
): Promise<Prescription> => {
  return queueOperation(async () => {
    await ensureImageDirExists();
    
    const id = `rx_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const imageFileName = `${id}.enc`;
    
    const imagesDir = getImagesDirectory();
    const imageFile = new File(imagesDir, imageFileName);
    
    const base64Data = prescription.imageBase64.includes(',') 
      ? prescription.imageBase64.split(',')[1] 
      : prescription.imageBase64;
    
    try {
      // Encrypt and save image
      const encryptedImage = await encryptImage(base64Data);
      imageFile.create();
      imageFile.write(encryptedImage);
      
      // Calculate expiry date
      const dateTaken = new Date(prescription.date_taken);
      const expiryDate = new Date(dateTaken);
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      
      const newPrescription: Prescription = {
        id,
        family_member_id: prescription.family_member_id,
        rx_type: prescription.rx_type,
        image_uri: imageFile.uri,
        notes: prescription.notes || '',
        date_taken: prescription.date_taken,
        expiry_date: expiryDate.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      
      const prescriptions = await getPrescriptions();
      prescriptions.push(newPrescription);
      
      const encrypted = await encryptData(prescriptions);
      await safeSetItem(PRESCRIPTIONS_KEY, encrypted, true);
      
      return newPrescription;
    } catch (error) {
      // Cleanup on error
      if (imageFile.exists) {
        try {
          imageFile.delete();
        } catch (deleteError) {
          console.error('Error cleaning up image file:', deleteError);
        }
      }
      throw error;
    }
  });
};

export const deletePrescription = async (id: string): Promise<void> => {
  return queueOperation(async () => {
    try {
      const prescriptions = await getPrescriptions();
      const filtered = prescriptions.filter(p => p.id !== id);
      const encrypted = await encryptData(filtered);
      await safeSetItem(PRESCRIPTIONS_KEY, encrypted, true);
      await deletePrescriptionImage(id);
    } catch (error) {
      console.error('Error deleting prescription:', error);
      
      if (error instanceof StorageError) {
        handleStorageError(error);
      }
      
      throw error;
    }
  });
};

export const clonePrescription = async (id: string): Promise<Prescription> => {
  return queueOperation(async () => {
    const original = await getPrescriptionById(id);
    if (!original) {
      throw new Error('Prescription not found');
    }

    await ensureImageDirExists();
    
    // Generate new ID for the cloned prescription
    const newId = `rx_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const newImageFileName = `${newId}.enc`;
    
    const imagesDir = getImagesDirectory();
    const originalImageFile = new File(imagesDir, `${original.id}.enc`);
    const newImageFile = new File(imagesDir, newImageFileName);
    
    try {
      // Copy the encrypted image file
      if (originalImageFile.exists) {
        const imageData = await originalImageFile.text();
        newImageFile.create();
        newImageFile.write(imageData);
      }
      
      // Set the date to today
      const today = new Date();
      const dateTaken = today.toISOString().split('T')[0];
      const expiryDate = new Date(today);
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      
      const clonedPrescription: Prescription = {
        id: newId,
        family_member_id: original.family_member_id,
        rx_type: original.rx_type,
        image_uri: newImageFile.uri,
        notes: original.notes,
        date_taken: dateTaken,
        expiry_date: expiryDate.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      
      const prescriptions = await getPrescriptions();
      prescriptions.push(clonedPrescription);
      
      const encrypted = await encryptData(prescriptions);
      await safeSetItem(PRESCRIPTIONS_KEY, encrypted, true);
      
      return clonedPrescription;
    } catch (error) {
      // Cleanup on error
      if (newImageFile.exists) {
        try {
          newImageFile.delete();
        } catch (deleteError) {
          console.error('Error cleaning up cloned image file:', deleteError);
        }
      }
      throw error;
    }
  });
};

const deletePrescriptionImage = async (prescriptionId: string): Promise<void> => {
  try {
    const imagesDir = getImagesDirectory();
    const imageFile = new File(imagesDir, `${prescriptionId}.enc`);
    if (imageFile.exists) {
      imageFile.delete();
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Load encrypted prescription image
export const loadPrescriptionImage = async (imageUri: string): Promise<string> => {
  try {
    const imageFile = new File(Paths.document, imageUri.replace(Paths.document + '/', ''));
    const encryptedImage = await imageFile.text();
    const decryptedImage = await decryptImage(encryptedImage);
    return decryptedImage;
  } catch (error) {
    console.error('Error loading prescription image:', error);
    throw error;
  }
};

// Export encrypted backup
export const exportEncryptedBackup = async (): Promise<void> => {
  try {
    const members = await getFamilyMembers();
    const prescriptions = await getPrescriptions();
    
    const backup = {
      version: '1.0',
      app: 'Optical Rx Now',
      exported_at: new Date().toISOString(),
      members,
      prescriptions: prescriptions.map(p => ({
        ...p,
        image_uri: 'EXCLUDED_FROM_BACKUP', // Don't include file paths
      })),
    };
    
    // Encrypt entire backup
    const encrypted = await encryptData(backup);
    
    // Save to temporary file
    const fileName = `optical-rx-backup-${Date.now()}.encrypted`;
    const tempDir = new Directory(Paths.cache, 'backups');
    if (!tempDir.exists) {
      tempDir.create();
    }
    const backupFile = new File(tempDir, fileName);
    backupFile.create();
    await backupFile.write(encrypted);
    
    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(backupFile.uri, {
        mimeType: 'application/octet-stream',
        dialogTitle: 'Save encrypted backup',
      });
    }
    
    // Clean up temp file
    if (backupFile.exists) {
      backupFile.delete();
    }
  } catch (error) {
    console.error('Error exporting backup:', error);
    throw error;
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
