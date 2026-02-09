import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
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
  imageBase64: string;
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
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log("Error getting prescriptions:", error);
    return [];
  }
};

export const savePrescription = async (
  prescription: Omit<Prescription, "id" | "createdAt">
): Promise<Prescription> => {
  const prescriptions = await getPrescriptions();
  const newRx: Prescription = {
    ...prescription,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  prescriptions.push(newRx);
  await AsyncStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));

  // Schedule notifications if expiry date is set
  if (newRx.expiryDate) {
    await scheduleExpiryNotifications(newRx);
  }

  return newRx;
};

export const getPrescriptionById = async (
  id: string
): Promise<Prescription | null> => {
  const prescriptions = await getPrescriptions();
  return prescriptions.find((p) => p.id === id) || null;
};

export const deletePrescription = async (id: string): Promise<boolean> => {
  const prescriptions = await getPrescriptions();
  const filtered = prescriptions.filter((p) => p.id !== id);
  await AsyncStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(filtered));

  // Cancel associated notifications
  await cancelPrescriptionNotifications(id);

  return true;
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

  const expiryDate = new Date(prescription.expiryDate);
  const alertDays = [30, 14, 7, 1, 0]; // Days before expiry
  const member = await getFamilyMemberById(prescription.familyMemberId);
  const memberName = member?.name || "Family member";

  const scheduledNotifications: ScheduledNotification[] = [];

  for (const daysBefore of alertDays) {
    const triggerDate = new Date(expiryDate);
    triggerDate.setDate(triggerDate.getDate() - daysBefore);
    triggerDate.setHours(9, 0, 0, 0); // Send at 9 AM

    // Skip if the trigger date is in the past
    if (triggerDate <= new Date()) continue;

    const title =
      daysBefore === 0
        ? "Prescription Expires Today!"
        : `Prescription Expires in ${daysBefore} ${daysBefore === 1 ? "Day" : "Days"}`;

    const body = `${memberName}'s ${prescription.rxType} prescription expires ${
      daysBefore === 0
        ? "today"
        : daysBefore === 1
          ? "tomorrow"
          : `on ${expiryDate.toLocaleDateString()}`
    }. Time to schedule an eye exam!`;

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { prescriptionId: prescription.id },
          sound: true,
        },
        trigger: {
          date: triggerDate,
        },
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
