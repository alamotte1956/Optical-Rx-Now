import { useState, useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearAllData,
  setAgeVerified,
  getFamilyMembers,
  getPrescriptions,
  getStats,
} from "../services/localStorage";

// Verified affiliate programs ordered by commission percentage (highest first)
const DEFAULT_AFFILIATES = [
  {
    id: "designer-optics",
    name: "Designer Optics",
    url: "https://designeroptics.com/pages/affiliate-program",
    baseUrl: "https://www.designeroptics.com",
    commission: 15,
    verified: true,
    enabled: true,
    description: "Premium designer eyewear",
    network: "Partnerize",
    affiliateId: "", // Add your affiliate ID
    category: "online",
  },
  {
    id: "eyeglasses-com",
    name: "Eyeglasses.com",
    url: "https://www.eyeglasses.com/info/affiliate-program",
    baseUrl: "https://www.eyeglasses.com",
    commission: 15,
    verified: true,
    enabled: true,
    description: "Wide selection of eyewear",
    network: "IMPACT.com",
    affiliateId: "", // Add your affiliate ID
    category: "online",
  },
  {
    id: "glasses-usa",
    name: "GlassesUSA",
    url: "https://www.glassesusa.com/affiliates",
    baseUrl: "https://www.glassesusa.com",
    commission: 12,
    verified: true,
    enabled: true,
    description: "Top-rated online eyewear retailer",
    network: "Commission Junction",
    affiliateId: "", // Add your affiliate ID
    category: "online",
  },
  {
    id: "clearly",
    name: "Clearly",
    url: "https://www.clearly.ca/en-ca",
    baseUrl: "https://www.clearly.ca",
    commission: 12,
    verified: true,
    enabled: true,
    description: "Affordable glasses & contacts",
    network: "Direct",
    affiliateId: "", // Add your affiliate ID
    category: "contacts",
  },
  {
    id: "lens-com",
    name: "Lens.com",
    url: "https://www.lens.com/affiliates",
    baseUrl: "https://www.lens.com",
    commission: 12,
    verified: true,
    enabled: true,
    description: "Contact lenses at wholesale prices",
    network: "Commission Junction",
    affiliateId: "", // Add your affiliate ID
    category: "contacts",
  },
  {
    id: "contactsdirect",
    name: "ContactsDirect",
    url: "https://www.contactsdirect.com/affiliates",
    baseUrl: "https://www.contactsdirect.com",
    commission: 11,
    verified: true,
    enabled: true,
    description: "Fast contact lens delivery",
    network: "ShareASale",
    affiliateId: "", // Add your affiliate ID
    category: "contacts",
  },
  {
    id: "zenni",
    name: "Zenni Optical",
    url: "https://www.zennioptical.com/c/affiliate",
    baseUrl: "https://www.zennioptical.com",
    commission: 10,
    verified: true,
    enabled: true,
    description: "Budget-friendly eyewear starting at $6.95",
    network: "Impact Radius",
    affiliateId: "", // Add your affiliate ID
    category: "online",
  },
  {
    id: "eyebuydirect",
    name: "EyeBuyDirect",
    url: "https://www.eyebuydirect.com/affiliates",
    baseUrl: "https://www.eyebuydirect.com",
    commission: 10,
    verified: true,
    enabled: true,
    description: "Affordable prescription glasses & sunglasses",
    network: "ShareASale",
    affiliateId: "", // Add your affiliate ID
    category: "online",
  },
  {
    id: "warby-parker",
    name: "Warby Parker",
    url: "https://www.warbyparker.com",
    baseUrl: "https://www.warbyparker.com",
    commission: 10,
    verified: true,
    enabled: true,
    description: "Stylish frames with home try-on",
    network: "Rakuten",
    affiliateId: "", // Add your affiliate ID
    category: "online",
  },
  {
    id: "1800contacts",
    name: "1-800 Contacts",
    url: "https://www.1800contacts.com/affiliates",
    baseUrl: "https://www.1800contacts.com",
    commission: 9,
    verified: true,
    enabled: true,
    description: "America's #1 contact lens retailer",
    network: "Commission Junction",
    affiliateId: "", // Add your affiliate ID
    category: "contacts",
  },
  {
    id: "target-optical",
    name: "Target Optical",
    url: "https://www.targetoptical.com/to-us/affiliates-main",
    baseUrl: "https://www.targetoptical.com",
    commission: 8,
    verified: true,
    enabled: true,
    description: "Trusted retail optical",
    network: "Commission Junction",
    affiliateId: "", // Add your affiliate ID
    category: "retail",
  },
  {
    id: "eyeconic",
    name: "Eyeconic",
    url: "https://www.eyeconic.com/affiliates.html",
    baseUrl: "https://www.eyeconic.com",
    commission: 8,
    verified: true,
    enabled: true,
    description: "VSP/MetLife insurance integration",
    network: "VSP",
    affiliateId: "", // Add your affiliate ID
    category: "online",
  },
  {
    id: "coastal",
    name: "Coastal",
    url: "https://www.coastal.com",
    baseUrl: "https://www.coastal.com",
    commission: 8,
    verified: true,
    enabled: true,
    description: "Designer frames at affordable prices",
    network: "ShareASale",
    affiliateId: "", // Add your affiliate ID
    category: "online",
  },
  {
    id: "sportrx",
    name: "SportRx",
    url: "https://www.sportrx.com/affiliate-program/",
    baseUrl: "https://www.sportrx.com",
    commission: 7,
    verified: true,
    enabled: true,
    description: "Sports & performance eyewear",
    network: "Direct",
    affiliateId: "", // Add your affiliate ID
    category: "online",
  },
  {
    id: "framesdirect",
    name: "FramesDirect",
    url: "https://www.framesdirect.com/affiliates",
    baseUrl: "https://www.framesdirect.com",
    commission: 7,
    verified: true,
    enabled: true,
    description: "Designer frames & sunglasses",
    network: "Commission Junction",
    affiliateId: "", // Add your affiliate ID
    category: "online",
  },
  {
    id: "sams-club",
    name: "Sam's Club Optical",
    url: "https://www.samsclub.com/content/affiliate-program",
    baseUrl: "https://www.samsclub.com/b/optical/1990005",
    commission: 5,
    verified: true,
    enabled: true,
    description: "Warehouse club optical - great value",
    network: "Direct",
    affiliateId: "", // Add your affiliate ID
    category: "retail",
    isPreferred: true,
  },
  {
    id: "costco-optical",
    name: "Costco Optical",
    url: "https://www.costco.com/optical.html",
    baseUrl: "https://www.costco.com/optical.html",
    commission: 4,
    verified: true,
    enabled: true,
    description: "Premium quality at Costco prices",
    network: "Direct",
    affiliateId: "", // Add your affiliate ID
    category: "retail",
  },
  {
    id: "americas-best",
    name: "America's Best",
    url: "https://www.americasbest.com",
    baseUrl: "https://www.americasbest.com",
    commission: 4,
    verified: true,
    enabled: true,
    description: "2 pairs of glasses for $79.95",
    network: "Direct",
    affiliateId: "", // Add your affiliate ID
    category: "retail",
  },
];

