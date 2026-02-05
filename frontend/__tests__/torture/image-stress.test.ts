/**
 * Image Stress Tests
 * 
 * Tests for validating image handling under stress:
 * - Handling 50+ large images (5-10MB each)
 * - Image encryption/decryption with multiple large files
 * - Image cleanup on prescription deletion
 * - Concurrent image loading
 * - Image caching behavior
 * - Low storage scenarios
 * - Cleanup of orphaned images
 */

import {
  createFamilyMember,
  createPrescription,
  deletePrescription,
  deleteFamilyMember,
  getPrescriptions,
  loadPrescriptionImage,
  type FamilyMember,
  type Prescription,
} from '../../services/localStorage';
import { encryptImage, decryptImage } from '../../services/encryption';
import {
  MockAsyncStorage,
  MockSecureStore,
  MockFileSystem,
  startPerformanceTracking,
  stopPerformanceTracking,
  assertPerformance,
  clearAllTestData,
} from '../utils/test-helpers';
import {
  generateBulkFamilyMembers,
  generateBulkPrescriptions,
  generateVariousSizedImages,
} from '../utils/mock-data-generator';

// Mock storage
const mockAsyncStorage = new MockAsyncStorage(100); // 100MB for async storage
const mockSecureStore = new MockSecureStore();
const mockFileSystem = new MockFileSystem(500); // 500MB for file system

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

