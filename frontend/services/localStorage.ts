import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

// Storage Keys
const KEYS = {
  FAMILY_MEMBERS: "@optical_rx_family_members",
  PRESCRIPTIONS: "@optical_rx_prescriptions",
  SETTINGS: "@optical_rx_settings",
  AGE_VERIFIED: "@optical_rx_age_verified",
  SCHEDULED_NOTIFICATIONS: "@optical_rx_notifications",
};

// Types
export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  familyMemberId: string;
  rxType: "eyeglass" | "contact";
  imageBase64: string; // Now stores file path instead of base64
  notes: string;
  dateTaken: string;
  expiryDate: string | null;
  createdAt: string;
}

// Internal type for storage (without image data)
interface PrescriptionStorage {
  id: string;
  familyMemberId: string;
  rxType: "eyeglass" | "contact";
  imagePath: string; // File path to image
  notes: string;
  dateTaken: string;
  expiryDate: string | null;
  createdAt: string;
}

export interface Settings {
  notificationsEnabled: boolean;
  email: string | null;
}

export interface ScheduledNotification {
  id: string;
  prescriptionId: string;
  triggerDate: string;
  daysBefore: number;
  notificationId: string | null;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ==================== Utility Functions ====================

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Image storage directory
const IMAGE_DIR = `${FileSystem.documentDirectory}prescription_images/`;

// Ensure image directory exists
const ensureImageDir = async (): Promise<boolean> => {
  try {
    if (!FileSystem.documentDirectory) {
      console.log("FileSystem.documentDirectory is not available");
      return false;
    }
    
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
      console.log("Created image directory:", IMAGE_DIR);
    }
    return true;
  } catch (error) {
    console.log("Error ensuring image directory:", error);
    return false;
  }
};

// Validate base64 data
const isValidBase64 = (data: string): boolean => {
  if (!data || data.length < 100) return false;
  
  // Check if it has data URI prefix or is raw base64
  const base64Part = data.startsWith("data:") ? data.split(",")[1] : data;
  if (!base64Part || base64Part.length < 100) return false;
  
  // Basic base64 character validation
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  return base64Regex.test(base64Part.substring(0, 100)); // Check first 100 chars
};

// Save image to file system and return file path
const saveImageToFile = async (base64Data: string, prescriptionId: string): Promise<string | null> => {
  try {
    // Validate input
    if (!isValidBase64(base64Data)) {
      console.log("Invalid base64 data provided");
      return null;
    }
    
    // Ensure directory exists
    const dirReady = await ensureImageDir();
    if (!dirReady) {
      console.log("Could not create image directory");
      return null;
    }
    
    // Remove data URI prefix if present
    let imageData = base64Data;
    if (base64Data.startsWith("data:")) {
      const parts = base64Data.split(",");
      if (parts.length < 2) {
        console.log("Invalid data URI format");
        return null;
      }
      imageData = parts[1];
    }
    
    const filePath = `${IMAGE_DIR}${prescriptionId}.jpg`;
    
    await FileSystem.writeAsStringAsync(filePath, imageData, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Verify file was created
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      console.log("File was not created");
      return null;
    }
    
    console.log("Image saved to:", filePath, "size:", fileInfo.size);
    return filePath;
  } catch (error) {
    console.log("Error saving image to file:", error);
    return null;
  }
};

// Load image from file system as base64 data URI
const loadImageFromFile = async (filePath: string): Promise<string | null> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      console.log("Image file not found:", filePath);
      return null;
    }
    
    const base64 = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.log("Error loading image:", error);
    return null;
  }
};

// Delete image file
const deleteImageFile = async (filePath: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
      console.log("Deleted image file:", filePath);
    }
  } catch (error) {
    console.log("Error deleting image:", error);
  }
};

// ==================== Family Members ====================

export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.FAMILY_MEMBERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log("Error getting family members:", error);
    return [];
  }
};