const ADMIN_LINKS = [
  {
    name: "App Store Connect",
    url: "https://appstoreconnect.apple.com",
    icon: "logo-apple",
    description: "Manage iOS app",
  },
  {
    name: "Google Play Console",
    url: "https://play.google.com/console",
    icon: "logo-google-playstore",
    description: "Manage Android app",
  },
  {
    name: "Optical Rx Now Website",
    url: "https://opticalrxnow.com",
    icon: "globe-outline",
    description: "Company website",
  },
];

const AFFILIATES_STORAGE_KEY = "@optical_rx_affiliates";

export default function AdminScreen() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [affiliates, setAffiliates] = useState(DEFAULT_AFFILIATES);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalPrescriptions: 0,
    activeUsers: 0,
    avgPrescriptionsPerUser: 0,
    prescriptionsByType: { eyeglass: 0, contact: 0 },
    recentActivity: 0,
  });

  useEffect(() => {
    loadAffiliates();
    loadAnalytics();
  }, []);

  const loadAffiliates = async () => {
    try {
      const stored = await AsyncStorage.getItem(AFFILIATES_STORAGE_KEY);
      if (stored) {
        const parsedAffiliates = JSON.parse(stored);
        // Sort by commission percentage (highest first)
        parsedAffiliates.sort((a: any, b: any) => b.commission - a.commission);
        setAffiliates(parsedAffiliates);
      } else {
        // Save default affiliates
        await saveAffiliates(DEFAULT_AFFILIATES);
      }
    } catch (error) {
      console.log("Error loading affiliates:", error);
    }
  };

  const saveAffiliates = async (updatedAffiliates: typeof DEFAULT_AFFILIATES) => {
    try {
      // Sort by commission before saving
      const sorted = [...updatedAffiliates].sort((a, b) => b.commission - a.commission);
      await AsyncStorage.setItem(AFFILIATES_STORAGE_KEY, JSON.stringify(sorted));
      setAffiliates(sorted);
    } catch (error) {
      console.log("Error saving affiliates:", error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const [members, prescriptions, stats] = await Promise.all([
        getFamilyMembers(),
        getPrescriptions(),
        getStats(),
      ]);

      // Calculate analytics
      const totalUsers = members.length;
      const totalPrescriptions = prescriptions.length;
      const avgPrescriptionsPerUser =
        totalUsers > 0 ? (totalPrescriptions / totalUsers).toFixed(1) : 0;

      // Count by type
      const prescriptionsByType = prescriptions.reduce(
        (acc, rx) => {
          acc[rx.rxType]++;
          return acc;
        },
        { eyeglass: 0, contact: 0 }
      );

      // Recent activity (prescriptions in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentActivity = prescriptions.filter(
        (rx) => new Date(rx.dateTaken) >= thirtyDaysAgo
      ).length;

      setAnalytics({
        totalUsers,
        totalPrescriptions,
        activeUsers: totalUsers, // All users with data are considered active
        avgPrescriptionsPerUser: Number(avgPrescriptionsPerUser),
        prescriptionsByType,
        recentActivity,
      });
    } catch (error) {
      console.log("Error loading analytics:", error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleAffiliate = async (id: string) => {
    const updated = affiliates.map((aff) =>
      aff.id === id ? { ...aff, enabled: !aff.enabled } : aff
    );
    await saveAffiliates(updated);
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete ALL prescriptions, family members, and app settings. This action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              await setAgeVerified(false);
              Alert.alert(
                "Success",
                "All data has been cleared. Please restart the app.",
                [
                  {
                    text: "OK",
                    onPress: () => router.replace("/"),
                  },
                ]
              );
            } catch (error) {
              console.log("Error clearing data:", error);
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
      Alert.alert(
        "Success",
        "Age verification has been reset. The verification screen will appear when you restart the app.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Error", "Could not reset age verification");
    }
  };

  const getEngagementRate = () => {
    if (analytics.totalUsers === 0) return 0;
    return ((analytics.recentActivity / analytics.totalUsers) * 100).toFixed(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Analytics Dashboard */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("analytics")}
          >
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="stats-chart" size={24} color="#4a9eff" />
              <Text style={styles.sectionTitle}>Analytics Dashboard</Text>
            </View>
            <Ionicons
              name={expandedSection === "analytics" ? "chevron-up" : "chevron-down"}
              size={24}
              color="#8899a6"
            />
          </TouchableOpacity>

          {expandedSection === "analytics" && (
            <View style={styles.sectionContent}>
              <Text style={styles.analyticsSubtitle}>
                Advertiser-Valuable Metrics
              </Text>

              {/* Key Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Ionicons name="people" size={32} color="#4CAF50" />
                  <Text style={styles.metricValue}>{analytics.totalUsers}</Text>
                  <Text style={styles.metricLabel}>Total Users</Text>
                </View>

                <View style={styles.metricCard}>
                  <Ionicons name="document-text" size={32} color="#2196F3" />
                  <Text style={styles.metricValue}>{analytics.totalPrescriptions}</Text>
                  <Text style={styles.metricLabel}>Prescriptions</Text>
                </View>

                <View style={styles.metricCard}>
                  <Ionicons name="trending-up" size={32} color="#FF9800" />
                  <Text style={styles.metricValue}>
                    {analytics.avgPrescriptionsPerUser}
                  </Text>
                  <Text style={styles.metricLabel}>Avg Per User</Text>
                </View>

                <View style={styles.metricCard}>
                  <Ionicons name="flash" size={32} color="#9C27B0" />
                  <Text style={styles.metricValue}>{getEngagementRate()}%</Text>
                  <Text style={styles.metricLabel}>Engagement</Text>
                </View>
              </View>

              {/* Activity Breakdown */}
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsCardTitle}>Recent Activity (30 days)</Text>
                <View style={styles.analyticsRow}>
                  <Text style={styles.analyticsLabel}>New Prescriptions:</Text>
                  <Text style={styles.analyticsValue}>{analytics.recentActivity}</Text>
                </View>
              </View>

              {/* Prescription Type Breakdown */}
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsCardTitle}>Prescription Types</Text>
                <View style={styles.analyticsRow}>
                  <View style={styles.analyticsItem}>
                    <Ionicons name="glasses-outline" size={20} color="#4a9eff" />
                    <Text style={styles.analyticsLabel}>Eyeglasses:</Text>
                    <Text style={styles.analyticsValue}>
                      {analytics.prescriptionsByType.eyeglass}
                    </Text>
                  </View>
                </View>
                <View style={styles.analyticsRow}>
                  <View style={styles.analyticsItem}>
                    <Ionicons name="eye-outline" size={20} color="#4a9eff" />
                    <Text style={styles.analyticsLabel}>Contact Lenses:</Text>
                    <Text style={styles.analyticsValue}>
                      {analytics.prescriptionsByType.contact}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Advertiser Value Proposition */}
              <View style={[styles.analyticsCard, styles.valueCard]}>
                <Ionicons name="trending-up" size={24} color="#4CAF50" />
                <Text style={styles.valueTitle}>Advertiser Value</Text>
                <Text style={styles.valueText}>
                  • High-intent users actively managing prescriptions
                </Text>
                <Text style={styles.valueText}>
                  • {analytics.totalUsers} qualified eyewear shoppers
                </Text>
                <Text style={styles.valueText}>
                  • {getEngagementRate()}% monthly engagement rate
                </Text>
                <Text style={styles.valueText}>
                  • Purchase-ready audience with verified needs
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Affiliate Management */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("affiliates")}
          >
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="link" size={24} color="#4a9eff" />
              <Text style={styles.sectionTitle}>Affiliate Management</Text>
            </View>
            <Ionicons
              name={expandedSection === "affiliates" ? "chevron-up" : "chevron-down"}
              size={24}
              color="#8899a6"
            />
          </TouchableOpacity>

          {expandedSection === "affiliates" && (
            <View style={styles.sectionContent}>
              <Text style={styles.affiliateNote}>
                ✓ Verified affiliates • Ordered by commission %
              </Text>

              {affiliates.map((affiliate) => (
                <View
                  key={affiliate.id}
                  style={[
                    styles.affiliateCard,
                    !affiliate.enabled && styles.affiliateCardDisabled,
                  ]}
                >
                  <View style={styles.affiliateHeader}>
                    <View style={styles.affiliateInfo}>
                      <View style={styles.affiliateTitleRow}>
                        <Text style={styles.affiliateName}>{affiliate.name}</Text>
                        {affiliate.verified && (
                          <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        )}
                      </View>
                      <Text style={styles.affiliateCommission}>
                        {affiliate.commission}% Commission • {affiliate.network}
                      </Text>
                      <Text style={styles.affiliateDescription}>
                        {affiliate.description}
                      </Text>
                    </View>
                    <Switch
                      value={affiliate.enabled}
                      onValueChange={() => toggleAffiliate(affiliate.id)}
                      trackColor={{ false: "#3a4d63", true: "#4a9eff" }}
                      thumbColor={affiliate.enabled ? "#fff" : "#8899a6"}
                    />
                  </View>

                  {affiliate.enabled && (
                    <TouchableOpacity
                      style={styles.affiliateButton}
                      onPress={() => openLink(affiliate.url)}
                    >
                      <Text style={styles.affiliateButtonText}>Open Affiliate Program</Text>
                      <Ionicons name="open-outline" size={16} color="#4a9eff" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#4a9eff" />
                <Text style={styles.infoText}>
                  Toggle affiliates on/off to customize which programs appear in the app.
                  They're automatically sorted by commission percentage.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* App Management */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("management")}
          >
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="settings" size={24} color="#4a9eff" />
              <Text style={styles.sectionTitle}>App Management</Text>
            </View>
            <Ionicons
              name={expandedSection === "management" ? "chevron-up" : "chevron-down"}
              size={24}
              color="#8899a6"
            />
          </TouchableOpacity>

          {expandedSection === "management" && (
            <View style={styles.sectionContent}>
              {ADMIN_LINKS.map((link) => (
                <TouchableOpacity
                  key={link.name}
                  style={styles.linkCard}
                  onPress={() => openLink(link.url)}
                >
                  <Ionicons name={link.icon as any} size={24} color="#4a9eff" />
                  <View style={styles.linkInfo}>
                    <Text style={styles.linkName}>{link.name}</Text>
                    <Text style={styles.linkDescription}>{link.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#6b7c8f" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="database" size={24} color="#4a9eff" />
              <Text style={styles.sectionTitle}>Data Management</Text>
            </View>
          </View>

          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleResetAgeVerification}
            >
              <Ionicons name="refresh" size={20} color="#4a9eff" />
              <Text style={styles.actionButtonText}>Reset Age Verification</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleClearAllData}
            >
              <Ionicons name="trash" size={20} color="#ff5c5c" />
              <Text style={[styles.actionButtonText, styles.dangerText]}>
                Clear All App Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Optical Rx Now v1.0.0</Text>
          <Text style={styles.footerSubtext}>© 2025 Optical Rx Now</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2d45",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a2d45",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  sectionContent: {
    padding: 16,
    backgroundColor: "#0f1d2f",
  },
  analyticsSubtitle: {
    fontSize: 14,
    color: "#8899a6",
    marginBottom: 16,
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  metricLabel: {
    fontSize: 12,
    color: "#8899a6",
    textAlign: "center",
  },
  analyticsCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  analyticsCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  analyticsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  analyticsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  analyticsLabel: {
    fontSize: 14,
    color: "#8899a6",
  },
  analyticsValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  valueCard: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
    marginTop: 8,
    marginBottom: 12,
  },
  valueText: {
    fontSize: 13,
    color: "#8899a6",
    marginBottom: 6,
    lineHeight: 18,
  },
  affiliateNote: {
    fontSize: 13,
    color: "#4CAF50",
    marginBottom: 12,
    fontWeight: "600",
  },
  affiliateCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#4a9eff",
  },
  affiliateCardDisabled: {
    opacity: 0.5,
    borderColor: "#3a4d63",
  },
  affiliateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  affiliateInfo: {
    flex: 1,
    marginRight: 12,
  },
  affiliateTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  affiliateName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  affiliateCommission: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a9eff",
    marginBottom: 4,
  },
  affiliateDescription: {
    fontSize: 13,
    color: "#8899a6",
  },
  affiliateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4a9eff",
  },
  affiliateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a9eff",
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#8899a6",
    lineHeight: 18,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  linkInfo: {
    flex: 1,
  },
  linkName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 13,
    color: "#6b7c8f",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4a9eff",
  },
  dangerButton: {
    backgroundColor: "rgba(255, 92, 92, 0.1)",
    borderWidth: 1,
    borderColor: "#ff5c5c",
  },
  dangerText: {
    color: "#ff5c5c",
  },
  footer: {
    alignItems: "center",
    padding: 24,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#8899a6",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#6b7c8f",
  },
});
