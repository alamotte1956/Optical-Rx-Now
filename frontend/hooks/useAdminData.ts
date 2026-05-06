import { useState, useEffect, useCallback, useRef } from "react";
import {
  checkBackendHealth,
  getAnalyticsDashboard,
  getFinancialDashboard,
  getAffiliates,
  getBanners,
  getInvoices,
  type Affiliate,
  type Banner,
  type Invoice,
  type AnalyticsDashboard,
  type FinancialDashboard,
} from "../services/adminApi";

export interface AdminData {
  // Connection state
  backendOnline: boolean | null;
  loading: boolean;
  refreshing: boolean;
  lastRefresh: Date | null;

  // Data
  analytics: AnalyticsDashboard | null;
  financials: FinancialDashboard | null;
  affiliates: Affiliate[];
  banners: Banner[];
  invoices: Invoice[];

  // Actions
  refreshData: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function useAdminData(): AdminData {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [financials, setFinancials] = useState<FinancialDashboard | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const loadAllData = useCallback(async () => {
    try {
      const healthy = await checkBackendHealth();
      setBackendOnline(healthy);

      if (!healthy) {
        setLoading(false);
        return;
      }

      const [analyticsData, financialData, affiliateData, bannerData, invoiceData] = await Promise.all([
        getAnalyticsDashboard().catch(() => null),
        getFinancialDashboard().catch(() => null),
        getAffiliates().catch(() => []),
        getBanners().catch(() => []),
        getInvoices().catch(() => []),
      ]);

      setAnalytics(analyticsData);
      setFinancials(financialData);
      setAffiliates(affiliateData);
      setBanners(bannerData);
      setInvoices(invoiceData);
      setLastRefresh(new Date());
    } catch (error) {
      console.log("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auto-refresh every 10 seconds
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      loadAllData();
    }, 10000);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [loadAllData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  return {
    backendOnline,
    loading,
    refreshing,
    lastRefresh,
    analytics,
    financials,
    affiliates,
    banners,
    invoices,
    refreshData: loadAllData,
    onRefresh,
  };
}
