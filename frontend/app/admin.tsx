import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFamilyMembers, getPrescriptions } from "../services/localStorage";
import { getLocalStats } from "../services/analytics";

interface AnalyticsData {
  summary: {
    total_family_members: number;
    total_prescriptions: number;
    app_opens_7d: number;
    app_opens_30d: number;
  };
  prescriptions_by_type: {
    eyeglass: number;
    contact: number;
  };
  recent_activity: Record<string, number>;
  generated_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get local data stats
      const members = await getFamilyMembers();
      const prescriptions = await getPrescriptions();
      const eventStats = await getLocalStats();
      
      const analyticsData: AnalyticsData = {
        summary: {
          total_family_members: members.length,
          total_prescriptions: prescriptions.length,
          app_opens_7d: eventStats.last_7_days,
          app_opens_30d: eventStats.last_30_days,
        },
        prescriptions_by_type: {
          eyeglass: prescriptions.filter(p => p.rx_type === 'eyeglass').length,
          contact: prescriptions.filter(p => p.rx_type === 'contact').length,
        },
        recent_activity: eventStats.by_type,
        generated_at: new Date().toISOString(),
      };
      
      setData(analyticsData);
    } catch (error) {
      console.error("Error calculating stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const StatCard = ({ title, value, icon, color = "#4a9eff" }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <TouchableOpacity onPress={() => { setRefreshing(true); fetchAnalytics(); }}>
          <Ionicons name="refresh" size={24} color="#4a9eff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAnalytics(); }}
            tintColor="#4a9eff"
          />
        }
      >
        {/* Pitch Banner */}
        <View style={styles.pitchBanner}>
          <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
          <View style={styles.pitchContent}>
            <Text style={styles.pitchTitle}>Local-Only Analytics</Text>
            <Text style={styles.pitchText}>
              All data stored securely on your device
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/manage-affiliates")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="link" size={24} color="#4a9eff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Affiliate Links</Text>
            <Text style={styles.actionText}>Add, edit, or update your affiliate URLs</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6b7c8f" />
        </TouchableOpacity>

        {/* Key Metrics */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Key Metrics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Family Members"
            value={data?.summary.total_family_members || 0}
            icon="people"
            color="#4a9eff"
          />
          <StatCard
            title="Prescriptions"
            value={data?.summary.total_prescriptions || 0}
            icon="document-text"
            color="#4CAF50"
          />
          <StatCard
            title="Opens (7d)"
            value={data?.summary.app_opens_7d || 0}
            icon="calendar"
            color="#9c27b0"
          />
          <StatCard
            title="Opens (30d)"
            value={data?.summary.app_opens_30d || 0}
            icon="today"
            color="#ff9800"
          />
        </View>

        {/* Prescription Types */}
        <Text style={styles.sectionTitle}>Prescriptions by Type</Text>
        <View style={styles.growthCard}>
          <View style={styles.growthRow}>
            <View style={styles.growthItem}>
              <Text style={styles.growthValue}>
                {data?.prescriptions_by_type.eyeglass || 0}
              </Text>
              <Text style={styles.growthLabel}>Eyeglass</Text>
            </View>
            <View style={styles.growthDivider} />
            <View style={styles.growthItem}>
              <Text style={styles.growthValue}>
                {data?.prescriptions_by_type.contact || 0}
              </Text>
              <Text style={styles.growthLabel}>Contact Lens</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.contentCard}>
          {Object.entries(data?.recent_activity || {}).map(([type, count]) => (
            <View key={type} style={styles.activityRow}>
              <Text style={styles.activityType}>
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <Text style={styles.activityCount}>{count as number}</Text>
            </View>
          ))}
          {Object.keys(data?.recent_activity || {}).length === 0 && (
            <Text style={styles.noActivityText}>No activity recorded yet</Text>
          )}
        </View>

        {/* Last Updated */}
        <Text style={styles.timestamp}>
          Last updated: {data?.generated_at ? new Date(data.generated_at).toLocaleString() : "N/A"}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#8899a6",
    marginTop: 16,
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
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  pitchBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 166, 35, 0.15)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  pitchContent: {
    flex: 1,
  },
  pitchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f5a623",
  },
  pitchText: {
    fontSize: 13,
    color: "#8899a6",
    marginTop: 2,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  actionText: {
    fontSize: 13,
    color: "#8899a6",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  statTitle: {
    fontSize: 12,
    color: "#8899a6",
    marginTop: 4,
    textAlign: "center",
  },
  growthCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  growthRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  growthItem: {
    flex: 1,
    alignItems: "center",
  },
  growthDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#3a4d63",
  },
  growthValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  growthLabel: {
    fontSize: 12,
    color: "#8899a6",
    marginTop: 4,
  },
  platformCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  platformRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  platformItem: {
    alignItems: "center",
  },
  platformValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  platformLabel: {
    fontSize: 12,
    color: "#8899a6",
    marginTop: 4,
  },
  engagementCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  engagementRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  engagementItem: {
    alignItems: "center",
  },
  engagementValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  engagementLabel: {
    fontSize: 12,
    color: "#8899a6",
    marginTop: 4,
  },
  contentCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  contentItem: {
    alignItems: "center",
  },
  contentValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4a9eff",
  },
  contentLabel: {
    fontSize: 12,
    color: "#8899a6",
    marginTop: 4,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#0f1d30",
  },
  activityType: {
    fontSize: 14,
    color: "#fff",
  },
  activityCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4a9eff",
  },
  noActivityText: {
    fontSize: 14,
    color: "#8899a6",
    textAlign: "center",
    paddingVertical: 20,
  },
  dailyCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  dailyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#0f1d30",
  },
  dailyDate: {
    fontSize: 14,
    color: "#fff",
  },
  dailyStats: {
    flexDirection: "row",
    gap: 16,
  },
  dailyActive: {
    fontSize: 13,
    color: "#4a9eff",
  },
  dailyNew: {
    fontSize: 13,
    color: "#4CAF50",
  },
  timestamp: {
    fontSize: 11,
    color: "#6b7c8f",
    textAlign: "center",
  },
});
