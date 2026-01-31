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

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface AnalyticsData {
  summary: {
    total_downloads: number;
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    new_users_this_week: number;
    new_users_this_month: number;
  };
  platforms: {
    ios: number;
    android: number;
    web: number;
  };
  engagement: {
    ad_clicks_30d: number;
    affiliate_clicks_30d: number;
    total_prescriptions: number;
    total_family_members: number;
  };
  daily_breakdown: Array<{
    date: string;
    active_users: number;
    new_users: number;
  }>;
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
      const response = await fetch(`${BACKEND_URL}/api/analytics/dashboard`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
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
          <Ionicons name="megaphone" size={24} color="#f5a623" />
          <View style={styles.pitchContent}>
            <Text style={styles.pitchTitle}>Advertiser Pitch Ready</Text>
            <Text style={styles.pitchText}>
              Use these metrics to pitch to advertisers
            </Text>
          </View>
        </View>

        {/* Key Metrics */}
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Downloads"
            value={data?.summary.total_downloads || 0}
            icon="download"
            color="#4CAF50"
          />
          <StatCard
            title="Monthly Active"
            value={data?.summary.monthly_active_users || 0}
            icon="people"
            color="#4a9eff"
          />
          <StatCard
            title="Weekly Active"
            value={data?.summary.weekly_active_users || 0}
            icon="calendar"
            color="#9c27b0"
          />
          <StatCard
            title="Daily Active"
            value={data?.summary.daily_active_users || 0}
            icon="today"
            color="#ff9800"
          />
        </View>

        {/* Growth */}
        <Text style={styles.sectionTitle}>Growth</Text>
        <View style={styles.growthCard}>
          <View style={styles.growthRow}>
            <View style={styles.growthItem}>
              <Text style={styles.growthValue}>
                +{data?.summary.new_users_this_week || 0}
              </Text>
              <Text style={styles.growthLabel}>New this week</Text>
            </View>
            <View style={styles.growthDivider} />
            <View style={styles.growthItem}>
              <Text style={styles.growthValue}>
                +{data?.summary.new_users_this_month || 0}
              </Text>
              <Text style={styles.growthLabel}>New this month</Text>
            </View>
          </View>
        </View>

        {/* Platform Breakdown */}
        <Text style={styles.sectionTitle}>Platform Breakdown</Text>
        <View style={styles.platformCard}>
          <View style={styles.platformRow}>
            <View style={styles.platformItem}>
              <Ionicons name="logo-apple" size={28} color="#fff" />
              <Text style={styles.platformValue}>{data?.platforms.ios || 0}</Text>
              <Text style={styles.platformLabel}>iOS</Text>
            </View>
            <View style={styles.platformItem}>
              <Ionicons name="logo-android" size={28} color="#3DDC84" />
              <Text style={styles.platformValue}>{data?.platforms.android || 0}</Text>
              <Text style={styles.platformLabel}>Android</Text>
            </View>
            <View style={styles.platformItem}>
              <Ionicons name="globe" size={28} color="#4a9eff" />
              <Text style={styles.platformValue}>{data?.platforms.web || 0}</Text>
              <Text style={styles.platformLabel}>Web</Text>
            </View>
          </View>
        </View>

        {/* Engagement */}
        <Text style={styles.sectionTitle}>Engagement (30 Days)</Text>
        <View style={styles.engagementCard}>
          <View style={styles.engagementRow}>
            <View style={styles.engagementItem}>
              <Ionicons name="megaphone" size={20} color="#f5a623" />
              <Text style={styles.engagementValue}>{data?.engagement.ad_clicks_30d || 0}</Text>
              <Text style={styles.engagementLabel}>Ad Clicks</Text>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name="cart" size={20} color="#4CAF50" />
              <Text style={styles.engagementValue}>{data?.engagement.affiliate_clicks_30d || 0}</Text>
              <Text style={styles.engagementLabel}>Affiliate Clicks</Text>
            </View>
          </View>
        </View>

        {/* Content Stats */}
        <Text style={styles.sectionTitle}>Content Created</Text>
        <View style={styles.contentCard}>
          <View style={styles.contentRow}>
            <View style={styles.contentItem}>
              <Text style={styles.contentValue}>{data?.engagement.total_prescriptions || 0}</Text>
              <Text style={styles.contentLabel}>Prescriptions Stored</Text>
            </View>
            <View style={styles.contentItem}>
              <Text style={styles.contentValue}>{data?.engagement.total_family_members || 0}</Text>
              <Text style={styles.contentLabel}>Family Members</Text>
            </View>
          </View>
        </View>

        {/* Daily Breakdown */}
        <Text style={styles.sectionTitle}>Last 7 Days</Text>
        <View style={styles.dailyCard}>
          {data?.daily_breakdown.map((day, index) => (
            <View key={day.date} style={styles.dailyRow}>
              <Text style={styles.dailyDate}>
                {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </Text>
              <View style={styles.dailyStats}>
                <Text style={styles.dailyActive}>{day.active_users} active</Text>
                <Text style={styles.dailyNew}>+{day.new_users} new</Text>
              </View>
            </View>
          ))}
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
