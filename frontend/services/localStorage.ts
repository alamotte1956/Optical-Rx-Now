import AsyncStorage from "@react-native-async-storage/async-storage";

const FAMILY_KEY = "@optical_rx_family_members";
const RX_KEY = "@optical_rx_prescriptions";

/**
 * Simple safe write queue
 * prevents overlapping AsyncStorage writes
 */
let writeQueue: Promise<void> = Promise.resolve();

const queueWrite = <T>(op: () => Promise<T>): Promise<T> => {
  const next = writeQueue.then(op);
  writeQueue = next.then(() => {}, () => {});
  return next;
};

/**
 * Safe JSON parse with fallback
 */
const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error("Error parsing stored data:", error);
    return fallback;
  }
};

/**
 * Generate unique ID
 */
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

//
// TYPES
//

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  family_member_id: string;
  rx_type: "eyeglass" | "contact";
  image_uri: string;
  notes: string;
  date_taken: string;
  expiry_date: string;
  created_at: string;
  pd?: number;
  pd_type?: "monocular" | "binocular";
  left_pd?: number;
  right_pd?: number;
}

//
// VALIDATION
//

const validateFamilyMember = (member: Omit<FamilyMember, "id" | "created_at">): void => {
  if (!member.name || member.name.trim().length === 0) {
    throw new Error("Family member name is required");
  }
  if (!member.relationship || member.relationship.trim().length === 0) {
    throw new Error("Relationship is required");
  }
};

const validatePrescription = (data: Omit<Prescription, "id" | "created_at" | "expiry_date" | "image_uri"> & { imageBase64: string }): void => {
  if (!data.family_member_id) {
    throw new Error("Family member ID is required");
  }
  if (!data.rx_type || !["eyeglass", "contact"].includes(data.rx_type)) {
    throw new Error("Valid prescription type is required");
  }
  if (!data.imageBase64 || data.imageBase64.trim().length === 0) {
    throw new Error("Prescription image is required");
  }
  if (!data.date_taken) {
    throw new Error("Date taken is required");
  }
  
  // Validate PD data if provided
  if (data.pd_type === "monocular") {
    if (!data.left_pd || !data.right_pd) {
      throw new Error("Both left and right PD are required for monocular PD type");
    }
  }
};

//
// FAMILY MEMBERS
//

export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  try {
    const raw = await AsyncStorage.getItem(FAMILY_KEY);
    return safeParse<FamilyMember[]>(raw, []);
  } catch (error) {
    console.error("Error getting family members:", error);
    return [];
  }
};

export const createFamilyMember = async (
  member: Omit<FamilyMember, "id" | "created_at">
): Promise<FamilyMember> => {
  validateFamilyMember(member);
  
  return queueWrite(async () => {
    try {
      const list = await getFamilyMembers();

      const newMember: FamilyMember = {
        ...member,
        name: member.name.trim(),
        relationship: member.relationship.trim(),
        id: generateId("member"),
        created_at: new Date().toISOString(),
      };

      list.push(newMember);
      await AsyncStorage.setItem(FAMILY_KEY, JSON.stringify(list));

      return newMember;
    } catch (error) {
      console.error("Error creating family member:", error);
      throw new Error("Failed to create family member");
    }
  });
};

export const updateFamilyMember = async (
  id: string,
  updates: Partial<Omit<FamilyMember, "id" | "created_at">>
): Promise<FamilyMember | null> => {
  if (updates.name) updates.name = updates.name.trim();
  if (updates.relationship) updates.relationship = updates.relationship.trim();

  return queueWrite(async () => {
    try {
      const list = await getFamilyMembers();
      const index = list.findIndex((m) => m.id === id);
      
      if (index === -1) {
        return null;
      }

      const updatedMember: FamilyMember = {
        ...list[index],
        ...updates,
      };

      list[index] = updatedMember;
      await AsyncStorage.setItem(FAMILY_KEY, JSON.stringify(list));

      return updatedMember;
    } catch (error) {
      console.error("Error updating family member:", error);
      throw new Error("Failed to update family member");
    }
  });
};