export const saveFamilyMember = async (
  name: string,
  relationship: string
): Promise<FamilyMember> => {
  const members = await getFamilyMembers();
  const newMember: FamilyMember = {
    id: generateId(),
    name,
    relationship,
    createdAt: new Date().toISOString(),
  };
  members.push(newMember);
  await AsyncStorage.setItem(KEYS.FAMILY_MEMBERS, JSON.stringify(members));
  return newMember;
};

export const updateFamilyMember = async (
  id: string,
  name: string,
  relationship: string
): Promise<FamilyMember | null> => {
  const members = await getFamilyMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return null;

  members[index] = { ...members[index], name, relationship };
  await AsyncStorage.setItem(KEYS.FAMILY_MEMBERS, JSON.stringify(members));
  return members[index];
};

export const deleteFamilyMember = async (id: string): Promise<boolean> => {
  const members = await getFamilyMembers();
  const filtered = members.filter((m) => m.id !== id);
  await AsyncStorage.setItem(KEYS.FAMILY_MEMBERS, JSON.stringify(filtered));

  // Also delete associated prescriptions
  const prescriptions = await getPrescriptions();
  const filteredRx = prescriptions.filter((p) => p.familyMemberId !== id);
  await AsyncStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(filteredRx));

  return true;
};

export const getFamilyMemberById = async (
  id: string
): Promise<FamilyMember | null> => {
  const members = await getFamilyMembers();
  return members.find((m) => m.id === id) || null;
};

// ==================== Prescriptions ====================

export const getPrescriptions = async (): Promise<Prescription[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PRESCRIPTIONS);
    if (!data) {
      console.log("No prescriptions in storage");
      return [];
    }
    
    const stored: PrescriptionStorage[] = JSON.parse(data);
    console.log(`=== Loading ${stored.length} prescriptions ===`);
    
    const prescriptions: Prescription[] = [];
    
    for (const item of stored) {
      let imageBase64 = "";
      
      console.log(`Processing: ${item.id}`);
      console.log(`  imagePath: ${item.imagePath?.substring(0, 60)}...`);
      
      // Check if imagePath is a valid file path (not an error marker)
      const errorMarkers = ["FILE_SAVE_FAILED", "FILE_SAVE_ERROR", "NO_DOC_DIR", "FILE_NOT_CREATED", "INVALID_BASE64"];
      const isErrorMarker = errorMarkers.includes(item.imagePath);
      const isDataUri = item.imagePath?.startsWith("data:");
      const isFilePath = item.imagePath && !isErrorMarker && !isDataUri && item.imagePath.length > 10;
      
      if (isFilePath) {
        try {
          console.log(`  Checking file: ${item.imagePath}`);
          const fileInfo = await FileSystem.getInfoAsync(item.imagePath);
          console.log(`  File exists: ${fileInfo.exists}`);
          
          if (fileInfo.exists) {
            const base64 = await FileSystem.readAsStringAsync(item.imagePath, {
              encoding: FileSystem.EncodingType.Base64,
            });
            imageBase64 = `data:image/jpeg;base64,${base64}`;
            console.log(`  Image loaded, size: ${imageBase64.length}`);
          } else {
            console.log(`  File not found at path`);
          }
        } catch (e: any) {
          console.log(`  Error loading image: ${e?.message || e}`);
        }
      } else if (isDataUri) {
        // Legacy: imagePath contains base64 data directly
        imageBase64 = item.imagePath;
        console.log(`  Using legacy base64 data, size: ${imageBase64.length}`);
      } else {
        console.log(`  No valid image path (marker: ${item.imagePath})`);
      }
      
      prescriptions.push({
        id: item.id,
        familyMemberId: item.familyMemberId,
        rxType: item.rxType,
        imageBase64,
        notes: item.notes || "",
        dateTaken: item.dateTaken,
        expiryDate: item.expiryDate,
        createdAt: item.createdAt,
      });
    }
    
    console.log(`=== Loaded ${prescriptions.length} prescriptions ===`);
    return prescriptions;
  } catch (error: any) {
    console.log("Error getting prescriptions:", error?.message || error);
    return [];
  }
};
  } catch (error) {
    console.log("Error getting prescriptions:", error);
    return [];
  }
};

