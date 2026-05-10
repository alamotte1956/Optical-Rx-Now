import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const KEYS = {
  FAMILY_MEMBERS: "@optical_rx_family_members",
  PRESCRIPTIONS: "@optical_rx_prescriptions",
  SETTINGS: "@optical_rx_settings",
  AGE_VERIFIED: "@optical_rx_age_verified",
  SCHEDULED_NOTIFICATIONS: "@optical_rx_notifications",
  INSURANCE_CARDS: "@optical_rx_insurance_cards",
};

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  createdAt: string;
}

export interface InsuranceCard {
  id: string;
  familyMemberId: string;
  label: string;
  frontImageBase64: string;
  backImageBase64: string | null;
  insurerName: string;
  memberId: string;
  groupNumber: string;
  notes: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  familyMemberId: string;
  rxType: "eyeglass" | "contact";
  imageBase64: string;
  notes: string;
  dateTaken: string;
  expiryDate: string | null;
  createdAt: string;
  // Optional doctor/provider info
  doctorName?: string;
  doctorPhone?: string;
  clinicName?: string;
}

interface PrescriptionStorage {
  id: string;
  familyMemberId: string;
  rxType: "eyeglass" | "contact";
  imagePath: string;
  notes: string;
  dateTaken: string;
  expiryDate: string | null;
  createdAt: string;
  // Doctor/provider info
  doctorName?: string;
  doctorPhone?: string;
  clinicName?: string;
}

export interface ReminderSetting {
  days: number;
  label: string;
  enabled: boolean;
}

export interface Settings {
  notificationsEnabled: boolean;
  email: string | null;
  reminderDays?: ReminderSetting[];
}

export interface ScheduledNotification {
  id: string;
  prescriptionId: string;
  triggerDate: string;
  daysBefore: number;
  notificationId: string | null;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const IMAGE_DIR = `${FileSystem.documentDirectory}prescription_images/`;

const ensureImageDir = async (): Promise<boolean> => {
  try {
    if (!FileSystem.documentDirectory) return false;
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
    }
    return true;
  } catch (error) {
    console.log("Error ensuring image directory:", error);
    return false;
  }
};

const saveImageToFile = async (uriOrBase64: string, prescriptionId: string): Promise<string | null> => {
  try {
    const dirReady = await ensureImageDir();
    if (!dirReady) return null;
    
    const filePath = `${IMAGE_DIR}${prescriptionId}.jpg`;

    if (uriOrBase64.startsWith("file://") || uriOrBase64.startsWith("/")) {
      await FileSystem.copyAsync({ from: uriOrBase64, to: filePath });
    } else {
      let imageData = uriOrBase64;
      if (uriOrBase64.startsWith("data:")) {
        const parts = uriOrBase64.split(",");
        if (parts.length >= 2) imageData = parts[1];
      }
      await FileSystem.writeAsStringAsync(filePath, imageData, { encoding: FileSystem.EncodingType.Base64 });
    }
    
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) return null;
    
    return filePath;
  } catch (error) {
    console.log("Error saving image to file:", error);
    return null;
  }
};

const deleteImageFile = async (filePath: string): Promise<void> => {
  try {
    if (!filePath) return;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
    }
  } catch (error) {
    console.log("Error deleting image:", error);
  }
};

export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.FAMILY_MEMBERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log("Error getting family members:", error);
    return [];
  }
};

