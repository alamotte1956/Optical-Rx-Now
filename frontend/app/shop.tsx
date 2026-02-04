import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import * as WebBrowser from "expo-web-browser";
import AffiliateCard from "./components/AffiliateCard";
import affiliateData from "../data/affiliates.json";

interface AffiliatePartner {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  discount: string;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function ShopScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [partners, setPartners] = useState<AffiliatePartner[]>([]);
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
      // Use static data instead of fetching from backend
      setPartners(affiliateData);
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
      
      // If we have location, add it to the URL for store finder
      if (location) {
        // Sam's Club store locator URL with coordinates
        url = `https://www.samsclub.com/locator?latitude=${location.latitude}&longitude=${location.longitude}&radius=50`;
      } else {
        // Try to get location one more time
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
    } catch (error) {
      // Fallback to basic URL
      await WebBrowser.openBrowserAsync("https://www.samsclub.com/locator");
    } finally {
      setLocationLoading(false);
    }
  };

  const filteredPartners = partners.filter((p) => {
    // Exclude Sam's Club since it's shown as featured
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find an Eyewear Retailer</Text>
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
        {/* Sam's Club - Featured at Top */}
        <Text style={styles.sectionTitle}>Featured Partner</Text>
        <TouchableOpacity style={styles.samsClubCard} onPress={handleSamsClubPress}>
          <View style={styles.samsClubIcon}>
            <Ionicons name="location" size={28} color="#0066cc" />
          </View>
          <View style={styles.samsClubContent}>
            <View style={styles.samsClubHeader}>
              <Text style={styles.samsClubName}>Sam's Club Optical</Text>
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={10} color="#fff" />
                <Text style={styles.featuredText}>FEATURED</Text>
              </View>
            </View>
            <Text style={styles.samsClubDescription}>
              {location ? "Find your nearest Sam's Club Optical" : "In-store eye exams & quality eyewear"}
            </Text>
            <View style={styles.samsClubLocation}>
              <Ionicons name="navigate" size={14} color="#4CAF50" />
              <Text style={styles.samsClubLocationText}>
                {location ? "Using your location" : "Tap to find nearby stores"}
              </Text>
            </View>
          </View>
          {locationLoading ? (
            <ActivityIndicator size="small" color="#4a9eff" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#6b7c8f" />
          )}
        </TouchableOpacity>

        {/* Online Partners */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Online Partners</Text>
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
  samsClubCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#0066cc",
  },
  samsClubIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 102, 204, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  samsClubContent: {
    flex: 1,
  },
  samsClubHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  samsClubName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff5c5c",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  featuredText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
  },
  samsClubDescription: {
    fontSize: 13,
    color: "#8899a6",
    marginTop: 4,
  },
  samsClubLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  samsClubLocationText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  disclaimer: {
    fontSize: 11,
    color: "#6b7c8f",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
  },
});
