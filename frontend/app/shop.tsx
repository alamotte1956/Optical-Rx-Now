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
import * as Location from "expo-location";
import * as WebBrowser from "expo-web-browser";
import AffiliateCard from "../components/AffiliateCard";
import { getAffiliates, type Affiliate } from "../services/affiliateStorage";

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function ShopScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [partners, setPartners] = useState<Affiliate[]>([]);
  const [filter, setFilter] = useState<"all" | "eyeglasses" | "contacts">("all");
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchPartners();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (error) {
      console.log("Location error:", error);
    }
  };

  const fetchPartners = async () => {
    try {
      const data = await getAffiliates();
      // Only show active affiliates
      const activeAffiliates = data.filter(a => a.is_active);
      setPartners(activeAffiliates);
    } catch (error) {
      console.error("Error loading affiliates:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSamsClubPress = async () => {
    setLocationLoading(true);

    try {
      let url = "https://www.samsclub.com/locator";

      if (location) {
        url = `https://www.samsclub.com/locator?latitude=${location.latitude}&longitude=${location.longitude}&radius=50`;
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          url = `https://www.samsclub.com/locator?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&radius=50`;
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      }

      await WebBrowser.openBrowserAsync(url);
    } catch {
      await WebBrowser.openBrowserAsync("https://www.samsclub.com/locator");
    } finally {
      setLocationLoading(false);
    }
  };

  const filteredPartners = partners.filter((p) => {
    if (p.name.toLowerCase().includes("sam's club")) return false;
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find an Eyewear Retailer</Text>
        <View style={styles.placeholder} />
      </View>

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
        {filteredPartners.map((partner) => (
          <AffiliateCard key={partner.id} partner={partner} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  placeholder: { width: 44 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
});