export const saveFamilyMember = async (name: string, relationship: string): Promise<FamilyMember> => {
  let members: FamilyMember[] = [];
  
  try {
    const data = await AsyncStorage.getItem(KEYS.FAMILY_MEMBERS);
    if (data) {
      members = JSON.parse(data);
    }
  } catch (error) {
    console.log("Error reading members:", error);
  }
  
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

export const getFamilyMemberById = async (id: string): Promise<FamilyMember | null> => {
  const members = await getFamilyMembers();
  return members.find((m) => m.id === id) || null;
};

export const deleteFamilyMember = async (id: string): Promise<boolean> => {
  try {
    const prescriptions = await getPrescriptionsByMember(id);
    for (const rx of prescriptions) {
      await deletePrescription(rx.id);
    }
    const members = await getFamilyMembers();
    const filtered = members.filter((m) => m.id !== id);
    await AsyncStorage.setItem(KEYS.FAMILY_MEMBERS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.log("Error deleting family member:", error);
    return false;
  }
};

export const getPrescriptions = async (): Promise<Prescription[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PRESCRIPTIONS);
    if (!data) return [];
    
    const storedPrescriptions: PrescriptionStorage[] = JSON.parse(data);
    
    const prescriptions: Prescription[] = storedPrescriptions.map((stored) => {
      let imageBase64 = stored.imagePath || "";
      const oldData = stored as any;
      if (!imageBase64 && oldData.imageBase64) {
        imageBase64 = oldData.imageBase64;
      }
      
      return {
        id: stored.id,
        familyMemberId: stored.familyMemberId,
        rxType: stored.rxType,
        imageBase64,
        notes: stored.notes,
        dateTaken: stored.dateTaken,
        expiryDate: stored.expiryDate,
        createdAt: stored.createdAt,
        doctorName: stored.doctorName,
        doctorPhone: stored.doctorPhone,
        clinicName: stored.clinicName,
      };
    });
    
    return prescriptions;
  } catch (error) {
    console.log("Error getting prescriptions:", error);
    return [];
  }
};

export const savePrescription = async (prescription: Omit<Prescription, "id" | "createdAt">): Promise<Prescription> => {
  try {
    const prescriptionId = generateId();
    let imagePath = "";
    
    if (prescription.imageBase64) {
      const savedPath = await saveImageToFile(prescription.imageBase64, prescriptionId);
      imagePath = savedPath || prescription.imageBase64;
    }
    
    const data = await AsyncStorage.getItem(KEYS.PRESCRIPTIONS);
    const storedPrescriptions: PrescriptionStorage[] = data ? JSON.parse(data) : [];
    
    const storageRx: PrescriptionStorage = {
      id: prescriptionId,
      familyMemberId: prescription.familyMemberId,
      rxType: prescription.rxType,
      imagePath,
      notes: prescription.notes,
      dateTaken: prescription.dateTaken,
      expiryDate: prescription.expiryDate,
      createdAt: new Date().toISOString(),
      doctorName: prescription.doctorName,
      doctorPhone: prescription.doctorPhone,
      clinicName: prescription.clinicName,
    };
    
    storedPrescriptions.push(storageRx);
    await AsyncStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(storedPrescriptions));

    const newRx: Prescription = { ...storageRx, imageBase64: imagePath };

    if (newRx.expiryDate) {
      await scheduleExpiryNotifications(newRx).catch(e => console.log("Notif error:", e));
    }

    return newRx;
  } catch (error) {
    console.log("Error saving prescription:", error);
    throw error;
  }
};

export const getPrescriptionById = async (id: string): Promise<Prescription | null> => {
  const prescriptions = await getPrescriptions();
  return prescriptions.find((p) => p.id === id) || null;
};

export const getPrescriptionsByMember = async (memberId: string): Promise<Prescription[]> => {
  const prescriptions = await getPrescriptions();
  return prescriptions.filter((p) => p.familyMemberId === memberId);
};

export const deletePrescription = async (id: string): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PRESCRIPTIONS);
    const storedPrescriptions: PrescriptionStorage[] = data ? JSON.parse(data) : [];
    
    const toDelete = storedPrescriptions.find((p) => p.id === id);
    if (toDelete?.imagePath) {
      await deleteImageFile(toDelete.imagePath);
    }
    
    const filtered = storedPrescriptions.filter((p) => p.id !== id);
    await AsyncStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(filtered));
    await cancelPrescriptionNotifications(id);
    return true;
  } catch (error) {
    console.log("Error deleting prescription:", error);
    return false;
  }
};

export const getSettings = async (): Promise<Settings> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : { notificationsEnabled: true, email: null };
  } catch (error) {
    return { notificationsEnabled: true, email: null };
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const isAgeVerified = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.AGE_VERIFIED);
    return value === "true";
  } catch {
    return false;
  }
};

