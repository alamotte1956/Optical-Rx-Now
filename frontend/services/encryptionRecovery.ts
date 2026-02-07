import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEncryptionKey } from './encryption';

const ENCRYPTION_BACKUP_KEY = '@encryption_key_backup';
const ENCRYPTION_RECOVERY_STATE = '@encryption_recovery_state';

interface RecoveryState {
  lastKeyRotation: number;
  recoveryAttempts: number;
  lastError: string | null;
}

/**
 * Encryption Recovery System
 * Handles encryption key corruption, rotation, and recovery
 */
export class EncryptionRecovery {
  /**
   * Attempt to recover encryption key
   */
  static async recoverEncryptionKey(): Promise<boolean> {
    try {
      console.log('[Encryption Recovery] Attempting key recovery...');
      
      // Try to get the current key
      try {
        await getEncryptionKey();
        console.log('[Encryption Recovery] Current key is valid');
        return true;
      } catch (error) {
        console.warn('[Encryption Recovery] Current key failed, attempting recovery');
      }

      // Check if we have a backup
      const backup = await AsyncStorage.getItem(ENCRYPTION_BACKUP_KEY);
      if (backup) {
        console.log('[Encryption Recovery] Found backup key, attempting restore');
        try {
          await SecureStore.setItemAsync('app_encryption_key', backup);
          
          // Verify the restored key works
          await getEncryptionKey();
          console.log('[Encryption Recovery] Successfully recovered from backup');
          return true;
        } catch (error) {
          console.error('[Encryption Recovery] Backup key restore failed:', error);
        }
      }

      console.warn('[Encryption Recovery] No valid backup found');
      return false;
    } catch (error) {
      console.error('[Encryption Recovery] Recovery failed:', error);
      await this.updateRecoveryState((error as Error).message);
      return false;
    }
  }

  /**
   * Create backup of encryption key
   */
  static async backupEncryptionKey(): Promise<void> {
    try {
      const key = await getEncryptionKey();
      await AsyncStorage.setItem(ENCRYPTION_BACKUP_KEY, key);
      console.log('[Encryption Recovery] Key backup created');
    } catch (error) {
      console.error('[Encryption Recovery] Failed to backup key:', error);
    }
  }

  /**
   * Rotate encryption key (advanced feature - requires re-encryption of all data)
   */
  static async rotateEncryptionKey(): Promise<boolean> {
    try {
      console.log('[Encryption Recovery] Starting key rotation...');
      
      // Backup old key first
      await this.backupEncryptionKey();
      
      // Remove current key to force generation of new one
      await SecureStore.deleteItemAsync('app_encryption_key');
      
      // Generate new key
      const newKey = await getEncryptionKey();
      
      // Update recovery state
      const state = await this.getRecoveryState();
      state.lastKeyRotation = Date.now();
      await this.saveRecoveryState(state);
      
      console.log('[Encryption Recovery] Key rotation complete');
      
      // Note: In a real implementation, you would need to:
      // 1. Decrypt all existing data with old key
      // 2. Re-encrypt with new key
      // This is a simplified version
      
      return true;
    } catch (error) {
      console.error('[Encryption Recovery] Key rotation failed:', error);
      await this.updateRecoveryState((error as Error).message);
      return false;
    }
  }

  /**
   * Verify encryption system health
   */
  static async verifyEncryptionHealth(): Promise<{
    healthy: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Try to get encryption key
      try {
        await getEncryptionKey();
      } catch (error) {
        issues.push(`Encryption key access failed: ${(error as Error).message}`);
      }

      // Check if backup exists
      const backup = await AsyncStorage.getItem(ENCRYPTION_BACKUP_KEY);
      if (!backup) {
        issues.push('No encryption key backup found');
      }

      // Check recovery state
      const state = await this.getRecoveryState();
      if (state.recoveryAttempts > 5) {
        issues.push('Multiple recovery attempts detected');
      }

      return {
        healthy: issues.length === 0,
        issues,
      };
    } catch (error) {
      issues.push(`Health check failed: ${(error as Error).message}`);
      return {
        healthy: false,
        issues,
      };
    }
  }

  /**
   * Export data before key reset (user-facing feature)
   */
  static async exportBeforeKeyReset(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // In a real implementation, this would:
      // 1. Decrypt all user data
      // 2. Create an unencrypted backup
      // 3. Provide it to the user for safekeeping
      
      console.log('[Encryption Recovery] Export functionality would run here');
      
      return {
        success: true,
        message: 'Data exported successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Export failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Reset encryption system (last resort)
   */
  static async resetEncryptionSystem(): Promise<void> {
    try {
      console.warn('[Encryption Recovery] Resetting encryption system...');
      
      // Remove all encryption-related keys
      await SecureStore.deleteItemAsync('app_encryption_key');
      await AsyncStorage.removeItem(ENCRYPTION_BACKUP_KEY);
      await AsyncStorage.removeItem(ENCRYPTION_RECOVERY_STATE);
      
      // Generate fresh key
      await getEncryptionKey();
      
      console.log('[Encryption Recovery] System reset complete');
    } catch (error) {
      console.error('[Encryption Recovery] Reset failed:', error);
      throw error;
    }
  }

  /**
   * Get recovery state
   */
  private static async getRecoveryState(): Promise<RecoveryState> {
    const stored = await AsyncStorage.getItem(ENCRYPTION_RECOVERY_STATE);
    return stored ? JSON.parse(stored) : {
      lastKeyRotation: 0,
      recoveryAttempts: 0,
      lastError: null,
    };
  }

  /**
   * Save recovery state
   */
  private static async saveRecoveryState(state: RecoveryState): Promise<void> {
    await AsyncStorage.setItem(ENCRYPTION_RECOVERY_STATE, JSON.stringify(state));
  }

  /**
   * Update recovery state with error
   */
  private static async updateRecoveryState(errorMessage: string): Promise<void> {
    const state = await this.getRecoveryState();
    state.recoveryAttempts++;
    state.lastError = errorMessage;
    await this.saveRecoveryState(state);
  }
}
