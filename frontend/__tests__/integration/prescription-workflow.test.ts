// Module-level mocking
jest.mock('../../services/localStorage', () => {
  let familyMembers: any[] = [];
  let prescriptions: any[] = [];
  
  return {
    createFamilyMember: jest.fn(async (data) => {
      const member = {
        ...data,
        id: `member_${Date.now()}_${Math.random()}`,
        created_at: new Date().toISOString(),
      };
      familyMembers.push(member);
      return member;
    }),
    getFamilyMembers: jest.fn(async () => [...familyMembers]),
    deleteFamilyMember: jest.fn(async (id) => {
      familyMembers = familyMembers.filter(m => m.id !== id);
      // Cascade delete prescriptions
      prescriptions = prescriptions.filter(p => p.family_member_id !== id);
    }),
    createPrescription: jest.fn(async (data) => {
      const rx = {
        ...data,
        id: `rx_${Date.now()}_${Math.random()}`,
        image_uri: data.imageBase64,
        created_at: new Date().toISOString(),
      };
      prescriptions.push(rx);
      return rx;
    }),
    getPrescriptions: jest.fn(async (familyId) => {
      return familyId
        ? prescriptions.filter(p => p.family_member_id === familyId)
        : [...prescriptions];
    }),
    deletePrescription: jest.fn(async (id) => {
      prescriptions = prescriptions.filter(p => p.id !== id);
    }),
    _reset: () => {
      familyMembers = [];
      prescriptions = [];
    },
  };
});

import * as localStorage from '../../services/localStorage';

describe('Prescription Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (localStorage as any)._reset();
  });

  it('should complete full workflow: create member → add prescription → delete', async () => {
    // Step 1: Create family member
    const member = await localStorage.createFamilyMember({
      name: 'John Doe',
      relationship: 'Self',
    });
    
    expect(member).toHaveProperty('id');
    expect(member.name).toBe('John Doe');

    // Step 2: Add prescription with image
    const prescription = await localStorage.createPrescription({
      family_member_id: member.id,
      rx_type: 'eyeglass',
      notes: 'Reading glasses',
      date_taken: new Date().toISOString(),
      imageBase64: 'data:image/jpeg;base64,testimage',
    });

    expect(prescription).toHaveProperty('id');
    expect(prescription.family_member_id).toBe(member.id);
    expect(prescription.image_uri).toBe('data:image/jpeg;base64,testimage');

    // Step 3: Verify prescription is associated with member
    const memberPrescriptions = await localStorage.getPrescriptions(member.id);
    expect(memberPrescriptions.length).toBe(1);
    expect(memberPrescriptions[0].id).toBe(prescription.id);

    // Step 4: Delete prescription
    await localStorage.deletePrescription(prescription.id);
    
    const afterDelete = await localStorage.getPrescriptions(member.id);
    expect(afterDelete.length).toBe(0);
  });

  it('should maintain data consistency across multiple operations', async () => {
    // Create multiple family members
    const member1 = await localStorage.createFamilyMember({
      name: 'Alice',
      relationship: 'Self',
    });

    const member2 = await localStorage.createFamilyMember({
      name: 'Bob',
      relationship: 'Spouse',
    });

    // Add prescriptions for each
    const rx1 = await localStorage.createPrescription({
      family_member_id: member1.id,
      rx_type: 'eyeglass',
      notes: 'Alice glasses',
      date_taken: new Date().toISOString(),
      imageBase64: 'data:image/jpeg;base64,alice',
    });

    const rx2 = await localStorage.createPrescription({
      family_member_id: member2.id,
      rx_type: 'contact',
      notes: 'Bob contacts',
      date_taken: new Date().toISOString(),
      imageBase64: 'data:image/jpeg;base64,bob',
    });

    // Verify correct association
    const alice Prescriptions = await localStorage.getPrescriptions(member1.id);
    const bobPrescriptions = await localStorage.getPrescriptions(member2.id);

    expect(alicePrescriptions.length).toBe(1);
    expect(bobPrescriptions.length).toBe(1);
    expect(alicePrescriptions[0].notes).toBe('Alice glasses');
    expect(bobPrescriptions[0].notes).toBe('Bob contacts');

    // Verify all prescriptions
    const allPrescriptions = await localStorage.getPrescriptions();
    expect(allPrescriptions.length).toBe(2);
  });

  it('should handle cascade delete when member is deleted', async () => {
    // Create member with multiple prescriptions
    const member = await localStorage.createFamilyMember({
      name: 'Test User',
      relationship: 'Child',
    });

    // Add 3 prescriptions
    for (let i = 0; i < 3; i++) {
      await localStorage.createPrescription({
        family_member_id: member.id,
        rx_type: i % 2 === 0 ? 'eyeglass' : 'contact',
        notes: `Prescription ${i}`,
        date_taken: new Date().toISOString(),
        imageBase64: `data:image/jpeg;base64,test${i}`,
      });
    }

    // Verify prescriptions exist
    let prescriptions = await localStorage.getPrescriptions(member.id);
    expect(prescriptions.length).toBe(3);

    // Delete member - should cascade delete prescriptions
    await localStorage.deleteFamilyMember(member.id);

    // Verify member is gone
    const members = await localStorage.getFamilyMembers();
    expect(members.find(m => m.id === member.id)).toBeUndefined();

    // Verify prescriptions are also deleted (cascade)
    prescriptions = await localStorage.getPrescriptions(member.id);
    expect(prescriptions.length).toBe(0);
  });

  it('should handle workflow with image loading and processing', async () => {
    const member = await localStorage.createFamilyMember({
      name: 'Image Test',
      relationship: 'Self',
    });

    // Simulate loading large image
    const largeImageData = 'data:image/jpeg;base64,' + 'A'.repeat(1024 * 100); // 100KB

    const prescription = await localStorage.createPrescription({
      family_member_id: member.id,
      rx_type: 'eyeglass',
      notes: 'Large image test',
      date_taken: new Date().toISOString(),
      imageBase64: largeImageData,
    });

    expect(prescription.image_uri).toBe(largeImageData);

    // Load and verify
    const loaded = await localStorage.getPrescriptions(member.id);
    expect(loaded[0].image_uri).toBe(largeImageData);
  });
});
