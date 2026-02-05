/**
 * Common mocks for torture tests
 * 
 * This file provides reusable mock implementations for native modules
 * that are used across all torture test files.
 */

import {
  MockAsyncStorage,
  MockSecureStore,
  MockFileSystem,
} from './test-helpers';

/**
 * Create expo-file-system mock
 */
export const createFileSystemMock = (mockFileSystem: MockFileSystem) => ({
  Paths: {
    document: 'file://document',
    cache: 'file://cache',
  },
  File: jest.fn().mockImplementation(function(dir: any, filename: string) {
    const dirPath = typeof dir === 'string' ? dir : dir.uri || 'file://document';
    const fullPath = `${dirPath}/${filename}`;
    return {
      uri: fullPath,
      get exists() {
        return mockFileSystem.exists(fullPath);
      },
      create: jest.fn(() => {
        mockFileSystem.writeFile(fullPath, '');
      }),
      write: jest.fn((content: string) => {
        mockFileSystem.writeFile(fullPath, content);
      }),
      text: jest.fn(async () => {
        return mockFileSystem.readFile(fullPath);
      }),
      delete: jest.fn(() => {
        mockFileSystem.deleteFile(fullPath);
      }),
    };
  }),
  Directory: jest.fn().mockImplementation(function(base: any, name: string) {
    const basePath = typeof base === 'string' ? base : base.uri || 'file://document';
    return {
      uri: `${basePath}/${name}`,
      exists: true,
      create: jest.fn(),
    };
  }),
});

/**
 * Create AsyncStorage mock
 */
export const createAsyncStorageMock = (mockAsyncStorage: MockAsyncStorage) => ({
  default: {
    getItem: jest.fn((key: string) => mockAsyncStorage.getItem(key)),
    setItem: jest.fn((key: string, value: string) => mockAsyncStorage.setItem(key, value)),
    removeItem: jest.fn((key: string) => mockAsyncStorage.removeItem(key)),
    clear: jest.fn(() => mockAsyncStorage.clear()),
    getAllKeys: jest.fn(() => mockAsyncStorage.getAllKeys()),
  },
});

/**
 * Create SecureStore mock
 */
export const createSecureStoreMock = (mockSecureStore: MockSecureStore) => ({
  getItemAsync: jest.fn((key: string) => mockSecureStore.getItemAsync(key)),
  setItemAsync: jest.fn((key: string, value: string) => mockSecureStore.setItemAsync(key, value)),
  deleteItemAsync: jest.fn((key: string) => mockSecureStore.deleteItemAsync(key)),
});

/**
 * Create LocalAuthentication mock
 */
export const createLocalAuthMock = () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
});

/**
 * Create Sharing mock
 */
export const createSharingMock = () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn((uri: string, options: any) => Promise.resolve()),
});
