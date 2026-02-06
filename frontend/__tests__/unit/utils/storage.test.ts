jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  safeGetItem,
  safeSetItem,
  getItemWithRecovery,
  validateJSON,
  clearBackup,
  getStorageInfo,
  StorageError,
  handleStorageError,
} from '../../../utils/storage';

describe('Storage Utils Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Safe Get Operations', () => {
    it('should successfully retrieve stored value', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-value');
      
      const result = await safeGetItem('test-key');
      expect(result).toBe('test-value');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should return null for non-existent key', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await safeGetItem('missing-key');
      expect(result).toBeNull();
    });

    it('should retry on transient errors', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockRejectedValueOnce(new Error('Transient error'))
        .mockRejectedValueOnce(new Error('Transient error'))
        .mockResolvedValueOnce('success');
      
      const result = await safeGetItem('retry-key');
      expect(result).toBe('success');
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('Safe Set Operations', () => {
    it('should store value successfully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await safeSetItem('test-key', 'test-value');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should create backup before overwriting', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('old-value');
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await safeSetItem('test-key', 'new-value', true);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key_backup', 'old-value');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'new-value');
    });

    it('should handle quota exceeded error', async () => {
      const quotaError = new Error('QuotaExceededError');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(quotaError);
      
      await expect(safeSetItem('test-key', 'value')).rejects.toThrow(StorageError);
      await expect(safeSetItem('test-key', 'value')).rejects.toMatchObject({
        code: 'QUOTA_EXCEEDED',
      });
    });
  });

  describe('Recovery from Corruption', () => {
    it('should parse valid JSON successfully', async () => {
      const testData = { name: 'John', age: 30 };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(testData));
      
      const result = await getItemWithRecovery('test-key', {});
      expect(result).toEqual(testData);
    });

    it('should return default value when key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const defaultValue = { fallback: true };
      const result = await getItemWithRecovery('missing-key', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should recover from backup on corruption', async () => {
      const backupData = { recovered: true };
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('corrupted-{json')  // Corrupted main data
        .mockResolvedValueOnce(JSON.stringify(backupData));  // Valid backup
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      const result = await getItemWithRecovery('test-key', {});
      expect(result).toEqual(backupData);
    });
  });

  describe('Backup Management', () => {
    it('should clear backup for a given key', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      
      await clearBackup('test-key');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-key_backup');
    });
  });

  describe('JSON Validation', () => {
    it('should validate correct JSON', () => {
      expect(validateJSON('{"valid": true}')).toBe(true);
      expect(validateJSON('[1, 2, 3]')).toBe(true);
      expect(validateJSON('"simple string"')).toBe(true);
    });

    it('should reject invalid JSON', () => {
      expect(validateJSON('{invalid json}')).toBe(false);
      expect(validateJSON('{"unclosed": ')).toBe(false);
      expect(validateJSON('undefined')).toBe(false);
    });
  });

  describe('Storage Info', () => {
    it('should retrieve storage information', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(['key1', 'key2']);
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('value1')
        .mockResolvedValueOnce('value2');
      
      const info = await getStorageInfo();
      expect(info.keys).toEqual(['key1', 'key2']);
      expect(info.estimatedSize).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const info = await getStorageInfo();
      expect(info.keys).toEqual([]);
      expect(info.estimatedSize).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors with appropriate error codes', () => {
      const quotaError = new StorageError('Quota exceeded', 'QUOTA_EXCEEDED');
      expect(quotaError.code).toBe('QUOTA_EXCEEDED');
      expect(quotaError.message).toBe('Quota exceeded');
    });

    it('should call Alert for error handling', () => {
      const { Alert } = require('react-native');
      const error = new StorageError('Test error', 'QUOTA_EXCEEDED');
      
      handleStorageError(error);
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
