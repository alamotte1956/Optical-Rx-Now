// Analytics service - no-op implementation (frontend-only app)
// All analytics methods are kept for API compatibility but don't send data anywhere

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "@optical_rx_device_id";

// Generate or retrieve a persistent device ID (kept for potential future use)
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

// Track analytics event - no-op (no backend)
export const trackEvent = async (
  eventType: "app_open" | "ad_click" | "affiliate_click",
  metadata?: Record<string, any>
) => {
  // No-op - frontend only app, no analytics backend
  console.log(`Analytics event (not sent): ${eventType}`, metadata);
};

// Track app open
export const trackAppOpen = () => trackEvent("app_open");

// Track ad click
export const trackAdClick = (adId?: string) => trackEvent("ad_click", { ad_id: adId });

// Track affiliate click
export const trackAffiliateClick = (partnerId: string) =>
  trackEvent("affiliate_click", { partner_id: partnerId });
