import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from 'expo-crypto';

const DEVICE_ID_KEY = "@optical_rx_device_id";
const EVENTS_KEY = "@app_events";
const MAX_EVENTS = 100;

// Generate or retrieve device ID (local only, for user stats)
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      const randomBytes = await Crypto.getRandomBytesAsync(16);
      const randomHex = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      deviceId = `${Platform.OS}-${Date.now()}-${randomHex}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return `temp-${Date.now()}`;
  }
};

// Store events locally for user's own stats
export const trackEvent = async (
  eventType: "app_open" | "prescription_added" | "member_added" | "export_data",
  metadata?: Record<string, any>
) => {
  try {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events = eventsJson ? JSON.parse(eventsJson) : [];
    
    events.push({
      type: eventType,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      metadata,
    });
    
    // Keep only last MAX_EVENTS
    const trimmedEvents = events.slice(-MAX_EVENTS);
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(trimmedEvents));
  } catch (error) {
    console.error('Error tracking event locally:', error);
  }
};

// Get local stats for user
export const getLocalStats = async () => {
  try {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events = eventsJson ? JSON.parse(eventsJson) : [];
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      total_events: events.length,
      last_7_days: events.filter((e: any) => new Date(e.timestamp) > sevenDaysAgo).length,
      last_30_days: events.filter((e: any) => new Date(e.timestamp) > thirtyDaysAgo).length,
      by_type: events.reduce((acc: any, e: any) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {}),
    };
  } catch {
    return { total_events: 0, last_7_days: 0, last_30_days: 0, by_type: {} };
  }
};

// Convenience functions
export const trackAppOpen = () => trackEvent("app_open");
export const trackPrescriptionAdded = () => trackEvent("prescription_added");
export const trackMemberAdded = () => trackEvent("member_added");
export const trackExportData = () => trackEvent("export_data");

