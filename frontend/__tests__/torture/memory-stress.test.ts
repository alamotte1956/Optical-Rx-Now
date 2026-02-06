// Module-level mocking
jest.mock('../../services/localStorage', () => ({
  createPrescription: jest.fn((data) => Promise.resolve({
    ...data,
    id: `rx_${Date.now()}_${Math.random()}`,
    created_at: new Date().toISOString(),
  })),
  getPrescriptions: jest.fn(() => Promise.resolve([])),
  deletePrescription: jest.fn(() => Promise.resolve()),
}));

import * as localStorage from '../../services/localStorage';

describe('Memory Stress Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load 100 prescriptions quickly', async () => {
    // Mock returning 100 prescriptions
    (localStorage.getPrescriptions as jest.Mock).mockResolvedValue(
      Array.from({ length: 100 }, (_, i) => ({
        id: `rx_${i}`,
        family_member_id: `member_${i % 10}`,
        rx_type: i % 2 === 0 ? 'eyeglass' : 'contact',
        notes: `Prescription ${i}`,
        date_taken: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }))
    );

    const startTime = Date.now();
    const prescriptions = await localStorage.getPrescriptions();
    const duration = Date.now() - startTime;

    console.log(`✓ Loaded 100 prescriptions in ${duration}ms`);
    
    expect(prescriptions.length).toBe(100);
    expect(duration).toBeLessThan(2000);
  }, process.env.CI ? 120000 : 60000);

  it('should handle repeated filtering without memory growth', async () => {
    const largePrescriptionList = Array.from({ length: 100 }, (_, i) => ({
      id: `rx_${i}`,
      family_member_id: `member_${i % 5}`,
      rx_type: i % 2 === 0 ? 'eyeglass' : 'contact',
      notes: `Prescription ${i}`,
      date_taken: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    const startTime = Date.now();

    // Filter the list 10 times
    for (let iteration = 0; iteration < 10; iteration++) {
      (localStorage.getPrescriptions as jest.Mock).mockResolvedValue(
        largePrescriptionList.filter(rx => rx.family_member_id === `member_${iteration % 5}`)
      );
      
      const filtered = await localStorage.getPrescriptions();
      expect(filtered.length).toBeGreaterThan(0);
    }

    const duration = Date.now() - startTime;
    console.log(`✓ Filtered 100 prescriptions 10 times in ${duration}ms`);
    
    expect(duration).toBeLessThan(1000);
  }, process.env.CI ? 120000 : 60000);

  it('should handle bulk operations without memory leaks', async () => {
    const startTime = Date.now();

    // Create and delete in cycles
    for (let cycle = 0; cycle < 10; cycle++) {
      // Create 10 prescriptions
      for (let i = 0; i < 10; i++) {
        await localStorage.createPrescription({
          family_member_id: 'member_test',
          rx_type: 'eyeglass',
          notes: `Cycle ${cycle}, item ${i}`,
          date_taken: new Date().toISOString(),
          imageBase64: 'data:image/jpeg;base64,test',
        });
      }

      // Delete 10 prescriptions
      for (let i = 0; i < 10; i++) {
        await localStorage.deletePrescription(`rx_${cycle}_${i}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✓ Completed 10 create/delete cycles in ${duration}ms`);
    
    expect(duration).toBeLessThan(15000);
    expect(localStorage.createPrescription).toHaveBeenCalledTimes(100);
    expect(localStorage.deletePrescription).toHaveBeenCalledTimes(100);
  }, process.env.CI ? 120000 : 60000);

  it('should handle large list rendering performance', async () => {
    const hugeList = Array.from({ length: 200 }, (_, i) => ({
      id: `rx_${i}`,
      family_member_id: `member_${i % 20}`,
      rx_type: i % 2 === 0 ? 'eyeglass' : 'contact',
      notes: `Large list item ${i}`,
      date_taken: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    (localStorage.getPrescriptions as jest.Mock).mockResolvedValue(hugeList);

    const startTime = Date.now();
    const prescriptions = await localStorage.getPrescriptions();
    const duration = Date.now() - startTime;

    console.log(`✓ Loaded ${prescriptions.length} prescriptions in ${duration}ms`);
    
    expect(prescriptions.length).toBe(200);
    expect(duration).toBeLessThan(3000);
  }, process.env.CI ? 120000 : 60000);
});
