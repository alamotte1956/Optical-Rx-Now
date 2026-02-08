import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
 * Safe JSON parse with fallback
 */
const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error("Error parsing auth data:", error);
    return fallback;
  }
};

/**
 * Get current failed attempt data
 */
const getAuthAttempts = async (): Promise<AuthAttempts> => {
  try {
    const data = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
    if (!data) return { count: 0, lockoutUntil: null };
    const parsed = safeParse<AuthAttempts>(data, { count: 0, lockoutUntil: null });
    
    // Validate lockoutUntil
    if (parsed.lockoutUntil && typeof parsed.lockoutUntil !== 'number') {
      return { count: parsed.count, lockoutUntil: null };
    }
    
    return parsed;
  } catch {
    return { count: 0, lockoutUntil: null };
  }
};

/**
 * Save failed attempt data
 */
const saveAuthAttempts = async (attempts: AuthAttempts): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attempts));
    return true;
  } catch (error) {
    console.error('Failed to save auth attempts:', error);
    return false;
  }
};

/**
 * Reset failed attempts (on successful auth)
 */
const resetAuthAttempts = async (): Promise<boolean> => {
  try {
    return await saveAuthAttempts({ count: 0, lockoutUntil: null });
  } catch (error) {
    console.error('Failed to reset auth attempts:', error);
    return false;
  }
};

/**
 * Check if currently locked out
 */
export const isLockedOut = async (): Promise<{ 
  locked: boolean; 
  remainingTime?: number;
  attemptsRemaining?: number;
}> => {
  try {
    const attempts = await getAuthAttempts();
    
    if (attempts.lockoutUntil) {
      const now = Date.now();
      if (now < attempts.lockoutUntil) {
        return { 
          locked: true, 
          remainingTime: Math.ceil((attempts.lockoutUntil - now) / 1000),
          attemptsRemaining: 0
        };
      } else {
        // Lockout expired, reset
        await resetAuthAttempts();
        return { locked: false, attemptsRemaining: MAX_ATTEMPTS };
      }
    }
    
    return { 
      locked: false, 
      attemptsRemaining: MAX_ATTEMPTS - attempts.count 
    };
  } catch (error) {
    console.error('Error checking lockout status:', error);
    return { locked: false, attemptsRemaining: MAX_ATTEMPTS };
  }
};

/**
 * Authenticate with biometrics (with rate limiting)
 */
export const authenticateAsync = async (
  promptMessage: string = 'Authenticate to access your prescriptions'
): Promise<LocalAuthentication.LocalAuthenticationResult> => {
  // Check lockout status
  const lockout = await isLockedOut();
  if (lockout.locked) {
    throw new Error(
      `Too many failed attempts. Please try again in ${lockout.remainingTime} seconds.`
    );
  }
  
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
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
        throw new Error('Too many failed attempts. Locked out for 15 minutes.');
      } else {
        await saveAuthAttempts({
          count: newCount,
          lockoutUntil: null
        });
      }
    }
    
    return result;
  } catch (error: any) {
    console.error('Authentication error:', error);
    
    // Don't count as failed attempt if user cancelled
    if (error?.message?.includes('cancel') || error?.code === 'USER_CANCEL') {
      throw error;
    }
    
    // Don't count as failed attempt if no biometrics enrolled
    if (error?.code === 'NOT_ENROLLED' || error?.message?.includes('not enrolled')) {
      throw error;
    }
    
    throw error;
  }
};

/**
 * Check if biometric hardware is available
 */
export const isBiometricAvailable = async (): Promise<{
  available: boolean;
  biometryType?: LocalAuthentication.AuthenticationType;
}> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return { available: false };
    }
    
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      return { available: false };
    }
    
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    return { 
      available: true,
      biometryType: supportedTypes.length > 0 ? supportedTypes[0] : undefined
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return { available: false };
  }
};

/**
 * Check if biometric authentication is enabled
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric enabled status:', error);
    return false;
  }
};

/**
 * Enable or disable biometric authentication
 */
export const setBiometricEnabled = async (enabled: boolean): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled.toString());
    return true;
  } catch (error) {
    console.error('Error setting biometric enabled:', error);
    return false;
  }
};

/**
 * Authenticate user with biometrics
 */
export const authenticateUser = async (
  reason: string = 'Authenticate to continue',
  force: boolean = false
): Promise<boolean> => {
  try {
    const enabled = await isBiometricEnabled();
    
    if (!enabled && !force) {
      return true; // Biometric not enabled, allow access
    }
    
    const { available } = await isBiometricAvailable();
    
    if (!available && !force) {
      return true; // No biometric hardware, allow access
    }
    
    // Check if recently authenticated
    if (!force) {
      const lastAuthTime = await AsyncStorage.getItem(LAST_AUTH_TIME_KEY);
      if (lastAuthTime) {
        const timeSinceAuth = Date.now() - parseInt(lastAuthTime);
        if (timeSinceAuth < AUTH_TIMEOUT_MS) {
          return true; // Recently authenticated
        }
      }
    }
    
    // Use rate-limited authentication
    const result = await authenticateAsync(reason);
    
    if (result.success) {
      // Store auth timestamp
      await AsyncStorage.setItem(LAST_AUTH_TIME_KEY, Date.now().toString());
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Authentication error:', error);
    
    // Allow access if biometrics not enrolled
    if (error?.code === 'NOT_ENROLLED' || error?.message?.includes('not enrolled')) {
      return true;
    }
    
    // Allow access if user cancelled (unless forced)
    if (error?.message?.includes('cancel') || error?.code === 'USER_CANCEL') {
      return !force;
    }
    
    return false;
  }
};

/**
 * Clear authentication session
 */
export const clearAuthSession = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(LAST_AUTH_TIME_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing auth session:', error);
    return false;
  }
};

/**
 * Get remaining auth time (time until re-authentication required)
 */
export const getRemainingAuthTime = async (): Promise<number> => {
  try {
    const lastAuthTime = await AsyncStorage.getItem(LAST_AUTH_TIME_KEY);
    if (!lastAuthTime) return 0;
    
    const timeSinceAuth = Date.now() - parseInt(lastAuthTime);
    const remaining = AUTH_TIMEOUT_MS - timeSinceAuth;
    
    return Math.max(0, remaining);
  } catch (error) {
    console.error('Error getting remaining auth time:', error);
    return 0;
  }
};

/**
 * Manually reset lockout (for testing or admin use)
 */
export const resetLockout = async (): Promise<boolean> => {
  try {
    return await resetAuthAttempts();
  } catch (error) {
    console.error('Error resetting lockout:', error);
    return false;
  }
};