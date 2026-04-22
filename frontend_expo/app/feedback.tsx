import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MailComposer from "expo-mail-composer";

const FEEDBACK_TYPES = [
  { id: "bug", label: "Bug Report", icon: "bug", color: "#ff5c5c" },
  { id: "feature", label: "Feature Request", icon: "bulb", color: "#FF9800" },
  { id: "general", label: "General Feedback", icon: "chatbubble", color: "#4a9eff" },
  { id: "other", label: "Other", icon: "ellipsis-horizontal", color: "#9C27B0" },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const [feedbackType, setFeedbackType] = useState<string>("general");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendFeedback = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter your feedback message.");
      return;
    }

    setSending(true);

    const selectedType = FEEDBACK_TYPES.find((t) => t.id === feedbackType);
    const subject = `[My Optical Wallet] ${selectedType?.label || "Feedback"}`;
    const body = `Feedback Type: ${selectedType?.label}\n\n${message}\n\n---\nSent from My Optical Wallet App`;

    const isAvailable = await MailComposer.isAvailableAsync();

    if (isAvailable) {
      try {
        const result = await MailComposer.composeAsync({
          recipients: ["support@OpticalRxNow.com"],
          subject: subject,
          body: body,
        });

        if (result.status === "sent") {
          Alert.alert("Thank You!", "Your feedback has been sent. We appreciate your input!", [
            { text: "OK", onPress: () => router.back() },
          ]);
        } else {
          setSending(false);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to send feedback. Please try again.");
        setSending(false);
      }
    } else {
      // Fallback to mailto link
      const mailtoUrl = `mailto:support@OpticalRxNow.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const canOpen = await Linking.canOpenURL(mailtoUrl);

      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        Alert.alert("Thank You!", "Your email app has been opened. Please send your feedback.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          "No Email App",
          "Please email us directly at support@OpticalRxNow.com",
          [{ text: "OK" }]
        );
      }
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Feedback</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.label}>What type of feedback?</Text>
          <View style={styles.typeGrid}>
            {FEEDBACK_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  feedbackType === type.id && { borderColor: type.color, backgroundColor: `${type.color}15` },
                ]}
                onPress={() => setFeedbackType(type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={feedbackType === type.id ? type.color : "#6b7c8f"}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    feedbackType === type.id && { color: type.color },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Your Message</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tell us what you think, report a bug, or suggest a feature..."
            placeholderTextColor="#6b7c8f"
            multiline
            numberOfLines={8}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.sendButton, (!message.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSendFeedback}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.sendButtonText}>Send Feedback</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Ionicons name="heart" size={20} color="#ff5c5c" />
            <Text style={styles.infoText}>
              We read every message and appreciate your feedback. It helps us make My Optical Wallet better for everyone!
            </Text>
          </View>
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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#1a2d45",
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8899a6",
  },
  textInput: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    minHeight: 150,
    marginBottom: 24,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#4a9eff",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sendButtonDisabled: {
    backgroundColor: "#3a4d63",
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "rgba(255, 92, 92, 0.1)",
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#8899a6",
    lineHeight: 20,
  },
});
