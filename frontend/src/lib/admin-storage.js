const ADMIN_STORAGE_KEY = "my-optical-wallet-admin";

const defaultAffiliates = [
  ["glassesusa", "GlassesUSA", 30, "Commission Junction", "Everyday prescription glasses and lenses.", "https://www.glassesusa.com/"],
  ["warby-parker", "Warby Parker", 20, "ShareASale", "Modern prescription eyewear and try-at-home frames.", "https://www.warbyparker.com/"],
  ["designer-optics", "Designer Optics", 15, "Partnerize", "Premium designer eyewear and sunglasses.", "https://www.designeroptics.com/"],
  ["eyebuydirect", "EyeBuyDirect", 15, "Direct", "Value-focused prescription eyewear with frequent promotions.", "https://www.eyebuydirect.com/"],
  ["1800-contacts", "1-800 Contacts", 14, "Impact", "Contact lens ordering, refills, and subscription-style convenience.", "https://www.1800contacts.com/"],
  ["eyeglasses-com", "Eyeglasses.com", 13, "Impact", "Designer and prescription frames.", "https://www.eyeglasses.com/"],
  ["clearly", "Clearly", 12, "Direct", "Prescription glasses, contacts, and vision essentials.", "https://www.clearly.com/"],
  ["sams-club-optical", "Sam's Club Optical", 12, "Rakuten", "Club optical offers tied to memberships and eyewear deals.", "https://www.samsclub.com/c/optical/1295"],
  ["target-optical", "Target Optical", 8, "Commission Junction", "Contacts, eyeglasses, and in-store optical promotions.", "https://www.targetoptical.com/"],
  ["sportrx", "SportRx", 8, "AvantLink", "Sport eyewear, prescription inserts, and performance frames.", "https://www.sportrx.com/"],
  ["lens-com", "Lens.com", 8, "Direct", "Contact lens deals and refill-focused offers.", "https://www.lens.com/"],
  ["eyeconic", "Eyeconic", 7, "Commission Junction", "Insurance-friendly eyewear and contact lens shopping.", "https://www.eyeconic.com/"],
  ["coastal", "Coastal", 6, "Affiliate Program", "Prescription glasses and contact lens offers.", "https://www.coastal.com/"],
  ["contactsdirect", "ContactsDirect", 5, "Affiliate Program", "Popular contact lens destination with insurance-friendly shopping.", "https://www.contactsdirect.com/"],
  ["framesdirect", "FramesDirect", 4, "Commission Junction", "Prescription glasses and premium sunglasses.", "https://www.framesdirect.com/"],
  ["zenni-optical", "Zenni Optical", 3, "Direct", "Affordable frames and blue-light styles.", "https://www.zennioptical.com/"],
  ["costco-optical", "Costco Optical", 3, "Commission Junction", "Warehouse optical deals tied to memberships and eyewear savings.", "https://www.costco.com/optical.html"],
  ["americas-best", "America's Best", 1, "Direct", "Value optical offers and exam-focused promotions.", "https://www.americasbest.com/"],
].map(([id, name, commission, network, description, programUrl]) => ({
  id,
  name,
  commission,
  network,
  description,
  programUrl,
  affiliateId: "",
  active: true,
  verified: true,
}));

const DEFAULT_AFFILIATE_IDS = new Set(defaultAffiliates.map((affiliate) => affiliate.id));

export const sortAffiliatesByCommission = (affiliates) =>
  [...affiliates].sort((left, right) => Number(right.commission || 0) - Number(left.commission || 0));

export const createDefaultAdminState = () => ({
  affiliates: sortAffiliatesByCommission(defaultAffiliates),
  updatedAt: new Date().toISOString(),
});

export const loadAdminState = () => {
  if (typeof window === "undefined") {
    return createDefaultAdminState();
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) {
      return createDefaultAdminState();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.affiliates)) {
      return createDefaultAdminState();
    }

    const storedIds = parsed.affiliates.map((affiliate) => affiliate.id);
    const matchesDefaultList =
      storedIds.length === defaultAffiliates.length
      && storedIds.every((id) => DEFAULT_AFFILIATE_IDS.has(id));

    if (!matchesDefaultList) {
      return createDefaultAdminState();
    }

    return {
      ...parsed,
      affiliates: sortAffiliatesByCommission(parsed.affiliates),
    };
  } catch {
    return createDefaultAdminState();
  }
};

export const saveAdminState = (state, options = {}) => {
  if (typeof window === "undefined") {
    return state;
  }

  const shouldSort = options.sortAffiliates ?? true;

  const nextState = {
    ...state,
    affiliates: shouldSort ? sortAffiliatesByCommission(state.affiliates || []) : [...(state.affiliates || [])],
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(nextState));
  return nextState;
};

export const resetAdminState = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
  }

  return createDefaultAdminState();
};

export const ADMIN_STORAGE_KEY_NAME = ADMIN_STORAGE_KEY;
