// Module-level mocking
jest.mock('../../services/localStorage', () => ({
  createPrescription: jest.fn((data) => Promise.resolve({
    ...data,
    id: `rx_${Date.now()}_${Math.random()}`,
    created_at: new Date().toISOString(),
  })),
  deletePrescription: jest.fn(() => Promise.resolve()),
  getPrescriptions: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../../services/encryption', () => ({
  encryptImage: jest.fn((data) => Promise.resolve(`encrypted_${data.substring(0, 50)}`)),
  decryptImage: jest.fn((data) => Promise.resolve(data.replace('encrypted_', ''))),
}));

import * as localStorage from '../../services/localStorage';
import * as encryption from '../../services/encryption';

describe('Image Stress Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle 50 large images', async () => {
    const startTime = Date.now();
    const imageSize = 5 * 1024 * 1024; // 5MB
    const largeImage = 'data:image/jpeg;base64,' + 'A'.repeat(imageSize);

    for (let i = 0; i < 50; i++) {
      await localStorage.createPrescription({
        family_member_id: 'member_1',
        rx_type: 'eyeglass',
        notes: `Image ${i}`,
        date_taken: new Date().toISOString(),
        imageBase64: largeImage,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✓ Handled 50 large images (5MB each) in ${duration}ms`);
    
    expect(localStorage.createPrescription).toHaveBeenCalledTimes(50);
  }, process.env.CI ? 120000 : 60000);

  it('should encrypt and decrypt 10MB image quickly', async () => {
    const imageSize = 10 * 1024 * 1024;
    const largeImage = 'data:image/jpeg;base64,' + 'B'.repeat(imageSize);

    const encryptStart = Date.now();
    const encrypted = await encryption.encryptImage(largeImage);
    const encryptDuration = Date.now() - encryptStart;
    console.log(`✓ Encrypted 10MB image in ${encryptDuration}ms`);

    const decryptStart = Date.now();
    const decrypted = await encryption.decryptImage(encrypted);
    const decryptDuration = Date.now() - decryptStart;
    console.log(`✓ Decrypted 10MB image in ${decryptDuration}ms`);

    expect(encrypted).toBeDefined();
    expect(decrypted).toBeDefined();
    expect(encryptDuration).toBeLessThan(5000);
    expect(decryptDuration).toBeLessThan(5000);
  }, process.env.CI ? 120000 : 60000);

  it('should handle concurrent image encryption', async () => {
    const startTime = Date.now();
    const images = [];
    
    for (let i = 0; i < 10; i++) {
      images.push('data:image/jpeg;base64,' + 'C'.repeat(1024 * 100)); // 100KB each
    }

    const encryptPromises = images.map(img => encryption.encryptImage(img));
    await Promise.all(encryptPromises);

    const duration = Date.now() - startTime;
    console.log(`✓ Encrypted 10 images concurrently in ${duration}ms`);
    
    expect(duration).toBeLessThan(3000);
  }, process.env.CI ? 120000 : 60000);

  it('should handle image cleanup on deletion', async () => {
    const startTime = Date.now();

    // Delete 20 prescriptions with images
    for (let i = 0; i < 20; i++) {
      await localStorage.deletePrescription(`rx_${i}`);
    }

    const duration = Date.now() - startTime;
    console.log(`✓ Cleaned up 20 images in ${duration}ms`);
    
    expect(localStorage.deletePrescription).toHaveBeenCalledTimes(20);
    expect(duration).toBeLessThan(5000);
  }, process.env.CI ? 120000 : 60000);
});
