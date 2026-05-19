import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAdminData } from "../hooks/useAdminData";
import Constants from "expo-constants";
const APP_VERSION = Constants.expoConfig?.version || "2.2.1";
import { adminStyles as styles } from "../styles/adminStyles";
import {
  AnalyticsDashboard,
  FinancialOverview,
  BannerManagement,
  InvoiceManagement,
  AppManagementSection,
  DataManagementSection,
} from "../components/admin";

export default function AdminScreen() {
  const router = useRouter();
  const {
    backendOnline,
    loading,
    refreshing,
    analytics,
    financials,
    affiliates,
    banners,
    invoices,
    refreshData,
    onRefresh,
  } = useAdminData();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? null : s);

  // Loading state
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/welcome")}
            style={{ width: 36, height: 36, justifyContent: "center", alignItems: "center" }}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={20} color="#4a9eff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={styles.headerRight}>
          <View style={[styles.statusDot, { backgroundColor: backendOnline ? "#4CAF50" : "#ff5c5c" }]} />
          <Text style={styles.statusText}>{backendOnline ? "Online" : "Offline"}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />}
      >
        {/* Backend Status Warning */}
        {backendOnline === false && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#FF9800" />
            <Text style={styles.warningText}>Backend is offline. Some features may not work.</Text>
          </View>
        )}

        {/* Analytics Dashboard */}
        <AnalyticsDashboard
          analytics={analytics}
          expanded={expandedSection === "analytics"}
          onToggle={() => toggleSection("analytics")}
          onRefresh={onRefresh}
        />

        {/* Financial Overview */}
        <FinancialOverview
          financials={financials}
          expanded={expandedSection === "financial"}
          onToggle={() => toggleSection("financial")}
        />

        {/* Banner Management */}
        <BannerManagement
          banners={banners}
          expanded={expandedSection === "banners"}
          onToggle={() => toggleSection("banners")}
          refreshData={refreshData}
        />

        {/* Invoice Management */}
        <InvoiceManagement
          invoices={invoices}
          expanded={expandedSection === "invoices"}
          onToggle={() => toggleSection("invoices")}
          refreshData={refreshData}
        />

        {/* App Management */}
        <AppManagementSection
          expanded={expandedSection === "management"}
          onToggle={() => toggleSection("management")}
        />

        {/* Data Management */}
        <DataManagementSection
          expanded={expandedSection === "data"}
          onToggle={() => toggleSection("data")}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>My Optical Wallet v{APP_VERSION}</Text>
          <Text style={styles.footerSubtext}>Admin Panel • Backend {backendOnline ? "Connected" : "Disconnected"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