export const savePrescription = async (
  prescription: Omit<Prescription, "id" | "createdAt">
): Promise<Prescription> => {
  const prescriptionId = generateId();
  const createdAt = new Date().toISOString();
  
  console.log("=== savePrescription called ===");
  console.log("ID:", prescriptionId);
  console.log("Has image:", !!prescription.imageBase64);
  console.log("Image length:", prescription.imageBase64?.length || 0);
  
  // Step 1: Try to save image to file system
  let imagePath = "";
  
  if (prescription.imageBase64 && prescription.imageBase64.length > 100) {
    try {
      const docDir = FileSystem.documentDirectory;
      if (!docDir) {
        console.log("ERROR: documentDirectory is null");
        imagePath = "NO_DOC_DIR";
      } else {
        const imageDir = `${docDir}rx_images/`;
        console.log("Image directory:", imageDir);
        
        // Ensure directory exists
        const dirInfo = await FileSystem.getInfoAsync(imageDir);
        console.log("Directory exists:", dirInfo.exists);
        
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
          console.log("Created directory");
        }
        
        // Extract raw base64 (remove data URI prefix)
        let rawBase64 = prescription.imageBase64;
        if (rawBase64.startsWith("data:")) {
          const parts = rawBase64.split(",");
          rawBase64 = parts[1] || "";
        }
        console.log("Raw base64 length:", rawBase64.length);
        
        if (rawBase64.length > 100) {
          // Write to file
          const filePath = `${imageDir}${prescriptionId}.jpg`;
          console.log("Writing to:", filePath);
          
          await FileSystem.writeAsStringAsync(filePath, rawBase64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Verify file was written
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          console.log("File created:", fileInfo.exists, "Size:", (fileInfo as any).size);
          
          if (fileInfo.exists) {
            imagePath = filePath;
            console.log("SUCCESS: Image saved to:", filePath);
          } else {
            console.log("ERROR: File not created");
            imagePath = "FILE_NOT_CREATED";
          }
        } else {
          console.log("ERROR: Raw base64 too short");
          imagePath = "INVALID_BASE64";
        }
      }
    } catch (fileError: any) {
      console.log("File save error:", fileError?.message || fileError);
      imagePath = "FILE_SAVE_ERROR";
    }
  } else {
    console.log("No valid image data to save");
  }
  
  console.log("Final imagePath:", imagePath);
  
  // Step 2: Save prescription metadata to AsyncStorage
  try {
    const data = await AsyncStorage.getItem(KEYS.PRESCRIPTIONS);
    const stored: PrescriptionStorage[] = data ? JSON.parse(data) : [];
    
    const newStored: PrescriptionStorage = {
      id: prescriptionId,
      familyMemberId: prescription.familyMemberId,
      rxType: prescription.rxType,
      imagePath,
      notes: prescription.notes || "",
      dateTaken: prescription.dateTaken,
      expiryDate: prescription.expiryDate,
      createdAt,
    };
    
    stored.push(newStored);
    await AsyncStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(stored));
    console.log("Prescription metadata saved, total count:", stored.length);
  } catch (storageError: any) {
    console.log("AsyncStorage error:", storageError?.message || storageError);
    throw new Error("Failed to save prescription");
  }
  
  // Return the prescription with original image data
  const newRx: Prescription = {
    id: prescriptionId,
    familyMemberId: prescription.familyMemberId,
    rxType: prescription.rxType,
    imageBase64: prescription.imageBase64,
    notes: prescription.notes || "",
    dateTaken: prescription.dateTaken,
    expiryDate: prescription.expiryDate,
    createdAt,
  };
  
  console.log("=== savePrescription complete ===");
  return newRx;
};

export const getPrescriptionById = async (
  id: string
): Promise<Prescription | null> => {
  const prescriptions = await getPrescriptions();
  return prescriptions.find((p) => p.id === id) || null;
};

