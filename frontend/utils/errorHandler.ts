import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ERROR_LOG_KEY = '@optical_rx_now:error_log';
const MAX_ERROR_LOG_SIZE = 50;

// Error types for better categorization
export enum ErrorType {
  STORAGE_QUOTA = 'STORAGE_QUOTA',
  STORAGE_CORRUPTION = 'STORAGE_CORRUPTION',
  NETWORK = 'NETWORK',
  KEYCHAIN = 'KEYCHAIN',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorLogEntry {
  timestamp: string;
  type: ErrorType;
  message: string;
  stack?: string;
  metadata?: Record<string, any>;
}

// Classify error by message/type
function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  
  if (message.includes('quota') || message.includes('storage full')) {
    return ErrorType.STORAGE_QUOTA;
  }
  if (message.includes('json') || message.includes('parse') || message.includes('corrupt')) {
    return ErrorType.STORAGE_CORRUPTION;
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return ErrorType.NETWORK;
  }
  if (message.includes('keychain') || message.includes('securestore') || message.includes('keystore')) {
    return ErrorType.KEYCHAIN;
  }
  if (message.includes('permission') || message.includes('denied') || message.includes('unauthorized')) {
    return ErrorType.PERMISSION;
  }
  
  return ErrorType.UNKNOWN;
}

// Get user-friendly error message
function getUserFriendlyMessage(errorType: ErrorType, originalMessage: string): string {
  switch (errorType) {
    case ErrorType.STORAGE_QUOTA:
      return 'Your device storage is full. Please free up some space and try again.';
    case ErrorType.STORAGE_CORRUPTION:
      return 'Some data appears to be corrupted. The app will attempt to recover your information.';
    case ErrorType.NETWORK:
      return 'Unable to connect to the network. Please check your internet connection and try again.';
    case ErrorType.KEYCHAIN:
      return 'There was a problem accessing secure storage. Please restart the app and try again.';
    case ErrorType.PERMISSION:
      return 'This feature requires additional permissions. Please check your app settings.';
    default:
      return 'An unexpected error occurred. Please try again or restart the app.';
  }
}

// Log error to AsyncStorage
async function logError(entry: ErrorLogEntry): Promise<void> {
  try {
    const existingLog = await AsyncStorage.getItem(ERROR_LOG_KEY);
    let errorLog: ErrorLogEntry[] = [];
    
    if (existingLog) {
      try {
        errorLog = JSON.parse(existingLog);
      } catch {
        // If log is corrupted, start fresh
        errorLog = [];
      }
    }
    
    // Add new error
    errorLog.unshift(entry);
    
    // Keep only the last MAX_ERROR_LOG_SIZE errors
    if (errorLog.length > MAX_ERROR_LOG_SIZE) {
      errorLog = errorLog.slice(0, MAX_ERROR_LOG_SIZE);
    }
    
    await AsyncStorage.setItem(ERROR_LOG_KEY, JSON.stringify(errorLog));
  } catch (error) {
    // If we can't log the error, just console it
    console.error('Failed to log error to storage:', error);
  }
}

// Retrieve error log
export async function getErrorLog(): Promise<ErrorLogEntry[]> {
  try {
    const log = await AsyncStorage.getItem(ERROR_LOG_KEY);
    if (!log) return [];
    return JSON.parse(log);
  } catch {
    return [];
  }
}

// Clear error log
export async function clearErrorLog(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ERROR_LOG_KEY);
  } catch (error) {
    console.error('Failed to clear error log:', error);
  }
}

// Handle global JavaScript errors
export function handleGlobalError(error: Error, isFatal: boolean = false): void {
  console.error('Global error caught:', error);
  
  const errorType = classifyError(error);
  const userMessage = getUserFriendlyMessage(errorType, error.message);
  
  // Log the error
  const logEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    type: errorType,
    message: error.message,
    stack: error.stack,
    metadata: {
      isFatal,
      name: error.name,
    },
  };
  
  logError(logEntry);
  
  // Show user-friendly alert
  Alert.alert(
    isFatal ? 'Critical Error' : 'Error',
    userMessage,
    [
      {
        text: 'OK',
        onPress: () => {
          if (isFatal) {
            // For fatal errors, suggest app restart
            Alert.alert(
              'Restart Required',
              'Please close and restart the app to continue.',
              [{ text: 'OK' }]
            );
          }
        },
      },
    ],
    { cancelable: false }
  );
}

// Handle unhandled promise rejections
export function handleUnhandledRejection(
  reason: any,
  promise: Promise<any>
): void {
  console.error('Unhandled promise rejection:', reason);
  
  // Convert reason to Error if it's not already
  const error = reason instanceof Error ? reason : new Error(String(reason));
  const errorType = classifyError(error);
  const userMessage = getUserFriendlyMessage(errorType, error.message);
  
  // Log the error
  const logEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    type: errorType,
    message: error.message || String(reason),
    stack: error.stack,
    metadata: {
      isPromiseRejection: true,
    },
  };
  
  logError(logEntry);
  
  // Show user-friendly alert
  Alert.alert(
    'Unexpected Error',
    userMessage,
    [{ text: 'OK' }],
    { cancelable: false }
  );
}

// Setup global error handlers
export function setupGlobalErrorHandlers(): () => void {
  // Store original handlers
  const originalErrorHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
  const originalRejectionHandler = (global as any).__unhandledPromiseRejection;
  
  // Set up global error handler
  if ((global as any).ErrorUtils) {
    (global as any).ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      handleGlobalError(error, isFatal);
      
      // Call original handler if it exists
      if (originalErrorHandler) {
        originalErrorHandler(error, isFatal);
      }
    });
  }
  
  // Set up unhandled promise rejection handler
  const rejectionTracking = require('promise/setimmediate/rejection-tracking');
  rejectionTracking.enable({
    allRejections: true,
    onUnhandled: (id: string, error: Error) => {
      handleUnhandledRejection(error, Promise.reject(error));
    },
    onHandled: () => {
      // Rejection was handled, no action needed
    },
  });
  
  // Return cleanup function
  return () => {
    // Restore original handlers
    if ((global as any).ErrorUtils && originalErrorHandler) {
      (global as any).ErrorUtils.setGlobalHandler(originalErrorHandler);
    }
    
    rejectionTracking.disable();
  };
}
