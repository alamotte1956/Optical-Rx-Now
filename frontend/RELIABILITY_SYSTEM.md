# Reliability System Documentation

## Overview

The Optical Rx Now app includes a comprehensive reliability system designed to handle errors gracefully, recover from failures, and ensure data integrity. This document provides an overview of the system architecture and how to use it.

## Architecture

### 1. Error Handling (`utils/errorHandler.ts`)

**Purpose**: Centralized error handling and logging

**Features**:
- Global error handler setup
- Error logging with timestamps
- Fatal vs non-fatal error classification
- Error log retrieval for debugging

**Usage**:
```typescript
import { setupGlobalErrorHandlers, handleGlobalError } from '../utils/errorHandler';

// Setup on app start
setupGlobalErrorHandlers();

// Handle errors manually
try {
  // risky operation
} catch (error) {
  handleGlobalError(error, false); // false = not fatal
}
```

### 2. Error Boundary Component (`components/ErrorBoundary.tsx`)

**Purpose**: Catch React component errors and display user-friendly UI

**Features**:
- Catches component rendering errors
- Displays friendly error message
- Provides "Try Again" button
- Integrates with error handler

**Usage**:
```typescript
import { ErrorBoundary } from '../components/ErrorBoundary';

<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

### 3. Network State Manager (`utils/networkStateManager.ts`)

**Purpose**: Monitor network connectivity and queue offline operations

**Features**:
- Real-time network status monitoring
- Automatic operation queuing when offline
- Auto-retry when connection restored
- Listener support for UI updates

**Usage**:
```typescript
import { networkStateManager } from '../utils/networkStateManager';

// Execute operation with network awareness
const result = await networkStateManager.executeOrQueue(
  async () => {
    return await fetchData();
  },
  { requiresNetwork: true, maxRetries: 3 }
);

// Listen to network changes
const unsubscribe = networkStateManager.addListener((isOnline) => {
  console.log('Network status:', isOnline ? 'online' : 'offline');
});
```

### 4. Notification Retry System (`services/notificationRetry.ts`)

**Purpose**: Handle notification permission requests and scheduling with retry logic

**Features**:
- Permission request with exponential backoff
- Failed notification queueing
- Auto-retry on permission grant
- Persistent state across app restarts

**Usage**:
```typescript
import { notificationRetrySystem } from '../services/notificationRetry';

// Request permissions with retry
const granted = await notificationRetrySystem.requestPermissionWithRetry();

// Schedule notification with retry
const notificationId = await notificationRetrySystem.scheduleNotificationWithRetry(
  { title: 'Reminder', body: 'Check your prescriptions' },
  { seconds: 60 }
);
```

### 5. Storage Recovery (`utils/storageRecovery.ts`)

**Purpose**: Automatic backup and recovery for AsyncStorage data

**Features**:
- Automatic backup creation
- Corruption detection and recovery
- JSON validation
- Versioned backups
- Health checking

**Usage**:
```typescript
import { StorageRecovery } from '../utils/storageRecovery';

// Save with automatic backup
await StorageRecovery.setItem('myKey', 'myValue', { createBackup: true });

// Get with automatic recovery
const value = await StorageRecovery.getItem('myKey', {
  validateData: StorageRecovery.validateJSON
});

// JSON helpers
await StorageRecovery.setJSON('myKey', { data: 'value' });
const data = await StorageRecovery.getJSON('myKey', {});

// Health check
const health = await StorageRecovery.checkHealth();
```

### 6. Encryption Recovery (`services/encryptionRecovery.ts`)

**Purpose**: Handle encryption key failures and recovery

**Features**:
- Encryption key backup
- Key recovery from backup
- Key rotation (with caveats)
- Health verification
- System reset (last resort)

**Usage**:
```typescript
import { EncryptionRecovery } from '../services/encryptionRecovery';

// Backup encryption key
await EncryptionRecovery.backupEncryptionKey();

// Recover from failure
const recovered = await EncryptionRecovery.recoverEncryptionKey();

// Verify health
const health = await EncryptionRecovery.verifyEncryptionHealth();

// Last resort: reset (WARNING: loses all encrypted data)
await EncryptionRecovery.resetEncryptionSystem();
```

### 7. Health Check System (`utils/healthCheck.ts`)

**Purpose**: Monitor overall system health and provide recommendations

**Features**:
- Comprehensive health monitoring
- Storage health check
- Encryption health check
- Error rate monitoring
- Auto-repair capabilities
- Actionable recommendations

**Usage**:
```typescript
import { HealthCheck } from '../utils/healthCheck';

