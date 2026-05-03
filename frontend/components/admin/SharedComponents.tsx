import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Shared Section wrapper
export const Section = ({
  title,
  icon,
  iconColor = "#4a9eff",
  expanded,
  onToggle,
  badge,
  children,
}: {
  title: string;
  icon: string;
  iconColor?: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}) => (
  <View style={sectionStyles.section}>
    <TouchableOpacity
      style={sectionStyles.sectionHeader}
      onPress={onToggle}
      accessibilityLabel={`${title} section`}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
    >
      <View style={sectionStyles.sectionHeaderLeft}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
        <Text style={sectionStyles.sectionTitle}>{title}</Text>
        {badge && (
          <View style={sectionStyles.badge}>
            <Text style={sectionStyles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={22} color="#6b7c8f" />
    </TouchableOpacity>
    {expanded && <View style={sectionStyles.sectionContent}>{children}</View>}
  </View>
);

// Shared MetricCard
export const MetricCard = ({
  value,
  label,
  icon,
  color = "#4a9eff",
}: {
  value: string | number;
  label: string;
  icon: string;
  color?: string;
}) => (
  <View style={sectionStyles.metricCard} accessibilityLabel={`${label}: ${value}`}>
    <Ionicons name={icon as any} size={24} color={color} />
    <Text style={[sectionStyles.metricValue, { color }]}>{value}</Text>
    <Text style={sectionStyles.metricLabel}>{label}</Text>
  </View>
);

const sectionStyles = StyleSheet.create({
  section: {
    backgroundColor: "#112240",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  badge: {
    backgroundColor: "rgba(74, 158, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4a9eff",
  },
  metricCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  metricLabel: {
    fontSize: 11,
    color: "#8899a6",
    fontWeight: "600",
    textAlign: "center",
  },
});