export const deletePrescription = async (id: string): Promise<boolean> => {
  try {
    // Get stored prescriptions
    const data = await AsyncStorage.getItem(KEYS.PRESCRIPTIONS);
    const storedPrescriptions: PrescriptionStorage[] = data ? JSON.parse(data) : [];
    
    // Find the prescription to get image path
    const toDelete = storedPrescriptions.find((p) => p.id === id);
    
    // Delete the image file if it exists
    if (toDelete?.imagePath && toDelete.imagePath.startsWith(FileSystem.documentDirectory || "")) {
      await deleteImageFile(toDelete.imagePath);
    }
    
    // Remove from array
    const filtered = storedPrescriptions.filter((p) => p.id !== id);
    await AsyncStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(filtered));

    // Cancel associated notifications
    await cancelPrescriptionNotifications(id);

    console.log(`Deleted prescription ${id}`);
    return true;
  } catch (error) {
    console.log("Error deleting prescription:", error);
    return false;
  }
};

export const getPrescriptionsByMember = async (
  memberId: string
): Promise<Prescription[]> => {
  const prescriptions = await getPrescriptions();
  return prescriptions.filter((p) => p.familyMemberId === memberId);
};

// ==================== Settings ====================

export const getSettings = async (): Promise<Settings> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : { notificationsEnabled: true, email: null };
  } catch (error) {
    console.log("Error getting settings:", error);
    return { notificationsEnabled: true, email: null };
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

// ==================== Age Verification ====================

export const isAgeVerified = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.AGE_VERIFIED);
    return value === "true";
  } catch (error) {
    return false;
  }
};

export const setAgeVerified = async (verified: boolean): Promise<void> => {
  await AsyncStorage.setItem(KEYS.AGE_VERIFIED, verified ? "true" : "false");
};

// ==================== Notifications ====================

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permissions not granted");
      return false;
    }

    // Configure for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("expiry-alerts", {
        name: "Prescription Expiry Alerts",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4a9eff",
      });
    }

    return true;
  } catch (error) {
    console.log("Error requesting notification permissions:", error);
    return false;
  }
};