export const deleteFamilyMember = async (id: string): Promise<boolean> => {
  return queueWrite(async () => {
    try {
      const list = await getFamilyMembers();
      const filtered = list.filter((m) => m.id !== id);
      
      if (filtered.length === list.length) {
        return false; // Nothing was deleted
      }
      
      await AsyncStorage.setItem(FAMILY_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting family member:", error);
      throw new Error("Failed to delete family member");
    }
  });
};

//
// PRESCRIPTIONS
//

/**
 * Calculate expiry date based on prescription type
 * Eyeglasses: 2 years
 * Contact lenses: 1 year
 */
const calculateExpiryDate = (rxType: string): string => {
  const today = new Date();
  const expiry = new Date(today);
  
  // Contact lenses typically expire in 1 year, eyeglasses in 2 years
  const yearsToAdd = rxType === "contact" ? 1 : 2;
  expiry.setFullYear(expiry.getFullYear() + yearsToAdd);
  
  return expiry.toISOString().split("T")[0];
};

export const getPrescriptions = async (
  familyId?: string
): Promise<Prescription[]> => {
  try {
    const raw = await AsyncStorage.getItem(RX_KEY);
    const list: Prescription[] = safeParse<Prescription[]>(raw, []);

    return familyId
      ? list.filter((p) => String(p.family_member_id) === String(familyId))
      : list;
  } catch (error) {
    console.error("Error getting prescriptions:", error);
    return [];
  }
};

export const getPrescriptionById = async (
  id: string
): Promise<Prescription | null> => {
  try {
    const list = await getPrescriptions();
    return list.find((p) => p.id === id) || null;
  } catch (error) {
    console.error("Error getting prescription by ID:", error);
    return null;
  }
};

export const createPrescription = async (
  data: Omit<
    Prescription,
    "id" | "created_at" | "expiry_date" | "image_uri"
  > & { imageBase64: string }
): Promise<Prescription> => {
  validatePrescription(data);
  
  return queueWrite(async () => {
    try {
      const list = await getPrescriptions();

      const rx: Prescription = {
        id: generateId("rx"),
        family_member_id: data.family_member_id,
        rx_type: data.rx_type,
        image_uri: data.imageBase64,
        notes: data.notes.trim(),
        date_taken: data.date_taken,
        expiry_date: calculateExpiryDate(data.rx_type),
        created_at: new Date().toISOString(),
        pd: data.pd,
        pd_type: data.pd_type,
        left_pd: data.left_pd,
        right_pd: data.right_pd,
      };

      list.push(rx);
      await AsyncStorage.setItem(RX_KEY, JSON.stringify(list));

      return rx;
    } catch (error) {
      console.error("Error creating prescription:", error);
      throw new Error("Failed to create prescription");
    }
  });
};

export const updatePrescription = async (
  id: string,
  updates: Partial<Omit<Prescription, "id" | "created_at" | "expiry_date">>
): Promise<Prescription | null> => {
  if (updates.notes) updates.notes = updates.notes.trim();

  return queueWrite(async () => {
    try {
      const list = await getPrescriptions();
      const index = list.findIndex((p) => p.id === id);
      
      if (index === -1) {
        return null;
      }

      const updatedRx: Prescription = {
        ...list[index],
        ...updates,
      };

      list[index] = updatedRx;
      await AsyncStorage.setItem(RX_KEY, JSON.stringify(list));

      return updatedRx;
    } catch (error) {
      console.error("Error updating prescription:", error);
      throw new Error("Failed to update prescription");
    }
  });
};

export const deletePrescription = async (id: string): Promise<boolean> => {
  return queueWrite(async () => {
    try {
      const list = await getPrescriptions();
      const filtered = list.filter((p) => p.id !== id);
      
      if (filtered.length === list.length) {
        return false; // Nothing was deleted
      }
      
      await AsyncStorage.setItem(RX_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting prescription:", error);
      throw new Error("Failed to delete prescription");
    }
  });
};

//
// STATS
//

export const getStats = async () => {
  try {
    const members = await getFamilyMembers();
    const rx = await getPrescriptions();

    return {
      family_members: members.length,
      total_prescriptions: rx.length,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      family_members: 0,
      total_prescriptions: 0,
    };
  }
};

//
// UTILITY FUNCTIONS
//

/**
 * Clear all data (for testing or reset)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([FAMILY_KEY, RX_KEY]);
  } catch (error) {
    console.error("Error clearing data:", error);
    throw new Error("Failed to clear data");
  }
};

/**
 * Export all data as JSON
 */
export const exportAllData = async (): Promise<string> => {
  try {
    const members = await getFamilyMembers();
    const prescriptions = await getPrescriptions();

    const data = {
      family_members: members,
      prescriptions,
      exported_at: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error exporting data:", error);
    throw new Error("Failed to export data");
  }
};