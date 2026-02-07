import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getPrescriptions } from './localStorage';

const NOTIFICATIONS_KEY = '@optical_rx_now:scheduled_notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Must use physical device for push notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  return true;
};

/**
 * Schedule notifications for a single prescription
 */
export const schedulePrescriptionNotification = async (prescription: any): Promise<void> => {
  try {
    const expiryDate = new Date(prescription.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Only schedule if expires within 60 days
    if (daysUntilExpiry > 60 || daysUntilExpiry < 0) {
      return;
    }

    // Cancel existing notifications for this prescription
    await cancelPrescriptionNotifications(prescription.id);

    const intervals = [30, 14, 7, 3];
    const scheduledIds: string[] = [];

    for (const days of intervals) {
      if (daysUntilExpiry > days) {
        const triggerDate = new Date(expiryDate);
        triggerDate.setDate(triggerDate.getDate() - days);

        if (triggerDate > now) {
          const identifier = await Notifications.scheduleNotificationAsync({
            content: {
              title: getNotificationTitle(days),
              body: getNotificationBody(days, prescription),
              sound: true,
              badge: 1,
            },
            trigger: { date: triggerDate },
          });

          scheduledIds.push(identifier);
        }
      }
    }

    // Save notification IDs
    await saveNotificationIds(prescription.id, scheduledIds);
  } catch (error) {
    console.error('Error scheduling prescription notification:', error);
  }
};

/**
 * Schedule notifications for all prescriptions
 */
export const scheduleAllPrescriptionNotifications = async (): Promise<void> => {
  try {
    const prescriptions = await getPrescriptions();
    
    for (const prescription of prescriptions) {
      await schedulePrescriptionNotification(prescription);
    }
  } catch (error) {
    console.error('Error scheduling all notifications:', error);
  }
};

/**
 * Cancel all notifications for a prescription
 */
export const cancelPrescriptionNotifications = async (prescriptionId: string): Promise<void> => {
  try {
    const notificationIds = await getNotificationIds(prescriptionId);
    
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    await removeNotificationIds(prescriptionId);
  } catch (error) {
    console.error('Error canceling notifications:', error);
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
  return 'Prescription Expiring Soon';
}

/**
 * Get notification body
 */
function getNotificationBody(days: number, prescription: any): string {
  const type = prescription.rx_type === 'eyeglass' ? 'eyeglasses' : 'contact lenses';
  return `Your ${type} prescription expires in ${days} days. Schedule an eye exam today!`;
}

/**
 * Save notification IDs for a prescription
 */
async function saveNotificationIds(prescriptionId: string, notificationIds: string[]): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const allIds = data ? JSON.parse(data) : {};
    
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
    const allIds = data ? JSON.parse(data) : {};
    
    return allIds[prescriptionId] || [];
  } catch (error) {
    console.error('Error getting notification IDs:', error);
    return [];
  }
}

/**
 * Remove notification IDs for a prescription
 */
async function removeNotificationIds(prescriptionId: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const allIds = data ? JSON.parse(data) : {};
    
    delete allIds[prescriptionId];
    
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allIds));
  } catch (error) {
    console.error('Error removing notification IDs:', error);
  }
}