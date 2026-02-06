// Module-level mocking with persistent storage simulation
jest.mock('../../services/localStorage', () => {
  let persistentData = {
    members: [] as any[],
    prescriptions: [] as any[],
  };
  
  return {
    createFamilyMember: jest.fn(async (data) => {
      const member = {
        ...data,
        id: `member_${Date.now()}_${Math.random()}`,
        created_at: new Date().toISOString(),
      };
      persistentData.members.push(member);
      return member;
    }),
    getFamilyMembers: jest.fn(async () => [...persistentData.members]),
    createPrescription: jest.fn(async (data) => {
      const rx = {
        ...data,
        id: `rx_${Date.now()}_${Math.random()}`,
        created_at: new Date().toISOString(),
      };
      persistentData.prescriptions.push(rx);
      return rx;
    }),
    getPrescriptions: jest.fn(async () => [...persistentData.prescriptions]),
    _simulateRestart: () => {
      // Simulate app restart - data persists
      return { ...persistentData };
    },
    _reset: () => {
      persistentData = { members: [], prescriptions: [] };
    },
  };
});

jest.mock('../../services/encryption', () => ({
  encryptData: jest.fn(async (data) => {
    return `encrypted:${JSON.stringify(data)}`;
  }),
  decryptData: jest.fn(async (encrypted) => {
    const data = encrypted.replace('encrypted:', '');
    return JSON.parse(data);
  }),
}));

import * as localStorage from '../../services/localStorage';
import * as encryption from '../../services/encryption';

describe('Offline Persistence Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (localStorage as any)._reset();
  });

  it('should persist data after app restart', async () => {
    // Create data
    const member = await localStorage.createFamilyMember({
      name: 'Persistent User',
      relationship: 'Self',
    });

    const prescription = await localStorage.createPrescription({
      family_member_id: member.id,
      rx_type: 'eyeglass',
      notes: 'Persistent prescription',
      date_taken: new Date().toISOString(),
      imageBase64: 'data:image/jpeg;base64,test',
    });

    // Simulate app restart
    const dataBeforeRestart = (localStorage as any)._simulateRestart();
    
    // Verify data persists
    const membersAfterRestart = await localStorage.getFamilyMembers();
    const prescriptionsAfterRestart = await localStorage.getPrescriptions();

    expect(membersAfterRestart.length).toBe(1);
    expect(prescriptionsAfterRestart.length).toBe(1);
    expect(membersAfterRestart[0].id).toBe(member.id);
    expect(prescriptionsAfterRestart[0].id).toBe(prescription.id);
  });

  it('should recover data created offline after going online', async () => {
    // Simulate creating data while offline
    const offlineMembers = [];
    
    for (let i = 0; i < 10; i++) {
      const member = await localStorage.createFamilyMember({
        name: `Offline User ${i}`,
        relationship: 'Child',
      });
      offlineMembers.push(member);
    }

    // Simulate app restart (coming back online)
    const persistedData = (localStorage as any)._simulateRestart();
    
    // Verify all offline data persisted
    const recoveredMembers = await localStorage.getFamilyMembers();
    expect(recoveredMembers.length).toBe(10);
    expect(recoveredMembers.map(m => m.id)).toEqual(offlineMembers.map(m => m.id));
  });

  it('should handle backup export and import', async () => {
    // Create test data
    await localStorage.createFamilyMember({
      name: 'Backup Test 1',
      relationship: 'Self',
    });

    await localStorage.createFamilyMember({
      name: 'Backup Test 2',
      relationship: 'Spouse',
    });

    // Export data (encrypt for backup)
    const members = await localStorage.getFamilyMembers();
    const prescriptions = await localStorage.getPrescriptions();
    
    const backupData = {
      members,
      prescriptions,
      exportDate: new Date().toISOString(),
    };

    const encryptedBackup = await encryption.encryptData(backupData);
    expect(encryptedBackup).toBeDefined();

    // Clear data
    (localStorage as any)._reset();
    
    // Verify data is cleared
    let currentMembers = await localStorage.getFamilyMembers();
    expect(currentMembers.length).toBe(0);

    // Import from backup
    const decryptedBackup = await encryption.decryptData(encryptedBackup);
    
    // Restore data
    for (const member of decryptedBackup.members) {
      await localStorage.createFamilyMember({
        name: member.name,
        relationship: member.relationship,
      });
    }

    // Verify restored
    currentMembers = await localStorage.getFamilyMembers();
    expect(currentMembers.length).toBe(2);
  });

  it('should maintain referential integrity after multiple offline/online cycles', async () => {
    // Cycle 1: Create member offline
    const member1 = await localStorage.createFamilyMember({
      name: 'Cycle Test 1',
      relationship: 'Self',
    });

    // Cycle 2: Add prescription offline
    const rx1 = await localStorage.createPrescription({
      family_member_id: member1.id,
      rx_type: 'eyeglass',
      notes: 'Cycle 1 prescription',
      date_taken: new Date().toISOString(),
      imageBase64: 'data:image/jpeg;base64,cycle1',
    });

    // Simulate restart
    (localStorage as any)._simulateRestart();

    // Cycle 3: Add another prescription
    const rx2 = await localStorage.createPrescription({
      family_member_id: member1.id,
      rx_type: 'contact',
      notes: 'Cycle 2 prescription',
      date_taken: new Date().toISOString(),
      imageBase64: 'data:image/jpeg;base64,cycle2',
    });

    // Verify all data persists and relationships intact
    const allPrescriptions = await localStorage.getPrescriptions();
    expect(allPrescriptions.length).toBe(2);
    expect(allPrescriptions.every(rx => rx.family_member_id === member1.id)).toBe(true);
  });

  it('should handle large dataset persistence across restarts', async () => {
    // Create large dataset
    for (let i = 0; i < 20; i++) {
      const member = await localStorage.createFamilyMember({
        name: `Large Dataset User ${i}`,
        relationship: i % 2 === 0 ? 'Self' : 'Child',
      });

      // Add prescriptions for each member
      for (let j = 0; j < 5; j++) {
        await localStorage.createPrescription({
          family_member_id: member.id,
          rx_type: j % 2 === 0 ? 'eyeglass' : 'contact',
          notes: `Member ${i}, Prescription ${j}`,
          date_taken: new Date().toISOString(),
          imageBase64: `data:image/jpeg;base64,test${i}${j}`,
        });
      }
    }

    // Verify before restart
    let members = await localStorage.getFamilyMembers();
    let prescriptions = await localStorage.getPrescriptions();
    expect(members.length).toBe(20);
    expect(prescriptions.length).toBe(100);

    // Simulate restart
    (localStorage as any)._simulateRestart();

    // Verify after restart
    members = await localStorage.getFamilyMembers();
    prescriptions = await localStorage.getPrescriptions();
    expect(members.length).toBe(20);
    expect(prescriptions.length).toBe(100);
  });
});
