import React from "react";
import { Text, View, StyleSheet } from "react-native";
import Constants from "expo-constants";

const APP_VERSION = Constants.expoConfig?.version || "2.2.1";

export const VersionFooter: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.versionText}>v{APP_VERSION}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
    paddingBottom: 24,
  },
  versionText: {
    fontSize: 12,
    color: "#4a5568",
    textAlign: "center",
  },
});
