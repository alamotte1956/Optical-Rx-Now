import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AdBannerProps {
  onUpgrade?: () => void;
}

export default function AdBanner({ onUpgrade }: AdBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.adContent}>
        <Text style={styles.adLabel}>AD</Text>
        <Text style={styles.adText}>Go Premium - Remove Ads & Unlock All Features</Text>
      </View>
      <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
        <Ionicons name="star" size={14} color="#fff" />
        <Text style={styles.upgradeText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a2d45",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  adContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adLabel: {
    backgroundColor: "#3a4d63",
    color: "#8899a6",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adText: {
    color: "#8899a6",
    fontSize: 12,
    flex: 1,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5a623",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  upgradeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
