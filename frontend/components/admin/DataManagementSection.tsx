import React from "react";
import { Pressable, Text, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Section } from "./Section";
import { adminStyles as styles } from "../../styles/adminStyles";
import { clearAllData, setAgeVerified } from "../../services/localStorage";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export const DataManagementSection: React.FC<Props> = ({ expanded, onToggle }) => {
  const router = useRouter();

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete ALL optical documents, family members, and app settings. This action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              await setAgeVerified(false);
              Alert.alert("Success", "All data has been cleared. Please restart the app.", [
                { text: "OK", onPress: () => router.replace("/") },
              ]);
            } catch (error) {
              Alert.alert("Error", "Could not clear data");
            }
          },
        },
      ]
    );
  };

  const handleResetAgeVerification = async () => {
    try {
      await setAgeVerified(false);
      Alert.alert("Success", "Age verification has been reset.");
    } catch {
      Alert.alert("Error", "Could not reset age verification");
    }
  };

  return (
    <Section
      title="Data Management"
      icon="server-outline"
      iconColor="#ff5c5c"
      expanded={expanded}
      onToggle={onToggle}
    >
      <Pressable style={styles.actionButton} onPress={handleResetAgeVerification}>
        <Ionicons name="refresh" size={20} color="#4a9eff" />
        <Text style={styles.actionButtonText}>Reset Age Verification</Text>
      </Pressable>
      <Pressable style={[styles.actionButton, styles.dangerButton]} onPress={handleClearAllData}>
        <Ionicons name="trash" size={20} color="#ff5c5c" />
        <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All App Data</Text>
      </Pressable>
    </Section>
  );
};
