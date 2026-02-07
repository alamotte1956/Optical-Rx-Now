import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKUP_SUFFIX = '_backup';
const VERSION_KEY = '@storage_version';
const CURRENT_VERSION = '1.0';

interface StorageRecoveryOptions {
  key: string;
  maxBackups?: number;
  validateData?: (data: any) => boolean;
}

/**
 * Storage Recovery System
 * Provides automatic backup, versioning, and recovery for AsyncStorage data
 */
export class StorageRecovery {
  /**
   * Save data with automatic backup
   */
  static async setItem(
    key: string,
    value: string,
    options: { createBackup?: boolean } = {}
  ): Promise<void> {
    const { createBackup = true } = options;

    try {
      // Create backup of existing data if requested
      if (createBackup) {
        const existing = await AsyncStorage.getItem(key);
        if (existing) {
          await AsyncStorage.setItem(`${key}${BACKUP_SUFFIX}`, existing);
        }
      }

      // Save new data
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }

  /**
   * Get data with automatic recovery from backup if corrupted
   */
  static async getItem(
    key: string,
    options: { validateData?: (data: string) => boolean } = {}
  ): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      
      if (!value) {
        return null;
      }

      // Validate data if validator provided
      if (options.validateData && !options.validateData(value)) {
        console.warn(`Data validation failed for key: ${key}, attempting recovery`);
        return await this.recoverFromBackup(key);
      }

      return value;
    } catch (error) {
      console.error(`Error reading from storage (key: ${key}):`, error);
      // Attempt to recover from backup
      return await this.recoverFromBackup(key);
    }
  }

  /**
   * Recover data from backup
   */
  private static async recoverFromBackup(key: string): Promise<string | null> {
    try {
      const backupKey = `${key}${BACKUP_SUFFIX}`;
      const backup = await AsyncStorage.getItem(backupKey);
      
      if (backup) {
        console.log(`Recovered data from backup for key: ${key}`);
        // Restore from backup
        await AsyncStorage.setItem(key, backup);
        return backup;
      }
      
      console.warn(`No backup found for key: ${key}`);
      return null;
    } catch (error) {
      console.error(`Error recovering from backup (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * Validate JSON data
   */
  static validateJSON(data: string): boolean {
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get data as JSON with recovery
   */
  static async getJSON<T>(
    key: string,
    defaultValue: T
  ): Promise<T> {
    try {
      const value = await this.getItem(key, {
        validateData: this.validateJSON,
      });
      
      if (!value) {
        return defaultValue;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error(`Error parsing JSON for key: ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set data as JSON with backup
   */
  static async setJSON(
    key: string,
    value: any,
    options: { createBackup?: boolean } = {}
  ): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      await this.setItem(key, jsonString, options);
    } catch (error) {
      console.error(`Error saving JSON for key: ${key}:`, error);
      throw error;
    }
  }

  /**
   * Create versioned backup
   */
  static async createVersionedBackup(key: string): Promise<void> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        const timestamp = Date.now();
        const versionedKey = `${key}_v${timestamp}`;
        await AsyncStorage.setItem(versionedKey, value);
        console.log(`Created versioned backup: ${versionedKey}`);
      }
    } catch (error) {
      console.error(`Error creating versioned backup for key: ${key}:`, error);
    }
  }

  /**
   * Check storage health
   */
  static async checkHealth(): Promise<{
    healthy: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Test write
      const testKey = '@storage_health_test';
      const testValue = 'test';
      await AsyncStorage.setItem(testKey, testValue);
      
      // Test read
      const readValue = await AsyncStorage.getItem(testKey);
      if (readValue !== testValue) {
        issues.push('Storage read/write mismatch');
      }
      
      // Cleanup
      await AsyncStorage.removeItem(testKey);

      // Check version
      const version = await AsyncStorage.getItem(VERSION_KEY);
      if (!version) {
        await AsyncStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      }

      return {
        healthy: issues.length === 0,
        issues,
      };
    } catch (error) {
      issues.push(`Storage health check failed: ${(error as Error).message}`);
      return {
        healthy: false,
        issues,
      };
    }
  }
}
