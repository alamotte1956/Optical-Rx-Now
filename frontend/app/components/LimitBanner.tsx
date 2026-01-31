import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LimitBannerProps {
  current: number;
  limit: number;
  type: "family" | "prescription";
  onUpgrade: () => void;
}

export default function LimitBanner({ current, limit, type, onUpgrade }: LimitBannerProps) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  if (!isNearLimit) return null;

  return (
    <View style={[styles.container, isAtLimit && styles.containerAtLimit]}>
      <View style={styles.content}>
        <Ionicons 
          name={isAtLimit ? "warning" : "information-circle"} 
          size={20} 
          color={isAtLimit ? "#ff5c5c" : "#f5a623"} 
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isAtLimit 
              ? `${type === "family" ? "Family member" : "Prescription"} limit reached` 
              : `${current}/${limit} ${type === "family" ? "family members" : "prescriptions"} used`
            }
          </Text>
          <Text style={styles.subtitle}>
            {isAtLimit 
              ? "Upgrade to Premium for unlimited access"
              : "Upgrade soon to avoid limits"
            }
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={onUpgrade}>
        <Text style={styles.buttonText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(245, 166, 35, 0.15)",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(245, 166, 35, 0.3)",
  },
  containerAtLimit: {
    backgroundColor: "rgba(255, 92, 92, 0.15)",
    borderColor: "rgba(255, 92, 92, 0.3)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  subtitle: {
    color: "#8899a6",
    fontSize: 11,
    marginTop: 2,
  },
  button: {
    backgroundColor: "#f5a623",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
