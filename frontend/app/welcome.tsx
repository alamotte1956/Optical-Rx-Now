import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert, ScrollView, Share, Linking, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStats, requestNotificationPermissions } from "../services/localStorage";

const AGE_VERIFIED_KEY = "@optical_rx_age_verified";

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [stats, setStats] = useState({ familyMembers: 0, totalPrescriptions: 0 });

  useEffect(() => {
    loadStats();
    // Request notification permissions on first load
    requestNotificationPermissions();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.log("Error loading stats:", error);
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

  const handleResetAgeVerification = async () => {
    Alert.alert(
      "Reset Age Verification",
      "This will show the age verification screen again next time you open the app. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(AGE_VERIFIED_KEY);
              Alert.alert("Done", "Age verification has been reset. Close and reopen the app to see the verification screen.");
            } catch (error) {
              console.log("Error resetting age verification:", error);
            }
          },
        },
      ]
    );
  };

  // Long press handlers for admin access
  const handleLogoLongPressIn = () => {
    longPressTimer.current = setTimeout(() => {
      router.push("/admin");
    }, 3000); // 3 seconds
  };

  const handleLogoLongPressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
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
          {/* Logo - Long press for 3 seconds to access Admin */}
          <Pressable 
            style={styles.logoContainer}
            onPressIn={handleLogoLongPressIn}
            onPressOut={handleLogoLongPressOut}
          >
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Pressable>

          {/* Title */}
          <Text style={styles.subtitle}>
            Store and manage your family's eyeglass and contact lens prescriptions
          </Text>

          {/* Open My Vault / Get Started Button */}
          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {stats.familyMembers > 0 ? "Open My Vault" : "Get Started"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Find Optical Stores Button - Links to shop */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push("/shop")}
          >
            <Ionicons name="storefront" size={22} color="#4a9eff" />
            <Text style={styles.secondaryButtonText}>Find Retail Optical Stores</Text>
          </TouchableOpacity>

          {/* Find Optometrists Button */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push("/find-optometrists")}
          >
            <Ionicons name="eye" size={22} color="#4a9eff" />
            <Text style={styles.secondaryButtonText}>Find Optometrists Near Me</Text>
          </TouchableOpacity>

          {/* Notification Settings Button */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push("/notification-settings")}
          >
            <Ionicons name="notifications" size={22} color="#4a9eff" />
            <Text style={styles.secondaryButtonText}>Expiry Alert Settings</Text>
          </TouchableOpacity>

          {/* Ad Banner Placeholder */}
          <TouchableOpacity 
            style={styles.adPlaceholder}
            onPress={() => Linking.openURL("https://opticalrxnow.com")}
          >
            <Ionicons name="megaphone-outline" size={24} color="#4a9eff" />
            <Text style={styles.adPlaceholderText}>Advertise with us Here</Text>
          </TouchableOpacity>

          {/* Reset Age Verification - for testing */}
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleResetAgeVerification}
          >
            <Text style={styles.resetButtonText}>Reset Age Verification</Text>
          </TouchableOpacity>
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
    paddingTop: 10,
    alignItems: "center",
  },
  logoContainer: {
    width: 320,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  subtitle: {
    fontSize: 15,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 16,
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
    marginBottom: 12,
    width: "100%",
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(74, 158, 255, 0.3)",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a9eff",
  },
  adPlaceholder: {
    width: "100%",
    height: 80,
    backgroundColor: "rgba(74, 158, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 158, 255, 0.2)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  adPlaceholderText: {
    fontSize: 14,
    color: "#6b7c8f",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  resetButton: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  resetButtonText: {
    fontSize: 12,
    color: "#6b7c8f",
    textDecorationLine: "underline",
  },
});
