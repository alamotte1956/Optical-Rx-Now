// App Store Optimization Service
// Handles review prompts, app indexing, and engagement tracking
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { Platform, Alert, Linking } from "react-native";

const ASO_KEYS = {
  PRESCRIPTIONS_ADDED: "@aso_prescriptions_added",
  MEMBERS_ADDED: "@aso_members_added",
  APP_OPENS: "@aso_app_opens",
  LAST_REVIEW_PROMPT: "@aso_last_review_prompt",
  HAS_REVIEWED: "@aso_has_reviewed",
  FIRST_OPEN_DATE: "@aso_first_open_date",
};

// Store URLs for manual review fallback
const STORE_URLS = {
  ios: "https://apps.apple.com/app/optical-rx-now/id[YOUR_APP_ID]?action=write-review",
  android: "https://play.google.com/store/apps/details?id=com.opticalrxnow.mobile.v2&showAllReviews=true",
};

// Track app opens for ASO
export const trackAppOpenForASO = async (): Promise<void> => {
  try {
    const currentCount = await AsyncStorage.getItem(ASO_KEYS.APP_OPENS);
    const newCount = (parseInt(currentCount || "0") + 1).toString();
    await AsyncStorage.setItem(ASO_KEYS.APP_OPENS, newCount);

    // Set first open date if not set
    const firstOpen = await AsyncStorage.getItem(ASO_KEYS.FIRST_OPEN_DATE);
    if (!firstOpen) {
      await AsyncStorage.setItem(ASO_KEYS.FIRST_OPEN_DATE, new Date().toISOString());
    }

    // Check if we should prompt for review
    await checkAndPromptReview();
  } catch (error) {
    console.log("ASO tracking error:", error);
  }
};

// Track prescription added
export const trackPrescriptionForASO = async (): Promise<void> => {
  try {
    const currentCount = await AsyncStorage.getItem(ASO_KEYS.PRESCRIPTIONS_ADDED);
    const newCount = (parseInt(currentCount || "0") + 1).toString();
    await AsyncStorage.setItem(ASO_KEYS.PRESCRIPTIONS_ADDED, newCount);
    
    // Check for review prompt after adding prescription
    await checkAndPromptReview();
  } catch (error) {
    console.log("ASO prescription tracking error:", error);
  }
};

// Track member added
export const trackMemberForASO = async (): Promise<void> => {
  try {
    const currentCount = await AsyncStorage.getItem(ASO_KEYS.MEMBERS_ADDED);
    const newCount = (parseInt(currentCount || "0") + 1).toString();
    await AsyncStorage.setItem(ASO_KEYS.MEMBERS_ADDED, newCount);
  } catch (error) {
    console.log("ASO member tracking error:", error);
  }
};

