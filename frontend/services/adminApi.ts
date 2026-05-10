/**
 * Admin API Service
 * Connects the frontend Admin Panel to the FastAPI backend.
 * Uses EXPO_PUBLIC_BACKEND_URL from .env + /api prefix.
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

// Production backend URL for this app
const PRODUCTION_BACKEND_URL = "https://optical-rx-now-production.up.railway.app";

// Resolve the backend URL dynamically from environment config
const getBaseUrl = (): string => {
  // Try all possible sources for the backend URL
  try {
    const fromExtra = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL;
    if (fromExtra && fromExtra.length > 0 && !fromExtra.includes("preview.emergentagent.com")) {
      console.log("[AdminAPI] Using URL from extra:", fromExtra);
      return fromExtra;
    }
  } catch (e) {
    console.log("[AdminAPI] Constants.expoConfig not available");
  }

  try {
    const fromEnv = process.env.EXPO_PUBLIC_BACKEND_URL;
    if (fromEnv && fromEnv.length > 0 && !fromEnv.includes("preview.emergentagent.com")) {
      console.log("[AdminAPI] Using URL from env:", fromEnv);
      return fromEnv;
    }
  } catch (e) {
    console.log("[AdminAPI] process.env not available");
  }

  // Always use production Railway URL (ensures web preview and native share same database)
  console.log("[AdminAPI] Using production URL:", PRODUCTION_BACKEND_URL);
  return PRODUCTION_BACKEND_URL;
};

// Admin API Key for protected endpoints
const ADMIN_API_KEY = Constants.expoConfig?.extra?.ADMIN_API_KEY || "Pvz8xwghNOsIOtw1tBKZXO4LsaB_3xOjiNy81w4qy08";

const BASE_URL = getBaseUrl();

const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${BASE_URL}${endpoint}`;
  const isWriteMethod = options.method && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method);
  
  // Only add Content-Type for write methods (avoids CORS preflight on GET)
  const defaultHeaders: Record<string, string> = isWriteMethod
    ? { "Content-Type": "application/json", "X-Admin-Key": ADMIN_API_KEY }
    : {};

  try {
    // Add timeout for Android (native fetch can hang)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...(options.headers || {}) },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error ${response.status}: ${errorBody}`);
    }

    return await response.json();
  } catch (error: any) {
    console.log(`[AdminAPI] ${url} failed:`, error.message || error);
    throw error;
  }
};

// ==================== AFFILIATES ====================

export interface Affiliate {
  affiliate_id: string;
  name: string;
  url: string;
  commission: number;
  logo_url?: string | null;
  is_active: boolean;
  click_count: number;
  updated_at?: string;
}

export const getAffiliates = async (): Promise<Affiliate[]> => {
  const data = await apiCall("/api/affiliates?all=true");
  return data.affiliates || [];
};

export const createAffiliate = async (affiliate: Partial<Affiliate>): Promise<any> => {
  return apiCall("/api/affiliates", {
    method: "POST",
    body: JSON.stringify(affiliate),
  });
};

export const updateAffiliate = async (affiliateId: string, affiliate: Partial<Affiliate>): Promise<any> => {
  return apiCall(`/api/affiliates/${affiliateId}`, {
    method: "PUT",
    body: JSON.stringify(affiliate),
  });
};

export const deleteAffiliate = async (affiliateId: string): Promise<any> => {
  return apiCall(`/api/affiliates/${affiliateId}`, {
    method: "DELETE",
  });
};

// ==================== BANNERS ====================

export interface Banner {
  banner_id: string;
  image_url: string;
  destination_url: string;
  title?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  view_count: number;
  click_count: number;
  created_at?: string;
}

export const getBanners = async (): Promise<Banner[]> => {
  const data = await apiCall("/api/banners?all=true");
  return data.banners || [];
};

export const createBanner = async (banner: Partial<Banner>): Promise<any> => {
  return apiCall("/api/banners", {
    method: "POST",
    body: JSON.stringify(banner),
  });
};

export const updateBanner = async (bannerId: string, banner: Partial<Banner>): Promise<any> => {
  return apiCall(`/api/banners/${bannerId}`, {
    method: "PUT",
    body: JSON.stringify(banner),
  });
};

export const deleteBanner = async (bannerId: string): Promise<any> => {
  return apiCall(`/api/banners/${bannerId}`, {
    method: "DELETE",
  });
};

// ==================== INVOICES ====================

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  invoice_id: string;
  recipient_name: string;
  recipient_email?: string | null;
  invoice_type: "advertiser" | "affiliate";
  line_items: LineItem[];
  total_amount: number;
  status: "pending" | "paid" | "overdue";
  created_at?: string;
  due_date?: string | null;
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const data = await apiCall("/api/invoices");
  return data.invoices || [];
};

export const createInvoice = async (invoice: Partial<Invoice>): Promise<any> => {
  return apiCall("/api/invoices", {
    method: "POST",
    body: JSON.stringify(invoice),
  });
};

export const updateInvoice = async (invoiceId: string, updates: Record<string, any>): Promise<any> => {
  return apiCall(`/api/invoices/${invoiceId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
};

export const deleteInvoice = async (invoiceId: string): Promise<any> => {
  return apiCall(`/api/invoices/${invoiceId}`, {
    method: "DELETE",
  });
};

export const autoGenerateInvoices = async (): Promise<any> => {
  return apiCall("/api/invoices/auto-generate", {
    method: "POST",
  });
};

// ==================== ANALYTICS ====================

export interface AnalyticsDashboard {
  events: Record<string, number>;
  platform_breakdown: Record<string, number>;
  platform_events: Record<string, Record<string, number>>;
  affiliate_stats: {
    total_clicks: number;
    total_affiliates: number;
    total_commission_potential: number;
  };
  banner_stats: {
    total_views: number;
    total_clicks: number;
    active_banners: number;
  };
  summary: {
    app_opens: number;
    share_clicks: number;
    total_events: number;
  };
}

export interface FinancialDashboard {
  commission: {
    potential: number;
    total_affiliate_clicks: number;
    active_affiliates: number;
  };
  invoices: {
    total: number;
    paid: { count: number; amount: number };
    pending: { count: number; amount: number };
    overdue: { count: number; amount: number };
  };
  total_revenue: number;
}

export const getAnalyticsDashboard = async (): Promise<AnalyticsDashboard> => {
  return apiCall("/api/analytics/dashboard");
};

export const getFinancialDashboard = async (): Promise<FinancialDashboard> => {
  return apiCall("/api/finance/dashboard");
};

export const logAnalyticsEvent = async (eventType: string, metadata?: Record<string, any>): Promise<any> => {
  const platformName = Platform.OS; // 'ios', 'android', or 'web'
  return apiCall("/api/analytics/event", {
    method: "POST",
    body: JSON.stringify({
      event_type: eventType,
      platform: platformName,
      metadata: { ...metadata, platform: platformName },
    }),
  });
};

// ==================== HEALTH CHECK ====================

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const data = await apiCall("/api/health");
    return data.status === "healthy";
  } catch {
    return false;
  }
};
