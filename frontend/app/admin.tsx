import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  clearAllData,
  setAgeVerified,
} from "../services/localStorage";
import {
  checkBackendHealth,
  getAnalyticsDashboard,
  getFinancialDashboard,
  getAffiliates,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  autoGenerateInvoices,
  type Affiliate,
  type Banner,
  type Invoice,
  type LineItem,
  type AnalyticsDashboard,
  type FinancialDashboard,
} from "../services/adminApi";
import Constants from "expo-constants";

// ==================== DEFAULT SEED DATA ====================
const DEFAULT_AFFILIATES_SEED: Partial<Affiliate>[] = [
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
  { name: "Eyeconic", url: "https://www.eyeconic.com", commission: 8, is_active: true },
  { name: "Coastal", url: "https://www.coastal.com", commission: 8, is_active: true },
  { name: "SportRx", url: "https://www.sportrx.com", commission: 7, is_active: true },
  { name: "FramesDirect", url: "https://www.framesdirect.com", commission: 7, is_active: true },
  { name: "Sam's Club Optical", url: "https://www.samsclub.com/b/optical/1990005", commission: 5, is_active: true },
  { name: "Costco Optical", url: "https://www.costco.com/optical.html", commission: 4, is_active: true },
  { name: "America's Best", url: "https://www.americasbest.com", commission: 4, is_active: true },
];

const ADMIN_LINKS = [
  { name: "App Store Connect", url: "https://appstoreconnect.apple.com", icon: "logo-apple", description: "Manage iOS app" },
  { name: "App Store Analytics", url: "https://appstoreconnect.apple.com/analytics", icon: "analytics-outline", description: "iOS downloads, sessions & active users" },
  { name: "Google Play Console", url: "https://play.google.com/console", icon: "logo-google-playstore", description: "Manage Android app" },
  { name: "Play Store Statistics", url: "https://play.google.com/console/developers/app/statistics", icon: "bar-chart-outline", description: "Android installs, ratings & user data" },
  { name: "My Optical Wallet Website", url: "https://MyOpticalWallet.com", icon: "globe-outline", description: "Company website" },
];

