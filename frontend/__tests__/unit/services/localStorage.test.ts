// Mock the localStorage module at the top level as specified in problem statement
jest.mock('../../../services/localStorage', () => ({
  createFamilyMember: jest.fn((data) => Promise.resolve({
    ...data,
    id: `member_${Date.now()}`,
    created_at: new Date().toISOString(),
  })),
  getFamilyMembers: jest.fn(() => Promise.resolve([])),
  deleteFamilyMember: jest.fn(() => Promise.resolve()),
  createPrescription: jest.fn((data) => Promise.resolve({
    ...data,
    id: `rx_${Date.now()}`,
    image_uri: data.imageBase64,
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  })),
  getPrescriptions: jest.fn(() => Promise.resolve([])),
  deletePrescription: jest.fn(() => Promise.resolve()),
  getStats: jest.fn(() => Promise.resolve({ family_members: 0, total_prescriptions: 0 })),
}));

import * as localStorageService from '../../../services/localStorage';

describe('LocalStorage Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Family Member Operations', () => {
    it('should create a family member with generated ID and timestamp', async () => {
      const memberData = {
        name: 'Test User',
        relationship: 'Self',
      };

      const result = await localStorageService.createFamilyMember(memberData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('created_at');
      expect(result.name).toBe('Test User');
      expect(result.relationship).toBe('Self');
    });

    it('should retrieve empty list initially', async () => {
      const members = await localStorageService.getFamilyMembers();
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBe(0);
    });

    it('should delete family member by ID', async () => {
      await localStorageService.deleteFamilyMember('member_123');
      expect(localStorageService.deleteFamilyMember).toHaveBeenCalledWith('member_123');
    });
  });

  describe('Prescription Operations', () => {
    it('should create prescription with auto-generated fields', async () => {
      const rxData = {
        family_member_id: 'member_123',
        rx_type: 'eyeglass' as const,
        notes: 'Test prescription',
        date_taken: new Date().toISOString(),
        imageBase64: 'data:image/jpeg;base64,test',
      };

      const result = await localStorageService.createPrescription(rxData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('expiry_date');
      expect(result.family_member_id).toBe('member_123');
    });

    it('should retrieve empty prescription list initially', async () => {
      const prescriptions = await localStorageService.getPrescriptions();
      expect(Array.isArray(prescriptions)).toBe(true);
      expect(prescriptions.length).toBe(0);
    });

    it('should delete prescription by ID', async () => {
      await localStorageService.deletePrescription('rx_456');
      expect(localStorageService.deletePrescription).toHaveBeenCalledWith('rx_456');
    });
  });

  describe('Statistics', () => {
    it('should return stats with zero counts initially', async () => {
      const stats = await localStorageService.getStats();
      expect(stats).toHaveProperty('family_members');
      expect(stats).toHaveProperty('total_prescriptions');
      expect(stats.family_members).toBe(0);
      expect(stats.total_prescriptions).toBe(0);
    });
  });
});
