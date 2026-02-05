/**
 * Offline Stress Tests
 * 
 * Tests for validating offline functionality:
 * - Create data while offline (100+ items)
 * - Test offline → online transitions
 * - Verify data integrity after offline operations
 * - Test error handling for network-dependent features
 * - Validate data persistence during offline mode
 */

import {
  createFamilyMember,
  createPrescription,
  deleteFamilyMember,
  getFamilyMembers,
  getPrescriptions,
  exportEncryptedBackup,
  type FamilyMember,
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

// Network state
let isOnline = true;

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

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn((uri: string, options: any) => Promise.resolve()),
}));

jest.mock('expo-file-system', () => ({
  Paths: { document: 'file://document', cache: 'file://cache' },
  File: jest.fn().mockImplementation(function(dir: any, filename: string) {
    const dirPath = typeof dir === 'string' ? dir : (dir?.uri || 'file://document');
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
    const basePath = typeof base === 'string' ? base : (base?.uri || 'file://document');
    return {
      uri: `${basePath}/${name}`,
      exists: true,
      create: jest.fn(),
    };
  }),
}));



  describe('Offline Data Creation', () => {
    it('should create 100+ items while offline', async () => {
      // Go offline
      setNetworkState(false);
      
      const metrics = startPerformanceTracking();
      
      // Create 50 family members
      const members = generateBulkFamilyMembers(50);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        const created = await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        });
        createdMembers.push(created);
      }
      
      // Create 100 prescriptions
      const prescriptionData = generatePrescriptionsForMembers(
        createdMembers.slice(0, 10),
        10,
        100
      );
      
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      const finalMetrics = stopPerformanceTracking(metrics, 150);
      
      // Verify all created
      const allMembers = await getFamilyMembers();
      const allPrescriptions = await getPrescriptions();
      
      expect(allMembers).toHaveLength(50);
      expect(allPrescriptions).toHaveLength(100);
      
      // Should still be performant offline
      console.log(`✓ Created 150 items offline in ${finalMetrics.duration}ms`);
    }, 120000);

    it('should handle rapid offline operations', async () => {
      setNetworkState(false);
      
      const member = await createFamilyMember({ name: 'Offline User', relationship: 'Self' });
      
      // Rapidly create prescriptions
      const prescriptionData = generateBulkPrescriptions(member.id, 50, 50);
      
      const createPromises = prescriptionData.map(rx => createPrescription(rx));
      await Promise.all(createPromises);
      
      const prescriptions = await getPrescriptions();
      expect(prescriptions).toHaveLength(50);
      
      console.log(`✓ Created 50 prescriptions rapidly while offline`);
    }, 60000);
  });

  describe('Offline to Online Transitions', () => {
    it('should maintain data integrity during offline → online transition', async () => {
      // Create data while offline
      setNetworkState(false);
      
      const offlineMembers = generateBulkFamilyMembers(20);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of offlineMembers) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      const prescriptionData = generatePrescriptionsForMembers(createdMembers.slice(0, 10), 5, 100);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Verify offline data
      const offlineCheckMembers = await getFamilyMembers();
      const offlineCheckPrescriptions = await getPrescriptions();
      expect(offlineCheckMembers).toHaveLength(20);
      expect(offlineCheckPrescriptions).toHaveLength(50);
      
      // Go online
      setNetworkState(true);
      
      // Verify data persists after going online
      const onlineMembers = await getFamilyMembers();
      const onlinePrescriptions = await getPrescriptions();
      
      expect(onlineMembers).toHaveLength(20);
      expect(onlinePrescriptions).toHaveLength(50);
      
      // Data should match
      expect(onlineMembers.map(m => m.id).sort())
        .toEqual(offlineCheckMembers.map(m => m.id).sort());
      
      console.log(`✓ Data integrity maintained during offline → online transition`);
    }, 60000);

    it('should handle multiple offline/online cycles', async () => {
      const cycles = 5;
      
      for (let i = 0; i < cycles; i++) {
        // Offline cycle
        setNetworkState(false);
        
        const member = await createFamilyMember({ 
          name: `Offline User ${i}`, 
          relationship: 'Self' 
        });
        
        const prescriptionData = generateBulkPrescriptions(member.id, 5, 50);
        for (const rx of prescriptionData) {
          await createPrescription(rx);
        }
        
        // Online cycle
        setNetworkState(true);
        
        // Verify data
        const members = await getFamilyMembers();
        const prescriptions = await getPrescriptions();
        
        expect(members.length).toBeGreaterThan(i);
        expect(prescriptions.length).toBeGreaterThan(i * 5);
      }
      
      const finalMembers = await getFamilyMembers();
      const finalPrescriptions = await getPrescriptions();
      
      expect(finalMembers).toHaveLength(cycles);
      expect(finalPrescriptions).toHaveLength(cycles * 5);
      
      console.log(`✓ Handled ${cycles} offline/online cycles successfully`);
    }, 60000);
  });

  describe('Data Persistence in Offline Mode', () => {
    it('should persist large datasets created offline', async () => {
      setNetworkState(false);
      
      // Create large dataset
      const members = generateBulkFamilyMembers(30);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 3, 200);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Simulate app restart (data persists in mock storage)
      const reloadedMembers = await getFamilyMembers();
      const reloadedPrescriptions = await getPrescriptions();
      
      expect(reloadedMembers).toHaveLength(30);
      expect(reloadedPrescriptions).toHaveLength(90);
      
      console.log(`✓ Persisted 90 prescriptions created offline`);
    }, 120000);

    it('should handle encryption/decryption offline', async () => {
      setNetworkState(false);
      
      // Create encrypted data offline
      const members = generateBulkFamilyMembers(10);
      
      for (const member of members) {
        await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        });
      }
      
      // Retrieve and decrypt
      const retrieved = await getFamilyMembers();
      expect(retrieved).toHaveLength(10);
      
      // Verify data integrity
      for (const member of retrieved) {
        expect(member.id).toBeDefined();
        expect(member.name).toBeDefined();
      }
      
      console.log(`✓ Encryption/decryption works offline`);
    });
  });

  describe('Offline Bulk Operations', () => {
    it('should handle bulk deletes while offline', async () => {
      // Create data online
      setNetworkState(true);
      
      const members = generateBulkFamilyMembers(20);
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
      
      // Go offline and delete
      setNetworkState(false);
      
      // Delete half the members
      for (const member of createdMembers.slice(0, 10)) {
        await deleteFamilyMember(member.id);
      }
      
      // Verify deletions
      const remaining = await getFamilyMembers();
      expect(remaining).toHaveLength(10);
      
      const remainingPrescriptions = await getPrescriptions();
      expect(remainingPrescriptions).toHaveLength(50);
      
      console.log(`✓ Bulk delete worked offline`);
    }, 120000);

    it('should handle mixed operations offline', async () => {
      setNetworkState(false);
      
      // Create some data
      const members = generateBulkFamilyMembers(10);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      // Add prescriptions to some
      const prescriptionData = generatePrescriptionsForMembers(
        createdMembers.slice(0, 5),
        10,
        50
      );
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Delete some members
      for (const member of createdMembers.slice(5, 8)) {
        await deleteFamilyMember(member.id);
      }
      
      // Verify final state
      const finalMembers = await getFamilyMembers();
      const finalPrescriptions = await getPrescriptions();
      
      expect(finalMembers).toHaveLength(7); // 10 - 3 deleted
      expect(finalPrescriptions).toHaveLength(50); // Only first 5 had prescriptions
      
      console.log(`✓ Mixed operations completed offline`);
    }, 60000);
  });

  describe('Offline Backup and Export', () => {
    it('should create encrypted backup while offline', async () => {
      setNetworkState(false);
      
      // Create data
      const members = generateBulkFamilyMembers(10);
      for (const member of members) {
        await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        });
      }
      
      const allMembers = await getFamilyMembers();
      const prescriptionData = generatePrescriptionsForMembers(allMembers.slice(0, 5), 10, 100);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Create backup offline
      await expect(exportEncryptedBackup()).resolves.not.toThrow();
      
      console.log(`✓ Created encrypted backup offline`);
    }, 60000);
  });

  describe('Offline Performance', () => {
    it('should maintain performance benchmarks offline', async () => {
      setNetworkState(false);
      
      // Create 100 prescriptions
      const member = await createFamilyMember({ name: 'Offline User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 100, 50);
      
      const metrics = startPerformanceTracking();
      
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      const finalMetrics = stopPerformanceTracking(metrics, 100);
      
      // Should complete in reasonable time even offline
      assertPerformance(finalMetrics, 30000, 'Creating 100 prescriptions offline');
      
      console.log(`✓ Created 100 prescriptions offline in ${finalMetrics.duration}ms`);
    }, 60000);

    it('should load data quickly while offline', async () => {
      setNetworkState(false);
      
      // Create test data
      const members = generateBulkFamilyMembers(20);
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
      
      // Measure load time
      const metrics = startPerformanceTracking();
      const members_loaded = await getFamilyMembers();
      const prescriptions_loaded = await getPrescriptions();
      const finalMetrics = stopPerformanceTracking(metrics);
      
      expect(members_loaded).toHaveLength(20);
      expect(prescriptions_loaded).toHaveLength(100);
      
      // Should load quickly
      assertPerformance(finalMetrics, 2000, 'Loading data offline');
      
      console.log(`✓ Loaded data offline in ${finalMetrics.duration}ms`);
    }, 120000);
  });

  describe('Offline Data Integrity', () => {
    it('should maintain referential integrity offline', async () => {
      setNetworkState(false);
      
      // Create data with relationships
      const members = generateBulkFamilyMembers(10);
      const createdMembers: FamilyMember[] = [];
      
      for (const member of members) {
        createdMembers.push(await createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        }));
      }
      
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 5, 50);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Verify all prescriptions reference valid members
      const allPrescriptions = await getPrescriptions();
      const memberIds = new Set(createdMembers.map(m => m.id));
      
      for (const rx of allPrescriptions) {
        expect(memberIds.has(rx.family_member_id)).toBe(true);
      }
      
      console.log(`✓ Referential integrity maintained offline`);
    }, 60000);

    it('should handle concurrent offline operations without corruption', async () => {
      setNetworkState(false);
      
      const members = generateBulkFamilyMembers(10);
      
      // Create members concurrently
      const createPromises = members.map(member =>
        createFamilyMember({
          name: member.name,
          relationship: member.relationship,
        })
      );
      
      const createdMembers = await Promise.all(createPromises);
      
      // Create prescriptions concurrently
      const prescriptionData = generatePrescriptionsForMembers(createdMembers, 5, 50);
      const rxPromises = prescriptionData.map(rx => createPrescription(rx));
      
      await Promise.all(rxPromises);
      
      // Verify data integrity
      const finalMembers = await getFamilyMembers();
      const finalPrescriptions = await getPrescriptions();
      
      expect(finalMembers).toHaveLength(10);
      expect(finalPrescriptions).toHaveLength(50);
      
      // No duplicate IDs
      const memberIds = new Set(finalMembers.map(m => m.id));
      const rxIds = new Set(finalPrescriptions.map(rx => rx.id));
      
      expect(memberIds.size).toBe(10);
      expect(rxIds.size).toBe(50);
      
      console.log(`✓ Concurrent offline operations completed without corruption`);
    }, 60000);
  });
});
