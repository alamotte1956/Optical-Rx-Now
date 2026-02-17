import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import {
  getSettings,
  saveSettings,
  getScheduledNotifications,
  requestNotificationPermissions,
} from "../services/localStorage";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    loadSettings();
    checkPermissions();
    loadScheduledNotifications();
  }, []);

  const loadSettings = async () => {
    const settings = await getSettings();
    setNotificationsEnabled(settings.notificationsEnabled);
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted(status === "granted");
  };

  const loadScheduledNotifications = async () => {
    const notifications = await getScheduledNotifications();
    // Filter out past notifications
    const upcoming = notifications.filter(
      (n) => new Date(n.triggerDate) > new Date()
    );
    setScheduledCount(upcoming.length);
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value && !permissionGranted) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to receive expiry alerts.",
          [{ text: "OK" }]
        );
        return;
      }
      setPermissionGranted(true);
    }

    setNotificationsEnabled(value);
    await saveSettings({ notificationsEnabled: value, email: null });
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
    if (!granted) {
      Alert.alert(
        "Permission Denied",
        "Please enable notifications in your device settings.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expiry Alerts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="notifications" size={32} color="#4a9eff" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Never Miss an Expiration</Text>
            <Text style={styles.infoText}>
              Get notified when your prescriptions are about to expire so you can schedule an eye exam in time.
            </Text>
          </View>
        </View>

        {/* Alert Schedule */}
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>Alert Schedule</Text>
          <Text style={styles.scheduleText}>You'll receive notifications at 8 AM:</Text>
          <View style={styles.scheduleList}>
            <View style={styles.scheduleItem}>
              <Ionicons name="calendar-outline" size={18} color="#4a9eff" />
              <Text style={styles.scheduleItemText}>30 days before expiration</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Ionicons name="calendar-outline" size={18} color="#4a9eff" />
              <Text style={styles.scheduleItemText}>14 days before expiration</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Ionicons name="calendar-outline" size={18} color="#4a9eff" />
              <Text style={styles.scheduleItemText}>7 days before expiration</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Ionicons name="time-outline" size={18} color="#ff9500" />
              <Text style={styles.scheduleItemText}>2 days before expiration</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Ionicons name="alert-circle-outline" size={18} color="#ff5c5c" />
              <Text style={styles.scheduleItemText}>Morning of expiration day</Text>
            </View>
          </View>
        </View>

        {/* Permission Status */}
        {!permissionGranted && (
          <TouchableOpacity style={styles.permissionCard} onPress={handleRequestPermission}>
            <Ionicons name="warning" size={24} color="#ff9500" />
            <View style={styles.permissionTextContainer}>
              <Text style={styles.permissionTitle}>Notifications Disabled</Text>
              <Text style={styles.permissionText}>
                Tap here to enable notifications
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7c8f" />
          </TouchableOpacity>
        )}

        {/* Enable/Disable Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color="#4a9eff" />
            <Text style={styles.settingLabel}>Enable Expiry Alerts</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: "#3a4d63", true: "#4a9eff" }}
            thumbColor={notificationsEnabled ? "#fff" : "#8899a6"}
          />
        </View>

        {/* Scheduled Notifications Count */}
        {scheduledCount > 0 && (
          <View style={styles.statsCard}>
            <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
            <Text style={styles.statsText}>
              {scheduledCount} upcoming {scheduledCount === 1 ? "alert" : "alerts"} scheduled
            </Text>
          </View>
        )}

        {/* How it works */}
        <View style={styles.howItWorks}>
          <Text style={styles.howItWorksTitle}>How it works</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Add a prescription with an expiration date
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              We automatically schedule reminder notifications
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Get notified before your prescription expires
            </Text>
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
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginBottom: 20,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#8899a6",
    lineHeight: 20,
  },
  scheduleCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 14,
    color: "#8899a6",
    marginBottom: 12,
  },
  scheduleList: {
    gap: 10,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scheduleItemText: {
    fontSize: 14,
    color: "#fff",
  },
  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 149, 0, 0.15)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ff9500",
  },
  permissionText: {
    fontSize: 13,
    color: "#8899a6",
    marginTop: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#fff",
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  statsText: {
    fontSize: 15,
    color: "#4CAF50",
    fontWeight: "500",
  },
  howItWorks: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
  },
  howItWorksTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4a9eff",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
    paddingTop: 4,
  },
});
