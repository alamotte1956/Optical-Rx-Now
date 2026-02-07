import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert, ScrollView, Share, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStats } from "../services/localStorage";
import * as Haptics from "expo-haptics";
<<<<<<< HEAD
=======
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";
import AffiliateCard from "../components/AffiliateCard";
import affiliateData from "../data/affiliates.json";
>>>>>>> 06da9d7 (feat: Add affiliate links to welcome page and admin dashboard)

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
      const data = await getStats();
      setStats(data);
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
      console.error("Error sharing:", error);
      Alert.alert(
        'Sharing Failed',
        'Unable to share at this time. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleAdminAccess = async () => {
    // Provide haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Haptic feedback error:', error);
      // Continue with admin access even if haptic fails
    }
    
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
        {/* Banner Ad Placeholder */}
        <View style={styles.bannerAdPlaceholder}>
          <Text style={styles.adPlaceholderText}>Advertisement</Text>
          <View style={styles.adPlaceholderInner}>
            <Text style={styles.adPlaceholderInner}>Banner Ad Space</Text>
            <Text style={styles.adPlaceholderSubtext}>320x50 Mobile Banner</Text>
          </View>
        </View>

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
          <Text style={styles.subtitle}>
            Store and manage your family&apos;s eyeglass and contact lens prescriptions
          </Text>

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

          {/* Find Optometrist Button */}
          <TouchableOpacity style={styles.findOptometristButton} onPress={() => router.push('/find-optometrist')}>
            <View style={styles.findOptometristIcon}>
              <Ionicons name="location" size={28} color="#4a9eff" />
            </View>
            <View style={styles.findOptometristText}>
              <Text style={styles.findOptometristTitle}>Find Eye Care Near You</Text>
              <Text style={styles.findOptometristSubtitle}>Locate optometrists and eye doctors</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4a9eff" />
          </TouchableOpacity>

          {/* Featured Affiliates */}
          <View style={styles.affiliatesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Optical Partners</Text>
              <TouchableOpacity onPress={() => router.push('/shop')} style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#4a9eff" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.affiliatesScroll}>
              {affiliateData.filter(affiliate => affiliate.is_featured && affiliate.is_active).slice(0, 3).map(partner => (
                <View key={partner.id} style={styles.affiliateCardMini}>
                  <AffiliateCard partner={partner} />
                </View>
              ))}
            </ScrollView>
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
  bannerAdPlaceholder: {
    backgroundColor: "#1a2d45",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2a4d6f",
  },
  adPlaceholderText: {
    fontSize: 10,
    color: "#6b7c8f",
    textAlign: "center",
    paddingVertical: 4,
  },
  adPlaceholderInner: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f1d30",
  },
  adPlaceholderSubtext: {
    fontSize: 10,
    color: "#6b7c8f",
    marginTop: 2,
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
  affiliatesSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4a9eff',
    marginRight: 4,
  },
  affiliatesScroll: {
    paddingHorizontal: 20,
  },
  affiliateCardMini: {
    width: 280,
    marginRight: 12,
  },
  findOptometristButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2d45',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a4d6f',
  },
  findOptometristIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a9eff20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  findOptometristText: {
    flex: 1,
    marginLeft: 12,
  },
  findOptometristTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  findOptometristSubtitle: {
    fontSize: 13,
    color: '#8899a6',
  },
});
