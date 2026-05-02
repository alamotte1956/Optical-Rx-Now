// Analytics service with local tracking and optional Firebase Analytics
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "@optical_rx_device_id";
const ANALYTICS_EVENTS_KEY = "@optical_rx_analytics_events";
const ANALYTICS_STATS_KEY = "@optical_rx_analytics_stats";

// Analytics stats interface
export interface AnalyticsStats {
  totalAppOpens: number;
  totalAdClicks: number;
  totalAffiliateClicks: number;
  clicksByPartner: { [partnerId: string]: number };
  lastUpdated: string;
}

// Event types
type EventType = "app_open" | "ad_click" | "affiliate_click" | "screen_view" | "prescription_added" | "member_added";

interface AnalyticsEvent {
  eventType: EventType;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Generate or retrieve a persistent device ID
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return `temp-${Date.now()}`;
  }
};

// Get default stats object
const getDefaultStats = (): AnalyticsStats => ({
  totalAppOpens: 0,
  totalAdClicks: 0,
  totalAffiliateClicks: 0,
  clicksByPartner: {},
  lastUpdated: new Date().toISOString(),
});

// Load analytics stats from storage
export const getAnalyticsStats = async (): Promise<AnalyticsStats> => {
  try {
    const stored = await AsyncStorage.getItem(ANALYTICS_STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return getDefaultStats();
  } catch (error) {
    console.log("Error loading analytics stats:", error);
    return getDefaultStats();
  }
};

// Save analytics stats to storage
const saveAnalyticsStats = async (stats: AnalyticsStats): Promise<void> => {
  try {
    stats.lastUpdated = new Date().toISOString();
    await AsyncStorage.setItem(ANALYTICS_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.log("Error saving analytics stats:", error);
  }
};

// Track analytics event with persistent storage
export const trackEvent = async (
  eventType: EventType,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    const deviceId = await getDeviceId();
    const event: AnalyticsEvent = {
      eventType,
      timestamp: new Date().toISOString(),
      metadata: { ...metadata, deviceId, platform: Platform.OS },
    };

    // Log for debugging
    console.log(`Analytics event: ${eventType}`, metadata);

    // Update stats based on event type
    const stats = await getAnalyticsStats();
    
    switch (eventType) {
      case "app_open":
        stats.totalAppOpens++;
        break;
      case "ad_click":
        stats.totalAdClicks++;
        break;
      case "affiliate_click":
        stats.totalAffiliateClicks++;
        if (metadata?.partner_id) {
          const partnerId = metadata.partner_id;
          stats.clicksByPartner[partnerId] = (stats.clicksByPartner[partnerId] || 0) + 1;
        }
        break;
    }

    await saveAnalyticsStats(stats);

    // Store recent events (keep last 100)
    const storedEvents = await AsyncStorage.getItem(ANALYTICS_EVENTS_KEY);
    let events: AnalyticsEvent[] = storedEvents ? JSON.parse(storedEvents) : [];
    events.push(event);
    if (events.length > 100) {
      events = events.slice(-100);
    }
    await AsyncStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(events));

  } catch (error) {
    console.log("Analytics tracking error:", error);
  }
};

// Track app open
export const trackAppOpen = (): Promise<void> => trackEvent("app_open");

// Track ad click with ad ID
export const trackAdClick = (adId?: string): Promise<void> => 
  trackEvent("ad_click", { ad_id: adId });

// Track affiliate click with partner details
export const trackAffiliateClick = (partnerId: string, partnerName?: string): Promise<void> =>
  trackEvent("affiliate_click", { 
    partner_id: partnerId,
    partner_name: partnerName,
  });

// Track screen view
export const trackScreenView = (screenName: string): Promise<void> =>
  trackEvent("screen_view", { screen_name: screenName });

// Track prescription added
export const trackPrescriptionAdded = (rxType: "eyeglass" | "contact"): Promise<void> =>
  trackEvent("prescription_added", { rx_type: rxType });

// Track family member added
export const trackMemberAdded = (): Promise<void> =>
  trackEvent("member_added");

// Get recent events for debugging
export const getRecentEvents = async (): Promise<AnalyticsEvent[]> => {
  try {
    const stored = await AsyncStorage.getItem(ANALYTICS_EVENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Clear all analytics data
export const clearAnalyticsData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([ANALYTICS_EVENTS_KEY, ANALYTICS_STATS_KEY]);
    console.log("Analytics data cleared");
  } catch (error) {
    console.log("Error clearing analytics:", error);
  }
};
