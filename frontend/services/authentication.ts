import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';
const LAST_AUTH_TIME_KEY = '@last_auth_time';
const AUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const isBiometricAvailable = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
  return enabled === 'true';
};

export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled.toString());
};

export const authenticateUser = async (reason: string = 'Authenticate to continue'): Promise<boolean> => {
  const enabled = await isBiometricEnabled();
  
  if (!enabled) {
    return true; // Biometric not enabled, allow access
  }
  
  const available = await isBiometricAvailable();
  
  if (!available) {
    return true; // No biometric hardware, allow access
  }
  
  // Check if recently authenticated
  const lastAuthTime = await AsyncStorage.getItem(LAST_AUTH_TIME_KEY);
  if (lastAuthTime) {
    const timeSinceAuth = Date.now() - parseInt(lastAuthTime);
    if (timeSinceAuth < AUTH_TIMEOUT_MS) {
      return true; // Recently authenticated
    }
  }
  
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    
    if (result.success) {
      // Store auth timestamp
      await AsyncStorage.setItem(LAST_AUTH_TIME_KEY, Date.now().toString());
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
};

export const clearAuthSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(LAST_AUTH_TIME_KEY);
};
