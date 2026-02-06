import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';
const LAST_AUTH_TIME_KEY = '@last_auth_time';
const AUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const FAILED_ATTEMPTS_KEY = '@optical_rx_failed_auth_attempts';

interface AuthAttempts {
  count: number;
  lockoutUntil: number | null;
}

/**
 * Get current failed attempt data
 */
const getAuthAttempts = async (): Promise<AuthAttempts> => {
  try {
    const data = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
    if (!data) return { count: 0, lockoutUntil: null };
    return JSON.parse(data);
  } catch {
    return { count: 0, lockoutUntil: null };
  }
};

/**
 * Save failed attempt data
 */
const saveAuthAttempts = async (attempts: AuthAttempts): Promise<void> => {
  try {
    await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.error('Failed to save auth attempts:', error);
  }
};

/**
 * Reset failed attempts (on successful auth)
 */
const resetAuthAttempts = async (): Promise<void> => {
  await saveAuthAttempts({ count: 0, lockoutUntil: null });
};

/**
 * Check if currently locked out
 */
export const isLockedOut = async (): Promise<{ locked: boolean; remainingTime?: number }> => {
  const attempts = await getAuthAttempts();
  
  if (attempts.lockoutUntil) {
    const now = Date.now();
    if (now < attempts.lockoutUntil) {
      return { 
        locked: true, 
        remainingTime: Math.ceil((attempts.lockoutUntil - now) / 1000) 
      };
    } else {
      // Lockout expired, reset
      await resetAuthAttempts();
      return { locked: false };
    }
  }
  
  return { locked: false };
};

/**
 * Authenticate with biometrics (with rate limiting)
 */
export const authenticateAsync = async (): Promise<LocalAuthentication.LocalAuthenticationResult> => {
  // Check lockout status
  const lockout = await isLockedOut();
  if (lockout.locked) {
    throw new Error(`Too many failed attempts. Please try again in ${lockout.remainingTime} seconds.`);
  }
  
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access your prescriptions',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    
    if (result.success) {
      // Reset failed attempts on success
      await resetAuthAttempts();
    } else {
      // Increment failed attempts
      const attempts = await getAuthAttempts();
      const newCount = attempts.count + 1;
      
      if (newCount >= MAX_ATTEMPTS) {
        // Lock out user
        await saveAuthAttempts({
          count: newCount,
          lockoutUntil: Date.now() + LOCKOUT_DURATION
        });
        throw new Error(`Too many failed attempts. Locked out for 15 minutes.`);
      } else {
        await saveAuthAttempts({
          count: newCount,
          lockoutUntil: null
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

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
    // Use rate-limited authentication
    const result = await authenticateAsync();
    
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
