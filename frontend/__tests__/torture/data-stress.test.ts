/**
 * Data Stress Tests
 * 
 * Tests for validating data operations under heavy load:
 * - Creating 50+ family members rapidly
 * - Creating 100+ prescriptions across multiple family members
 * - Bulk delete operations
 * - Data persistence with large datasets
 * - Encryption/decryption performance
 * - Search/filter performance
 * - AsyncStorage limits handling
 */

import {
  getFamilyMembers,
  getPrescriptions,
  createFamilyMember,
  createPrescription,
  deleteFamilyMember,
  deletePrescription,
  getStats,
  type FamilyMember,
  type Prescription,
} from '../../services/localStorage';
import { encryptData, decryptData } from '../../services/encryption';
import {
  MockAsyncStorage,
  MockSecureStore,
  MockFileSystem,
  startPerformanceTracking,
  stopPerformanceTracking,
  assertPerformance,
  batchOperation,
  simulateLowStorage,
  clearAllTestData,
} from '../utils/test-helpers';
import {
  generateBulkFamilyMembers,
  generateBulkPrescriptions,
  generatePrescriptionsForMembers,
  generateEdgeCaseFamilyMember,
} from '../utils/mock-data-generator';

// Mock AsyncStorage
const mockAsyncStorage = new MockAsyncStorage(50); // 50MB limit
const mockSecureStore = new MockSecureStore();
const mockFileSystem = new MockFileSystem(100); // 100MB limit

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
        exists: mockFileSystem.exists(fullPath),
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

