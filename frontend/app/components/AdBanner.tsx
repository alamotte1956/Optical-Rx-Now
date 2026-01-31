import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { trackAdClick } from "../services/analytics";

export default function AdBanner() {
  const handleAdPress = async () => {
    // Track ad click for analytics
    await trackAdClick("zenni_banner");
    // In production, this would be a real ad click
    // For now, link to a relevant optical partner
    await WebBrowser.openBrowserAsync("https://www.zennioptical.com");
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleAdPress}>
      <View style={styles.adContent}>
        <Text style={styles.adLabel}>AD</Text>
        <View style={styles.adTextContainer}>
          <Text style={styles.adTitle}>Need new eyewear?</Text>
          <Text style={styles.adText}>Prescription glasses from $6.95</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#6b7c8f" />
    </TouchableOpacity>
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
    gap: 10,
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
  adTextContainer: {
    flex: 1,
  },
  adTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  adText: {
    color: "#8899a6",
    fontSize: 12,
    marginTop: 2,
  },
});
