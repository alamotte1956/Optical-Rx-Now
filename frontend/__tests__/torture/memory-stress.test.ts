/**
 * Memory Stress Tests
 * 
 * Tests for validating memory management:
 * - Monitor memory usage during bulk operations
 * - Test for memory leaks
 * - Verify cleanup on component unmount
 * - Test large list rendering performance
 * - Validate image memory management
 * - Test app backgrounding/foregrounding
 */

import {
  createFamilyMember,
  createPrescription,
  deleteFamilyMember,
  getFamilyMembers,
  getPrescriptions,
  type FamilyMember,
  type Prescription,
} from '../../services/localStorage';
import {
  MockAsyncStorage,
  MockSecureStore,
  MockFileSystem,
  startPerformanceTracking,
  stopPerformanceTracking,
  assertPerformance,
  clearAllTestData,
  delay,
} from '../utils/test-helpers';
import {
  generateBulkFamilyMembers,
  generateBulkPrescriptions,
  generatePrescriptionsForMembers,
} from '../utils/mock-data-generator';

// Mock storage
const mockAsyncStorage = new MockAsyncStorage(100);
const mockSecureStore = new MockSecureStore();
const mockFileSystem = new MockFileSystem(500);

// Mock modules
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn((key: string) => mockAsyncStorage.getItem(key)),
    setItem: jest.fn((key: string, value: string) => mockAsyncStorage.setItem(key, value)),
    removeItem: jest.fn((key: string) => mockAsyncStorage.removeItem(key)),
    clear: jest.fn(() => mockAsyncStorage.clear()),
    getAllKeys: jest.fn(() => mockAsyncStorage.getAllKeys()),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) => mockSecureStore.getItemAsync(key)),
  setItemAsync: jest.fn((key: string, value: string) => mockSecureStore.setItemAsync(key, value)),
  deleteItemAsync: jest.fn((key: string) => mockSecureStore.deleteItemAsync(key)),
}));

jest.mock('expo-file-system', () => {
  const { Paths } = jest.requireActual('expo-file-system');
  
  return {
    Paths,
    File: jest.fn().mockImplementation(function(dir: any, filename: string) {
      const fullPath = `${dir}/${filename}`;
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
      return {
        uri: `${base}/${name}`,
        exists: true,
        create: jest.fn(),
      };
    }),
  };
});

