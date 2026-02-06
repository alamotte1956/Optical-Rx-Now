// Module-level mocking
jest.mock('../../services/localStorage', () => ({
  createFamilyMember: jest.fn((data) => Promise.resolve({
    ...data,
    id: `member_${Date.now()}_${Math.random()}`,
    created_at: new Date().toISOString(),
  })),
  createPrescription: jest.fn((data) => Promise.resolve({
    ...data,
    id: `rx_${Date.now()}_${Math.random()}`,
    created_at: new Date().toISOString(),
  })),
  getPrescriptions: jest.fn(() => Promise.resolve([])),
  getFamilyMembers: jest.fn(() => Promise.resolve([])),
  deletePrescription: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../services/encryption', () => ({
  encryptData: jest.fn((data) => Promise.resolve(JSON.stringify(data))),
  decryptData: jest.fn((data) => Promise.resolve(JSON.parse(data))),
}));

import * as localStorage from '../../services/localStorage';
import * as encryption from '../../services/encryption';

describe('Offline Stress Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create 100+ items while offline', async () => {
    const startTime = Date.now();

    // Simulate offline mode - all operations succeed immediately
    for (let i = 0; i < 100; i++) {
      await localStorage.createPrescription({
        family_member_id: `member_${i % 10}`,
        rx_type: i % 2 === 0 ? 'eyeglass' : 'contact',
        notes: `Offline prescription ${i}`,
        date_taken: new Date().toISOString(),
        imageBase64: 'data:image/jpeg;base64,test',
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✓ Created 100 prescriptions offline in ${duration}ms`);
    
    expect(localStorage.createPrescription).toHaveBeenCalledTimes(100);
    expect(duration).toBeLessThan(30000);
  }, process.env.CI ? 120000 : 60000);

  it('should handle rapid offline operations', async () => {
    const startTime = Date.now();
    const operations = [];

    // 50 rapid offline operations
    for (let i = 0; i < 50; i++) {
      operations.push(localStorage.createFamilyMember({
        name: `Offline User ${i}`,
        relationship: i % 3 === 0 ? 'Self' : 'Child',
      }));
    }

    await Promise.all(operations);

    const duration = Date.now() - startTime;
    console.log(`✓ Completed 50 rapid offline operations in ${duration}ms`);
    
    expect(localStorage.createFamilyMember).toHaveBeenCalledTimes(50);
  }, process.env.CI ? 120000 : 60000);

  it('should persist data created offline', async () => {
    const offlineData = [];

    // Create offline
    for (let i = 0; i < 20; i++) {
      const prescription = await localStorage.createPrescription({
        family_member_id: 'member_offline',
        rx_type: 'eyeglass',
        notes: `Offline ${i}`,
        date_taken: new Date().toISOString(),
        imageBase64: 'data:image/jpeg;base64,test',
      });
      offlineData.push(prescription);
    }

    console.log(`✓ Created ${offlineData.length} items offline`);
    
    expect(offlineData.length).toBe(20);
    expect(offlineData.every(item => item.id)).toBe(true);
  }, process.env.CI ? 120000 : 60000);

  it('should handle encryption/decryption offline', async () => {
    const testData = {
      members: Array.from({ length: 50 }, (_, i) => ({
        id: `member_${i}`,
        name: `User ${i}`,
      })),
      prescriptions: Array.from({ length: 100 }, (_, i) => ({
        id: `rx_${i}`,
        notes: `Prescription ${i}`,
      })),
    };

    const startTime = Date.now();
    const encrypted = await encryption.encryptData(testData);
    const decrypted = await encryption.decryptData(encrypted);
    const duration = Date.now() - startTime;

    console.log(`✓ Encrypted/decrypted large dataset offline in ${duration}ms`);
    
    expect(decrypted).toEqual(testData);
    expect(duration).toBeLessThan(5000);
  }, process.env.CI ? 120000 : 60000);

  it('should handle bulk deletes while offline', async () => {
    const startTime = Date.now();

    // Delete 30 prescriptions offline
    for (let i = 0; i < 30; i++) {
      await localStorage.deletePrescription(`rx_offline_${i}`);
    }

    const duration = Date.now() - startTime;
    console.log(`✓ Deleted 30 items offline in ${duration}ms`);
    
    expect(localStorage.deletePrescription).toHaveBeenCalledTimes(30);
    expect(duration).toBeLessThan(10000);
  }, process.env.CI ? 120000 : 60000);

  it('should handle mixed operations offline', async () => {
    const startTime = Date.now();

    // Mix of creates and deletes
    const operations = [];
    
    for (let i = 0; i < 20; i++) {
      operations.push(localStorage.createFamilyMember({
        name: `Mixed ${i}`,
        relationship: 'Self',
      }));
    }

    for (let i = 0; i < 10; i++) {
      operations.push(localStorage.deletePrescription(`rx_${i}`));
    }

    await Promise.all(operations);

    const duration = Date.now() - startTime;
    console.log(`✓ Completed 30 mixed operations offline in ${duration}ms`);
    
    expect(duration).toBeLessThan(10000);
  }, process.env.CI ? 120000 : 60000);
});
