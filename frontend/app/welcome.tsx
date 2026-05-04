import { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert, ScrollView, Share, Linking, Pressable, Vibration, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStats, requestNotificationPermissions, getSettings, ReminderSetting } from "../services/localStorage";
import * as Haptics from "expo-haptics";
import { isSmallDevice, isLargeDevice, moderateScale } from "../services/responsive";
import { useTranslation } from "../services/i18n";
import { useTheme } from "../services/theme";
import { exportAllToPDF } from "../services/pdfExport";
import BannerCarousel from "../components/BannerCarousel";
import { logAnalyticsEvent } from "../services/adminApi";

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
  const { t } = useTranslation();
  const { theme, isDark, setMode, mode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ familyMembers: 0, totalPrescriptions: 0 });
  const [reminderSettings, setReminderSettings] = useState<ReminderSetting[]>(DEFAULT_REMINDERS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Shimmer animation for logo
  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.75, 1, 0.75],
  });

  const shimmerScale = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.03, 1],
  });

  useFocusEffect(
    useCallback(() => {
      loadStats();
      loadReminderSettings();
    }, [])
  );

  useEffect(() => {
    requestNotificationPermissions();
    // Track app open
    logAnalyticsEvent("app_open").catch(() => {});
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
      logAnalyticsEvent("share_click").catch(() => {});
      await Share.share({
        message: `${t("share_message")} https://play.google.com/store/apps/details?id=com.opticalrxnow.mobile.v1`,
        title: "My Optical Wallet",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Share Button in Header */}
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#4a9eff" />
        </TouchableOpacity>
      </View>

      {/* Logo - Long press for admin access */}
      <View style={{ alignItems: "center", paddingTop: 0 }}>
        <TouchableOpacity 
          style={styles.logoContainer}
          onLongPress={handleLogoLongPress}
          delayLongPress={1200}
          activeOpacity={0.7}
        >
          <Animated.Image
            source={require("../assets/images/logo.png")}
            style={[styles.logo, { opacity: shimmerOpacity, transform: [{ scale: shimmerScale }] }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={[styles.appName, { color: "#4a9eff" }]}>My Optical Wallet</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Title */}
          <Text style={styles.subtitle}>
            {t("welcome_subtitle")}
          </Text>

          {/* Open My Wallet / Get Started Button */}
          <TouchableOpacity style={styles.button} onPress={handleGetStarted} accessibilityLabel="Get Started" accessibilityRole="button" accessibilityHint="Opens your optical wallet">
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {stats.familyMembers > 0 ? t("open_wallet") : t("get_started")}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Dynamic Banner Carousel */}
          <BannerCarousel />

          {/* Find Optical Stores Button - Links to shop */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push("/shop")}
          >
            <Ionicons name="storefront" size={22} color="#4a9eff" />
            <Text style={styles.secondaryButtonText}>{t("find_stores")}</Text>
          </TouchableOpacity>

          {/* Insurance Cards Button */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push("/insurance-cards")}
          >
            <Ionicons name="card-outline" size={22} color="#4a9eff" />
            <Text style={styles.secondaryButtonText}>Insurance Cards</Text>
          </TouchableOpacity>

          {/* Language Settings */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push("/language-settings")}
          >
            <Ionicons name="globe-outline" size={22} color="#4a9eff" />
            <Text style={styles.secondaryButtonText}>{t("language_settings")}</Text>
          </TouchableOpacity>

          {/* Dark/Light Mode Toggle */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setMode(isDark ? "light" : "dark")}
          >
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color="#4a9eff" />
            <Text style={styles.secondaryButtonText}>{isDark ? "Light Mode" : "Dark Mode"}</Text>
          </TouchableOpacity>

          {/* Export PDF Button */}
          {stats.totalPrescriptions > 0 && (
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={async () => {
                try {
                  await exportAllToPDF();
                } catch (error) {
                  Alert.alert("Error", "Unable to generate PDF. Please try again.");
                }
              }}
            >
              <Ionicons name="document-outline" size={22} color="#4a9eff" />
              <Text style={styles.secondaryButtonText}>Export All to PDF</Text>
            </TouchableOpacity>
          )}

          {/* Legal Section - Privacy & Terms at the very bottom */}
          <View style={styles.legalSection}>
            <TouchableOpacity 
              style={styles.legalButton}
              onPress={() => Linking.openURL("https://www.MyOpticalWallet.com/privacy")}
            >
              <Ionicons name="shield-checkmark" size={18} color="#6b7c8f" />
              <Text style={styles.legalButtonText}>{t("privacy_policy")}</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>|</Text>
            <TouchableOpacity 
              style={styles.legalButton}
              onPress={() => Linking.openURL("https://www.MyOpticalWallet.com/terms")}
            >
              <Ionicons name="document-text" size={18} color="#6b7c8f" />
              <Text style={styles.legalButtonText}>{t("terms_of_service")}</Text>
            </TouchableOpacity>
          </View>

          {/* Version Number */}
          <Text style={styles.versionText}>{t("version")} 2.0.1</Text>
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
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingTop: 0,
    alignItems: "center",
  },
  logoContainer: {
    width: isSmallDevice ? 240 : isLargeDevice ? 340 : 300,
    height: isSmallDevice ? 145 : isLargeDevice ? 225 : 185,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: isSmallDevice ? 0 : 0,
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
    fontSize: moderateScale(15),
    color: "#8899a6",
    textAlign: "center",
    marginBottom: isSmallDevice ? 12 : 16,
    lineHeight: moderateScale(22),
  },
  appName: {
    fontSize: moderateScale(34),
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: isSmallDevice ? 4 : 8,
    letterSpacing: 0.5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a9eff",
    paddingVertical: isSmallDevice ? 12 : 16,
    paddingHorizontal: isSmallDevice ? 24 : 32,
    borderRadius: 30,
    marginBottom: isSmallDevice ? 8 : 12,
    width: "100%",
    gap: 8,
  },
  buttonText: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    paddingVertical: isSmallDevice ? 10 : 14,
    paddingHorizontal: isSmallDevice ? 16 : 24,
    borderRadius: 12,
    marginBottom: isSmallDevice ? 8 : 12,
    width: "100%",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(74, 158, 255, 0.3)",
  },
  secondaryButtonText: {
    fontSize: moderateScale(16),
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
    padding: isSmallDevice ? 12 : 16,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#fff",
    marginBottom: isSmallDevice ? 8 : 12,
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
