import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Custom error class for storage-related errors
export class StorageError extends Error {
  constructor(
    message: string,
    public code: 
      | 'QUOTA_EXCEEDED'
      | 'CORRUPTION_DETECTED'
      | 'PARSE_ERROR'
      | 'UNKNOWN_ERROR'
      | 'BACKUP_FAILED'
      | 'RECOVERY_FAILED',
    public originalError?: any
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 100;

// Helper to delay between retries
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get backup key for a given key
function getBackupKey(key: string): string {
  return `${key}_backup`;
}

// Check if error is a quota exceeded error
function isQuotaExceededError(error: any): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('QuotaExceededError') ||
      error.message.includes('quota') ||
      error.message.includes('storage full') ||
      error.name === 'QuotaExceededError')
  );
}

// Check if error is a corruption/parse error
function isCorruptionError(error: any): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('JSON') ||
      error.message.includes('parse') ||
      error.message.includes('Unexpected token') ||
      error.message.includes('corrupt'))
  );
}

// Handle storage errors with user-friendly messages
export function handleStorageError(error: StorageError): void {
  let title = 'Storage Error';
  let message = 'An error occurred while accessing storage.';
  
  switch (error.code) {
    case 'QUOTA_EXCEEDED':
      title = 'Storage Full';
      message = 'Your device storage is full. Please free up some space by:\n\n• Deleting old photos or files\n• Removing unused apps\n• Clearing app caches\n\nThen try again.';
      break;
    case 'CORRUPTION_DETECTED':
      title = 'Data Corruption Detected';
      message = 'Some data appears to be corrupted. The app will attempt to recover from a backup.';
      break;
    case 'PARSE_ERROR':
      title = 'Data Error';
      message = 'Unable to read stored data. This may be due to corruption. The app will attempt recovery.';
      break;
    case 'BACKUP_FAILED':
      title = 'Backup Failed';
      message = 'Unable to create a backup of your data. This may be due to low storage space.';
      break;
    case 'RECOVERY_FAILED':
      title = 'Recovery Failed';
      message = 'Unable to recover corrupted data. Some information may have been lost.';
      break;
    default:
      title = 'Unknown Error';
      message = 'An unexpected storage error occurred. Please try again or restart the app.';
  }
  
  Alert.alert(title, message, [{ text: 'OK' }]);
}

// Safe get with retry logic
export async function safeGetItem(
  key: string,
  retryCount: number = 0
): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error(`Error getting item ${key}:`, error);
    
    // Retry on transient errors
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      await delay(RETRY_DELAY_MS * (retryCount + 1));
      return safeGetItem(key, retryCount + 1);
    }
    
    // If all retries failed, throw StorageError
    throw new StorageError(
      `Failed to get item after ${MAX_RETRY_ATTEMPTS} attempts`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

// Safe set with backup and quota handling
export async function safeSetItem(
  key: string,
  value: string,
  createBackup: boolean = true,
  retryCount: number = 0
): Promise<void> {
  try {
    // Create backup before overwriting (for important data)
    if (createBackup) {
      try {
        const existingValue = await AsyncStorage.getItem(key);
        if (existingValue) {
          await AsyncStorage.setItem(getBackupKey(key), existingValue);
        }
      } catch (backupError) {
        console.warn('Failed to create backup:', backupError);
        // Continue with the write even if backup fails
      }
    }
    
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting item ${key}:`, error);
    
    // Check for quota exceeded
    if (isQuotaExceededError(error)) {
      throw new StorageError(
        'Device storage is full',
        'QUOTA_EXCEEDED',
        error
      );
    }
    
    // Retry on transient errors
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      await delay(RETRY_DELAY_MS * (retryCount + 1));
      return safeSetItem(key, value, createBackup, retryCount + 1);
    }
    
    // If all retries failed, throw StorageError
    throw new StorageError(
      `Failed to set item after ${MAX_RETRY_ATTEMPTS} attempts`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

// Get item with automatic recovery from corruption
export async function getItemWithRecovery<T>(
  key: string,
  defaultValue: T
): Promise<T> {
  try {
    // Try to get the item
    const value = await safeGetItem(key);
    
    if (!value) {
      return defaultValue;
    }
    
    // Try to parse the JSON
    try {
      return JSON.parse(value) as T;
    } catch (parseError) {
      console.error('JSON parse error, attempting recovery:', parseError);
      
      // Try to recover from backup
      try {
        const backupValue = await safeGetItem(getBackupKey(key));
        
        if (backupValue) {
          const parsedBackup = JSON.parse(backupValue) as T;
          
          // Restore from backup
          await safeSetItem(key, backupValue, false);
          
          Alert.alert(
            'Data Recovered',
            'Some corrupted data was recovered from a backup.',
            [{ text: 'OK' }]
          );
          
          return parsedBackup;
        }
      } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError);
      }
      
      // If recovery fails, throw corruption error
      throw new StorageError(
        'Data corruption detected and recovery failed',
        'CORRUPTION_DETECTED',
        parseError
      );
    }
  } catch (error) {
    console.error('Error in getItemWithRecovery:', error);
    
    // If it's already a StorageError, re-throw it
    if (error instanceof StorageError) {
      throw error;
    }
    
    // Otherwise, wrap it
    throw new StorageError(
      'Failed to retrieve and parse item',
      'UNKNOWN_ERROR',
      error
    );
  }
}

// Validate JSON integrity before parsing (optional stricter validation)
export function validateJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

// Clear backup for a key
export async function clearBackup(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(getBackupKey(key));
  } catch (error) {
    console.error('Failed to clear backup:', error);
  }
}

// Get storage usage info (if available)
export async function getStorageInfo(): Promise<{
  keys: string[];
  estimatedSize: number;
}> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let estimatedSize = 0;
    
    // Estimate size by sampling
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          estimatedSize += value.length;
        }
      } catch {
        // Skip keys that fail to read
      }
    }
    
    return {
      keys,
      estimatedSize,
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return {
      keys: [],
      estimatedSize: 0,
    };
  }
}
