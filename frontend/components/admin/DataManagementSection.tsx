import React, { useState } from "react";
import { Text, Alert } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Section } from "./Section";
import { ConfirmModal } from "./ConfirmModal";
import { adminStyles as styles } from "../../styles/adminStyles";
import { clearAllData, setAgeVerified } from "../../services/localStorage";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export const DataManagementSection: React.FC<Props> = ({ expanded, onToggle }) => {
  const router = useRouter();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const confirmClearAllData = async () => {
    setShowClearConfirm(false);
    try {
      await clearAllData();
      await setAgeVerified(false);
      Alert.alert("Success", "All data has been cleared. Please restart the app.");
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Could not clear data");
    }
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
    <>
      <Section
        title="Data Management"
        icon="server-outline"
        iconColor="#ff5c5c"
        expanded={expanded}
        onToggle={onToggle}
      >
        <RectButton style={styles.actionButton} onPress={handleResetAgeVerification}>
          <Ionicons name="refresh" size={20} color="#4a9eff" />
          <Text style={styles.actionButtonText}>Reset Age Verification</Text>
        </RectButton>
        <RectButton style={[styles.actionButton, styles.dangerButton]} onPress={() => setShowClearConfirm(true)}>
          <Ionicons name="trash" size={20} color="#ff5c5c" />
          <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All App Data</Text>
        </RectButton>
      </Section>

      {/* Clear All Data Confirmation */}
      <ConfirmModal
        visible={showClearConfirm}
        title="Clear All Data"
        message="This will delete ALL optical documents, family members, and app settings. This action cannot be undone!"
        confirmText="Clear Everything"
        confirmColor="#ff5c5c"
        icon="warning"
        iconColor="#ff5c5c"
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={confirmClearAllData}
      />
    </>
  );
};
