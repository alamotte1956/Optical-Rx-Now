/**
 * Test Helpers for Torture/Stress Testing
 * 
 * Provides utility functions for:
 * - Waiting for async operations
 * - Clearing app data between tests
 * - Mocking native modules
 * - Measuring performance metrics
 */

// Performance tracking
export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: number;
  operationCount?: number;
}

/**
 * Start tracking performance metrics
 */
export const startPerformanceTracking = (): PerformanceMetrics => {
  return {
    startTime: Date.now(),
  };
};

/**
 * Stop tracking and calculate metrics
 */
export const stopPerformanceTracking = (
  metrics: PerformanceMetrics,
  operationCount?: number
): PerformanceMetrics => {
  const endTime = Date.now();
  return {
    ...metrics,
    endTime,
    duration: endTime - metrics.startTime,
    operationCount,
  };
};

/**
 * Wait for a condition to be true or timeout
 */
export const waitFor = async (
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 100
): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const result = await condition();
    if (result) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`);
};

/**
 * Wait for async operation with timeout
 */
export const waitForAsync = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
};

/**
 * Delay execution
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Mock AsyncStorage with size limits
 */
export class MockAsyncStorage {
  private storage: Map<string, string> = new Map();
  private maxSize: number;
  private currentSize: number = 0;

  constructor(maxSizeMB: number = 10) {
    this.maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  }

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    const oldValue = this.storage.get(key);
    const oldSize = oldValue ? oldValue.length : 0;
    const newSize = value.length;
    
    const sizeDiff = newSize - oldSize;
    
    if (this.currentSize + sizeDiff > this.maxSize) {
      throw new Error('AsyncStorage quota exceeded');
    }
    
    this.storage.set(key, value);
    this.currentSize += sizeDiff;
  }

  async removeItem(key: string): Promise<void> {
    const value = this.storage.get(key);
    if (value) {
      this.currentSize -= value.length;
      this.storage.delete(key);
    }
  }

  async clear(): Promise<void> {
    this.storage.clear();
    this.currentSize = 0;
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  getCurrentSize(): number {
    return this.currentSize;
  }

  getRemainingSpace(): number {
    return this.maxSize - this.currentSize;
  }
}

/**
 * Mock SecureStore
 */
export class MockSecureStore {
  private storage: Map<string, string> = new Map();

  async getItemAsync(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItemAsync(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async deleteItemAsync(key: string): Promise<void> {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Mock File System
 */
export class MockFileSystem {
  private files: Map<string, string> = new Map();
  private maxFileSize: number;

  constructor(maxFileSizeMB: number = 50) {
    this.maxFileSize = maxFileSizeMB * 1024 * 1024;
  }

  writeFile(path: string, content: string): void {
    if (content.length > this.maxFileSize) {
      throw new Error('File size exceeds maximum allowed size');
    }
    this.files.set(path, content);
  }

  readFile(path: string): string {
    const content = this.files.get(path);
    if (!content) {
      throw new Error(`File not found: ${path}`);
    }
    return content;
  }

  deleteFile(path: string): void {
    this.files.delete(path);
  }

  exists(path: string): boolean {
    return this.files.has(path);
  }

  clear(): void {
    this.files.clear();
  }

  getTotalSize(): number {
    let total = 0;
    for (const content of this.files.values()) {
      total += content.length;
    }
    return total;
  }
}

/**
 * Mock Image Picker
 */
export const createMockImagePicker = () => ({
  launchCameraAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{
      uri: 'mock://camera/image.jpg',
      width: 1920,
      height: 1080,
      base64: generateMockBase64Image(1024), // 1MB
    }],
  }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{
      uri: 'mock://library/image.jpg',
      width: 1920,
      height: 1080,
      base64: generateMockBase64Image(1024),
    }],
  }),
});

/**
 * Mock Local Authentication
 */
export const createMockLocalAuth = () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
});

/**
 * Generate mock base64 image data
 * @param sizeKB - Size in kilobytes
 */
export const generateMockBase64Image = (sizeKB: number): string => {
  // Base64 encoding increases size by ~33%, so we adjust
  const actualSize = Math.floor((sizeKB * 1024) / 1.33);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < actualSize; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Assert performance benchmark
 */
export const assertPerformance = (
  metrics: PerformanceMetrics,
  maxDurationMs: number,
  operationName: string = 'Operation'
): void => {
  if (!metrics.duration) {
    throw new Error('Performance metrics not completed');
  }
  
  if (metrics.duration > maxDurationMs) {
    throw new Error(
      `${operationName} took ${metrics.duration}ms, expected < ${maxDurationMs}ms`
    );
  }
};

/**
 * Batch operation helper
 */
export const batchOperation = async <T, R>(
  items: T[],
  operation: (item: T, index: number) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item, idx) => operation(item, i + idx))
    );
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Simulate low storage condition
 */
export const simulateLowStorage = (mockStorage: MockAsyncStorage, fillPercentage: number = 0.95): void => {
  const targetSize = mockStorage['maxSize'] * fillPercentage;
  const currentSize = mockStorage.getCurrentSize();
  const fillSize = targetSize - currentSize;
  
  if (fillSize > 0) {
    const padding = 'x'.repeat(Math.floor(fillSize));
    mockStorage.setItem('__low_storage_fill__', padding);
  }
};

/**
 * Clear all test data
 */
export const clearAllTestData = async (mockStorage: MockAsyncStorage, mockFileSystem: MockFileSystem): Promise<void> => {
  await mockStorage.clear();
  mockFileSystem.clear();
};
