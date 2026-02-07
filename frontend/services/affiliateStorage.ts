import AsyncStorage from "@react-native-async-storage/async-storage";
import affiliatesJson from "../data/affiliates.json";

const AFFILIATES_KEY = "@optical_rx_affiliates";

export interface Affiliate {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  discount: string;
  commission?: string;
  is_featured: boolean;
  is_active: boolean;
  order: number;
}

export const getAffiliates = async (): Promise<Affiliate[]> => {
  const stored = await AsyncStorage.getItem(AFFILIATES_KEY);
  
  if (stored) {
    return JSON.parse(stored);
  } else {
    // First time - load from JSON file
    await AsyncStorage.setItem(AFFILIATES_KEY, JSON.stringify(affiliatesJson));
    return affiliatesJson as Affiliate[];
  }
};

export const saveAffiliate = async (affiliate: Omit<Affiliate, "id"> | Affiliate): Promise<Affiliate> => {
  const affiliates = await getAffiliates();
  
  if ('id' in affiliate) {
    // Update existing
    const index = affiliates.findIndex(a => a.id === affiliate.id);
    if (index !== -1) {
      affiliates[index] = affiliate;
    }
    await AsyncStorage.setItem(AFFILIATES_KEY, JSON.stringify(affiliates));
    return affiliate;
  } else {
    // Create new
    const newAffiliate: Affiliate = {
      ...affiliate,
      id: `affiliate_${Date.now()}`,
    };
    affiliates.push(newAffiliate);
    await AsyncStorage.setItem(AFFILIATES_KEY, JSON.stringify(affiliates));
    return newAffiliate;
  }
};

export const deleteAffiliate = async (id: string): Promise<void> => {
  const affiliates = await getAffiliates();
  const filtered = affiliates.filter(a => a.id !== id);
  await AsyncStorage.setItem(AFFILIATES_KEY, JSON.stringify(filtered));
};

export const toggleAffiliateActive = async (id: string): Promise<void> => {
  const affiliates = await getAffiliates();
  const affiliate = affiliates.find(a => a.id === id);
  if (affiliate) {
    affiliate.is_active = !affiliate.is_active;
    await AsyncStorage.setItem(AFFILIATES_KEY, JSON.stringify(affiliates));
  }
};
