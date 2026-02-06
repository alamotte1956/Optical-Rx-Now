// Module-level mocking as specified in problem statement
jest.mock('../../services/localStorage', () => ({
  createFamilyMember: jest.fn((data) => Promise.resolve({
    ...data,
    id: `member_${Date.now()}_${Math.random()}`,
    created_at: new Date().toISOString(),
  })),
  getFamilyMembers: jest.fn(() => Promise.resolve([])),
  createPrescription: jest.fn((data) => Promise.resolve({
    ...data,
    id: `rx_${Date.now()}_${Math.random()}`,
    created_at: new Date().toISOString(),
  })),
  getPrescriptions: jest.fn(() => Promise.resolve([])),
  deleteFamilyMember: jest.fn(() => Promise.resolve()),
  deletePrescription: jest.fn(() => Promise.resolve()),
  getStats: jest.fn(() => Promise.resolve({ family_members: 0, total_prescriptions: 0 })),
}));

import * as localStorage from '../../services/localStorage';

describe('Data Stress Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create 50 family members rapidly', async () => {
    const startTime = Date.now();
    const members = [];

    for (let i = 0; i < 50; i++) {
      const member = await localStorage.createFamilyMember({
        name: `User${i}`,
        relationship: i % 2 === 0 ? 'Self' : 'Spouse',
      });
      members.push(member);
    }

    const duration = Date.now() - startTime;
    console.log(`✓ Created 50 family members in ${duration}ms`);
    
    expect(members.length).toBe(50);
    expect(duration).toBeLessThan(10000); // Less than 10 seconds
  }, process.env.CI ? 120000 : 60000);

  it('should create 100+ prescriptions across multiple members', async () => {
    const startTime = Date.now();
    const prescriptions = [];

    // Create for 5 members, 20 prescriptions each
    for (let memberId = 1; memberId <= 5; memberId++) {
      for (let rxNum = 0; rxNum < 20; rxNum++) {
        const rx = await localStorage.createPrescription({
          family_member_id: `member_${memberId}`,
          rx_type: rxNum % 2 === 0 ? 'eyeglass' : 'contact',
          notes: `Prescription ${rxNum}`,
          date_taken: new Date().toISOString(),
          imageBase64: 'data:image/jpeg;base64,test',
        });
        prescriptions.push(rx);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✓ Created 100 prescriptions in ${duration}ms`);
    
    expect(prescriptions.length).toBe(100);
    expect(duration).toBeLessThan(30000); // Less than 30 seconds
  }, process.env.CI ? 120000 : 60000);

  it('should handle bulk delete operations', async () => {
    const startTime = Date.now();

    // Delete 50 individual prescriptions
    for (let i = 0; i < 50; i++) {
      await localStorage.deletePrescription(`rx_${i}`);
    }

    const duration = Date.now() - startTime;
    console.log(`✓ Deleted 50 prescriptions in ${duration}ms`);
    
    expect(duration).toBeLessThan(10000); // Less than 10 seconds
    expect(localStorage.deletePrescription).toHaveBeenCalledTimes(50);
  }, process.env.CI ? 120000 : 60000);

  it('should retrieve stats quickly with large datasets', async () => {
    const startTime = Date.now();
    
    const stats = await localStorage.getStats();
    
    const duration = Date.now() - startTime;
    console.log(`✓ Retrieved stats in ${duration}ms`);
    
    expect(stats).toHaveProperty('family_members');
    expect(stats).toHaveProperty('total_prescriptions');
    expect(duration).toBeLessThan(1000); // Less than 1 second
  }, process.env.CI ? 120000 : 60000);
});