export const setAgeVerified = async (verified: boolean): Promise<void> => {
  await AsyncStorage.setItem(KEYS.AGE_VERIFIED, verified ? "true" : "false");
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return false;
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("expiry-alerts", {
        name: "Document Expiry Alerts",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    return true;
  } catch {
    return false;
  }
};

export const scheduleExpiryNotifications = async (prescription: Prescription): Promise<void> => {
  if (!prescription.expiryDate) return;
  const settings = await getSettings();
  if (!settings.notificationsEnabled) return;
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  let expiryDate: Date;
  const dateStr = prescription.expiryDate;
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    expiryDate = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  } else {
    expiryDate = new Date(dateStr);
  }
  if (isNaN(expiryDate.getTime())) return;

  // Use custom reminder settings if available, otherwise default
  const defaultAlertDays = [30, 14, 7, 2, 0];
  const alertDays = settings.reminderDays 
    ? settings.reminderDays.filter(r => r.enabled).map(r => r.days)
    : defaultAlertDays;
    
  const member = await getFamilyMemberById(prescription.familyMemberId);
  const memberName = member?.name || "Family member";
  const scheduledNotifications: ScheduledNotification[] = [];

  for (const daysBefore of alertDays) {
    const triggerDate = new Date(expiryDate);
    triggerDate.setDate(triggerDate.getDate() - daysBefore);
    triggerDate.setHours(8, 0, 0, 0);
    if (triggerDate <= new Date()) continue;

    const title = daysBefore === 0 ? "Document Expires TODAY!" : `Document Expires in ${daysBefore} Days`;
    const body = `${memberName}'s ${prescription.rxType} optical document ${daysBefore === 0 ? 'expires today' : `expires on ${expiryDate.toLocaleDateString()}`}`;

    try {
      const secondsUntilTrigger = Math.floor((triggerDate.getTime() - Date.now()) / 1000);
      if (secondsUntilTrigger < 60) continue;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: { title, body, data: { prescriptionId: prescription.id }, sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: secondsUntilTrigger } as any,
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

  const existingNotifications = await getScheduledNotifications();
  await AsyncStorage.setItem(KEYS.SCHEDULED_NOTIFICATIONS, JSON.stringify([...existingNotifications, ...scheduledNotifications]));
};

export const cancelPrescriptionNotifications = async (prescriptionId: string): Promise<void> => {
  try {
    const notifications = await getScheduledNotifications();
    const toCancel = notifications.filter((n) => n.prescriptionId === prescriptionId);
    for (const notification of toCancel) {
      if (notification.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
        } catch {}
      }
    }
    const remaining = notifications.filter((n) => n.prescriptionId !== prescriptionId);
    await AsyncStorage.setItem(KEYS.SCHEDULED_NOTIFICATIONS, JSON.stringify(remaining));
  } catch {}
};

export const getScheduledNotifications = async (): Promise<ScheduledNotification[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SCHEDULED_NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Reschedule ALL expiry notifications for every prescription.
 * Call this when:
 * - Notification settings change (toggle reminders on/off, change days)
 * - App opens (to refresh stale TIME_INTERVAL triggers after reboot)
 */
export const rescheduleAllNotifications = async (): Promise<{ scheduled: number; prescriptions: number }> => {
  try {
    const settings = await getSettings();
    if (!settings.notificationsEnabled) {
      // If notifications disabled, cancel everything
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.setItem(KEYS.SCHEDULED_NOTIFICATIONS, JSON.stringify([]));
      return { scheduled: 0, prescriptions: 0 };
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return { scheduled: 0, prescriptions: 0 };

    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem(KEYS.SCHEDULED_NOTIFICATIONS, JSON.stringify([]));

    // Get all prescriptions with expiry dates
    const allPrescriptions = await getPrescriptions();
    const rxWithExpiry = allPrescriptions.filter(rx => rx.expiryDate);
    
    let totalScheduled = 0;
    const allNewNotifications: ScheduledNotification[] = [];

    const defaultAlertDays = [30, 14, 7, 2, 0];
    const alertDays = settings.reminderDays
      ? settings.reminderDays.filter(r => r.enabled).map(r => r.days)
      : defaultAlertDays;

    for (const rx of rxWithExpiry) {
      if (!rx.expiryDate) continue;

      let expiryDate: Date;
      const dateStr = rx.expiryDate;
      const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoMatch) {
        expiryDate = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
      } else {
        expiryDate = new Date(dateStr);
      }
      if (isNaN(expiryDate.getTime())) continue;

      // Skip if already fully expired (all reminder dates passed)
      const earliestReminder = new Date(expiryDate);
      earliestReminder.setDate(earliestReminder.getDate() - Math.max(...alertDays, 0));
      if (earliestReminder < new Date() && expiryDate < new Date()) continue;

      const member = await getFamilyMemberById(rx.familyMemberId);
      const memberName = member?.name || "Family member";

      for (const daysBefore of alertDays) {
        const triggerDate = new Date(expiryDate);
        triggerDate.setDate(triggerDate.getDate() - daysBefore);
        triggerDate.setHours(8, 0, 0, 0);
        if (triggerDate <= new Date()) continue;

        const title = daysBefore === 0 
          ? "Document Expires TODAY!" 
          : `Document Expires in ${daysBefore} Days`;
        const body = `${memberName}'s ${rx.rxType} optical document ${
          daysBefore === 0 ? 'expires today' : `expires on ${expiryDate.toLocaleDateString()}`
        }`;

        try {
          const secondsUntilTrigger = Math.floor((triggerDate.getTime() - Date.now()) / 1000);
          if (secondsUntilTrigger < 60) continue;

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: { title, body, data: { prescriptionId: rx.id }, sound: true },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: secondsUntilTrigger } as any,
          });

          allNewNotifications.push({
            id: generateId(),
            prescriptionId: rx.id,
            triggerDate: triggerDate.toISOString(),
            daysBefore,
            notificationId,
          });
          totalScheduled++;
        } catch (error) {
          console.log("Error scheduling notification for rx:", rx.id, error);
        }
      }
    }

    await AsyncStorage.setItem(KEYS.SCHEDULED_NOTIFICATIONS, JSON.stringify(allNewNotifications));
    return { scheduled: totalScheduled, prescriptions: rxWithExpiry.length };
  } catch (error) {
    console.log("Error rescheduling all notifications:", error);
    return { scheduled: 0, prescriptions: 0 };
  }
};

