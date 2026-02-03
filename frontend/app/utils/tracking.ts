/**
 * App Tracking Transparency (ATT) Utility
 * 
 * Handles iOS App Tracking Transparency permission requests.
 * Required for iOS 14.5+ to show personalized ads.
 * 
 * Android does not require ATT, so these functions return true on Android.
 * 
 * @see https://developer.apple.com/app-store/user-privacy-and-data-use/
 * @see https://docs.expo.dev/versions/latest/sdk/tracking-transparency/
 */

import { Platform } from 'react-native';
import * as Tracking from 'expo-tracking-transparency';

/**
 * Requests tracking permission from the user (iOS only).
 * Shows the ATT dialog on iOS. Always returns true on Android.
 * 
 * @returns Promise<boolean> - true if permission granted or on Android, false if denied on iOS
 */
export async function requestTrackingPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    // Android doesn't require ATT
    return true;
  }

  try {
    const { status } = await Tracking.requestTrackingPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting tracking permission:', error);
    // If there's an error, assume permission was not granted
    return false;
  }
}

/**
 * Gets the current tracking permission status without showing the dialog.
 * 
 * @returns Promise<boolean> - true if permission granted or on Android, false if denied/not determined on iOS
 */
export async function getTrackingPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    // Android doesn't require ATT
    return true;
  }

  try {
    const { status } = await Tracking.getTrackingPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error getting tracking permission:', error);
    // If there's an error, assume permission was not granted
    return false;
  }
}