export const scheduleExpiryNotifications = async (
  prescription: Prescription
): Promise<void> => {
  if (!prescription.expiryDate) return;

  const settings = await getSettings();
  if (!settings.notificationsEnabled) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // Parse the expiry date properly (handles YYYY-MM-DD format)
  let expiryDate: Date;
  const dateStr = prescription.expiryDate;
  
  // Try YYYY-MM-DD format first
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    expiryDate = new Date(
      parseInt(isoMatch[1]),
      parseInt(isoMatch[2]) - 1,
      parseInt(isoMatch[3])
    );
  } else {
    // Try MM/DD/YYYY format
    const usMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (usMatch) {
      expiryDate = new Date(
        parseInt(usMatch[3]),
        parseInt(usMatch[1]) - 1,
        parseInt(usMatch[2])
      );
    } else {
      // Fallback to Date constructor
      expiryDate = new Date(dateStr);
    }
  }

  // Validate the date
  if (isNaN(expiryDate.getTime())) {
    console.log("Invalid expiry date, skipping notification scheduling");
    return;
  }
  // Notification schedule: 30 days, 14 days, 7 days, 2 days, and morning of expiration
  const alertDays = [30, 14, 7, 2, 0];
  const member = await getFamilyMemberById(prescription.familyMemberId);
  const memberName = member?.name || "Family member";

  const scheduledNotifications: ScheduledNotification[] = [];

  for (const daysBefore of alertDays) {
    const triggerDate = new Date(expiryDate);
    triggerDate.setDate(triggerDate.getDate() - daysBefore);
    // Send at 8 AM in the morning
    triggerDate.setHours(8, 0, 0, 0);

    // Skip if the trigger date is in the past
    if (triggerDate <= new Date()) continue;

    let title: string;
    let body: string;
    
    if (daysBefore === 0) {
      title = "⚠️ Prescription Expires TODAY!";
      body = `${memberName}'s ${prescription.rxType === "eyeglass" ? "eyeglass" : "contact lens"} prescription expires TODAY! Schedule an eye exam immediately to renew your prescription.`;
    } else if (daysBefore === 2) {
      title = "⏰ Prescription Expires in 2 Days!";
      body = `${memberName}'s ${prescription.rxType === "eyeglass" ? "eyeglass" : "contact lens"} prescription expires in 2 days on ${expiryDate.toLocaleDateString()}. Don't forget to schedule your eye exam!`;
    } else if (daysBefore === 7) {
      title = "📅 Prescription Expires in 1 Week";
      body = `${memberName}'s ${prescription.rxType === "eyeglass" ? "eyeglass" : "contact lens"} prescription expires in 7 days on ${expiryDate.toLocaleDateString()}. Time to book your eye appointment!`;
    } else if (daysBefore === 14) {
      title = "📋 Prescription Expires in 2 Weeks";
      body = `${memberName}'s ${prescription.rxType === "eyeglass" ? "eyeglass" : "contact lens"} prescription expires in 14 days on ${expiryDate.toLocaleDateString()}. Consider scheduling an eye exam soon.`;
    } else {
      title = "🔔 Prescription Expires in 30 Days";
      body = `${memberName}'s ${prescription.rxType === "eyeglass" ? "eyeglass" : "contact lens"} prescription will expire on ${expiryDate.toLocaleDateString()}. Start planning your next eye exam!`;
    }

    try {
      // Calculate seconds until the trigger date
      const secondsUntilTrigger = Math.floor(
        (triggerDate.getTime() - Date.now()) / 1000
      );

      // Skip if less than 60 seconds (notification won't work properly)
      if (secondsUntilTrigger < 60) continue;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { prescriptionId: prescription.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilTrigger,
        } as any,
      });

      scheduledNotifications.push({
        id: generateId(),
        prescriptionId: prescription.id,
        triggerDate: triggerDate.toISOString(),
        daysBefore,
        notificationId,
      });
    } catch (error) {
      console.log("Error scheduling notification:", error);
    }
  }

  // Save scheduled notifications
  const existingNotifications = await getScheduledNotifications();
  const updated = [...existingNotifications, ...scheduledNotifications];
  await AsyncStorage.setItem(
    KEYS.SCHEDULED_NOTIFICATIONS,
    JSON.stringify(updated)
  );
};

export const cancelPrescriptionNotifications = async (
  prescriptionId: string
): Promise<void> => {
  const notifications = await getScheduledNotifications();
  const toCancel = notifications.filter(
    (n) => n.prescriptionId === prescriptionId
  );

  for (const notification of toCancel) {
    if (notification.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(
          notification.notificationId
        );
      } catch (error) {
        console.log("Error canceling notification:", error);
      }
    }
  }

  const remaining = notifications.filter(
    (n) => n.prescriptionId !== prescriptionId
  );
  await AsyncStorage.setItem(
    KEYS.SCHEDULED_NOTIFICATIONS,
    JSON.stringify(remaining)
  );
};

export const getScheduledNotifications = async (): Promise<
  ScheduledNotification[]
> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SCHEDULED_NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log("Error getting scheduled notifications:", error);
    return [];
  }
};

// ==================== Stats ====================

export const getStats = async (): Promise<{
  familyMembers: number;
  totalPrescriptions: number;
}> => {
  const members = await getFamilyMembers();
  const prescriptions = await getPrescriptions();
  return {
    familyMembers: members.length,
    totalPrescriptions: prescriptions.length,
  };
};

// ==================== Clear All Data ====================

export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    KEYS.FAMILY_MEMBERS,
    KEYS.PRESCRIPTIONS,
    KEYS.SETTINGS,
    KEYS.SCHEDULED_NOTIFICATIONS,
  ]);
  await Notifications.cancelAllScheduledNotificationsAsync();
};
