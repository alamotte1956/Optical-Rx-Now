import React from "react";
import { View, Text, Alert, Platform } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Section } from "./Section";
import { MetricCard } from "./MetricCard";
import { adminStyles as styles } from "../../styles/adminStyles";
import type { AnalyticsDashboard as AnalyticsDashboardType } from "../../services/adminApi";

interface Props {
  analytics: AnalyticsDashboardType | null;
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}

export const AnalyticsDashboard: React.FC<Props> = ({ analytics, expanded, onToggle, onRefresh }) => {
  const handleGenerateReport = async () => {
    try {
      const baseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL
        || process.env.EXPO_PUBLIC_BACKEND_URL
        || "https://optical-rx-now-production.up.railway.app";
      const reportUrl = `${baseUrl}/api/reports/weekly`;

      if (Platform.OS === "web") {
        const { default: Linking } = await import("react-native");
        await Linking.openURL(reportUrl);
      } else {
        const FileSystem = await import("expo-file-system");
        const Sharing = await import("expo-sharing");
        const filename = `MOW_Weekly_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
        const fileUri = FileSystem.documentDirectory + filename;
        const download = await FileSystem.downloadAsync(reportUrl, fileUri);
        if (download.status === 200) {
          await Sharing.shareAsync(download.uri, {
            mimeType: "application/pdf",
            dialogTitle: "Weekly PDF Report",
          });
        } else {
          Alert.alert("Error", "Failed to download report. Status: " + download.status);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", "Could not generate report: " + (error.message || "Unknown error"));
    }
  };

  return (
    <Section
      title="Analytics Dashboard"
      icon="analytics-outline"
      iconColor="#4a9eff"
      expanded={expanded}
      onToggle={onToggle}
      badge={analytics ? String(analytics.summary.total_events) : undefined}
    >
      {analytics ? (
        <>
          {/* Android vs iOS Split View */}
          {analytics.platform_events && (() => {
            const androidData = analytics.platform_events["android"] || {};
            const iosData = analytics.platform_events["ios"] || {};
            const webData = analytics.platform_events["web"] || {};
            const androidTotal = Object.values(androidData).reduce((a, b) => a + b, 0);
            const iosTotal = Object.values(iosData).reduce((a, b) => a + b, 0);
            const webTotal = Object.values(webData).reduce((a, b) => a + b, 0);

            return (
              <>
                <View style={styles.platformSplitHeader}>
                  <View style={styles.platformSplitTab}>
                    <Ionicons name="logo-android" size={20} color="#3DDC84" />
                    <Text style={[styles.platformSplitTitle, { color: "#3DDC84" }]}>Android</Text>
                  </View>
                  <View style={styles.platformSplitTab}>
                    <Ionicons name="logo-apple" size={20} color="#fff" />
                    <Text style={[styles.platformSplitTitle, { color: "#fff" }]}>iOS</Text>
                  </View>
                </View>

                {/* App Opens */}
                <View style={styles.platformSplitRow}>
                  <View style={[styles.platformSplitCell, { borderRightWidth: 1, borderRightColor: "#1a2d45" }]}>
                    <Text style={[styles.platformSplitValue, { color: "#3DDC84" }]}>{androidData["app_open"] || 0}</Text>
                    <Text style={styles.platformSplitLabel}>App Opens</Text>
                  </View>
                  <View style={styles.platformSplitCell}>
                    <Text style={[styles.platformSplitValue, { color: "#fff" }]}>{iosData["app_open"] || 0}</Text>
                    <Text style={styles.platformSplitLabel}>App Opens</Text>
                  </View>
                </View>

                {/* Banner Views */}
                <View style={styles.platformSplitRow}>
                  <View style={[styles.platformSplitCell, { borderRightWidth: 1, borderRightColor: "#1a2d45" }]}>
                    <Text style={[styles.platformSplitValue, { color: "#3DDC84" }]}>{androidData["banner_view"] || 0}</Text>
                    <Text style={styles.platformSplitLabel}>Banner Views</Text>
                  </View>
                  <View style={styles.platformSplitCell}>
                    <Text style={[styles.platformSplitValue, { color: "#fff" }]}>{iosData["banner_view"] || 0}</Text>
                    <Text style={styles.platformSplitLabel}>Banner Views</Text>
                  </View>
                </View>

                {/* Banner Clicks */}
                <View style={styles.platformSplitRow}>
                  <View style={[styles.platformSplitCell, { borderRightWidth: 1, borderRightColor: "#1a2d45" }]}>
                    <Text style={[styles.platformSplitValue, { color: "#3DDC84" }]}>{androidData["banner_click"] || 0}</Text>
                    <Text style={styles.platformSplitLabel}>Banner Clicks</Text>
                  </View>
                  <View style={styles.platformSplitCell}>
                    <Text style={[styles.platformSplitValue, { color: "#fff" }]}>{iosData["banner_click"] || 0}</Text>
                    <Text style={styles.platformSplitLabel}>Banner Clicks</Text>
                  </View>
                </View>

                {/* Affiliate Clicks */}
                <View style={styles.platformSplitRow}>
                  <View style={[styles.platformSplitCell, { borderRightWidth: 1, borderRightColor: "#1a2d45" }]}>
                    <Text style={[styles.platformSplitValue, { color: "#3DDC84" }]}>{androidData["affiliate_click"] || 0}</Text>
                    <Text style={styles.platformSplitLabel}>Affiliate Clicks</Text>
                  </View>
                  <View style={styles.platformSplitCell}>
                    <Text style={[styles.platformSplitValue, { color: "#fff" }]}>{iosData["affiliate_click"] || 0}</Text>
                    <Text style={styles.platformSplitLabel}>Affiliate Clicks</Text>
                  </View>
                </View>

                {/* Shares */}
                <View style={styles.platformSplitRow}>
                  <View style={[styles.platformSplitCell, { borderRightWidth: 1, borderRightColor: "#1a2d45" }]}>
                    <Text style={[styles.platformSplitValue, { color: "#3DDC84" }]}>{androidData["share_click"] || 0}</Text>
                    <Text style={styles.platformSplitLabel}>Shares</Text>
                  </View>
                  <View style={styles.platformSplitCell}>
                    <Text style={[styles.platformSplitValue, { color: "#fff" }]}>{iosData["share_click"] || 0}</Text>
                    <Text style={styles.platformSplitLabel}>Shares</Text>
                  </View>
                </View>

                {/* Totals */}
                <View style={[styles.platformSplitRow, { backgroundColor: "#0f1d2f", borderRadius: 8, marginTop: 4 }]}>
                  <View style={[styles.platformSplitCell, { borderRightWidth: 1, borderRightColor: "#1a2d45" }]}>
                    <Text style={[styles.platformSplitValue, { color: "#3DDC84", fontSize: 22 }]}>{androidTotal}</Text>
                    <Text style={[styles.platformSplitLabel, { fontWeight: "700" }]}>Total Android</Text>
                  </View>
                  <View style={styles.platformSplitCell}>
                    <Text style={[styles.platformSplitValue, { color: "#fff", fontSize: 22 }]}>{iosTotal}</Text>
                    <Text style={[styles.platformSplitLabel, { fontWeight: "700" }]}>Total iOS</Text>
                  </View>
                </View>

                {/* Web summary */}
                {webTotal > 0 && (
                  <View style={[styles.platformSplitRow, { backgroundColor: "#0f1d2f", borderRadius: 8, marginTop: 4 }]}>
                    <View style={[styles.platformSplitCell, { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }]}>
                      <Ionicons name="globe-outline" size={18} color="#4a9eff" />
                      <Text style={[styles.platformSplitValue, { color: "#4a9eff", fontSize: 18 }]}>{webTotal}</Text>
                      <Text style={[styles.platformSplitLabel, { fontWeight: "700", marginTop: 0 }]}>Web Events</Text>
                    </View>
                  </View>
                )}
              </>
            );
          })()}

          <Text style={[styles.subsectionLabel, { marginTop: 16 }]}>Combined Totals</Text>
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
            <MetricCard value={analytics.affiliate_stats.total_affiliates} label="Affiliates" icon="people-outline" color="#E040FB" />
          </View>
          <RectButton style={styles.refreshRow} onPress={onRefresh}>
            <Ionicons name="refresh" size={16} color="#4a9eff" />
            <Text style={styles.refreshText}>Refresh Data</Text>
          </RectButton>

          {/* Platform Breakdown */}
          {analytics.platform_breakdown && Object.keys(analytics.platform_breakdown).length > 0 && (
            <>
              <Text style={styles.subsectionLabel}>Platform Breakdown</Text>
              <View style={styles.platformContainer}>
                {(() => {
                  const platformData = analytics.platform_breakdown;
                  const total = Object.values(platformData).reduce((a, b) => a + b, 0);
                  const platformConfig: Record<string, { icon: string; color: string; label: string }> = {
                    android: { icon: "logo-android", color: "#3DDC84", label: "Android" },
                    ios: { icon: "logo-apple", color: "#fff", label: "iOS" },
                    web: { icon: "globe-outline", color: "#4a9eff", label: "Web" },
                    unknown: { icon: "help-circle-outline", color: "#8899a6", label: "Unknown" },
                  };
                  return Object.entries(platformData)
                    .sort(([, a], [, b]) => b - a)
                    .map(([platform, count]) => {
                      const cfg = platformConfig[platform] || platformConfig.unknown;
                      const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
                      return (
                        <View key={platform} style={styles.platformCard}>
                          <View style={styles.platformIconRow}>
                            <Ionicons name={cfg.icon as any} size={28} color={cfg.color} />
                            <Text style={[styles.platformCount, { color: cfg.color }]}>{count}</Text>
                          </View>
                          <Text style={styles.platformLabel}>{cfg.label}</Text>
                          <View style={styles.platformBarBg}>
                            <View
                              style={[
                                styles.platformBarFill,
                                {
                                  backgroundColor: cfg.color,
                                  width: `${total > 0 ? (count / total) * 100 : 0}%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.platformPct}>{pct}%</Text>
                        </View>
                      );
                    });
                })()}
              </View>

              {/* Events by Platform */}
              {analytics.platform_events && Object.keys(analytics.platform_events).length > 0 && (
                <View style={styles.platformDetailSection}>
                  <Text style={[styles.subsectionLabel, { marginTop: 8 }]}>Events by Platform</Text>
                  {Object.entries(analytics.platform_events)
                    .sort(([, a], [, b]) => {
                      const sumA = Object.values(a).reduce((x, y) => x + y, 0);
                      const sumB = Object.values(b).reduce((x, y) => x + y, 0);
                      return sumB - sumA;
                    })
                    .map(([platform, events]) => {
                      const cfg: Record<string, { icon: string; color: string; label: string }> = {
                        android: { icon: "logo-android", color: "#3DDC84", label: "Android" },
                        ios: { icon: "logo-apple", color: "#fff", label: "iOS" },
                        web: { icon: "globe-outline", color: "#4a9eff", label: "Web" },
                        unknown: { icon: "help-circle-outline", color: "#8899a6", label: "Unknown" },
                      };
                      const c = cfg[platform] || cfg.unknown;
                      return (
                        <View key={platform} style={styles.platformEventCard}>
                          <View style={styles.platformEventHeader}>
                            <Ionicons name={c.icon as any} size={20} color={c.color} />
                            <Text style={[styles.platformEventTitle, { color: c.color }]}>{c.label}</Text>
                          </View>
                          {Object.entries(events)
                            .sort(([, a], [, b]) => b - a)
                            .map(([evt, cnt]) => (
                              <View key={evt} style={styles.platformEventRow}>
                                <Text style={styles.platformEventLabel}>
                                  {evt.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Text>
                                <Text style={styles.platformEventValue}>{cnt}</Text>
                              </View>
                            ))}
                        </View>
                      );
                    })}
                </View>
              )}
            </>
          )}

          <RectButton style={[styles.addButton, { backgroundColor: "#4a9eff", alignSelf: "center", marginTop: 8 }]} onPress={handleGenerateReport}>
            <Ionicons name="document-text" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Download Weekly PDF Report</Text>
          </RectButton>
        </>
      ) : (
        <Text style={styles.emptyText}>No analytics data available yet.</Text>
      )}
    </Section>
  );
};
