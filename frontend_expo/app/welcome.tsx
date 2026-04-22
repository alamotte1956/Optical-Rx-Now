import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert, ScrollView, Share, Linking, Pressable, Vibration } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStats, requestNotificationPermissions, getSettings, ReminderSetting } from "../services/localStorage";
import * as Haptics from "expo-haptics";

const AGE_VERIFIED_KEY = "@optical_rx_age_verified";

const DEFAULT_REMINDERS = [
  { days: 30, label: "30 days", enabled: true },
  { days: 14, label: "14 days", enabled: true },
  { days: 7, label: "7 days", enabled: true },
  { days: 2, label: "2 days", enabled: true },
  { days: 0, label: "Same day", enabled: true },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ familyMembers: 0, totalPrescriptions: 0 });
  const [reminderSettings, setReminderSettings] = useState<ReminderSetting[]>(DEFAULT_REMINDERS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadStats();
      loadReminderSettings();
    }, [])
  );

  useEffect(() => {
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

  const loadReminderSettings = async () => {
    try {
      const settings = await getSettings();
      setNotificationsEnabled(settings.notificationsEnabled);
      if (settings.reminderDays) {
        setReminderSettings(settings.reminderDays);
      }
    } catch (error) {
      console.log("Error loading reminder settings:", error);
    }
  };

  const getActiveRemindersText = () => {
    const activeReminders = reminderSettings.filter(r => r.enabled);
    if (!notificationsEnabled || activeReminders.length === 0) {
      return "Off";
    }
    return activeReminders.map(r => r.label).join(", ");
  };

  const handleGetStarted = () => {
    router.push("/(tabs)");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Check out My Optical Wallet - the easiest way to store and manage your family's eyeglass and contact lens prescriptions! Download it now: https://play.google.com/store/apps/details?id=com.opticalrxnow.mobile.v1",
        title: "My Optical Wallet",
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

  // Long press handler for admin access
  const handleLogoLongPress = async () => {
    console.log("Long press detected - navigating to admin");
    // Provide haptic feedback
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Fallback to vibration if haptics not available
      Vibration.vibrate(100);
    }
    router.push("/admin");
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
          {/* Logo - Long press for 2 seconds to access Admin */}
          <Pressable 
            style={({ pressed }) => [
              styles.logoContainer,
              pressed && styles.logoPressed
            ]}
            onLongPress={handleLogoLongPress}
            delayLongPress={2000}
          >
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Pressable>

          {/* Title */}
          <Text style={styles.subtitle}>
            Store your family's eyeglass and contact Lens documents
          </Text>

          {/* Open My Vault / Get Started Button */}
          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {stats.familyMembers > 0 ? "Open My Wallet" : "Get Started"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Quick Add Prescription Buttons */}
          {stats.familyMembers > 0 && (
            <View style={styles.quickAddContainer}>
              <Text style={styles.quickAddLabel}>Quick Add:</Text>
              <View style={styles.quickAddButtons}>
                <TouchableOpacity 
                  style={styles.quickAddButtonGlasses}
                  onPress={() => router.push("/add-rx?type=eyeglass")}
                >
                  <Ionicons name="glasses-outline" size={20} color="#fff" />
                  <Text style={styles.quickAddButtonText}>Glasses Rx</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickAddButtonContacts}
                  onPress={() => router.push("/add-rx?type=contact")}
                >
                  <Ionicons name="eye-outline" size={20} color="#fff" />
                  <Text style={styles.quickAddButtonText}>Contacts Rx</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Find Optical Stores Button - Links to shop */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push("/shop")}
          >
            <Ionicons name="storefront" size={22} color="#4a9eff" />
            <Text style={styles.secondaryButtonText}>Find Retail Optical Stores</Text>
          </TouchableOpacity>

          {/* Family Management Section */}
          <View style={styles.familySection}>
            <Text style={styles.sectionTitle}>Family Management</Text>
            <View style={styles.familyButtons}>
              <TouchableOpacity 
                style={styles.familyButton}
                onPress={() => router.push("/add-member")}
              >
                <Ionicons name="person-add" size={24} color="#4CAF50" />
                <Text style={styles.familyButtonText}>Add Family Member</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.familyButton}
                onPress={() => router.push("/(tabs)/family")}
              >
                <Ionicons name="people" size={24} color="#4a9eff" />
                <Text style={styles.familyButtonText}>View & Delete Members</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Legal Section - Opens Website URLs */}
          <View style={styles.legalSection}>
            <TouchableOpacity 
              style={styles.legalButton}
              onPress={() => Linking.openURL("https://www.MyOpticalWallet.com/privacy")}
            >
              <Ionicons name="shield-checkmark" size={18} color="#6b7c8f" />
              <Text style={styles.legalButtonText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>|</Text>
            <TouchableOpacity 
              style={styles.legalButton}
              onPress={() => Linking.openURL("https://www.MyOpticalWallet.com/terms")}
            >
              <Ionicons name="document-text" size={18} color="#6b7c8f" />
              <Text style={styles.legalButtonText}>Terms of Service</Text>
            </TouchableOpacity>
          </View>

          {/* Ad Banner Placeholder */}
          <TouchableOpacity 
            style={styles.adPlaceholder}
            onPress={() => Linking.openURL("mailto:alamotte1956@gmail.com?subject=Advertising%20Inquiry")}
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

          {/* Version Number */}
          <Text style={styles.versionText}>Version 1.0.2</Text>
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
  logoPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
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
  quickAddContainer: {
    width: "100%",
    marginBottom: 16,
  },
  quickAddLabel: {
    fontSize: 13,
    color: "#6b7c8f",
    marginBottom: 8,
    textAlign: "center",
  },
  quickAddButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  quickAddButtonGlasses: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4a9eff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  quickAddButtonContacts: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  quickAddButtonText: {
    fontSize: 14,
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
    marginBottom: 8,
  },
  resetButtonText: {
    fontSize: 12,
    color: "#6b7c8f",
    textDecorationLine: "underline",
  },
  versionText: {
    fontSize: 12,
    color: "#4a5568",
    textAlign: "center",
    marginBottom: 24,
  },
  familySection: {
    width: "100%",
    backgroundColor: "rgba(74, 158, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  familyButtons: {
    flexDirection: "row",
    gap: 12,
  },
  familyButton: {
    flex: 1,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  familyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  legalSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  legalButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  legalButtonText: {
    fontSize: 14,
    color: "#6b7c8f",
  },
  legalDivider: {
    color: "#3a4d63",
  },
  reminderSection: {
    width: "100%",
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.3)",
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reminderIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 152, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  reminderSubtitle: {
    fontSize: 13,
    color: "#8899a6",
  },
  reminderStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 152, 0, 0.2)",
  },
  reminderStatusText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "500",
  },
  reminderStatusOff: {
    color: "#ff5c5c",
  },
  rateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFD700",
  },
});
