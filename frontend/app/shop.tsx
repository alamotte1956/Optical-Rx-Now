import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import AffiliateCard from "./components/AffiliateCard";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface AffiliatePartner {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  discount: string;
}

export default function ShopScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [partners, setPartners] = useState<AffiliatePartner[]>([]);
  const [filter, setFilter] = useState<"all" | "eyeglasses" | "contacts">("all");

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/affiliates`);
      if (response.ok) {
        const data = await response.json();
        setPartners(data.partners);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredPartners = partners.filter((p) => {
    if (filter === "all") return true;
    if (filter === "eyeglasses") return p.category === "eyeglasses" || p.category === "both";
    if (filter === "contacts") return p.category === "contacts" || p.category === "both";
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Lenses</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#4a9eff" />
        <Text style={styles.infoText}>
          Order from our trusted partners. We may earn a commission at no extra cost to you.
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(["all", "eyeglasses", "contacts"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "All" : f === "eyeglasses" ? "Eyeglasses" : "Contacts"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Partners List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPartners();
            }}
            tintColor="#4a9eff"
          />
        }
      >
        <Text style={styles.sectionTitle}>Recommended Partners</Text>
        {filteredPartners.map((partner) => (
          <AffiliateCard key={partner.id} partner={partner} />
        ))}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Prices and availability subject to change. Please verify details on the partner website before purchasing.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#8899a6",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a2d45",
  },
  filterTabActive: {
    backgroundColor: "#4a9eff",
  },
  filterText: {
    fontSize: 14,
    color: "#8899a6",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  disclaimer: {
    fontSize: 11,
    color: "#6b7c8f",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
  },
});
