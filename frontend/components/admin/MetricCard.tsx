import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminStyles as styles } from "../../styles/adminStyles";

interface MetricCardProps {
  value: string | number;
  label: string;
  icon: string;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ value, label, icon, color = "#4a9eff" }) => (
  <View style={styles.metricCard}>
    <Ionicons name={icon as any} size={24} color={color} />
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);
