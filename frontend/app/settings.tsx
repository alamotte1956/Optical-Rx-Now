import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { isBiometricAvailable, isBiometricEnabled, setBiometricEnabled } from "../services/authentication";
import { exportEncryptedBackup } from "../services/localStorage";

export default function SettingsScreen() {
  const router = useRouter();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  useEffect(() => {
    checkBiometric();
  }, []);
  
  const checkBiometric = async () => {
    const available = await isBiometricAvailable();
    const enabled = await isBiometricEnabled();
    setBiometricAvailable(available);
    setBiometricEnabledState(enabled);
  };
  
  const handleToggleBiometric = async (value: boolean) => {
    try {
      await setBiometricEnabled(value);
      setBiometricEnabledState(value);
      
      Alert.alert(
        value ? "Biometric Enabled" : "Biometric Disabled",
        value 
          ? "You'll need to authenticate to view prescriptions"
          : "Biometric authentication has been disabled"
      );
    } catch (error) {
      console.error('Biometric toggle error:', error);
      Alert.alert(
        'Error',
        'Failed to update biometric settings. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleExportBackup = async () => {
    try {
      setExporting(true);
      await exportEncryptedBackup();
      Alert.alert(
        "Backup Created",
        "Your encrypted backup has been created. Save it to a secure location."
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        "Export Failed",
        "Failed to export backup. Please try again.",
        [{ text: 'OK' }]
      );
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        {biometricAvailable ? (
          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>
                Require Face ID or fingerprint to view prescriptions
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: "#3a4d63", true: "#4CAF50" }}
              thumbColor="#fff"
            />
          </View>
        ) : (
          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Biometric Authentication</Text>
              <Text style={[styles.settingDescription, { color: "#ff6b6b" }]}>
                Not available on this device
              </Text>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Data Management</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleExportBackup}
          disabled={exporting}
          accessibilityLabel="Export encrypted backup of your data"
          accessibilityState={{ disabled: exporting }}
          accessibilityHint="Creates an encrypted backup file you can save"
        >
          <View style={styles.actionIcon}>
            <Ionicons name="download-outline" size={24} color="#4a9eff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Export Encrypted Backup</Text>
            <Text style={styles.actionDescription}>
              Download an encrypted backup of your data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6b7c8f" />
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#4a9eff" />
          <Text style={styles.infoText}>
            All your data is encrypted and stored locally on your device. No data is sent to external servers.
          </Text>
        </View>
      </View>
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
    padding: 20,
  },
  sectionTitle: { 
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  setting: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: { 
    fontSize: 16, 
    color: "#fff",
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 13,
    color: "#8899a6",
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  actionDescription: {
    fontSize: 13,
    color: "#8899a6",
    marginTop: 2,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#8899a6",
    lineHeight: 18,
  },
});
