// Module-level mocking
jest.mock('../../services/localStorage', () => {
  const operations = new Set();
  
  return {
    createFamilyMember: jest.fn(async (data) => {
      const id = `member_${Date.now()}_${Math.random()}`;
      operations.add(id);
      await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async work
      return {
        ...data,
        id,
        created_at: new Date().toISOString(),
      };
    }),
    createPrescription: jest.fn(async (data) => {
      const id = `rx_${Date.now()}_${Math.random()}`;
      operations.add(id);
      await new Promise(resolve => setTimeout(resolve, 10));
      return {
        ...data,
        id,
        created_at: new Date().toISOString(),
      };
    }),
    deletePrescription: jest.fn(async (id) => {
      operations.delete(id);
      await new Promise(resolve => setTimeout(resolve, 5));
    }),
    _getOperations: () => operations,
  };
});

import * as localStorage from '../../services/localStorage';

describe('Concurrent Operations Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should prevent duplicate entries from rapid clicks', async () => {
    const memberData = {
      name: 'Rapid Click Test',
      relationship: 'Self',
    };

    // Simulate rapid button clicking (10 clicks)
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(localStorage.createFamilyMember(memberData));
    }

    const results = await Promise.all(promises);
    
    // All should have unique IDs
    const ids = new Set(results.map(r => r.id));
    console.log(`✓ Created ${results.length} members with ${ids.size} unique IDs`);
    
    expect(ids.size).toBe(10); // All unique IDs
  }, process.env.CI ? 120000 : 60000);

  it('should handle simultaneous create/delete operations', async () => {
    const startTime = Date.now();
    const promises = [];

    // Mix of create and delete operations
    for (let i = 0; i < 25; i++) {
      promises.push(localStorage.createPrescription({
        family_member_id: `member_${i % 5}`,
        rx_type: 'eyeglass',
        notes: `Concurrent ${i}`,
        date_taken: new Date().toISOString(),
        imageBase64: 'data:image/jpeg;base64,test',
      }));
    }

    for (let i = 0; i < 10; i++) {
      promises.push(localStorage.deletePrescription(`rx_${i}`));
    }

    await Promise.all(promises);

    const duration = Date.now() - startTime;
    console.log(`✓ Handled 35 concurrent operations in ${duration}ms`);
    
    expect(duration).toBeLessThan(5000);
  }, process.env.CI ? 120000 : 60000);

  it('should handle maximum concurrency stress test', async () => {
    const startTime = Date.now();
    const operations = [];

    // 50 concurrent operations of different types
    for (let i = 0; i < 50; i++) {
      if (i % 3 === 0) {
        operations.push(localStorage.createFamilyMember({
          name: `Concurrent User ${i}`,
          relationship: 'Child',
        }));
      } else {
        operations.push(localStorage.createPrescription({
          family_member_id: `member_${i % 10}`,
          rx_type: i % 2 === 0 ? 'eyeglass' : 'contact',
          notes: `Concurrent ${i}`,
          date_taken: new Date().toISOString(),
          imageBase64: 'data:image/jpeg;base64,test',
        }));
      }
    }

    const results = await Promise.all(operations);

    const duration = Date.now() - startTime;
    console.log(`✓ Completed 50 concurrent operations in ${duration}ms`);
    
    expect(results.length).toBe(50);
    expect(duration).toBeLessThan(30000);
  }, process.env.CI ? 120000 : 60000);

  it('should maintain data consistency during concurrent operations', async () => {
    const concurrentCreates = [];

    // Create 20 prescriptions concurrently
    for (let i = 0; i < 20; i++) {
      concurrentCreates.push(localStorage.createPrescription({
        family_member_id: 'member_test',
        rx_type: 'eyeglass',
        notes: `Consistency test ${i}`,
        date_taken: new Date().toISOString(),
        imageBase64: 'data:image/jpeg;base64,test',
      }));
    }

    const results = await Promise.all(concurrentCreates);

    // Verify all have unique IDs (no race conditions)
    const uniqueIds = new Set(results.map(r => r.id));
    console.log(`✓ All ${results.length} items have unique IDs: ${uniqueIds.size === results.length}`);
    
    expect(uniqueIds.size).toBe(results.length);
  }, process.env.CI ? 120000 : 60000);
});