// ==================== SECTION COMPONENT ====================
const Section = ({
  title,
  icon,
  iconColor = "#4a9eff",
  expanded,
  onToggle,
  badge,
  children,
}: {
  title: string;
  icon: string;
  iconColor?: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
      <View style={styles.sectionHeaderLeft}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
        <Text style={styles.sectionTitle}>{title}</Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={22} color="#6b7c8f" />
    </TouchableOpacity>
    {expanded && <View style={styles.sectionContent}>{children}</View>}
  </View>
);

// ==================== METRIC CARD ====================
const MetricCard = ({ value, label, icon, color = "#4a9eff" }: { value: string | number; label: string; icon: string; color?: string }) => (
  <View style={styles.metricCard}>
    <Ionicons name={icon as any} size={24} color={color} />
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

// ==================== MAIN COMPONENT ====================
export default function AdminScreen() {
  const router = useRouter();

  // Global state
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Data state
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [financials, setFinancials] = useState<FinancialDashboard | null>(null);
  const [affiliates, setAffiliatesList] = useState<Affiliate[]>([]);
  const [banners, setBannersList] = useState<Banner[]>([]);
  const [invoices, setInvoicesList] = useState<Invoice[]>([]);

  // Modal state
  const [affiliateModalVisible, setAffiliateModalVisible] = useState(false);
  const [bannerModalVisible, setBannerModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Partial<Affiliate> | null>(null);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Partial<Invoice> | null>(null);

  // Form state - Affiliate
  const [affName, setAffName] = useState("");
  const [affUrl, setAffUrl] = useState("");
  const [affCommission, setAffCommission] = useState("");

  // Form state - Banner
  const [banTitle, setBanTitle] = useState("");
  const [banImageUrl, setBanImageUrl] = useState("");
  const [banDestUrl, setBanDestUrl] = useState("");
  const [banStartDate, setBanStartDate] = useState("");
  const [banEndDate, setBanEndDate] = useState("");

  // Form state - Invoice
  const [invRecipient, setInvRecipient] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invType, setInvType] = useState<"advertiser" | "affiliate">("advertiser");
  const [invAmount, setInvAmount] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invDescription, setInvDescription] = useState("");

  // ==================== LOAD DATA ====================
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
      setAffiliatesList(affiliateData);
      setBannersList(bannerData);
      setInvoicesList(invoiceData);
    } catch (error) {
      console.log("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? null : s);

  const handleGenerateReport = async () => {
    try {
      const baseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL
        || process.env.EXPO_PUBLIC_BACKEND_URL || "";
      const reportUrl = `${baseUrl}/api/reports/weekly`;
      const { default: Linking } = await import("react-native");
      await Linking.openURL(reportUrl);
    } catch (error: any) {
      Alert.alert("Error", "Could not open report. Try again later.");
    }
  };

  // ==================== AFFILIATE ACTIONS ====================
  const openAffiliateModal = (affiliate?: Affiliate) => {
    if (affiliate) {
      setEditingAffiliate(affiliate);
      setAffName(affiliate.name);
      setAffUrl(affiliate.url);
      setAffCommission(String(affiliate.commission));
    } else {
      setEditingAffiliate(null);
      setAffName("");
      setAffUrl("");
      setAffCommission("");
    }
    setAffiliateModalVisible(true);
  };

  const saveAffiliate = async () => {
    if (!affName.trim() || !affUrl.trim()) {
      Alert.alert("Error", "Name and URL are required.");
      return;
    }
    try {
      if (editingAffiliate?.affiliate_id) {
        await updateAffiliate(editingAffiliate.affiliate_id, {
          ...editingAffiliate as Affiliate,
          name: affName.trim(),
          url: affUrl.trim(),
          commission: parseFloat(affCommission) || 0,
        });
      } else {
        await createAffiliate({
          name: affName.trim(),
          url: affUrl.trim(),
          commission: parseFloat(affCommission) || 0,
          is_active: true,
        });
      }
      setAffiliateModalVisible(false);
      await loadAllData();
      Alert.alert("Success", editingAffiliate?.affiliate_id ? "Affiliate updated!" : "Affiliate created!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDeleteAffiliate = (aff: Affiliate) => {
    Alert.alert("Delete Affiliate", `Remove "${aff.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteAffiliate(aff.affiliate_id);
            await loadAllData();
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const handleToggleAffiliate = async (aff: Affiliate) => {
    try {
      await updateAffiliate(aff.affiliate_id, { ...aff, is_active: !aff.is_active });
      await loadAllData();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const seedAffiliates = async () => {
    Alert.alert("Seed Affiliates", "This will add 18 default optical affiliate partners to the database.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Seed",
        onPress: async () => {
          try {
            for (const aff of DEFAULT_AFFILIATES_SEED) {
              await createAffiliate(aff);
            }
            await loadAllData();
            Alert.alert("Success", "18 affiliates seeded successfully!");
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  // ==================== BANNER ACTIONS ====================
  const openBannerModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setBanTitle(banner.title || "");
      setBanImageUrl(banner.image_url);
      setBanDestUrl(banner.destination_url);
      setBanStartDate(banner.start_date || "");
      setBanEndDate(banner.end_date || "");
    } else {
      setEditingBanner(null);
      setBanTitle("");
      setBanImageUrl("");
      setBanDestUrl("");
      setBanStartDate("");
      setBanEndDate("");
    }
    setBannerModalVisible(true);
  };

  const saveBanner = async () => {
    if (!banImageUrl.trim() || !banDestUrl.trim()) {
      Alert.alert("Error", "Image URL and Destination URL are required.");
      return;
    }
    try {
      if (editingBanner?.banner_id) {
        await updateBanner(editingBanner.banner_id, {
          ...editingBanner as Banner,
          title: banTitle.trim() || null,
          image_url: banImageUrl.trim(),
          destination_url: banDestUrl.trim(),
          start_date: banStartDate.trim() || null,
          end_date: banEndDate.trim() || null,
        });
      } else {
        await createBanner({
          title: banTitle.trim() || null,
          image_url: banImageUrl.trim(),
          destination_url: banDestUrl.trim(),
          start_date: banStartDate.trim() || null,
          end_date: banEndDate.trim() || null,
          is_active: true,
        });
      }
      setBannerModalVisible(false);
      await loadAllData();
      Alert.alert("Success", editingBanner?.banner_id ? "Banner updated!" : "Banner created!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDeleteBanner = (ban: Banner) => {
    Alert.alert("Delete Banner", `Remove "${ban.title || "Untitled"}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteBanner(ban.banner_id);
            await loadAllData();
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const handleToggleBanner = async (ban: Banner) => {
    try {
      await updateBanner(ban.banner_id, { ...ban, is_active: !ban.is_active });
      await loadAllData();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // ==================== INVOICE ACTIONS ====================
  const openInvoiceModal = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setInvRecipient(invoice.recipient_name);
      setInvEmail(invoice.recipient_email || "");
      setInvType(invoice.invoice_type);
      setInvAmount(String(invoice.total_amount));
      setInvDueDate(invoice.due_date || "");
      setInvDescription(invoice.line_items?.[0]?.description || "");
    } else {
      setEditingInvoice(null);
      setInvRecipient("");
      setInvEmail("");
      setInvType("advertiser");
      setInvAmount("");
      setInvDueDate("");
      setInvDescription("");
    }
    setInvoiceModalVisible(true);
  };

  const saveInvoice = async () => {
    if (!invRecipient.trim()) {
      Alert.alert("Error", "Recipient name is required.");
      return;
    }
    const amount = parseFloat(invAmount) || 0;
    const lineItems: LineItem[] = invDescription.trim()
      ? [{ description: invDescription.trim(), quantity: 1, unit_price: amount, total: amount }]
      : [];

    try {
      if (editingInvoice?.invoice_id) {
        await updateInvoice(editingInvoice.invoice_id, {
          recipient_name: invRecipient.trim(),
          recipient_email: invEmail.trim() || null,
          invoice_type: invType,
          total_amount: amount,
          line_items: lineItems,
          due_date: invDueDate.trim() || null,
        });
      } else {
        await createInvoice({
          recipient_name: invRecipient.trim(),
          recipient_email: invEmail.trim() || null,
          invoice_type: invType,
          total_amount: amount,
          line_items: lineItems,
          due_date: invDueDate.trim() || null,
          status: "pending",
        });
      }
      setInvoiceModalVisible(false);
      await loadAllData();
      Alert.alert("Success", editingInvoice?.invoice_id ? "Invoice updated!" : "Invoice created!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDeleteInvoice = (inv: Invoice) => {
    Alert.alert("Delete Invoice", `Remove invoice for "${inv.recipient_name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteInvoice(inv.invoice_id);
            await loadAllData();
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const handleAutoGenerateInvoices = async () => {
    Alert.alert(
      "Auto-Generate Invoices",
      "This will create invoices based on current affiliate click data and commission rates.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: async () => {
            try {
              const result = await autoGenerateInvoices();
              await loadAllData();
              Alert.alert(
                "Success",
                `${result.invoices_created} invoice(s) generated from affiliate data.`
              );
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const cycleInvoiceStatus = async (inv: Invoice) => {
    const statusOrder: Invoice["status"][] = ["pending", "paid", "overdue"];
    const currentIdx = statusOrder.indexOf(inv.status);
    const nextStatus = statusOrder[(currentIdx + 1) % statusOrder.length];
    try {
      await updateInvoice(inv.invoice_id, { status: nextStatus });
      await loadAllData();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // ==================== APP MANAGEMENT ====================
  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete ALL optical documents, family members, and app settings. This action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              await setAgeVerified(false);
              Alert.alert("Success", "All data has been cleared. Please restart the app.", [
                { text: "OK", onPress: () => router.replace("/") },
              ]);
            } catch (error) {
              Alert.alert("Error", "Could not clear data");
            }
          },
        },
      ]
    );
  };

  const handleResetAgeVerification = async () => {
    try {
      await setAgeVerified(false);
      Alert.alert("Success", "Age verification has been reset.");
    } catch {
      Alert.alert("Error", "Could not reset age verification");
    }
  };

  // ==================== STATUS HELPERS ====================
  const statusColor = (status: string) => {
    switch (status) {
      case "paid": return "#4CAF50";
      case "pending": return "#FF9800";
      case "overdue": return "#ff5c5c";
      default: return "#8899a6";
    }
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Loading Admin Panel...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={styles.headerRight}>
          <View style={[styles.statusDot, { backgroundColor: backendOnline ? "#4CAF50" : "#ff5c5c" }]} />
          <Text style={styles.statusText}>{backendOnline ? "Online" : "Offline"}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />}
      >
        {/* Backend Status Warning */}
        {backendOnline === false && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#FF9800" />
            <Text style={styles.warningText}>Backend is offline. Some features may not work.</Text>
          </View>
        )}

        {/* ==================== ANALYTICS DASHBOARD ==================== */}
        <Section
          title="Analytics Dashboard"
          icon="analytics-outline"
          iconColor="#4a9eff"
          expanded={expandedSection === "analytics"}
          onToggle={() => toggleSection("analytics")}
          badge={analytics ? String(analytics.summary.total_events) : undefined}
        >
          {analytics ? (
            <>
              <Text style={styles.subsectionLabel}>App Activity</Text>
              <View style={styles.metricsGrid}>
                <MetricCard value={analytics.summary.app_opens} label="App Opens" icon="phone-portrait-outline" />
                <MetricCard value={analytics.summary.share_clicks} label="Shares" icon="share-outline" color="#4CAF50" />
                <MetricCard value={analytics.summary.total_events} label="Total Events" icon="pulse-outline" color="#FF9800" />
                <MetricCard value={analytics.affiliate_stats.total_clicks} label="Aff. Clicks" icon="link-outline" color="#E040FB" />
              </View>
              <Text style={styles.subsectionLabel}>Banner Performance</Text>
              <View style={styles.metricsGrid}>
                <MetricCard value={analytics.banner_stats.total_views} label="Banner Views" icon="eye-outline" />
                <MetricCard value={analytics.banner_stats.total_clicks} label="Banner Clicks" icon="finger-print-outline" color="#4CAF50" />
                <MetricCard value={analytics.banner_stats.active_banners} label="Active Banners" icon="images-outline" color="#FF9800" />
                <MetricCard
                  value={analytics.affiliate_stats.total_affiliates}
                  label="Affiliates"
                  icon="people-outline"
                  color="#E040FB"
                />
              </View>
              <TouchableOpacity style={styles.refreshRow} onPress={onRefresh}>
                <Ionicons name="refresh" size={16} color="#4a9eff" />
                <Text style={styles.refreshText}>Refresh Data</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: "#4a9eff", alignSelf: "center", marginTop: 8 }]} onPress={handleGenerateReport}>
                <Ionicons name="document-text" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Download Weekly PDF Report</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.emptyText}>No analytics data available yet.</Text>
          )}
        </Section>

        {/* ==================== FINANCIAL DASHBOARD ==================== */}
        <Section
          title="Financial Overview"
          icon="cash-outline"
          iconColor="#4CAF50"
          expanded={expandedSection === "financial"}
          onToggle={() => toggleSection("financial")}
          badge={financials ? `$${financials.total_revenue.toFixed(0)}` : undefined}
        >
          {financials ? (
            <>
              <View style={styles.financeRow}>
                <View style={[styles.financeCard, { borderLeftColor: "#4CAF50" }]}>
                  <Text style={styles.financeCardLabel}>Total Revenue</Text>
                  <Text style={[styles.financeCardValue, { color: "#4CAF50" }]}>
                    ${financials.total_revenue.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.financeCard, { borderLeftColor: "#E040FB" }]}>
                  <Text style={styles.financeCardLabel}>Commission Potential</Text>
                  <Text style={[styles.financeCardValue, { color: "#E040FB" }]}>
                    ${financials.commission.potential.toFixed(2)}
                  </Text>
                </View>
              </View>
              <Text style={styles.subsectionLabel}>Invoice Summary</Text>
              <View style={styles.invoiceSummaryRow}>
                <View style={styles.invoiceSummaryItem}>
                  <Text style={[styles.invoiceSummaryCount, { color: "#4CAF50" }]}>{financials.invoices.paid.count}</Text>
                  <Text style={styles.invoiceSummaryLabel}>Paid</Text>
                  <Text style={styles.invoiceSummaryAmount}>${financials.invoices.paid.amount.toFixed(0)}</Text>
                </View>
                <View style={styles.invoiceSummaryItem}>
                  <Text style={[styles.invoiceSummaryCount, { color: "#FF9800" }]}>{financials.invoices.pending.count}</Text>
                  <Text style={styles.invoiceSummaryLabel}>Pending</Text>
                  <Text style={styles.invoiceSummaryAmount}>${financials.invoices.pending.amount.toFixed(0)}</Text>
                </View>
                <View style={styles.invoiceSummaryItem}>
                  <Text style={[styles.invoiceSummaryCount, { color: "#ff5c5c" }]}>{financials.invoices.overdue.count}</Text>
                  <Text style={styles.invoiceSummaryLabel}>Overdue</Text>
                  <Text style={styles.invoiceSummaryAmount}>${financials.invoices.overdue.amount.toFixed(0)}</Text>
                </View>
              </View>
              <View style={styles.affiliateStatsCard}>
                <Text style={styles.subsectionLabel}>Affiliate Stats</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Active Affiliates</Text>
                  <Text style={styles.statValue}>{financials.commission.active_affiliates}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Clicks</Text>
                  <Text style={styles.statValue}>{financials.commission.total_affiliate_clicks}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>Financial data unavailable.</Text>
          )}
        </Section>

        {/* ==================== AFFILIATE MANAGEMENT ==================== */}
        <Section
          title="Affiliate Management"
          icon="link-outline"
          iconColor="#E040FB"
          expanded={expandedSection === "affiliates"}
          onToggle={() => toggleSection("affiliates")}
          badge={String(affiliates.length)}
        >
          <View style={styles.sectionActions}>
            <TouchableOpacity style={styles.addButton} onPress={() => openAffiliateModal()}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.addButtonText}>Add Affiliate</Text>
            </TouchableOpacity>
            {affiliates.length === 0 && (
              <TouchableOpacity style={[styles.addButton, { backgroundColor: "#E040FB" }]} onPress={seedAffiliates}>
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Seed Defaults</Text>
              </TouchableOpacity>
            )}
          </View>

          {affiliates.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="link-outline" size={40} color="#3a4d63" />
              <Text style={styles.emptyCardText}>No affiliates yet</Text>
              <Text style={styles.emptyCardSub}>Tap "Seed Defaults" to add 18 optical affiliate partners</Text>
            </View>
          ) : (
            affiliates.map((aff) => (
              <View key={aff.affiliate_id} style={[styles.itemCard, !aff.is_active && styles.itemCardDisabled]}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemName}>{aff.name}</Text>
                      <View style={[styles.commissionBadge]}>
                        <Text style={styles.commissionBadgeText}>{aff.commission}%</Text>
                      </View>
                    </View>
                    <Text style={styles.itemSubtext} numberOfLines={1}>{aff.url}</Text>
                    <Text style={styles.itemMeta}>Clicks: {aff.click_count || 0}</Text>
                  </View>
                  <Switch
                    value={aff.is_active}
                    onValueChange={() => handleToggleAffiliate(aff)}
                    trackColor={{ false: "#3a4d63", true: "#4a9eff" }}
                    thumbColor={aff.is_active ? "#fff" : "#8899a6"}
                  />
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openAffiliateModal(aff)}>
                    <Ionicons name="create-outline" size={18} color="#4a9eff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => Linking.openURL(aff.url)}>
                    <Ionicons name="open-outline" size={18} color="#8899a6" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeleteAffiliate(aff)}>
                    <Ionicons name="trash-outline" size={18} color="#ff5c5c" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Section>

        {/* ==================== BANNER MANAGEMENT ==================== */}
        <Section
          title="Banner Management"
          icon="images-outline"
          iconColor="#FF9800"
          expanded={expandedSection === "banners"}
          onToggle={() => toggleSection("banners")}
          badge={String(banners.length)}
        >
          <View style={styles.sectionActions}>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: "#FF9800" }]} onPress={() => openBannerModal()}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.addButtonText}>Add Banner</Text>
            </TouchableOpacity>
          </View>

          {banners.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="images-outline" size={40} color="#3a4d63" />
              <Text style={styles.emptyCardText}>No banners yet</Text>
              <Text style={styles.emptyCardSub}>Create banners to display in the app carousel</Text>
            </View>
          ) : (
            banners.map((ban) => (
              <View key={ban.banner_id} style={[styles.itemCard, !ban.is_active && styles.itemCardDisabled]}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{ban.title || "Untitled Banner"}</Text>
                    <Text style={styles.itemSubtext} numberOfLines={1}>{ban.image_url}</Text>
                    <Text style={styles.itemMeta}>
                      Views: {ban.view_count || 0} | Clicks: {ban.click_count || 0}
                    </Text>
                    {(ban.start_date || ban.end_date) && (
                      <Text style={styles.itemMeta}>
                        {ban.start_date ? `From: ${ban.start_date.split("T")[0]}` : ""}{" "}
                        {ban.end_date ? `To: ${ban.end_date.split("T")[0]}` : ""}
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={ban.is_active}
                    onValueChange={() => handleToggleBanner(ban)}
                    trackColor={{ false: "#3a4d63", true: "#FF9800" }}
                    thumbColor={ban.is_active ? "#fff" : "#8899a6"}
                  />
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openBannerModal(ban)}>
                    <Ionicons name="create-outline" size={18} color="#FF9800" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => Linking.openURL(ban.destination_url)}>
                    <Ionicons name="open-outline" size={18} color="#8899a6" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeleteBanner(ban)}>
                    <Ionicons name="trash-outline" size={18} color="#ff5c5c" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Section>

        {/* ==================== INVOICE MANAGEMENT ==================== */}
        <Section
          title="Invoicing"
          icon="receipt-outline"
          iconColor="#00BCD4"
          expanded={expandedSection === "invoices"}
          onToggle={() => toggleSection("invoices")}
          badge={String(invoices.length)}
        >
          <View style={styles.sectionActions}>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: "#00BCD4" }]} onPress={() => openInvoiceModal()}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.addButtonText}>Create Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: "#4CAF50" }]} onPress={handleAutoGenerateInvoices}>
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={styles.addButtonText}>Auto-Generate</Text>
            </TouchableOpacity>
          </View>

          {invoices.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={40} color="#3a4d63" />
              <Text style={styles.emptyCardText}>No invoices yet</Text>
              <Text style={styles.emptyCardSub}>Create invoices for advertisers or affiliates</Text>
            </View>
          ) : (
            invoices.map((inv) => (
              <View key={inv.invoice_id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemName}>{inv.recipient_name}</Text>
                      <TouchableOpacity
                        style={[styles.statusBadge, { backgroundColor: statusColor(inv.status) + "22", borderColor: statusColor(inv.status) }]}
                        onPress={() => cycleInvoiceStatus(inv)}
                      >
                        <Text style={[styles.statusBadgeText, { color: statusColor(inv.status) }]}>
                          {inv.status.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.itemSubtext}>
                      {inv.invoice_type === "advertiser" ? "Advertiser" : "Affiliate"}{" "}
                      {inv.recipient_email ? `• ${inv.recipient_email}` : ""}
                    </Text>
                    <Text style={[styles.invoiceAmount, { color: statusColor(inv.status) }]}>
                      ${inv.total_amount.toFixed(2)}
                    </Text>
                    {inv.due_date && <Text style={styles.itemMeta}>Due: {inv.due_date.split("T")[0]}</Text>}
                    {inv.line_items?.length > 0 && (
                      <Text style={styles.itemMeta}>{inv.line_items[0]?.description}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openInvoiceModal(inv)}>
                    <Ionicons name="create-outline" size={18} color="#00BCD4" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeleteInvoice(inv)}>
                    <Ionicons name="trash-outline" size={18} color="#ff5c5c" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Section>

        {/* ==================== APP MANAGEMENT ==================== */}
        <Section
          title="App Management"
          icon="settings-outline"
          iconColor="#4a9eff"
          expanded={expandedSection === "management"}
          onToggle={() => toggleSection("management")}
        >
          {ADMIN_LINKS.map((link) => (
            <TouchableOpacity key={link.name} style={styles.linkCard} onPress={() => Linking.openURL(link.url)}>
              <Ionicons name={link.icon as any} size={22} color="#4a9eff" />
              <View style={styles.linkInfo}>
                <Text style={styles.linkName}>{link.name}</Text>
                <Text style={styles.linkDescription}>{link.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7c8f" />
            </TouchableOpacity>
          ))}
        </Section>

        {/* ==================== DATA MANAGEMENT ==================== */}
        <Section
          title="Data Management"
          icon="server-outline"
          iconColor="#ff5c5c"
          expanded={expandedSection === "data"}
          onToggle={() => toggleSection("data")}
        >
          <TouchableOpacity style={styles.actionButton} onPress={handleResetAgeVerification}>
            <Ionicons name="refresh" size={20} color="#4a9eff" />
            <Text style={styles.actionButtonText}>Reset Age Verification</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleClearAllData}>
            <Ionicons name="trash" size={20} color="#ff5c5c" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All App Data</Text>
          </TouchableOpacity>
        </Section>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>My Optical Wallet v2.0.1</Text>
          <Text style={styles.footerSubtext}>Admin Panel • Backend {backendOnline ? "Connected" : "Disconnected"}</Text>
        </View>
      </ScrollView>

      {/* ==================== AFFILIATE MODAL ==================== */}
      <Modal visible={affiliateModalVisible} transparent animationType="fade" onRequestClose={() => setAffiliateModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="link" size={28} color="#E040FB" />
              <Text style={styles.modalTitle}>{editingAffiliate?.affiliate_id ? "Edit" : "Add"} Affiliate</Text>
            </View>
            <TextInput style={styles.modalInput} placeholder="Partner Name" placeholderTextColor="#6b7c8f" value={affName} onChangeText={setAffName} />
            <TextInput style={styles.modalInput} placeholder="Website URL" placeholderTextColor="#6b7c8f" value={affUrl} onChangeText={setAffUrl} keyboardType="url" autoCapitalize="none" />
            <TextInput style={styles.modalInput} placeholder="Commission %" placeholderTextColor="#6b7c8f" value={affCommission} onChangeText={setAffCommission} keyboardType="decimal-pad" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setAffiliateModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveButton, { backgroundColor: "#E040FB" }]} onPress={saveAffiliate}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== BANNER MODAL ==================== */}
      <Modal visible={bannerModalVisible} transparent animationType="fade" onRequestClose={() => setBannerModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="images" size={28} color="#FF9800" />
                <Text style={styles.modalTitle}>{editingBanner?.banner_id ? "Edit" : "Add"} Banner</Text>
              </View>
              <TextInput style={styles.modalInput} placeholder="Banner Title (optional)" placeholderTextColor="#6b7c8f" value={banTitle} onChangeText={setBanTitle} />
              <TextInput style={styles.modalInput} placeholder="Image URL" placeholderTextColor="#6b7c8f" value={banImageUrl} onChangeText={setBanImageUrl} keyboardType="url" autoCapitalize="none" />
              <TextInput style={styles.modalInput} placeholder="Destination URL" placeholderTextColor="#6b7c8f" value={banDestUrl} onChangeText={setBanDestUrl} keyboardType="url" autoCapitalize="none" />
              <TextInput style={styles.modalInput} placeholder="Start Date (YYYY-MM-DD)" placeholderTextColor="#6b7c8f" value={banStartDate} onChangeText={setBanStartDate} />
              <TextInput style={styles.modalInput} placeholder="End Date (YYYY-MM-DD)" placeholderTextColor="#6b7c8f" value={banEndDate} onChangeText={setBanEndDate} />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setBannerModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalSaveButton, { backgroundColor: "#FF9800" }]} onPress={saveBanner}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== INVOICE MODAL ==================== */}
      <Modal visible={invoiceModalVisible} transparent animationType="fade" onRequestClose={() => setInvoiceModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="receipt" size={28} color="#00BCD4" />
                <Text style={styles.modalTitle}>{editingInvoice?.invoice_id ? "Edit" : "Create"} Invoice</Text>
              </View>
              <TextInput style={styles.modalInput} placeholder="Recipient Name" placeholderTextColor="#6b7c8f" value={invRecipient} onChangeText={setInvRecipient} />
              <TextInput style={styles.modalInput} placeholder="Email (optional)" placeholderTextColor="#6b7c8f" value={invEmail} onChangeText={setInvEmail} keyboardType="email-address" autoCapitalize="none" />
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[styles.typeButton, invType === "advertiser" && styles.typeButtonActive]}
                  onPress={() => setInvType("advertiser")}
                >
                  <Text style={[styles.typeButtonText, invType === "advertiser" && styles.typeButtonTextActive]}>Advertiser</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, invType === "affiliate" && styles.typeButtonActive]}
                  onPress={() => setInvType("affiliate")}
                >
                  <Text style={[styles.typeButtonText, invType === "affiliate" && styles.typeButtonTextActive]}>Affiliate</Text>
                </TouchableOpacity>
              </View>
              <TextInput style={styles.modalInput} placeholder="Description" placeholderTextColor="#6b7c8f" value={invDescription} onChangeText={setInvDescription} />
              <TextInput style={styles.modalInput} placeholder="Total Amount ($)" placeholderTextColor="#6b7c8f" value={invAmount} onChangeText={setInvAmount} keyboardType="decimal-pad" />
              <TextInput style={styles.modalInput} placeholder="Due Date (YYYY-MM-DD)" placeholderTextColor="#6b7c8f" value={invDueDate} onChangeText={setInvDueDate} />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setInvoiceModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalSaveButton, { backgroundColor: "#00BCD4" }]} onPress={saveInvoice}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 14, color: "#8899a6", marginTop: 12 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2d45",
  },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, color: "#8899a6" },

  content: { flex: 1 },

  // Warning Banner
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 152, 0, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FF9800",
  },
  warningText: { flex: 1, fontSize: 13, color: "#FF9800" },

  // Section
  section: { marginTop: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#1a2d45",
    borderBottomWidth: 1,
    borderBottomColor: "#0f1d2f",
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#fff" },
  badge: {
    backgroundColor: "rgba(74, 158, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#4a9eff" },
  sectionContent: { padding: 16, backgroundColor: "#0f1d2f" },

  // Subsection
  subsectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 10,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Metrics
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  metricValue: { fontSize: 24, fontWeight: "700" },
  metricLabel: { fontSize: 11, color: "#8899a6", textAlign: "center" },

  // Finance
  financeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  financeCard: {
    flex: 1,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
  },
  financeCardLabel: { fontSize: 12, color: "#8899a6", marginBottom: 4 },
  financeCardValue: { fontSize: 22, fontWeight: "700" },

  // Invoice Summary
  invoiceSummaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  invoiceSummaryItem: {
    flex: 1,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  invoiceSummaryCount: { fontSize: 24, fontWeight: "700" },
  invoiceSummaryLabel: { fontSize: 12, color: "#8899a6", marginTop: 2 },
  invoiceSummaryAmount: { fontSize: 11, color: "#6b7c8f", marginTop: 2 },

  // Affiliate Stats
  affiliateStatsCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#0f1d2f",
  },
  statLabel: { fontSize: 13, color: "#8899a6" },
  statValue: { fontSize: 13, fontWeight: "600", color: "#fff" },

  // Refresh
  refreshRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  refreshText: { fontSize: 13, color: "#4a9eff", fontWeight: "600" },

  // Section Actions
  sectionActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4a9eff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: { fontSize: 13, fontWeight: "600", color: "#fff" },

  // Empty state
  emptyCard: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    gap: 8,
  },
  emptyCardText: { fontSize: 16, fontWeight: "600", color: "#8899a6" },
  emptyCardSub: { fontSize: 13, color: "#6b7c8f", textAlign: "center" },
  emptyText: { fontSize: 14, color: "#6b7c8f", textAlign: "center", paddingVertical: 16 },

  // Item Card (shared for affiliates, banners, invoices)
  itemCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2a3d55",
  },
  itemCardDisabled: { opacity: 0.5 },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  itemName: { fontSize: 15, fontWeight: "700", color: "#fff" },
  itemSubtext: { fontSize: 12, color: "#6b7c8f", marginBottom: 2 },
  itemMeta: { fontSize: 12, color: "#8899a6", marginTop: 2 },
  itemActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#2a3d55",
    paddingTop: 10,
  },
  iconBtn: {
    width: 40,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
  },

  // Commission Badge
  commissionBadge: {
    backgroundColor: "rgba(224, 64, 251, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  commissionBadgeText: { fontSize: 12, fontWeight: "700", color: "#E040FB" },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },

  // Invoice Amount
  invoiceAmount: { fontSize: 18, fontWeight: "700", marginTop: 4 },

  // Link Card
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  linkInfo: { flex: 1 },
  linkName: { fontSize: 14, fontWeight: "600", color: "#fff", marginBottom: 2 },
  linkDescription: { fontSize: 12, color: "#6b7c8f" },

  // Action Buttons
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
  },
  actionButtonText: { fontSize: 14, fontWeight: "600", color: "#4a9eff" },
  dangerButton: {
    backgroundColor: "rgba(255, 92, 92, 0.1)",
    borderWidth: 1,
    borderColor: "#ff5c5c",
  },
  dangerText: { color: "#ff5c5c" },

  // Footer
  footer: { alignItems: "center", padding: 24, marginTop: 8, marginBottom: 20 },
  footerText: { fontSize: 14, color: "#8899a6", marginBottom: 2 },
  footerSubtext: { fontSize: 12, color: "#6b7c8f" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1a2d45",
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  modalInput: {
    width: "100%",
    backgroundColor: "#0f1d2f",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#2a3d55",
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#2a3d55",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalSaveText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // Type Toggle
  typeToggle: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#0f1d2f",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a3d55",
  },
  typeButtonActive: {
    backgroundColor: "rgba(0, 188, 212, 0.15)",
    borderColor: "#00BCD4",
  },
  typeButtonText: { fontSize: 14, color: "#8899a6", fontWeight: "600" },
  typeButtonTextActive: { color: "#00BCD4" },
});
