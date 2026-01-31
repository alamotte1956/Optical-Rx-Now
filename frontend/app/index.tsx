import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ family_members: 0, total_prescriptions: 0 });

  useEffect(() => {
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
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Optical Rx Now</Text>
        <Text style={styles.subtitle}>
          Store and manage your family's eyeglass and contact lens prescriptions
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="camera" size={24} color="#4a9eff" />
            <Text style={styles.featureText}>Capture Rx photos</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="people" size={24} color="#4a9eff" />
            <Text style={styles.featureText}>Organize by family member</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="share" size={24} color="#4a9eff" />
            <Text style={styles.featureText}>Share or print anytime</Text>
          </View>
        </View>

        {/* Stats (if returning user) */}
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

        {/* CTA Button */}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: "center",
  },
  logoContainer: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(74, 158, 255, 0.05)",
    borderRadius: 12,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 16,
  },
  statsContainer: {
    width: "100%",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a9eff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: "auto",
    marginBottom: 32,
    width: "100%",
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
