import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

interface AffiliatePartner {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  discount: string;
}

interface AffiliateCardProps {
  partner: AffiliatePartner;
}

export default function AffiliateCard({ partner }: AffiliateCardProps) {
  const handlePress = async () => {
    await WebBrowser.openBrowserAsync(partner.url);
  };

  const getCategoryIcon = (category: string) => {
    if (category === "eyeglasses") return "glasses";
    if (category === "contacts") return "eye";
    return "cart";
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.iconContainer}>
        <Ionicons name={getCategoryIcon(partner.category) as any} size={24} color="#4a9eff" />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{partner.name}</Text>
        <Text style={styles.description}>{partner.description}</Text>
        <View style={styles.discountBadge}>
          <Ionicons name="pricetag" size={12} color="#4CAF50" />
          <Text style={styles.discountText}>{partner.discount}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6b7c8f" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  description: {
    fontSize: 13,
    color: "#8899a6",
    marginTop: 2,
  },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  discountText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
});
