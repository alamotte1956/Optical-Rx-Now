import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getPrescriptions, type Prescription } from './localStorage';

const NOTIFICATIONS_KEY = '@optical_rx_now:scheduled_notifications';
const PERMISSION_CHECK_KEY = '@optical_rx_now:notification_permission_checked';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Safe JSON parse with fallback
 */
const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error("Error parsing notification data:", error);
    return fallback;
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    // Check if we've already asked for permissions
    const permissionChecked = await AsyncStorage.getItem(PERMISSION_CHECK_KEY);
    
    if (permissionChecked === 'denied') {
      console.log('Notification permissions previously denied');
      return false;
    }

    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      
      // Save that we've checked permissions
      if (finalStatus !== 'granted') {
        await AsyncStorage.setItem(PERMISSION_CHECK_KEY, 'denied');
      }
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Calculate days until expiration
 */
const calculateDaysUntilExpiry = (expiryDate: string): number => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  
  // Reset time components for accurate day calculation
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Check if a prescription notification should be scheduled
 */
const shouldScheduleNotification = (daysUntilExpiry: number): boolean => {
  // Only schedule if expires within 60 days and hasn't already expired
  return daysUntilExpiry > 0 && daysUntilExpiry <= 60;
};

/**
 * Schedule notifications for a single prescription
 */
export const schedulePrescriptionNotification = async (prescription: Prescription): Promise<void> => {
  try {
    if (!prescription.expiry_date) {
      console.warn('Prescription missing expiry date:', prescription.id);
      return;
    }

    const daysUntilExpiry = calculateDaysUntilExpiry(prescription.expiry_date);

    if (!shouldScheduleNotification(daysUntilExpiry)) {
      console.log(`Skipping notification for prescription ${prescription.id}: ${daysUntilExpiry} days until expiry`);
      return;
    }

    // Cancel existing notifications for this prescription first
    await cancelPrescriptionNotifications(prescription.id);

    const intervals = [60, 30, 14, 7, 3];
    const scheduledIds: string[] = [];
    const expiryDate = new Date(prescription.expiry_date);
    const now = new Date();

    for (const days of intervals) {
      if (daysUntilExpiry > days) {
        const triggerDate = new Date(expiryDate);
        triggerDate.setDate(triggerDate.getDate() - days);
        triggerDate.setHours(9, 0, 0, 0); // Schedule for 9 AM

        if (triggerDate > now) {
          try {
            const identifier = await Notifications.scheduleNotificationAsync({
              content: {
                title: getNotificationTitle(days),
                body: getNotificationBody(days, prescription),
                sound: true,
                badge: 1,
                data: {
                  prescriptionId: prescription.id,
                  rxType: prescription.rx_type,
                  daysUntilExpiry,
                },
              },
              trigger: { date: triggerDate },
            });

            scheduledIds.push(identifier);
            console.log(`Scheduled notification for ${days} days before expiry: ${identifier}`);
          } catch (error) {
            console.error(`Failed to schedule notification for ${days} days:`, error);
          }
        }
      }
    }

    // Save notification IDs
    if (scheduledIds.length > 0) {
      await saveNotificationIds(prescription.id, scheduledIds);
      console.log(`Scheduled ${scheduledIds.length} notifications for prescription ${prescription.id}`);
    }
  } catch (error) {
    console.error('Error scheduling prescription notification:', error);
  }
};

/**
 * Schedule notifications for all prescriptions
 */
export const scheduleAllPrescriptionNotifications = async (): Promise<number> => {
  try {
    const prescriptions = await getPrescriptions();
    let scheduledCount = 0;
    
    for (const prescription of prescriptions) {
      await schedulePrescriptionNotification(prescription);
      scheduledCount++;
    }
    
    console.log(`Attempted to schedule notifications for ${scheduledCount} prescriptions`);
    return scheduledCount;
  } catch (error) {
    console.error('Error scheduling all notifications:', error);
    return 0;
  }
};

/**
 * Cancel all notifications for a prescription
 */
export const cancelPrescriptionNotifications = async (prescriptionId: string): Promise<boolean> => {
  try {
    const notificationIds = await getNotificationIds(prescriptionId);
    
    if (notificationIds.length === 0) {
      return false;
    }
    
    for (const id of notificationIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch (error) {
        console.error(`Failed to cancel notification ${id}:`, error);
      }
    }

    await removeNotificationIds(prescriptionId);
    console.log(`Cancelled ${notificationIds.length} notifications for prescription ${prescriptionId}`);
    return true;
  } catch (error) {
    console.error('Error canceling notifications:', error);
    return false;
  }
};

/**
 * Cancel ALL scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};

/**
 * Get notification title based on days until expiration
 */
function getNotificationTitle(days: number): string {
  if (days === 1) return 'Prescription Expires Tomorrow!';
  if (days === 3) return 'Prescription Expires in 3 Days! ⏰';
  if (days === 7) return 'Prescription Expires in 1 Week! ⚠️';
  if (days === 14) return 'Prescription Expires in 2 Weeks';
  if (days === 30) return 'Prescription Expires in 1 Month';
  if (days === 60) return 'Prescription Expiring Soon - 2 Months';
  return 'Prescription Expiring Soon';
}

/**
 * Get notification body
 */
function getNotificationBody(days: number, prescription: Prescription): string {
  const type = prescription.rx_type === 'eyeglass' ? 'eyeglasses' : 'contact lenses';
  const action = prescription.rx_type === 'eyeglass' ? 'new glasses' : 'new contacts';
  
  if (days <= 3) {
    return `Your ${type} prescription expires in ${days} day${days !== 1 ? 's' : ''}! Schedule an eye exam to get ${action}.`;
  }
  
  return `Your ${type} prescription expires in ${days} days. Schedule an eye exam today!`;
}

/**
 * Save notification IDs for a prescription
 */
async function saveNotificationIds(prescriptionId: string, notificationIds: string[]): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const allIds = safeParse<Record<string, string[]>>(data, {});
    
    allIds[prescriptionId] = notificationIds;
    
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allIds));
  } catch (error) {
    console.error('Error saving notification IDs:', error);
  }
}

/**
 * Get notification IDs for a prescription
 */
async function getNotificationIds(prescriptionId: string): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const allIds = safeParse<Record<string, string[]>>(data, {});
    
    return allIds[prescriptionId] || [];
  } catch (error) {
    console.error('Error getting notification IDs:', error);
    return [];
  }
}

/**
 * Remove notification IDs for a prescription
 */
async function removeNotificationIds(prescriptionId: string): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const allIds = safeParse<Record<string, string[]>>(data, {});
    
    delete allIds[prescriptionId];
    
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allIds));
  } catch (error) {
    console.error('Error removing notification IDs:', error);
  }
}

/**
 * Get all scheduled notification information
 */
export const getScheduledNotificationsInfo = async (): Promise<Record<string, number>> => {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const allIds = safeParse<Record<string, string[]>>(data, {});
    
    const info: Record<string, number> = {};
    for (const [prescriptionId, ids] of Object.entries(allIds)) {
      info[prescriptionId] = ids.length;
    }
    
    return info;
  } catch (error) {
    console.error('Error getting scheduled notifications info:', error);
    return {};
  }
};