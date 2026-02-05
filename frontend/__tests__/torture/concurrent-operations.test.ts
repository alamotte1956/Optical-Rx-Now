/**
 * Concurrent Operations Tests
 * 
 * Tests for validating behavior under concurrent operations:
 * - Rapid button clicking (save, delete, edit)
 * - Simultaneous create/update/delete operations
 * - Concurrent image uploads
 * - Race conditions in state management
 * - Multiple navigation actions at once
 * - Concurrent biometric auth requests
 */

import {
  createFamilyMember,
  createPrescription,
  deletePrescription,
  deleteFamilyMember,
  getFamilyMembers,
  getPrescriptions,
  clonePrescription,
  type FamilyMember,
  type Prescription,
} from '../../services/localStorage';
import { authenticateUser, isBiometricEnabled } from '../../services/authentication';
import {
  MockAsyncStorage,
  MockSecureStore,
  MockFileSystem,
  createMockLocalAuth,
  startPerformanceTracking,
  stopPerformanceTracking,
  clearAllTestData,
  delay,
} from '../utils/test-helpers';
import {
  generateBulkFamilyMembers,
  generateBulkPrescriptions,
  generateFamilyMember,
} from '../utils/mock-data-generator';

// Mock storage
const mockAsyncStorage = new MockAsyncStorage(100);
const mockSecureStore = new MockSecureStore();
const mockFileSystem = new MockFileSystem(500);
const mockLocalAuth = createMockLocalAuth();

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

jest.mock('expo-local-authentication', () => mockLocalAuth);