// Check if conditions are met to prompt for review
const checkAndPromptReview = async (): Promise<void> => {
  try {
    // Don't prompt if already reviewed
    const hasReviewed = await AsyncStorage.getItem(ASO_KEYS.HAS_REVIEWED);
    if (hasReviewed === "true") return;

    // Check last prompt date (don't prompt more than once per 30 days)
    const lastPrompt = await AsyncStorage.getItem(ASO_KEYS.LAST_REVIEW_PROMPT);
    if (lastPrompt) {
      const daysSinceLastPrompt = Math.floor(
        (Date.now() - new Date(lastPrompt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastPrompt < 30) return;
    }

    // Get engagement metrics
    const appOpens = parseInt(await AsyncStorage.getItem(ASO_KEYS.APP_OPENS) || "0");
    const prescriptionsAdded = parseInt(await AsyncStorage.getItem(ASO_KEYS.PRESCRIPTIONS_ADDED) || "0");
    const firstOpenDate = await AsyncStorage.getItem(ASO_KEYS.FIRST_OPEN_DATE);

    // Calculate days since first open
    let daysSinceFirstOpen = 0;
    if (firstOpenDate) {
      daysSinceFirstOpen = Math.floor(
        (Date.now() - new Date(firstOpenDate).getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Review prompt conditions:
    // 1. At least 3 app opens AND 1 prescription added AND 3+ days since first open
    // 2. OR at least 7 app opens AND 7+ days since first open
    const condition1 = appOpens >= 3 && prescriptionsAdded >= 1 && daysSinceFirstOpen >= 3;
    const condition2 = appOpens >= 7 && daysSinceFirstOpen >= 7;

    if (condition1 || condition2) {
      await promptForReview();
    }
  } catch (error) {
    console.log("Review check error:", error);
  }
};

// Prompt user for app review
export const promptForReview = async (): Promise<void> => {
  try {
    // Record that we prompted
    await AsyncStorage.setItem(ASO_KEYS.LAST_REVIEW_PROMPT, new Date().toISOString());

    // Check if native review is available
    const isAvailable = await StoreReview.isAvailableAsync();

    if (isAvailable) {
      // Use native in-app review (doesn't guarantee showing)
      await StoreReview.requestReview();
    } else {
      // Fallback to manual prompt
      showManualReviewPrompt();
    }
  } catch (error) {
    console.log("Review prompt error:", error);
    showManualReviewPrompt();
  }
};

// Manual review prompt fallback
const showManualReviewPrompt = (): void => {
  Alert.alert(
    "Enjoying Optical Rx Now?",
    "Your review helps other families discover our app and keep their prescriptions organized!",
    [
      {
        text: "Not Now",
        style: "cancel",
      },
      {
        text: "Rate App",
        onPress: () => openStoreForReview(),
      },
      {
        text: "Never Ask",
        onPress: () => markAsReviewed(),
        style: "destructive",
      },
    ]
  );
};

// Open store page for review
export const openStoreForReview = async (): Promise<void> => {
  try {
    const url = Platform.OS === "ios" ? STORE_URLS.ios : STORE_URLS.android;
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
      // Assume they reviewed after opening store
      await markAsReviewed();
    }
  } catch (error) {
    console.log("Error opening store:", error);
  }
};

// Mark user as having reviewed (or opted out)
export const markAsReviewed = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ASO_KEYS.HAS_REVIEWED, "true");
  } catch (error) {
    console.log("Error marking reviewed:", error);
  }
};

// Get ASO stats for admin panel
export const getASOStats = async (): Promise<{
  appOpens: number;
  prescriptionsAdded: number;
  membersAdded: number;
  daysSinceFirstOpen: number;
  hasReviewed: boolean;
}> => {
  try {
    const appOpens = parseInt(await AsyncStorage.getItem(ASO_KEYS.APP_OPENS) || "0");
    const prescriptionsAdded = parseInt(await AsyncStorage.getItem(ASO_KEYS.PRESCRIPTIONS_ADDED) || "0");
    const membersAdded = parseInt(await AsyncStorage.getItem(ASO_KEYS.MEMBERS_ADDED) || "0");
    const hasReviewed = (await AsyncStorage.getItem(ASO_KEYS.HAS_REVIEWED)) === "true";
    
    const firstOpenDate = await AsyncStorage.getItem(ASO_KEYS.FIRST_OPEN_DATE);
    let daysSinceFirstOpen = 0;
    if (firstOpenDate) {
      daysSinceFirstOpen = Math.floor(
        (Date.now() - new Date(firstOpenDate).getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    return {
      appOpens,
      prescriptionsAdded,
      membersAdded,
      daysSinceFirstOpen,
      hasReviewed,
    };
  } catch (error) {
    console.log("Error getting ASO stats:", error);
    return {
      appOpens: 0,
      prescriptionsAdded: 0,
      membersAdded: 0,
      daysSinceFirstOpen: 0,
      hasReviewed: false,
    };
  }
};

// Reset ASO data (for testing)
export const resetASOData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(ASO_KEYS));
  } catch (error) {
    console.log("Error resetting ASO data:", error);
  }
};
