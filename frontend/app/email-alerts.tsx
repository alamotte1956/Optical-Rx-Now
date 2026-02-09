import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface UserEmail {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export default function EmailAlertsScreen() {
  const router = useRouter();
  const [emails, setEmails] = useState<UserEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user-emails`);
      if (response.ok) {
        const data = await response.json();
        setEmails(data);
      }
    } catch (error) {
      console.log("Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    if (!validateEmail(newEmail.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/user-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() }),
      });

      if (response.ok) {
        setNewEmail("");
        fetchEmails();
        Alert.alert(
          "Email Added",
          "You will receive expiration alerts at this email address."
        );
      } else {
        const error = await response.json();
        Alert.alert("Error", error.detail || "Failed to add email");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add email");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEmail = (email: UserEmail) => {
    Alert.alert(
      "Remove Email",
      `Remove ${email.email} from receiving alerts?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${BACKEND_URL}/api/user-emails/${email.id}`,
                { method: "DELETE" }
              );
              if (response.ok) {
                fetchEmails();
              }
            } catch (error) {
              Alert.alert("Error", "Failed to remove email");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Email Alerts</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="notifications" size={32} color="#4a9eff" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Prescription Expiry Alerts</Text>
              <Text style={styles.infoText}>
                Add your email to receive alerts when your prescriptions are about to expire. We'll notify you at:
              </Text>
              <View style={styles.alertSchedule}>
                <Text style={styles.alertItem}>• 30 days before</Text>
                <Text style={styles.alertItem}>• 2 weeks before</Text>
                <Text style={styles.alertItem}>• 1 week before</Text>
                <Text style={styles.alertItem}>• 1 day before</Text>
                <Text style={styles.alertItem}>• On expiration day</Text>
              </View>
            </View>
          </View>

          {/* Add Email Section */}
          <Text style={styles.sectionTitle}>Add Email Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              placeholderTextColor="#6b7c8f"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.addButton, (!newEmail.trim() || saving) && styles.addButtonDisabled]}
              onPress={handleAddEmail}
              disabled={!newEmail.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="add" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Registered Emails */}
          <Text style={styles.sectionTitle}>Registered Emails</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4a9eff" style={styles.loader} />
          ) : emails.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="mail-outline" size={48} color="#3a4d63" />
              <Text style={styles.emptyText}>No email addresses registered</Text>
              <Text style={styles.emptySubtext}>
                Add an email above to receive expiration alerts
              </Text>
            </View>
          ) : (
            emails.map((email) => (
              <View key={email.id} style={styles.emailCard}>
                <View style={styles.emailInfo}>
                  <Ionicons name="mail" size={20} color="#4a9eff" />
                  <Text style={styles.emailText}>{email.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveEmail(email)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff5c5c" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  flex: {
    flex: 1,
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
    marginBottom: 24,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#8899a6",
    lineHeight: 20,
    marginBottom: 12,
  },
  alertSchedule: {
    gap: 4,
  },
  alertItem: {
    fontSize: 13,
    color: "#4a9eff",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
  },
  addButton: {
    width: 52,
    height: 52,
    backgroundColor: "#4a9eff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#3a4d63",
  },
  loader: {
    marginTop: 32,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#8899a6",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7c8f",
    marginTop: 8,
    textAlign: "center",
  },
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  emailInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  emailText: {
    fontSize: 15,
    color: "#fff",
    flex: 1,
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
