/**
 * Mock Data Generator for Torture/Stress Testing
 * 
 * Generates realistic test data including:
 * - Bulk family members
 * - Bulk prescriptions
 * - Mock images of various sizes
 * - Edge case data
 */

import type { FamilyMember, Prescription } from '../../services/localStorage';
import { generateMockBase64Image } from './test-helpers';

// Sample names for generating realistic data
const FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
  'William', 'Mary', 'James', 'Patricia', 'Richard', 'Jennifer', 'Thomas', 'Linda',
  'Christopher', 'Elizabeth', 'Daniel', 'Barbara', 'Matthew', 'Susan', 'Anthony', 'Jessica',
  'Mark', 'Karen', 'Donald', 'Nancy', 'Steven', 'Margaret', 'Paul', 'Betty',
  'Andrew', 'Dorothy', 'Joshua', 'Sandra', 'Kenneth', 'Ashley', 'Kevin', 'Kimberly',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
];

const RELATIONSHIPS = [
  'Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Grandchild',
  'Partner', 'Other', 'Son', 'Daughter', 'Mother', 'Father', 'Brother', 'Sister',
];

/**
 * Generate a random name
 */
const generateRandomName = (): string => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
};

/**
 * Generate a random relationship
 */
const generateRandomRelationship = (): string => {
  return RELATIONSHIPS[Math.floor(Math.random() * RELATIONSHIPS.length)];
};

/**
 * Generate a single family member
 */
