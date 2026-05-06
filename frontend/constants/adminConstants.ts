// Admin Panel Constants & Seed Data
import type { Affiliate } from "../services/adminApi";

export const DEFAULT_AFFILIATES_SEED: Partial<Affiliate>[] = [
  { name: "Designer Optics", url: "https://designeroptics.com", commission: 15, is_active: true },
  { name: "Eyeglasses.com", url: "https://www.eyeglasses.com", commission: 15, is_active: true },
  { name: "GlassesUSA", url: "https://www.glassesusa.com", commission: 12, is_active: true },
  { name: "Clearly", url: "https://www.clearly.ca", commission: 12, is_active: true },
  { name: "Lens.com", url: "https://www.lens.com", commission: 12, is_active: true },
  { name: "ContactsDirect", url: "https://www.contactsdirect.com", commission: 11, is_active: true },
  { name: "Zenni Optical", url: "https://www.zennioptical.com", commission: 10, is_active: true },
  { name: "EyeBuyDirect", url: "https://www.eyebuydirect.com", commission: 10, is_active: true },
  { name: "Warby Parker", url: "https://www.warbyparker.com", commission: 10, is_active: true },
  { name: "1-800 Contacts", url: "https://www.1800contacts.com", commission: 9, is_active: true },
  { name: "Target Optical", url: "https://www.targetoptical.com", commission: 8, is_active: true },
  { name: "LensCrafters", url: "https://www.lenscrafters.com", commission: 8, is_active: true },
  { name: "Pearle Vision", url: "https://www.pearlevision.com", commission: 8, is_active: true },
  { name: "Eyeconic", url: "https://www.eyeconic.com", commission: 8, is_active: true },
  { name: "Coastal", url: "https://www.coastal.com", commission: 8, is_active: true },
  { name: "SportRx", url: "https://www.sportrx.com", commission: 7, is_active: true },
  { name: "FramesDirect", url: "https://www.framesdirect.com", commission: 7, is_active: true },
  { name: "Visionworks", url: "https://www.visionworks.com", commission: 7, is_active: true },
  { name: "Sam's Club Optical", url: "https://www.samsclub.com/b/optical/1990005", commission: 5, is_active: true },
  { name: "Walmart Vision Center", url: "https://www.walmart.com/cp/vision-centers/1078944", commission: 5, is_active: true },
  { name: "Costco Optical", url: "https://www.costco.com/optical.html", commission: 4, is_active: true },
  { name: "America's Best", url: "https://www.americasbest.com", commission: 4, is_active: true },
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
