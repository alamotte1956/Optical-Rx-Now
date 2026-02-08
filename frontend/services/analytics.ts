import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from 'expo-crypto';

const DEVICE_ID_KEY = "@optical_rx_device_id";
const EVENTS_KEY = "@app_events";
const MAX_EVENTS = 200; // Increased from 100 to allow more tracking

export type EventType =
  | "app_open"
  | "prescription_added"
  | "prescription_deleted"
  | "prescription_viewed"
  | "member_added"
  | "member_deleted"
  | "affiliate_clicked"
  | "shop_viewed"
  | "optometrist_searched"
  | "export_data"
  | "notification_sent"
  | "notification_clicked";

interface AnalyticsEvent {
  type: EventType;
  timestamp: string;
  platform: string;
  metadata?: Record<string, any>;
}

/**
 * Safe JSON parse with fallback
 */
const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error("Error parsing analytics data:", error);
    return fallback;
  }
};

/**
 * Validate event type
 */
const isValidEventType = (type: string): type is EventType => {
  const validTypes: EventType[] = [
    "app_open",
    "prescription_added",
    "prescription_deleted",
    "prescription_viewed",
    "member_added",
    "member_deleted",
    "affiliate_clicked",
    "shop_viewed",
    "optometrist_searched",
    "export_data",
    "notification_sent",
    "notification_clicked",
  ];
  return validTypes.includes(type as EventType);
};

/**
 * Generate or retrieve device ID (local only, for user stats)
 */
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

/**
 * Store events locally for user's own stats
 */
export const trackEvent = async (
  eventType: EventType,
  metadata?: Record<string, any>
): Promise<boolean> => {
  try {
    // Validate event type
    if (!isValidEventType(eventType)) {
      console.error(`Invalid event type: ${eventType}`);
      return false;
    }

    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events: AnalyticsEvent[] = safeParse<AnalyticsEvent[]>(eventsJson, []);
    
    const newEvent: AnalyticsEvent = {
      type: eventType,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      metadata,
    };
    
    events.push(newEvent);
    
    // Keep only last MAX_EVENTS
    const trimmedEvents = events.slice(-MAX_EVENTS);
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(trimmedEvents));
    
    return true;
  } catch (error) {
    console.error('Error tracking event locally:', error);
    return false;
  }
};

/**
 * Get local stats for user
 */
export const getLocalStats = async () => {
  try {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events: AnalyticsEvent[] = safeParse<AnalyticsEvent[]>(eventsJson, []);
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    // Filter by date ranges
    const events7d = events.filter(e => new Date(e.timestamp) > sevenDaysAgo);
    const events30d = events.filter(e => new Date(e.timestamp) > thirtyDaysAgo);
    const events90d = events.filter(e => new Date(e.timestamp) > ninetyDaysAgo);
    
    // Count by type
    const byType7d = events7d.reduce((acc: Record<string, number>, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {});
    
    const byType30d = events30d.reduce((acc: Record<string, number>, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total_events: events.length,
      last_7_days: events7d.length,
      last_30_days: events30d.length,
      last_90_days: events90d.length,
      by_type_7d: byType7d,
      by_type_30d: byType30d,
      by_type_all: events.reduce((acc: Record<string, number>, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {}),
    };
  } catch (error) {
    console.error('Error getting local stats:', error);
    return {
      total_events: 0,
      last_7_days: 0,
      last_30_days: 0,
      last_90_days: 0,
      by_type_7d: {},
      by_type_30d: {},
      by_type_all: {},
    };
  }
};

/**
 * Get events by type
 */
export const getEventsByType = async (eventType: EventType): Promise<AnalyticsEvent[]> => {
  try {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events: AnalyticsEvent[] = safeParse<AnalyticsEvent[]>(eventsJson, []);
    
    return events.filter(e => e.type === eventType);
  } catch (error) {
    console.error('Error getting events by type:', error);
    return [];
  }
};

/**
 * Get recent events
 */
export const getRecentEvents = async (limit: number = 20): Promise<AnalyticsEvent[]> => {
  try {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events: AnalyticsEvent[] = safeParse<AnalyticsEvent[]>(eventsJson, []);
    
    return events.slice(-limit).reverse(); // Most recent first
  } catch (error) {
    console.error('Error getting recent events:', error);
    return [];
  }
};

/**
 * Clear all analytics data
 */
export const clearAnalytics = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(EVENTS_KEY);
    console.log('Analytics data cleared');
  } catch (error) {
    console.error('Error clearing analytics:', error);
    throw new Error('Failed to clear analytics data');
  }
};

/**
 * Export analytics as JSON
 */
export const exportAnalytics = async (): Promise<string> => {
  try {
    const deviceId = await getDeviceId();
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events: AnalyticsEvent[] = safeParse<AnalyticsEvent[]>(eventsJson, []);
    
    const data = {
      device_id: deviceId,
      platform: Platform.OS,
      export_date: new Date().toISOString(),
      total_events: events.length,
      events,
    };
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting analytics:', error);
    throw new Error('Failed to export analytics');
  }
};

// Convenience functions
export const trackAppOpen = () => trackEvent("app_open");
export const trackPrescriptionAdded = (metadata?: { rxType?: string }) => 
  trackEvent("prescription_added", metadata);
export const trackPrescriptionDeleted = () => trackEvent("prescription_deleted");
export const trackPrescriptionViewed = () => trackEvent("prescription_viewed");
export const trackMemberAdded = () => trackEvent("member_added");
export const trackMemberDeleted = () => trackEvent("member_deleted");
export const trackAffiliateClicked = (metadata?: { affiliateId?: string, affiliateName?: string }) => 
  trackEvent("affiliate_clicked", metadata);
export const trackShopViewed = () => trackEvent("shop_viewed");
export const trackOptometristSearched = (metadata?: { zipCode?: string }) => 
  trackEvent("optometrist_searched", metadata);
export const trackExportData = () => trackEvent("export_data");
export const trackNotificationSent = () => trackEvent("notification_sent");
export const trackNotificationClicked = () => trackEvent("notification_clicked");