// Run health check
const result = await HealthCheck.runHealthCheck();
console.log('Overall health:', result.overall); // 'healthy' | 'warning' | 'critical'
console.log('Recommendations:', result.recommendations);

// Auto-repair
const repairResult = await HealthCheck.autoRepair();
console.log('Repaired:', repairResult.repaired);
console.log('Failed:', repairResult.failed);
```

## Integration Guide

### App Layout Integration

Update `app/_layout.tsx`:

```typescript
import { ErrorBoundary } from '../components/ErrorBoundary';
import { setupGlobalErrorHandlers } from '../utils/errorHandler';
import { HealthCheck } from '../utils/healthCheck';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    // Setup global error handlers
    setupGlobalErrorHandlers();
    
    // Run health check on startup
    HealthCheck.runHealthCheck().then(result => {
      console.log('Health check result:', result);
      
      if (result.overall === 'critical') {
        // Consider showing a warning to the user
        console.warn('Critical health issues detected:', result.recommendations);
      }
    });
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        {/* Your app content */}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
```

### Using Network State in Screens

Update `app/(tabs)/index.tsx`:

```typescript
import { networkStateManager } from '../../utils/networkStateManager';
import { useState, useEffect } from 'react';

export default function Screen() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    // Listen to network changes
    const unsubscribe = networkStateManager.addListener(setIsOnline);
    
    // Get initial state
    setIsOnline(networkStateManager.getIsOnline());
    
    return unsubscribe;
  }, []);
  
  return (
    <View>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text>You are offline. Some features may be limited.</Text>
        </View>
      )}
      {/* Your content */}
    </View>
  );
}
```

## Troubleshooting Guide

### Storage Issues

**Problem**: Data not loading or corrupted

**Solutions**:
1. Check storage health: `await StorageRecovery.checkHealth()`
2. Attempt recovery: Data will auto-recover from backup
3. Create versioned backup before major operations: `await StorageRecovery.createVersionedBackup('key')`

### Encryption Issues

**Problem**: Cannot decrypt data

**Solutions**:
1. Check encryption health: `await EncryptionRecovery.verifyEncryptionHealth()`
2. Attempt key recovery: `await EncryptionRecovery.recoverEncryptionKey()`
3. If all else fails: `await EncryptionRecovery.resetEncryptionSystem()` (WARNING: loses data)

### Network Issues

**Problem**: Operations failing due to connectivity

**Solutions**:
1. Use `networkStateManager.executeOrQueue()` to auto-queue offline operations
2. Monitor network status with listeners
3. Operations will auto-retry when connection restored

### High Error Rate

**Problem**: Many errors occurring

**Solutions**:
1. Run health check: `await HealthCheck.runHealthCheck()`
2. Review error logs: `getErrorLogs()`
3. Run auto-repair: `await HealthCheck.autoRepair()`

## Testing Instructions

### Manual Testing

1. **Error Boundary**:
   - Trigger a component error
   - Verify error UI appears
   - Click "Try Again" to recover

2. **Network State**:
   - Enable airplane mode
   - Attempt network operation
   - Disable airplane mode
   - Verify operation completes

3. **Storage Recovery**:
   - Corrupt data in AsyncStorage
   - Attempt to read
   - Verify recovery from backup

4. **Health Check**:
   - Run on app startup
   - Review recommendations
   - Test auto-repair

### Automated Testing

Currently, no test infrastructure exists. If adding tests:

```typescript
// Example test structure
describe('ErrorBoundary', () => {
  it('catches errors and displays fallback UI', () => {
    // Test implementation
  });
});
```

## Best Practices

1. **Always use ErrorBoundary** at the root of your app
2. **Setup error handlers** on app initialization
3. **Use StorageRecovery** instead of direct AsyncStorage for critical data
4. **Run health checks** periodically or on app startup
5. **Handle network state** for operations that require connectivity
6. **Create backups** before major data operations
7. **Monitor error logs** in production

## Performance Considerations

- Health checks are lightweight but should not run too frequently
- Network state manager has minimal overhead
- Storage recovery only creates backups when data changes
- Error logging is capped at 100 entries to prevent memory issues

## Future Enhancements

- Remote error logging (e.g., Sentry integration)
- Automatic crash reporting
- Performance monitoring
- A/B testing for recovery strategies
- User-facing health dashboard