/**
 * Send a test notification immediately to verify the device can receive them.
 */
export const sendTestNotification = async (): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return false;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Reminder Working!",
        body: "You'll receive expiry alerts just like this. Your reminders are set up correctly.",
        data: { test: true },
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 } as any,
    });
    return true;
  } catch (error) {
    console.log("Error sending test notification:", error);
    return false;
  }
};

/**
 * Get prescriptions that are expiring within the next N days.
 */
export const getExpiringPrescriptions = async (withinDays: number = 30): Promise<{ rx: Prescription; memberName: string; daysLeft: number }[]> => {
  try {
    const allPrescriptions = await getPrescriptions();
    const members = await getFamilyMembers();
    const memberMap = new Map(members.map(m => [m.id, m.name]));
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + withinDays);

    const expiring: { rx: Prescription; memberName: string; daysLeft: number }[] = [];

    for (const rx of allPrescriptions) {
      if (!rx.expiryDate) continue;

      let expiryDate: Date;
      const dateStr = rx.expiryDate;
      const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoMatch) {
        expiryDate = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
      } else {
        expiryDate = new Date(dateStr);
      }
      if (isNaN(expiryDate.getTime())) continue;

      expiryDate.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Include expired (negative days) and soon-to-expire
      if (daysLeft <= withinDays) {
        expiring.push({
          rx,
          memberName: memberMap.get(rx.familyMemberId) || "Unknown",
          daysLeft,
        });
      }
    }

    // Sort by days left (most urgent first)
    expiring.sort((a, b) => a.daysLeft - b.daysLeft);
    return expiring;
  } catch (error) {
    console.log("Error getting expiring prescriptions:", error);
    return [];
  }
};

