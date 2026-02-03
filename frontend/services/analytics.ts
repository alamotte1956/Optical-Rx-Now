import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const DEVICE_ID_KEY = "@optical_rx_device_id";

// Generate or retrieve a persistent device ID
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      // Generate a unique ID for this device
      deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return `temp-${Date.now()}`;
  }
};

// Track analytics event
export const trackEvent = async (
  eventType: "app_open" | "affiliate_click",
  metadata?: Record<string, any>
) => {
  try {
    const deviceId = await getDeviceId();
    const platform = Platform.OS; // 'ios', 'android', or 'web'
    
    await fetch(`${BACKEND_URL}/api/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: deviceId,
        event_type: eventType,
        platform: platform,
        app_version: "1.0.0",
        metadata: metadata,
      }),
    });
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.log("Analytics error:", error);
  }
};

// Track app open (call on app launch)
export const trackAppOpen = () => trackEvent("app_open");

// Track affiliate click
export const trackAffiliateClick = (partnerId: string) =>
  trackEvent("affiliate_click", { partner_id: partnerId });
