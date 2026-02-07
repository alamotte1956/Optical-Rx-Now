import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_RETRY_KEY = '@notification_retry_state';
const MAX_PERMISSION_RETRIES = 3;
const RETRY_DELAYS = [0, 60000, 300000, 86400000]; // 0s, 1min, 5min, 24hrs

interface RetryState {
  permissionAttempts: number;
  lastAttempt: number;
  permissionDenied: boolean;
  failedNotifications: Array<{
    id: string;
    trigger: any;
    content: any;
    retryCount: number;
  }>;
}

export class NotificationRetrySystem {
  private async getRetryState(): Promise<RetryState> {
    const stored = await AsyncStorage.getItem(NOTIFICATION_RETRY_KEY);
    return stored ? JSON.parse(stored) : {
      permissionAttempts: 0,
      lastAttempt: 0,
      permissionDenied: false,
      failedNotifications: [],
    };
  }

  private async saveRetryState(state: RetryState): Promise<void> {
    await AsyncStorage.setItem(NOTIFICATION_RETRY_KEY, JSON.stringify(state));
  }

  async requestPermissionWithRetry(): Promise<boolean> {
    const state = await this.getRetryState();

    // Don't retry if permanently denied
    if (state.permissionDenied && state.permissionAttempts >= MAX_PERMISSION_RETRIES) {
      console.log('Notification permissions permanently denied');
      return false;
    }

    // Check if we should wait before retrying
    const now = Date.now();
    const timeSinceLastAttempt = now - state.lastAttempt;
    const requiredDelay = RETRY_DELAYS[Math.min(state.permissionAttempts, RETRY_DELAYS.length - 1)];

    if (timeSinceLastAttempt < requiredDelay) {
      console.log('Too soon to retry notification permission');
      return false;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      state.permissionAttempts++;
      state.lastAttempt = now;
      state.permissionDenied = status !== 'granted';
      
      await this.saveRetryState(state);

      if (status === 'granted') {
        // Process any failed notifications
        await this.retryFailedNotifications();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      state.permissionAttempts++;
      state.lastAttempt = now;
      await this.saveRetryState(state);
      return false;
    }
  }

  async scheduleNotificationWithRetry(
    content: any,
    trigger: any,
    maxRetries: number = 3
  ): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({ content, trigger });
      return id;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      
      // Add to failed queue
      const state = await this.getRetryState();
      state.failedNotifications.push({
        id: Date.now().toString(),
        trigger,
        content,
        retryCount: 0,
      });
      await this.saveRetryState(state);
      
      return null;
    }
  }

  private async retryFailedNotifications(): Promise<void> {
    const state = await this.getRetryState();
    const stillFailed: typeof state.failedNotifications = [];

    for (const notification of state.failedNotifications) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: notification.content,
          trigger: notification.trigger,
        });
      } catch (error) {
        notification.retryCount++;
        if (notification.retryCount < 3) {
          stillFailed.push(notification);
        }
      }
    }

    state.failedNotifications = stillFailed;
    await this.saveRetryState(state);
  }

  async resetRetryState(): Promise<void> {
    await AsyncStorage.removeItem(NOTIFICATION_RETRY_KEY);
  }
}

export const notificationRetrySystem = new NotificationRetrySystem();
