import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import {
  getSettings,
  saveSettings,
  getScheduledNotifications,
  requestNotificationPermissions,
  rescheduleAllNotifications,
  sendTestNotification,
  getExpiringPrescriptions,
  ScheduledNotification,
} from "../services/localStorage";
import { useTranslation } from "../services/i18n";
import { VersionFooter } from "../components/VersionFooter";

const REMINDER_OPTIONS = [
  { days: 30, label: "30 days before", enabled: true },
  { days: 14, label: "14 days before", enabled: true },
  { days: 7, label: "7 days before", enabled: true },
  { days: 2, label: "2 days before", enabled: true },
  { days: 0, label: "Day of expiration", enabled: true },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [reminderSettings, setReminderSettings] = useState(REMINDER_OPTIONS);
  const [upcomingReminders, setUpcomingReminders] = useState<ScheduledNotification[]>([]);
  const [expiringCount, setExpiringCount] = useState(0);
  const [rescheduling, setRescheduling] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const loadAll = async () => {
    await loadSettings();
    await checkPermissions();
    await loadScheduledNotifications();
    await loadExpiringCount();
  };

  const loadSettings = async () => {
    const settings = await getSettings();
    setNotificationsEnabled(settings.notificationsEnabled);
    if (settings.reminderDays) {
      setReminderSettings(settings.reminderDays);
    }
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted(status === "granted");
  };

  const loadScheduledNotifications = async () => {
    const notifications = await getScheduledNotifications();
    const now = new Date();
    // Filter out past notifications and sort by date
    const upcoming = notifications
      .filter((n) => new Date(n.triggerDate) > now)
      .sort((a, b) => new Date(a.triggerDate).getTime() - new Date(b.triggerDate).getTime());
    setUpcomingReminders(upcoming.slice(0, 10)); // Show max 10
    setScheduledCount(upcoming.length);
  };

  const loadExpiringCount = async () => {
    const expiring = await getExpiringPrescriptions(30);
    setExpiringCount(expiring.length);
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
    await saveSettings({ notificationsEnabled: value, email: null, reminderDays: reminderSettings });
    
    // Reschedule all notifications with new enabled/disabled state
    setRescheduling(true);
    try {
      const result = await rescheduleAllNotifications();
      await loadScheduledNotifications();
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (error) {
      console.log("Reschedule error:", error);
    } finally {
      setRescheduling(false);
    }
  };

  const handleToggleReminder = async (days: number) => {
    const updated = reminderSettings.map((r) =>
      r.days === days ? { ...r, enabled: !r.enabled } : r
    );
    setReminderSettings(updated);
    await saveSettings({ notificationsEnabled, email: null, reminderDays: updated });

    // Reschedule all notifications with updated day preferences
    setRescheduling(true);
    try {
      const result = await rescheduleAllNotifications();
      await loadScheduledNotifications();
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (error) {
      console.log("Reschedule error:", error);
    } finally {
      setRescheduling(false);
    }
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

  const handleSendTestNotification = async () => {
    setSendingTest(true);
    try {
      const sent = await sendTestNotification();
      if (sent) {
        Alert.alert(
          "Test Sent!",
          "You should receive a test notification in about 2 seconds. If you don't see it, check your device notification settings.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Could Not Send",
          "Please make sure notifications are enabled in your device settings.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification.");
    } finally {
      setSendingTest(false);
    }
  };

  const handleRefreshReminders = async () => {
    setRescheduling(true);
    try {
      const result = await rescheduleAllNotifications();
      await loadScheduledNotifications();
      setLastRefreshed(new Date().toLocaleTimeString());
      Alert.alert(
        "Reminders Refreshed",
        `Scheduled ${result.scheduled} reminder${result.scheduled === 1 ? '' : 's'} for ${result.prescriptions} document${result.prescriptions === 1 ? '' : 's'}.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to refresh reminders.");
    } finally {
      setRescheduling(false);
    }
  };

  const formatReminderDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  const getDaysBeforeLabel = (days: number) => {
    if (days === 0) return "Expiry day";
    return `${days}d before`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expiry Alerts</Text>
        <TouchableOpacity onPress={() => router.replace("/welcome")} style={styles.placeholder} accessibilityLabel="Home" accessibilityRole="button">
          <Ionicons name="home-outline" size={22} color="#4a9eff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="notifications" size={32} color="#4a9eff" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Never Miss an Expiration</Text>
            <Text style={styles.infoText}>
              Get notified when your optical documents are about to expire so you can schedule an eye exam in time.
            </Text>
          </View>
        </View>

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

        {/* Test Notification Button */}
        <TouchableOpacity
          style={[styles.testButton, sendingTest && styles.testButtonDisabled]}
          onPress={handleSendTestNotification}
          disabled={sendingTest}
        >
          {sendingTest ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={20} color="#fff" />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Alert Schedule - Now Customizable */}
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>Customize Alert Schedule</Text>
          <Text style={styles.scheduleText}>Choose when to receive reminders (at 8 AM):</Text>
          <View style={styles.scheduleList}>
            {reminderSettings.map((reminder) => (
              <TouchableOpacity
                key={reminder.days}
                style={styles.scheduleItem}
                onPress={() => handleToggleReminder(reminder.days)}
                disabled={rescheduling}
              >
                <Ionicons
                  name={reminder.enabled ? "checkbox" : "square-outline"}
                  size={22}
                  color={reminder.enabled ? "#4a9eff" : "#6b7c8f"}
                />
                <Text style={[styles.scheduleItemText, !reminder.enabled && styles.scheduleItemDisabled]}>
                  {reminder.label}
                </Text>
                {rescheduling && (
                  <ActivityIndicator size="small" color="#4a9eff" style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Scheduled Notifications Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusHeaderLeft}>
              <Ionicons name="calendar-outline" size={22} color={scheduledCount > 0 ? "#4CAF50" : "#6b7c8f"} />
              <Text style={styles.statusTitle}>
                {scheduledCount > 0
                  ? `${scheduledCount} Upcoming Alert${scheduledCount === 1 ? "" : "s"}`
                  : "No Alerts Scheduled"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.refreshButton, rescheduling && styles.refreshButtonDisabled]}
              onPress={handleRefreshReminders}
              disabled={rescheduling}
            >
              {rescheduling ? (
                <ActivityIndicator size="small" color="#4a9eff" />
              ) : (
                <Ionicons name="refresh" size={20} color="#4a9eff" />
              )}
            </TouchableOpacity>
          </View>

          {lastRefreshed ? (
            <Text style={styles.lastRefreshed}>Last refreshed: {lastRefreshed}</Text>
          ) : null}

          {expiringCount > 0 && (
            <View style={styles.expiringBanner}>
              <Ionicons name="alert-circle" size={18} color="#ff9500" />
              <Text style={styles.expiringBannerText}>
                {expiringCount} document{expiringCount === 1 ? "" : "s"} expiring within 30 days
              </Text>
            </View>
          )}

          {/* Upcoming reminders list */}
          {upcomingReminders.length > 0 && (
            <View style={styles.remindersList}>
              {upcomingReminders.map((reminder, index) => (
                <View key={reminder.id || index} style={styles.reminderItem}>
                  <View style={styles.reminderDot} />
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderDate}>
                      {formatReminderDate(reminder.triggerDate)}
                    </Text>
                    <Text style={styles.reminderLabel}>
                      {getDaysBeforeLabel(reminder.daysBefore)}
                    </Text>
                  </View>
                </View>
              ))}
              {scheduledCount > 10 && (
                <Text style={styles.moreReminders}>
                  +{scheduledCount - 10} more alert{scheduledCount - 10 === 1 ? "" : "s"}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* How it works */}
        <View style={styles.howItWorks}>
          <Text style={styles.howItWorksTitle}>How it works</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Add an optical document with an expiration date
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
              Get notified before your optical document expires
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>
              Reminders refresh automatically each time you open the app
            </Text>
          </View>
        </View>
        <VersionFooter />
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
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginBottom: 16,
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 149, 0, 0.15)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 12,
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
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#4a9eff",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  scheduleCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    gap: 12,
    paddingVertical: 8,
  },
  scheduleItemText: {
    fontSize: 15,
    color: "#fff",
  },
  scheduleItemDisabled: {
    color: "#6b7c8f",
  },
  statusCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  lastRefreshed: {
    fontSize: 12,
    color: "#6b7c8f",
    marginBottom: 8,
  },
  expiringBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 149, 0, 0.12)",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  expiringBannerText: {
    fontSize: 13,
    color: "#ff9500",
    fontWeight: "500",
    flex: 1,
  },
  remindersList: {
    marginTop: 8,
    gap: 6,
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#2a3d55",
  },
  reminderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4a9eff",
  },
  reminderInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderDate: {
    fontSize: 13,
    color: "#fff",
  },
  reminderLabel: {
    fontSize: 12,
    color: "#8899a6",
    fontWeight: "500",
  },
  moreReminders: {
    fontSize: 12,
    color: "#6b7c8f",
    textAlign: "center",
    marginTop: 6,
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