export const generateFamilyMember = (index?: number): FamilyMember => {
  const name = index !== undefined 
    ? `Test Member ${index}` 
    : generateRandomName();
  
  return {
    id: `member_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    name,
    relationship: generateRandomRelationship(),
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
};

/**
 * Generate bulk family members
 */
export const generateBulkFamilyMembers = (count: number): FamilyMember[] => {
  const members: FamilyMember[] = [];
  
  for (let i = 0; i < count; i++) {
    members.push(generateFamilyMember(i + 1));
  }
  
  return members;
};

/**
 * Generate a random date in the past
 */
const generateRandomPastDate = (maxDaysAgo: number = 730): string => {
  const now = Date.now();
  const randomPast = now - (Math.random() * maxDaysAgo * 24 * 60 * 60 * 1000);
  return new Date(randomPast).toISOString().split('T')[0];
};

/**
 * Generate expiry date (2 years from date taken)
 */
const calculateExpiryDate = (dateTaken: string): string => {
  const date = new Date(dateTaken);
  date.setFullYear(date.getFullYear() + 2);
  return date.toISOString().split('T')[0];
};

/**
 * Generate prescription notes
 */
const generateNotes = (index?: number): string => {
  const templates = [
    'Regular prescription for daily use',
    'Updated prescription after annual checkup',
    'Transition lenses recommended',
    'Anti-glare coating applied',
    'Blue light filter added',
    'Progressive lenses',
    'Distance vision only',
    'Reading glasses',
    'Computer glasses for work',
    'Backup prescription',
  ];
  
  if (index !== undefined) {
    return `Prescription #${index} - ${templates[index % templates.length]}`;
  }
  
  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * Generate a single prescription
 */
export const generatePrescription = (
  familyMemberId: string,
  index?: number,
  imageSizeKB: number = 1024
): Omit<Prescription, 'id' | 'created_at'> & { imageBase64: string } => {
  const dateTaken = generateRandomPastDate();
  
  return {
    family_member_id: familyMemberId,
    rx_type: Math.random() > 0.5 ? 'eyeglass' : 'contact',
    notes: generateNotes(index),
    date_taken: dateTaken,
    expiry_date: calculateExpiryDate(dateTaken),
    imageBase64: generateMockBase64Image(imageSizeKB),
  } as any;
};

/**
 * Generate bulk prescriptions for a family member
 */
export const generateBulkPrescriptions = (
  familyMemberId: string,
  count: number,
  imageSizeKB: number = 1024
): Array<Omit<Prescription, 'id' | 'created_at'> & { imageBase64: string }> => {
  const prescriptions: Array<Omit<Prescription, 'id' | 'created_at'> & { imageBase64: string }> = [];
  
  for (let i = 0; i < count; i++) {
    prescriptions.push(generatePrescription(familyMemberId, i + 1, imageSizeKB));
  }
  
  return prescriptions;
};

/**
 * Generate prescriptions for multiple family members
 */
export const generatePrescriptionsForMembers = (
  familyMembers: FamilyMember[],
  prescriptionsPerMember: number,
  imageSizeKB: number = 1024
): Array<Omit<Prescription, 'id' | 'created_at'> & { imageBase64: string }> => {
  const prescriptions: Array<Omit<Prescription, 'id' | 'created_at'> & { imageBase64: string }> = [];
  
  for (const member of familyMembers) {
    const memberPrescriptions = generateBulkPrescriptions(
      member.id,
      prescriptionsPerMember,
      imageSizeKB
    );
    prescriptions.push(...memberPrescriptions);
  }
  
  return prescriptions;
};

/**
 * Generate edge case data for testing
 */
export const generateEdgeCaseData = () => {
  return {
    // Very long name
    longName: 'A'.repeat(500),
    
    // Special characters
    specialCharacters: '!@#$%^&*()_+-=[]{}|;:",.<>?/~`',
    
    // Unicode characters
    unicodeCharacters: '你好世界 مرحبا العالم Здравствуй мир',
    
    // Empty strings
    emptyString: '',
    
    // Very long notes
    longNotes: 'This is a very long note. '.repeat(100),
    
    // SQL injection attempts (should be handled safely)
    sqlInjection: "'; DROP TABLE prescriptions; --",
    
    // XSS attempts (should be handled safely)
    xssAttempt: '<script>alert("XSS")</script>',
    
    // Null characters
    nullChar: '\0',
    
    // Line breaks and tabs
    specialWhitespace: 'Line 1\nLine 2\tTabbed\rCarriage Return',
  };
};

/**
 * Generate family member with edge case data
 */
export const generateEdgeCaseFamilyMember = (type: string): FamilyMember => {
  const edgeCases = generateEdgeCaseData();
  
  switch (type) {
    case 'long-name':
      return {
        id: `member_edge_${Date.now()}`,
        name: edgeCases.longName,
        relationship: 'Self',
        created_at: new Date().toISOString(),
      };
    
    case 'special-chars':
      return {
        id: `member_edge_${Date.now()}`,
        name: edgeCases.specialCharacters,
        relationship: edgeCases.specialCharacters,
        created_at: new Date().toISOString(),
      };
    
    case 'unicode':
      return {
        id: `member_edge_${Date.now()}`,
        name: edgeCases.unicodeCharacters,
        relationship: 'Other',
        created_at: new Date().toISOString(),
      };
    
    case 'empty':
      return {
        id: `member_edge_${Date.now()}`,
        name: edgeCases.emptyString,
        relationship: edgeCases.emptyString,
        created_at: new Date().toISOString(),
      };
    
    default:
      return generateFamilyMember();
  }
};

/**
 * Generate various sized mock images for testing
 */
export const generateVariousSizedImages = () => {
  return {
    tiny: generateMockBase64Image(10), // 10KB
    small: generateMockBase64Image(100), // 100KB
    medium: generateMockBase64Image(500), // 500KB
    large: generateMockBase64Image(2048), // 2MB
    veryLarge: generateMockBase64Image(5120), // 5MB
    huge: generateMockBase64Image(10240), // 10MB
  };
};

/**
 * Generate test scenario datasets
 */
export const generateTestScenario = (scenario: string) => {
  switch (scenario) {
    case 'small':
      return {
        members: generateBulkFamilyMembers(5),
        prescriptionsPerMember: 5,
        imageSizeKB: 100,
      };
    
    case 'medium':
      return {
        members: generateBulkFamilyMembers(20),
        prescriptionsPerMember: 10,
        imageSizeKB: 500,
      };
    
    case 'large':
      return {
        members: generateBulkFamilyMembers(50),
        prescriptionsPerMember: 20,
        imageSizeKB: 1024,
      };
    
    case 'extreme':
      return {
        members: generateBulkFamilyMembers(100),
        prescriptionsPerMember: 50,
        imageSizeKB: 2048,
      };
    
    default:
      return generateTestScenario('medium');
  }
};