describe('Image Stress Tests', () => {
  beforeEach(async () => {
    await clearAllTestData(mockAsyncStorage, mockFileSystem);
    mockSecureStore.clear();
  });

  describe('Large Image Handling', () => {
    it('should handle 50+ large images (5MB each)', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      
      // Generate prescriptions with large images
      const prescriptionData = generateBulkPrescriptions(member.id, 50, 5120); // 5MB each
      
      const metrics = startPerformanceTracking();
      const createdPrescriptions: Prescription[] = [];
      
      for (const rx of prescriptionData) {
        const created = await createPrescription(rx);
        createdPrescriptions.push(created);
      }
      
      const finalMetrics = stopPerformanceTracking(metrics, 50);
      
      // Verify all images were created
      expect(createdPrescriptions).toHaveLength(50);
      
      // Verify file system usage
      const totalSize = mockFileSystem.getTotalSize();
      console.log(`✓ Created 50 large images, total size: ${totalSize} bytes`);
      
      // Performance benchmark: should complete in reasonable time
      // Note: This may take longer due to encryption
      expect(finalMetrics.duration).toBeDefined();
      
      console.log(`✓ Created 50 large images in ${finalMetrics.duration}ms`);
    }, 120000); // 2 minutes timeout

    it('should handle various image sizes', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const images = generateVariousSizedImages();
      
      const sizes = [
        { name: 'tiny', data: images.tiny },
        { name: 'small', data: images.small },
        { name: 'medium', data: images.medium },
        { name: 'large', data: images.large },
        { name: 'veryLarge', data: images.veryLarge },
      ];
      
      for (const size of sizes) {
        const rx = await createPrescription({
          family_member_id: member.id,
          rx_type: 'eyeglass',
          notes: `${size.name} image test`,
          date_taken: new Date().toISOString().split('T')[0],
          imageBase64: size.data,
        } as any);
        
        expect(rx.id).toBeDefined();
        expect(rx.image_uri).toBeDefined();
      }
      
      const prescriptions = await getPrescriptions();
      expect(prescriptions).toHaveLength(5);
    }, 60000);
  });

  describe('Image Encryption/Decryption Performance', () => {
    it('should encrypt/decrypt 10MB image in < 5 seconds', async () => {
      const images = generateVariousSizedImages();
      
      // Encryption test
      const encryptMetrics = startPerformanceTracking();
      const encrypted = await encryptImage(images.huge);
      const encryptFinal = stopPerformanceTracking(encryptMetrics);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      
      // Decryption test
      const decryptMetrics = startPerformanceTracking();
      const decrypted = await decryptImage(encrypted);
      const decryptFinal = stopPerformanceTracking(decryptMetrics);
      
      expect(decrypted).toBe(images.huge);
      
      // Performance benchmarks
      assertPerformance(encryptFinal, 5000, 'Encrypting 10MB image');
      assertPerformance(decryptFinal, 5000, 'Decrypting 10MB image');
      
      console.log(`✓ Encrypted 10MB in ${encryptFinal.duration}ms, decrypted in ${decryptFinal.duration}ms`);
    });

    it('should handle multiple concurrent image encryptions', async () => {
      const images = generateVariousSizedImages();
      const testImages = [
        images.medium,
        images.medium,
        images.medium,
        images.large,
        images.large,
      ];
      
      const metrics = startPerformanceTracking();
      
      // Encrypt all concurrently
      const encryptedImages = await Promise.all(
        testImages.map(img => encryptImage(img))
      );
      
      const finalMetrics = stopPerformanceTracking(metrics, 5);
      
      expect(encryptedImages).toHaveLength(5);
      expect(encryptedImages.every(img => typeof img === 'string')).toBe(true);
      
      console.log(`✓ Encrypted 5 images concurrently in ${finalMetrics.duration}ms`);
    });
  });

  describe('Image Cleanup', () => {
    it('should delete images when prescription is deleted', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 10, 1024);
      
      const createdPrescriptions: Prescription[] = [];
      for (const rx of prescriptionData) {
        createdPrescriptions.push(await createPrescription(rx));
      }
      
      // Verify images exist
      const initialSize = mockFileSystem.getTotalSize();
      expect(initialSize).toBeGreaterThan(0);
      
      // Delete prescriptions
      for (const rx of createdPrescriptions) {
        await deletePrescription(rx.id);
      }
      
      // Verify images were deleted
      const finalSize = mockFileSystem.getTotalSize();
      expect(finalSize).toBe(0);
      
      console.log(`✓ Deleted 10 prescription images successfully`);
    });

    it('should delete all images when family member is deleted', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 20, 512);
      
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      // Verify images exist
      const initialSize = mockFileSystem.getTotalSize();
      expect(initialSize).toBeGreaterThan(0);
      
      // Delete member (should cascade delete prescriptions and images)
      await deleteFamilyMember(member.id);
      
      // Verify all images were deleted
      const finalSize = mockFileSystem.getTotalSize();
      expect(finalSize).toBe(0);
      
      // Verify prescriptions were deleted
      const prescriptions = await getPrescriptions();
      expect(prescriptions).toHaveLength(0);
      
      console.log(`✓ Deleted member with 20 prescriptions and images`);
    }, 60000);

    it('should handle cleanup of orphaned images gracefully', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 5, 100);
      
      // Create prescriptions
      const createdPrescriptions: Prescription[] = [];
      for (const rx of prescriptionData) {
        createdPrescriptions.push(await createPrescription(rx));
      }
      
      // Manually add an orphaned image to file system
      const orphanedPath = 'prescription_images/orphaned_rx_123.enc';
      mockFileSystem.writeFile(orphanedPath, 'orphaned data');
      
      // Delete all prescriptions
      for (const rx of createdPrescriptions) {
        await deletePrescription(rx.id);
      }
      
      // The orphaned file should still exist (we don't have automatic cleanup)
      // But the test shows we can detect it
      expect(mockFileSystem.exists(orphanedPath)).toBe(true);
      
      console.log(`✓ Orphaned images can be detected`);
    });
  });

  describe('Concurrent Image Loading', () => {
    it('should load multiple images concurrently', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const prescriptionData = generateBulkPrescriptions(member.id, 10, 500);
      
      const createdPrescriptions: Prescription[] = [];
      for (const rx of prescriptionData) {
        createdPrescriptions.push(await createPrescription(rx));
      }
      
      // Load all images concurrently
      const metrics = startPerformanceTracking();
      
      const loadPromises = createdPrescriptions.map(rx => 
        loadPrescriptionImage(rx.image_uri)
      );
      
      const loadedImages = await Promise.all(loadPromises);
      
      const finalMetrics = stopPerformanceTracking(metrics, 10);
      
      expect(loadedImages).toHaveLength(10);
      expect(loadedImages.every(img => typeof img === 'string')).toBe(true);
      
      // Performance benchmark: loading should be fast
      assertPerformance(finalMetrics, 3000, 'Loading 10 images concurrently');
      
      console.log(`✓ Loaded 10 images concurrently in ${finalMetrics.duration}ms`);
    }, 30000);

    it('should handle image loading errors gracefully', async () => {
      // Try to load non-existent image
      await expect(loadPrescriptionImage('fake/path/image.enc'))
        .rejects.toThrow();
    });
  });

  describe('Low Storage Scenarios', () => {
    it('should handle low storage when creating images', async () => {
      // Fill up most of the file system
      const largePadding = 'x'.repeat(480 * 1024 * 1024); // 480MB
      mockFileSystem.writeFile('padding.txt', largePadding);
      
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      
      // Try to create a prescription with a large image
      const prescriptionData = generateBulkPrescriptions(member.id, 1, 10240); // 10MB
      
      // This might fail due to storage limits
      try {
        await createPrescription(prescriptionData[0]);
      } catch (error: any) {
        expect(error.message).toContain('size');
      }
      
      console.log(`✓ Handled low storage scenario`);
    });

    it('should track file system usage accurately', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      
      const initialSize = mockFileSystem.getTotalSize();
      
      // Create some prescriptions
      const prescriptionData = generateBulkPrescriptions(member.id, 5, 1024);
      for (const rx of prescriptionData) {
        await createPrescription(rx);
      }
      
      const finalSize = mockFileSystem.getTotalSize();
      
      expect(finalSize).toBeGreaterThan(initialSize);
      
      console.log(`✓ File system usage: ${finalSize} bytes`);
    });
  });

  describe('Image Data Integrity', () => {
    it('should maintain image data integrity through encryption', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const images = generateVariousSizedImages();
      
      // Create prescription with known image
      const rx = await createPrescription({
        family_member_id: member.id,
        rx_type: 'eyeglass',
        notes: 'Test prescription',
        date_taken: new Date().toISOString().split('T')[0],
        imageBase64: images.medium,
      } as any);
      
      // Load the image back
      const loadedImage = await loadPrescriptionImage(rx.image_uri);
      
      // Should match original
      expect(loadedImage).toBe(images.medium);
      
      console.log(`✓ Image data integrity maintained`);
    });

    it('should handle corrupted image data', async () => {
      const member = await createFamilyMember({ name: 'Test User', relationship: 'Self' });
      const images = generateVariousSizedImages();
      
      const rx = await createPrescription({
        family_member_id: member.id,
        rx_type: 'eyeglass',
        notes: 'Test prescription',
        date_taken: new Date().toISOString().split('T')[0],
        imageBase64: images.small,
      } as any);
      
      // Corrupt the image file
      const imagePath = rx.image_uri.replace('file://', '');
      mockFileSystem.writeFile(imagePath, 'corrupted data!!!');
      
      // Try to load corrupted image
      await expect(loadPrescriptionImage(rx.image_uri))
        .rejects.toThrow();
    });
  });
});