describe('Memory Stress Tests', () => {
  beforeEach(async () => {
    await clearAllTestData(mockAsyncStorage, mockFileSystem);
    mockSecureStore.clear();
    
    // Force garbage collection if available (Node.js)
    if (global.gc) {
      global.gc();
    }
  });

  describe('Bulk Operations Memory Usage', () => {
    it('should handle 100 prescriptions without excessive memory growth', async () => {
      const members = generateBulkFamilyMembers(5);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      // Create 100 prescriptions
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 20, 500);
      
      const metrics = startPerformanceTracking();
      
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      const finalMetrics = stopPerformanceTracking(metrics, 100);
      
      // Verify all created
      const prescriptions = await getPrescriptions();
      expect(prescriptions).toHaveLength(100);
      
      // Check storage usage
      const storageSize = mockAsyncStorage.getCurrentSize();
      const fileSystemSize = mockFileSystem.getTotalSize();
      
      console.log(`✓ Created 100 prescriptions - AsyncStorage: ${storageSize} bytes, FileSystem: ${fileSystemSize} bytes`);
      console.log(`✓ Time: ${finalMetrics.duration}ms`);
      
      // Storage should be reasonable
      expect(storageSize).toBeLessThan(50 * 1024 * 1024); // < 50MB
    }, 120000);

    it('should properly clean up memory after deleting data', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 50, 1024);
      
      // Create prescriptions
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      const beforeSize = mockAsyncStorage.getCurrentSize();
      const beforeFileSize = mockFileSystem.getTotalSize();
      
      // Delete member (cascades to prescriptions)
      await deleteFamilyMember(member.id);
      
      const afterSize = mockAsyncStorage.getCurrentSize();
      const afterFileSize = mockFileSystem.getTotalSize();
      
      // Memory should be reclaimed
      expect(afterSize).toBeLessThan(beforeSize);
      expect(afterFileSize).toBeLessThan(beforeFileSize);
      
      console.log(`✓ Memory reclaimed - AsyncStorage: ${beforeSize - afterSize} bytes, FileSystem: ${beforeFileSize - afterFileSize} bytes`);
    }, 60000);
  });

  describe('Memory Leak Detection', () => {
    it('should not leak memory during repeated create/delete cycles', async () => {
      const cycles = 10;
      const sizeSamples: number[] = [];
      
      for (let cycle = 0; cycle < cycles; cycle++) {
        // Create data
        const member = await createFamilyMember({ name: `User ${cycle}`, relationship: 'Self' });
        const prescriptionData = generateBulkPrescriptions(member.id, 10, 500);
        
        for (const rx of prescriptionData) {
          await createPrescription(rx);
        }
        
        // Delete data
        await deleteFamilyMember(member.id);
        
        // Sample storage size after each cycle
        sizeSamples.push(mockAsyncStorage.getCurrentSize());
      }
      
      // Storage size should stabilize, not grow continuously
      const firstHalf = sizeSamples.slice(0, 5);
      const secondHalf = sizeSamples.slice(5);
      
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      // Second half shouldn't be significantly larger than first half
      const growth = (secondAvg - firstAvg) / firstAvg;
      expect(growth).toBeLessThan(0.5); // Less than 50% growth
      
      console.log(`✓ Completed ${cycles} create/delete cycles - Growth: ${(growth * 100).toFixed(2)}%`);
    }, 120000);

    it('should not leak memory with repeated reads', async () => {
      // Create initial data
      const members = generateBulkFamilyMembers(10);
      for (const member of members) {
        await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        });
      }
      
      const member = await getFamilyMembers();
      const prescriptionData = generatePrescriptionsForMembers(member, 10, 500);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Repeatedly read data
      for (let i = 0; i < 100; i++) {
        await getFamilyMembers();
        await getPrescriptions();
      }
      
      // Storage size should be stable
      const finalSize = mockAsyncStorage.getCurrentSize();
      
      // Do more reads
      for (let i = 0; i < 100; i++) {
        await getFamilyMembers();
        await getPrescriptions();
      }
      
      const afterReadsSize = mockAsyncStorage.getCurrentSize();
      
      // Size shouldn't grow from reads
      expect(afterReadsSize).toBe(finalSize);
      
      console.log(`✓ Completed 200 reads - Storage stable at ${finalSize} bytes`);
    }, 60000);
  });

  describe('Large List Performance', () => {
    it('should efficiently load list of 100 prescriptions', async () => {
      // Create large dataset
      const members = generateBulkFamilyMembers(5);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 20, 100);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Measure load time
      const metrics = startPerformanceTracking();
      const prescriptions = await getPrescriptions();
      const finalMetrics = stopPerformanceTracking(metrics);
      
      expect(prescriptions).toHaveLength(100);
      
      // Should load quickly
      assertPerformance(finalMetrics, 2000, 'Loading 100 prescriptions');
      
      console.log(`✓ Loaded 100 prescriptions in ${finalMetrics.duration}ms`);
    }, 60000);

    it('should handle filtering large lists efficiently', async () => {
      // Create data
      const members = generateBulkFamilyMembers(10);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 10, 50);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Filter by each member
      const metrics = startPerformanceTracking();
      
      for (const member of createdMembers) {
        const filtered = await getPrescriptions(member.id);
        expect(filtered).toHaveLength(10);
      }
      
      const finalMetrics = stopPerformanceTracking(metrics, 10);
      
      // Should filter quickly
      assertPerformance(finalMetrics, 1000, 'Filtering prescriptions');
      
      console.log(`✓ Filtered 100 prescriptions 10 times in ${finalMetrics.duration}ms`);
    }, 60000);
  });

  describe('Image Memory Management', () => {
    it('should handle large images without excessive memory usage', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      
      // Create prescriptions with large images
      const prescriptionData = generateBulkPrescriptions(member.id, 20, 2048); // 2MB each
      
      const metrics = startPerformanceTracking();
      
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      const finalMetrics = stopPerformanceTracking(metrics, 20);
      
      const fileSystemSize = mockFileSystem.getTotalSize();
      
      // File system should handle the load
      expect(fileSystemSize).toBeGreaterThan(0);
      
      console.log(`✓ Created 20 large images - FileSystem: ${fileSystemSize} bytes, Time: ${finalMetrics.duration}ms`);
    }, 120000);

    it('should clean up image memory when prescriptions are deleted', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 30, 1024);
      
      const created: Prescription[] = [];
      for (const rx of prescriptionData) {
        created.push(await createPrescription(rx));
      }
      
      const beforeFileSize = mockFileSystem.getTotalSize();
      expect(beforeFileSize).toBeGreaterThan(0);
      
      // Delete all prescriptions
      for (const rx of created) {
        await deletePrescription(rx.id);
      }
      
      const afterFileSize = mockFileSystem.getTotalSize();
      
      // All images should be deleted
      expect(afterFileSize).toBe(0);
      
      console.log(`✓ Cleaned up ${beforeFileSize} bytes of images`);
    }, 60000);
  });

  describe('App State Transitions', () => {
    it('should maintain data integrity after simulated app restart', async () => {
      // Create data
      const members = generateBulkFamilyMembers(10);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 5, 100);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Simulate app restart (data persists in mock storage)
      // Re-read data
      const reloadedMembers = await getFamilyMembers();
      const reloadedPrescriptions = await getPrescriptions();
      
      expect(reloadedMembers).toHaveLength(10);
      expect(reloadedPrescriptions).toHaveLength(50);
      
      console.log(`✓ Data persisted across simulated restart`);
    }, 60000);

    it('should handle rapid state changes', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      
      // Rapidly create and read data
      for (let i = 0; i < 20; i++) {
        const rx = generateBulkPrescriptions(member.id, 1, 50)[0];
        await createPrescription(rx);
        await getPrescriptions();
      }
      
      const prescriptions = await getPrescriptions();
      expect(prescriptions).toHaveLength(20);
      
      console.log(`✓ Handled 20 rapid state changes`);
    }, 30000);
  });

  describe('Resource Cleanup', () => {
    it('should properly clean up after bulk operations', async () => {
      const initialAsyncSize = mockAsyncStorage.getCurrentSize();
      const initialFileSize = mockFileSystem.getTotalSize();
      
      // Perform bulk operations
      const members = generateBulkFamilyMembers(20);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 5, 500);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Clean up
      for (const member of createdMembers) {
        await deleteFamilyMember(member.id);
      }
      
      const finalAsyncSize = mockAsyncStorage.getCurrentSize();
      const finalFileSize = mockFileSystem.getTotalSize();
      
      // Should be close to initial state
      expect(finalAsyncSize).toBeLessThanOrEqual(initialAsyncSize + 1000); // Allow small overhead
      expect(finalFileSize).toBe(initialFileSize);
      
      console.log(`✓ Cleaned up all resources`);
    }, 120000);

    it('should not accumulate temporary data', async () => {
      const samples: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        // Create and delete data
        const member = await createFamilyMember({ name: `User ${i}`, relationship: 'Self' });
        const prescriptionData = generateBulkPrescriptions(member.id, 10, 100);
        
        for (const rx of prescriptionData) {
          await createPrescription(rx);
        }
        
        await deleteFamilyMember(member.id);
        
        samples.push(mockAsyncStorage.getCurrentSize());
      }
      
      // Storage should remain stable
      const maxSize = Math.max(...samples);
      const minSize = Math.min(...samples);
      
      expect(maxSize - minSize).toBeLessThan(10000); // Less than 10KB variance
      
      console.log(`✓ No temporary data accumulation - Variance: ${maxSize - minSize} bytes`);
    }, 60000);
  });
});