export const getStats = async (): Promise<{ familyMembers: number; totalPrescriptions: number }> => {
  const members = await getFamilyMembers();
  const prescriptions = await getPrescriptions();
  return { familyMembers: members.length, totalPrescriptions: prescriptions.length };
};

export const clearAllData = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(IMAGE_DIR, { idempotent: true });
    }
  } catch {}
  await AsyncStorage.multiRemove([KEYS.FAMILY_MEMBERS, KEYS.PRESCRIPTIONS, KEYS.SETTINGS, KEYS.SCHEDULED_NOTIFICATIONS]);
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Recommendation 9: Data Export/Backup
export const exportAllData = async (): Promise<string> => {
  const members = await getFamilyMembers();
  const prescriptions = await getPrescriptions();
  const settings = await getSettings();

  const exportData = {
    exportDate: new Date().toISOString(),
    appVersion: "2.0.1",
    familyMembers: members,
    opticalDocuments: prescriptions.map((p) => ({
      ...p,
      // Include image reference but not full base64 (too large for text export)
      hasImage: !!p.imageBase64,
      imageBase64: p.imageBase64 ? "[IMAGE DATA]" : null,
    })),
    settings,
    summary: {
      totalMembers: members.length,
      totalDocuments: prescriptions.length,
    },
  };

  return JSON.stringify(exportData, null, 2);
};

export const exportAllDataWithImages = async (): Promise<string> => {
  const members = await getFamilyMembers();
  const prescriptions = await getPrescriptions();
  const settings = await getSettings();

  const exportData = {
    exportDate: new Date().toISOString(),
    appVersion: "2.0.1",
    familyMembers: members,
    opticalDocuments: prescriptions,
    settings,
    summary: {
      totalMembers: members.length,
      totalDocuments: prescriptions.length,
    },
  };

  return JSON.stringify(exportData);
};

export const importData = async (jsonString: string): Promise<{ members: number; documents: number }> => {
  const data = JSON.parse(jsonString);

  if (data.familyMembers && Array.isArray(data.familyMembers)) {
    const existing = await getFamilyMembers();
    const existingIds = new Set(existing.map((m) => m.id));
    const newMembers = data.familyMembers.filter((m: FamilyMember) => !existingIds.has(m.id));
    if (newMembers.length > 0) {
      await AsyncStorage.setItem(KEYS.FAMILY_MEMBERS, JSON.stringify([...existing, ...newMembers]));
    }
  }

  if (data.opticalDocuments && Array.isArray(data.opticalDocuments)) {
    const existing = await getPrescriptions();
    const existingIds = new Set(existing.map((p) => p.id));
    const newDocs = data.opticalDocuments.filter((p: Prescription) => !existingIds.has(p.id) && p.imageBase64 !== "[IMAGE DATA]");
    // Note: imports without images will skip, full backup includes images
  }

  return {
    members: data.familyMembers?.length || 0,
    documents: data.opticalDocuments?.length || 0,
  };
};

// ============ Insurance Card Functions ============

export const getInsuranceCards = async (): Promise<InsuranceCard[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.INSURANCE_CARDS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getInsuranceCardsByMember = async (memberId: string): Promise<InsuranceCard[]> => {
  const cards = await getInsuranceCards();
  return cards.filter((c) => c.familyMemberId === memberId);
};

export const saveInsuranceCard = async (card: Omit<InsuranceCard, "id" | "createdAt">): Promise<InsuranceCard> => {
  const cards = await getInsuranceCards();
  const newCard: InsuranceCard = {
    ...card,
    id: `ins_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  cards.push(newCard);
  await AsyncStorage.setItem(KEYS.INSURANCE_CARDS, JSON.stringify(cards));
  return newCard;
};

export const deleteInsuranceCard = async (cardId: string): Promise<void> => {
  const cards = await getInsuranceCards();
  const filtered = cards.filter((c) => c.id !== cardId);
  await AsyncStorage.setItem(KEYS.INSURANCE_CARDS, JSON.stringify(filtered));
};
