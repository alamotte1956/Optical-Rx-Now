/**
 * Global Error Handler
 * Provides centralized error handling and logging for the application
 */

interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  fatal: boolean;
}

const errorLogs: ErrorLog[] = [];
const MAX_LOGS = 100;

/**
 * Handle global errors
 * @param error - The error to handle
 * @param isFatal - Whether the error is fatal
 */
export const handleGlobalError = (error: Error, isFatal: boolean = false): void => {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    message: error.message || 'Unknown error',
    stack: error.stack,
    fatal: isFatal,
  };

  // Add to logs
  errorLogs.push(errorLog);
  
  // Keep only the last MAX_LOGS entries
  if (errorLogs.length > MAX_LOGS) {
    errorLogs.shift();
  }

  // Log to console
  console.error('[Global Error Handler]', {
    message: errorLog.message,
    fatal: errorLog.fatal,
    timestamp: errorLog.timestamp,
  });

  // In production, you could send this to a logging service
  // For now, we just log it
};

/**
 * Setup global error handlers for unhandled errors
 */
export const setupGlobalErrorHandlers = (): void => {
  // Handle unhandled promise rejections
  const originalHandler = global.onunhandledrejection;
  global.onunhandledrejection = (event: any) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    handleGlobalError(error, false);
    
    // Call original handler if it exists
    if (originalHandler) {
      originalHandler(event);
    }
  };

  console.log('[Error Handler] Global error handlers initialized');
};

/**
 * Get recent error logs
 */
export const getErrorLogs = (): ErrorLog[] => {
  return [...errorLogs];
};

/**
 * Clear error logs
 */
export const clearErrorLogs = (): void => {
  errorLogs.length = 0;
};
