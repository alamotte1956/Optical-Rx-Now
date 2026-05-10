import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminStyles as styles } from "../../styles/adminStyles";

interface SectionProps {
  title: string;
  icon: string;
  iconColor?: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  title,
  icon,
  iconColor = "#4a9eff",
  expanded,
  onToggle,
  badge,
  children,
}) => (
  <View style={styles.section}>
    <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.sectionHeaderLeft}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
        <Text style={styles.sectionTitle}>{title}</Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={22} color="#6b7c8f" />
    </TouchableOpacity>
    {expanded && (
      <View style={styles.sectionContent} onStartShouldSetResponder={() => true}>
        {children}
      </View>
    )}
  </View>
);
