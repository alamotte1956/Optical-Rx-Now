// Admin Panel Constants & Seed Data
import type { Affiliate } from "../services/adminApi";

// Verified commission rates as of 2025. Sources: official program pages,
// ShareASale, CJ Affiliate, FlexOffers, Avantlink, Impact Radius.
// Sorted by commission rate (highest first).
export const DEFAULT_AFFILIATES_SEED: Partial<Affiliate>[] = [
  { name: "Warby Parker", url: "https://www.warbyparker.com", commission: 20, is_active: true },
  { name: "GlassesUSA", url: "https://www.glassesusa.com", commission: 15, is_active: true },
  { name: "Designer Optics", url: "https://designeroptics.com", commission: 15, is_active: true },
  { name: "EyeBuyDirect", url: "https://www.eyebuydirect.com", commission: 15, is_active: true },
  { name: "Eyeglasses.com", url: "https://www.eyeglasses.com", commission: 12, is_active: true },
  { name: "Clearly", url: "https://www.clearly.ca", commission: 12, is_active: true },
  { name: "Coastal", url: "https://www.coastal.com", commission: 10, is_active: true },
  { name: "1-800 Contacts", url: "https://www.1800contacts.com", commission: 10, is_active: true },
  { name: "Target Optical", url: "https://www.targetoptical.com", commission: 8, is_active: true },
  { name: "SportRx", url: "https://www.sportrx.com", commission: 8, is_active: true },
  { name: "Lens.com", url: "https://www.lens.com", commission: 6, is_active: true },
  { name: "Eyeconic", url: "https://www.eyeconic.com", commission: 5, is_active: true },
  { name: "FramesDirect", url: "https://www.framesdirect.com", commission: 4, is_active: true },
  { name: "SmartBuyGlasses", url: "https://www.smartbuyglasses.com", commission: 12, is_active: true },
  { name: "Walmart Vision Center", url: "https://www.walmart.com/cp/vision-centers/1078944", commission: 2, is_active: true },
  { name: "Zenni Optical", url: "https://www.zennioptical.com", commission: 1, is_active: true },
];

export const ADMIN_LINKS = [
  { name: "App Store Connect", url: "https://appstoreconnect.apple.com", icon: "logo-apple", description: "Manage iOS app" },
  { name: "App Store Analytics", url: "https://appstoreconnect.apple.com/analytics", icon: "analytics-outline", description: "iOS downloads, sessions & active users" },
  { name: "Google Play Console", url: "https://play.google.com/console", icon: "logo-google-playstore", description: "Manage Android app" },
  { name: "Play Store Statistics", url: "https://play.google.com/console/developers/app/statistics", icon: "bar-chart-outline", description: "Android installs, ratings & user data" },
  { name: "My Optical Wallet Website", url: "https://MyOpticalWallet.com", icon: "globe-outline", description: "Company website" },
];

export const statusColor = (status: string): string => {
  switch (status) {
    case "paid": return "#4CAF50";
    case "pending": return "#FF9800";
    case "overdue": return "#ff5c5c";
    default: return "#8899a6";
  }
};
