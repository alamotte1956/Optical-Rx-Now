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
// FAMILY MEMBERS
//

export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  const raw = await AsyncStorage.getItem(FAMILY_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const createFamilyMember = async (
  member: Omit<FamilyMember, "id" | "created_at">
): Promise<FamilyMember> =>
  queueWrite(async () => {
    const list = await getFamilyMembers();

    const newMember: FamilyMember = {
      ...member,
      id: `member_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    list.push(newMember);
    await AsyncStorage.setItem(FAMILY_KEY, JSON.stringify(list));

    return newMember;
  });

export const deleteFamilyMember = async (id: string) =>
  queueWrite(async () => {
    const list = await getFamilyMembers();
    const filtered = list.filter((m) => m.id !== id);
    await AsyncStorage.setItem(FAMILY_KEY, JSON.stringify(filtered));
  });

//
// PRESCRIPTIONS
//

export const getPrescriptions = async (
  familyId?: string
): Promise<Prescription[]> => {
  const raw = await AsyncStorage.getItem(RX_KEY);
  const list: Prescription[] = raw ? JSON.parse(raw) : [];

  return familyId
    ? list.filter((p) => p.family_member_id === familyId)
    : list;
};

export const getPrescriptionById = async (
  id: string
): Promise<Prescription | null> => {
  const list = await getPrescriptions();
  return list.find((p) => p.id === id) || null;
};

export const createPrescription = async (
  data: Omit<
    Prescription,
    "id" | "created_at" | "expiry_date" | "image_uri"
  > & { imageBase64: string }
): Promise<Prescription> =>
  queueWrite(async () => {
    const list = await getPrescriptions();

    const id = `rx_${Date.now()}`;
    const today = new Date();
    const expiry = new Date(today);
    expiry.setFullYear(expiry.getFullYear() + 2);

    const rx: Prescription = {
      id,
      family_member_id: data.family_member_id,
      rx_type: data.rx_type,
      image_uri: data.imageBase64,
      notes: data.notes,
      date_taken: data.date_taken,
      expiry_date: expiry.toISOString().split("T")[0],
      created_at: today.toISOString(),
      pd: data.pd,
      pd_type: data.pd_type,
      left_pd: data.left_pd,
      right_pd: data.right_pd,
    };

    list.push(rx);
    await AsyncStorage.setItem(RX_KEY, JSON.stringify(list));

    return rx;
  });

export const deletePrescription = async (id: string) =>
  queueWrite(async () => {
    const list = await getPrescriptions();
    const filtered = list.filter((p) => p.id !== id);
    await AsyncStorage.setItem(RX_KEY, JSON.stringify(filtered));
  });

//
// STATS
//

export const getStats = async () => {
  const members = await getFamilyMembers();
  const rx = await getPrescriptions();

  return {
    family_members: members.length,
    total_prescriptions: rx.length,
  };
};