describe('Data Stress Tests', () => {
  beforeEach(async () => {
    // Clear all data before each test
    await clearAllTestData(mockAsyncStorage, mockFileSystem);
    mockSecureStore.clear();
  });

  describe('Bulk Family Member Creation', () => {
    it('should create 50 family members rapidly', async () => {
      const metrics = startPerformanceTracking();
      const members = generateBulkFamilyMembers(50);
      
      // Create all members
      const createdMembers: FamilyMember[] = [];
      for (const member of members) {
        const created = await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        });
        createdMembers.push(created);
      }
      
      const finalMetrics = stopPerformanceTracking(metrics, 50);
      
      // Verify all members were created
      expect(createdMembers).toHaveLength(50);
      
      // Verify they can be retrieved
      const retrieved = await getFamilyMembers();
      expect(retrieved).toHaveLength(50);
      
      // Performance benchmark: should complete in < 10 seconds
      assertPerformance(finalMetrics, 10000, 'Creating 50 family members');
      
      console.log(`✓ Created 50 family members in ${finalMetrics.duration}ms`);
    }, 30000);

    it('should handle edge case names and relationships', async () => {
      const edgeCases = [
        generateEdgeCaseFamilyMember('long-name'),
        generateEdgeCaseFamilyMember('special-chars'),
        generateEdgeCaseFamilyMember('unicode'),
      ];
      
      for (const member of edgeCases) {
        const created = await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        });
        expect(created.id).toBeDefined();
      }
      
      const retrieved = await getFamilyMembers();
      expect(retrieved).toHaveLength(3);
    });
  });

  describe('Bulk Prescription Creation', () => {
    it('should create 100+ prescriptions across multiple family members', async () => {
      // First create family members
      const members = generateBulkFamilyMembers(10);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        const created = await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        });
        createdMembers.push(created);
      }
      
      // Now create prescriptions (10 per member = 100 total)
      const metrics = startPerformanceTracking();
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 10, 100); // 100KB images
      
      const createdPrescriptions: Prescription[] = [];
      for (const rx of prescriptionData) {
        const created = await createPrescription(rx);
        createdPrescriptions.push(created);
      }
      
      const finalMetrics = stopPerformanceTracking(metrics, 100);
      
      // Verify all prescriptions were created
      expect(createdPrescriptions).toHaveLength(100);
      
      // Verify they can be retrieved
      const retrieved = await getPrescriptions();
      expect(retrieved).toHaveLength(100);
      
      // Performance benchmark: should complete in < 30 seconds
      assertPerformance(finalMetrics, 30000, 'Creating 100 prescriptions');
      
      console.log(`✓ Created 100 prescriptions in ${finalMetrics.duration}ms`);
    }, 60000);

    it('should maintain data integrity with 100+ prescriptions', async () => {
      // Create test data
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 100, 50); // 50KB images
      
      const createdPrescriptions: Prescription[] = [];
      for (const rx of prescriptionData) {
        const created = await createPrescription(rx);
        createdPrescriptions.push(created);
      }
      
      // Verify each prescription
      for (const created of createdPrescriptions) {
        expect(created.id).toBeDefined();
        expect(created.family_member_id).toBe(member.id);
        expect(created.image_uri).toBeDefined();
        expect(created.expiry_date).toBeDefined();
      }
    }, 60000);
  });

  describe('Bulk Delete Operations', () => {
    it('should delete family member with 50+ prescriptions', async () => {
      // Create member with prescriptions
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 50, 50);
      
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Verify created
      let prescriptions = await getPrescriptions(member.id);
      expect(prescriptions).toHaveLength(50);
      
      // Delete member
      const metrics = startPerformanceTracking();
      await deleteFamilyMember(member.id);
      const finalMetrics = stopPerformanceTracking(metrics);
      
      // Verify member deleted
      const members = await getFamilyMembers();
      expect(members).toHaveLength(0);
      
      // Verify all prescriptions deleted
      prescriptions = await getPrescriptions();
      expect(prescriptions).toHaveLength(0);
      
      // Performance benchmark: should complete in < 10 seconds
      assertPerformance(finalMetrics, 10000, 'Deleting member with 50 prescriptions');
      
      console.log(`✓ Deleted member with 50 prescriptions in ${finalMetrics.duration}ms`);
    }, 30000);

    it('should delete individual prescriptions in bulk', async () => {
      // Create test data
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 50, 50);
      
      const createdPrescriptions: Prescription[] = [];
      for (const rx of prescriptionData) {
        createdPrescriptions.push(await createPrescription(rx));
      }
      
      // Delete all prescriptions
      const metrics = startPerformanceTracking();
      for (const rx of createdPrescriptions) {
        await deletePrescription(rx.id);
      }
      const finalMetrics = stopPerformanceTracking(metrics, 50);
      
      // Verify all deleted
      const remaining = await getPrescriptions();
      expect(remaining).toHaveLength(0);
      
      // Performance benchmark: should complete in < 10 seconds
      assertPerformance(finalMetrics, 10000, 'Deleting 50 prescriptions');
      
      console.log(`✓ Deleted 50 prescriptions in ${finalMetrics.duration}ms`);
    }, 30000);
  });

  describe('Data Persistence and Encryption', () => {
    it('should persist and retrieve 100+ encrypted prescriptions', async () => {
      // Create test data
      const members = generateBulkFamilyMembers(5);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      // Create prescriptions
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 20, 50);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Verify retrieval
      const retrieved = await getPrescriptions();
      expect(retrieved).toHaveLength(100);
      
      // Verify data integrity
      for (const rx of retrieved) {
        expect(rx.id).toBeDefined();
        expect(rx.family_member_id).toBeDefined();
        expect(createdMembers.some(m => m.id === rx.family_member_id)).toBe(true);
      }
    }, 60000);

    it('should encrypt and decrypt large datasets efficiently', async () => {
      const testData = generateBulkFamilyMembers(100);
      
      // Encryption benchmark
      const encryptMetrics = startPerformanceTracking();
      const encrypted = await encryptData(testData);
      const encryptFinal = stopPerformanceTracking(encryptMetrics);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      
      // Decryption benchmark
      const decryptMetrics = startPerformanceTracking();
      const decrypted = await decryptData(encrypted);
      const decryptFinal = stopPerformanceTracking(decryptMetrics);
      
      expect(decrypted).toHaveLength(100);
      
      // Performance benchmarks
      assertPerformance(encryptFinal, 5000, 'Encrypting 100 members');
      assertPerformance(decryptFinal, 5000, 'Decrypting 100 members');
      
      console.log(`✓ Encrypted in ${encryptFinal.duration}ms, decrypted in ${decryptFinal.duration}ms`);
    });
  });

  describe('Search and Filter Performance', () => {
    it('should filter 100+ prescriptions by member efficiently', async () => {
      // Create test data
      const members = generateBulkFamilyMembers(10);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      // Create prescriptions
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 10, 50);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Filter by each member
      const metrics = startPerformanceTracking();
      for (const member of createdMembers) {
        const memberRx = await getPrescriptions(member.id);
        expect(memberRx).toHaveLength(10);
        expect(memberRx.every(rx => rx.family_member_id === member.id)).toBe(true);
      }
      const finalMetrics = stopPerformanceTracking(metrics, 10);
      
      // Performance benchmark: should complete in < 2 seconds
      assertPerformance(finalMetrics, 2000, 'Filtering 100 prescriptions by member');
      
      console.log(`✓ Filtered prescriptions in ${finalMetrics.duration}ms`);
    }, 30000);

    it('should retrieve stats efficiently with large datasets', async () => {
      // Create test data
      const members = generateBulkFamilyMembers(20);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      // Create prescriptions
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 5, 50);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Get stats
      const metrics = startPerformanceTracking();
      const stats = await getStats();
      const finalMetrics = stopPerformanceTracking(metrics);
      
      expect(stats.family_members).toBe(20);
      expect(stats.total_prescriptions).toBe(100);
      
      // Performance benchmark: should complete in < 1 second
      assertPerformance(finalMetrics, 1000, 'Getting stats');
      
      console.log(`✓ Retrieved stats in ${finalMetrics.duration}ms`);
    }, 30000);
  });

  describe('AsyncStorage Limits', () => {
    it('should handle storage quota gracefully', async () => {
      // Simulate low storage
      simulateLowStorage(mockAsyncStorage, 0.98);
      
      // Try to create data near limit
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      
      // This should work with small image
      const smallRx = generateBulkPrescriptions(member.id, 1, 10);
      await expect(createPrescription(smallRx[0])).resolves.toBeDefined();
      
      // This might fail with large image if near limit
      const largeRx = generateBulkPrescriptions(member.id, 1, 5000);
      
      // Either it works or throws a storage error
      try {
        await createPrescription(largeRx[0]);
      } catch (error: any) {
        expect(error.message).toContain('quota');
      }
    }, 30000);

    it('should report storage usage accurately', async () => {
      const initialSize = mockAsyncStorage.getCurrentSize();
      
      // Create some data
      const members = generateBulkFamilyMembers(10);
      for (const member of members) {
        await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        });
      }
      
      const finalSize = mockAsyncStorage.getCurrentSize();
      
      // Storage should have increased
      expect(finalSize).toBeGreaterThan(initialSize);
      
      console.log(`✓ Storage usage: ${finalSize} bytes`);
    });
  });
});