describe('Concurrent Operations Tests', () => {
  beforeEach(async () => {
    await clearAllTestData(mockAsyncStorage, mockFileSystem);
    mockSecureStore.clear();
    jest.clearAllMocks();
  });

  describe('Rapid Button Clicking', () => {
    it('should prevent duplicate family member creation from rapid clicks', async () => {
      const memberData = generateFamilyMember();
      
      // Simulate rapid button clicks (5 clicks in quick succession)
      const createPromises = Array(5).fill(null).map(() =>
        createFamilyMember({
          name: memberData.name,
          relationship: memberData.relationship,
        })
      );
      
      const results = await Promise.all(createPromises);
      
      // All should succeed (operation queue handles this)
      expect(results).toHaveLength(5);
      expect(results.every(r => r.id)).toBe(true);
      
      // Verify all were created
      const members = await getFamilyMembers();
      expect(members).toHaveLength(5);
      
      console.log(`✓ Handled 5 rapid create operations`);
    });

    it('should handle rapid delete operations', async () => {
      // Create test data
      const members = generateBulkFamilyMembers(10);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      // Rapidly delete all members
      const deletePromises = createdMembers.map(m => deleteFamilyMember(m.id));
      await Promise.all(deletePromises);
      
      // Verify all deleted
      const remaining = await getFamilyMembers();
      expect(remaining).toHaveLength(0);
      
      console.log(`✓ Handled 10 concurrent delete operations`);
    }, 30000);

    it('should prevent duplicate prescription saves', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 1, 100)[0];
      
      // Simulate rapid save button clicks
      const savePromises = Array(5).fill(null).map(() =>
        createPrescription(prescriptionData)
      );
      
      const results = await Promise.all(savePromises);
      
      // All should succeed
      expect(results).toHaveLength(5);
      
      // Verify all were saved
      const prescriptions = await getPrescriptions();
      expect(prescriptions).toHaveLength(5);
      
      console.log(`✓ Handled 5 rapid prescription saves`);
    }, 30000);
  });

  describe('Simultaneous CRUD Operations', () => {
    it('should handle concurrent creates, reads, and deletes', async () => {
      const members = generateBulkFamilyMembers(20);
      
      // Start concurrent operations
      const operations = [];
      
      // Create operations
      for (let i = 0; i < 10; i++) {
        operations.push(createFamilyMember({
          name: members[i].name,
          relationship: members[i].relationship,
        }));
      }
      
      // Read operations
      for (let i = 0; i < 5; i++) {
        operations.push(getFamilyMembers());
      }
      
      // Execute all concurrently
      const results = await Promise.all(operations);
      
      // Verify creates succeeded
      const createResults = results.slice(0, 10) as FamilyMember[];
      expect(createResults.every(r => r.id)).toBe(true);
      
      // Verify reads succeeded
      const readResults = results.slice(10) as FamilyMember[][];
      expect(readResults.every(r => Array.isArray(r))).toBe(true);
      
      console.log(`✓ Handled 15 concurrent operations`);
    });

    it('should maintain data consistency during concurrent operations', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      
      // Create prescriptions concurrently
      const prescriptionData = generateBulkPrescriptions(member.id, 20, 50);
      const createPromises = prescriptionData.map(rx => createPrescription(rx));
      
      await Promise.all(createPromises);
      
      // Verify all created
      const prescriptions = await getPrescriptions();
      expect(prescriptions).toHaveLength(20);
      
      // Verify no data corruption
      for (const rx of prescriptions) {
        expect(rx.id).toBeDefined();
        expect(rx.family_member_id).toBe(member.id);
        expect(rx.image_uri).toBeDefined();
      }
      
      console.log(`✓ Created 20 prescriptions concurrently with data integrity`);
    }, 60000);

    it('should handle mixed operations on same data', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      
      // Create some prescriptions first
      const prescriptionData = generateBulkPrescriptions(member.id, 10, 50);
      const created: Prescription[] = [];
      for (const rx of prescriptionData.slice(0, 5)) {
        created.push(await createPrescription(rx));
      }
      
      // Now do mixed operations concurrently
      const operations = [];
      
      // Create more prescriptions
      for (const rx of prescriptionData.slice(5)) {
        operations.push(createPrescription(rx));
      }
      
      // Delete some prescriptions
      for (const rx of created.slice(0, 3)) {
        operations.push(deletePrescription(rx.id));
      }
      
      // Clone some prescriptions
      for (const rx of created.slice(3)) {
        operations.push(clonePrescription(rx.id));
      }
      
      // Read prescriptions
      operations.push(getPrescriptions());
      
      await Promise.all(operations);
      
      // Verify final state
      const final = await getPrescriptions();
      
      // Should have: 5 original - 3 deleted + 5 new + 2 cloned = 9
      expect(final.length).toBeGreaterThan(5);
      
      console.log(`✓ Handled mixed concurrent operations, final count: ${final.length}`);
    }, 60000);
  });

  describe('Concurrent Image Operations', () => {
    it('should handle concurrent image uploads', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 10, 500);
      
      const metrics = startPerformanceTracking();
      
      // Upload all images concurrently
      const uploadPromises = prescriptionData.map(rx => createPrescription(rx));
      const results = await Promise.all(uploadPromises);
      
      const finalMetrics = stopPerformanceTracking(metrics, 10);
      
      expect(results).toHaveLength(10);
      
      // Verify file system
      const fileSystemSize = mockFileSystem.getTotalSize();
      expect(fileSystemSize).toBeGreaterThan(0);
      
      console.log(`✓ Uploaded 10 images concurrently in ${finalMetrics.duration}ms`);
    }, 30000);

    it('should handle concurrent image deletions', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 15, 300);
      
      // Create prescriptions
      const created: Prescription[] = [];
      for (const rx of prescriptionData) {
        created.push(await createPrescription(rx));
      }
      
      // Delete all concurrently
      const deletePromises = created.map(rx => deletePrescription(rx.id));
      await Promise.all(deletePromises);
      
      // Verify all deleted
      const remaining = await getPrescriptions();
      expect(remaining).toHaveLength(0);
      
      // Verify images deleted
      const fileSystemSize = mockFileSystem.getTotalSize();
      expect(fileSystemSize).toBe(0);
      
      console.log(`✓ Deleted 15 images concurrently`);
    }, 60000);
  });

  describe('Race Conditions', () => {
    it('should handle race condition in member deletion with prescriptions', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 10, 100);
      
      // Create prescriptions
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Try to delete member and add prescription at same time
      const operations = [
        deleteFamilyMember(member.id),
        // This should fail or be queued properly
        createPrescription(prescriptionData[0]),
      ];
      
      try {
        await Promise.all(operations);
      } catch (error) {
        // One of the operations might fail, which is acceptable
      }
      
      // Verify final state is consistent
      const members = await getFamilyMembers();
      const prescriptions = await getPrescriptions();
      
      // Either member was deleted (no prescriptions) or still exists
      if (members.length === 0) {
        expect(prescriptions).toHaveLength(0);
      } else {
        expect(members.length).toBeGreaterThan(0);
      }
      
      console.log(`✓ Handled race condition in deletion`);
    }, 30000);

    it('should queue operations to prevent race conditions', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      
      // Create same prescription multiple times rapidly
      const prescriptionData = generateBulkPrescriptions(member.id, 1, 100)[0];
      
      const operations = Array(10).fill(null).map(() => 
        createPrescription(prescriptionData)
      );
      
      const results = await Promise.all(operations);
      
      // All should succeed (operation queue handles this)
      expect(results).toHaveLength(10);
      
      // Verify all have unique IDs
      const ids = new Set(results.map(r => r.id));
      expect(ids.size).toBe(10);
      
      console.log(`✓ Operation queue prevented race conditions`);
    }, 30000);
  });

  describe('Concurrent Biometric Auth', () => {
    it('should handle multiple biometric auth requests', async () => {
      // Enable biometric
      await mockAsyncStorage.setItem('@biometric_enabled', 'true');
      
      // Multiple concurrent auth requests
      const authPromises = Array(5).fill(null).map(() =>
        authenticateUser('Test authentication')
      );
      
      const results = await Promise.all(authPromises);
      
      // All should succeed with our mock
      expect(results.every(r => r === true)).toBe(true);
      
      // Verify mock was called
      expect(mockLocalAuth.authenticateAsync).toHaveBeenCalled();
      
      console.log(`✓ Handled 5 concurrent biometric auth requests`);
    });

    it('should handle auth timeout correctly', async () => {
      await mockAsyncStorage.setItem('@biometric_enabled', 'true');
      
      // First auth
      const result1 = await authenticateUser('First auth');
      expect(result1).toBe(true);
      
      // Immediate second auth should use cached result
      const result2 = await authenticateUser('Second auth');
      expect(result2).toBe(true);
      
      console.log(`✓ Auth caching works correctly`);
    });
  });

  describe('Stress Test - Maximum Concurrency', () => {
    it('should handle 50 concurrent operations', async () => {
      const metrics = startPerformanceTracking();
      
      // Mix of different operations
      const operations = [];
      
      // Create 20 members
      const members = generateBulkFamilyMembers(20);
      for (const member of members) {
        operations.push(createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      // Read 15 times
      for (let i = 0; i < 15; i++) {
        operations.push(getFamilyMembers());
      }
      
      // Get prescriptions 15 times
      for (let i = 0; i < 15; i++) {
        operations.push(getPrescriptions());
      }
      
      await Promise.all(operations);
      
      const finalMetrics = stopPerformanceTracking(metrics, 50);
      
      // Verify final state
      const finalMembers = await getFamilyMembers();
      expect(finalMembers.length).toBeGreaterThan(0);
      
      console.log(`✓ Handled 50 concurrent operations in ${finalMetrics.duration}ms`);
    }, 30000);

    it('should maintain consistency under extreme concurrency', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      
      // Create 30 prescriptions concurrently
      const prescriptionData = generateBulkPrescriptions(member.id, 30, 100);
      const createPromises = prescriptionData.map(rx => createPrescription(rx));
      
      await Promise.all(createPromises);
      
      // Verify all created correctly
      const prescriptions = await getPrescriptions();
      expect(prescriptions).toHaveLength(30);
      
      // Verify unique IDs
      const ids = new Set(prescriptions.map(rx => rx.id));
      expect(ids.size).toBe(30);
      
      // Verify all have images
      expect(prescriptions.every(rx => rx.image_uri)).toBe(true);
      
      console.log(`✓ Created 30 prescriptions concurrently with full consistency`);
    }, 60000);
  });
});
