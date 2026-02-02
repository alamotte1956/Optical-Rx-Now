import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert, ScrollView, Share } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AdBanner from "./components/AdBanner";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ family_members: 0, total_prescriptions: 0 });

  useEffect(() => {
    // Track app open for analytics (async, non-blocking)
    const trackOpen = async () => {
      try {
        const { trackAppOpen } = await import("../services/analytics");
        trackAppOpen();
      } catch (e) {
        console.log("Analytics not available");
      }
    };
    trackOpen();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.log("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    router.push("/(tabs)");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Check out Optical Rx Now - the easiest way to store and manage your family's eyeglass and contact lens prescriptions! Download it now.",
        title: "Optical Rx Now",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const handleAdminAccess = () => {
    Alert.alert(
      "Admin Area",
      "Choose an option:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Analytics Dashboard", onPress: () => router.push("/admin") },
        { text: "Manage Affiliates", onPress: () => router.push("/manage-affiliates") },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Share Button in Header */}
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#4a9eff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo - Long press for admin access */}
          <TouchableOpacity 
            style={styles.logoContainer}
            onLongPress={handleAdminAccess}
            delayLongPress={500}
            activeOpacity={0.8}
          >
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Optical Rx Now</Text>
          <Text style={styles.subtitle}>
            Store and manage your family's eyeglass and contact lens prescriptions
          </Text>

          {/* Need New Eyewear Button (Ad Banner) */}
          <View style={styles.adContainer}>
            <AdBanner />
          </View>

          {/* Open My Vault / Get Started Button */}
          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {stats.family_members > 0 ? "Open My Vault" : "Get Started"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Your Vault Stats (if returning user) */}
          {!loading && (stats.family_members > 0 || stats.total_prescriptions > 0) && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Your Vault</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.family_members}</Text>
                  <Text style={styles.statLabel}>Family Members</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.total_prescriptions}</Text>
                  <Text style={styles.statLabel}>Prescriptions</Text>
                </View>
              </View>
            </View>
          )}

          {/* Future Ad Banner Placeholder */}
          <View style={styles.adPlaceholder}>
            <Ionicons name="megaphone-outline" size={24} color="#6b7c8f" />
            <Text style={styles.adPlaceholderText}>Ad Space</Text>
          </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerPlaceholder: {
    width: 44,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: "center",
  },
  logoContainer: {
    width: 400,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  adContainer: {
    width: "100%",
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a9eff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 16,
    width: "100%",
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  statsContainer: {
    width: "100%",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4a9eff",
  },
  statLabel: {
    fontSize: 12,
    color: "#8899a6",
    marginTop: 4,
  },
  adPlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: "rgba(74, 158, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 158, 255, 0.2)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  adPlaceholderText: {
    fontSize: 14,
    color: "#6b7c8f",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
