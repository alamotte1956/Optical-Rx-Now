import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface OpticalStore {
  id: string;
  name: string;
  description: string;
  storeLocatorUrl: string;
  icon: string;
  color: string;
}

const OPTICAL_STORES: OpticalStore[] = [
  {
    id: "1",
    name: "Sam's Club Optical",
    description: "Quality eyewear at warehouse prices",
    storeLocatorUrl: "https://www.samsclub.com/locator",
    icon: "storefront",
    color: "#0067a0",
  },
  {
    id: "2",
    name: "Costco Optical",
    description: "Premium eyewear and eye exams",
    storeLocatorUrl: "https://www.costco.com/warehouse-locations",
    icon: "storefront",
    color: "#e31837",
  },
  {
    id: "3",
    name: "Walmart Vision Center",
    description: "Affordable eye care for the whole family",
    storeLocatorUrl: "https://www.walmart.com/store/finder",
    icon: "storefront",
    color: "#0071ce",
  },
  {
    id: "4",
    name: "Target Optical",
    description: "Stylish frames at great prices",
    storeLocatorUrl: "https://www.target.com/store-locator/find-stores",
    icon: "storefront",
    color: "#cc0000",
  },
  {
    id: "5",
    name: "LensCrafters",
    description: "Expert eye care and designer eyewear",
    storeLocatorUrl: "https://www.lenscrafters.com/lc-us/store-locator",
    icon: "glasses",
    color: "#1a1a1a",
  },
  {
    id: "6",
    name: "Pearle Vision",
    description: "Trusted eye care since 1961",
    storeLocatorUrl: "https://www.pearlevision.com/pv-us/store-locator",
    icon: "glasses",
    color: "#003087",
  },
  {
    id: "7",
    name: "Visionworks",
    description: "Your neighborhood eye care center",
    storeLocatorUrl: "https://www.visionworks.com/store-locator",
    icon: "eye",
    color: "#00a3e0",
  },
  {
    id: "8",
    name: "America's Best",
    description: "2 pairs of glasses for one low price",
    storeLocatorUrl: "https://www.americasbest.com/store-locator",
    icon: "glasses",
    color: "#e41e26",
  },
];

export default function OpticalStoresScreen() {
  const router = useRouter();

  const handleOpenStore = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log("Error opening URL:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Optical Stores</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Description */}
        <View style={styles.descriptionCard}>
          <Ionicons name="storefront" size={32} color="#4a9eff" />
          <Text style={styles.descriptionText}>
            Find retail optical stores near you. Tap on a store to open their store locator.
          </Text>
        </View>

        {/* Store List */}
        <Text style={styles.sectionTitle}>Popular Optical Retailers</Text>
        
        {OPTICAL_STORES.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={styles.storeCard}
            onPress={() => handleOpenStore(store.storeLocatorUrl)}
            activeOpacity={0.7}
          >
            <View style={[styles.storeIcon, { backgroundColor: store.color }]}>
              <Ionicons name={store.icon as any} size={24} color="#fff" />
            </View>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.storeDescription}>{store.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7c8f" />
          </TouchableOpacity>
        ))}

        {/* Online Retailers Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Online Eyewear Retailers</Text>
        
        <TouchableOpacity
          style={styles.storeCard}
          onPress={() => handleOpenStore("https://www.zennioptical.com")}
          activeOpacity={0.7}
        >
          <View style={[styles.storeIcon, { backgroundColor: "#00a99d" }]}>
            <Ionicons name="globe" size={24} color="#fff" />
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>Zenni Optical</Text>
            <Text style={styles.storeDescription}>Affordable prescription glasses online</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6b7c8f" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.storeCard}
          onPress={() => handleOpenStore("https://www.warbyparker.com")}
          activeOpacity={0.7}
        >
          <View style={[styles.storeIcon, { backgroundColor: "#00aeef" }]}>
            <Ionicons name="globe" size={24} color="#fff" />
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>Warby Parker</Text>
            <Text style={styles.storeDescription}>Designer eyewear at revolutionary prices</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6b7c8f" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.storeCard}
          onPress={() => handleOpenStore("https://www.eyebuydirect.com")}
          activeOpacity={0.7}
        >
          <View style={[styles.storeIcon, { backgroundColor: "#ff6b35" }]}>
            <Ionicons name="globe" size={24} color="#fff" />
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>EyeBuyDirect</Text>
            <Text style={styles.storeDescription}>Quality glasses starting at $6</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6b7c8f" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  descriptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    color: "#8899a6",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  storeDescription: {
    fontSize: 13,
    color: "#8899a6",
    marginTop: 2,
  },
});
