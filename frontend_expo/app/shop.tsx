import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trackAffiliateClick } from "../services/analytics";

const AFFILIATES_STORAGE_KEY = "@optical_rx_affiliates";

// Default affiliate data - will be overridden by admin settings
const DEFAULT_AFFILIATES = [
  {
    id: "eyeglasses-com",
    name: "Eyeglasses.com",
    description: "Over 200,000 frames from 300+ brands. Wide selection.",
    baseUrl: "https://www.eyeglasses.com",
    category: "online",
    isPreferred: false,
    commission: 15,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "designer-optics",
    name: "Designer Optics",
    description: "400+ designer brands including Gucci, Ray-Ban, Prada.",
    baseUrl: "https://www.designeroptics.com",
    category: "online",
    isPreferred: false,
    commission: 15,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "glasses-usa",
    name: "GlassesUSA",
    description: "Top-rated online eyewear retailer with virtual try-on.",
    baseUrl: "https://www.glassesusa.com",
    category: "online",
    isPreferred: false,
    commission: 12,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "clearly",
    name: "Clearly",
    description: "Quality contacts, eyeglasses & sunglasses.",
    baseUrl: "https://www.clearly.ca/en-ca",
    category: "contacts",
    isPreferred: false,
    commission: 12,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "lens-com",
    name: "Lens.com",
    description: "Contact lenses at wholesale prices.",
    baseUrl: "https://www.lens.com",
    category: "contacts",
    isPreferred: false,
    commission: 12,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "zenni",
    name: "Zenni Optical",
    description: "Affordable prescription glasses starting at $6.95. Huge selection of frames.",
    baseUrl: "https://www.zennioptical.com",
    category: "online",
    isPreferred: false,
    commission: 10,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "warby-parker",
    name: "Warby Parker",
    description: "Stylish frames with free home try-on program.",
    baseUrl: "https://www.warbyparker.com",
    category: "online",
    isPreferred: false,
    commission: 10,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "eyebuydirect",
    name: "EyeBuyDirect",
    description: "Affordable prescription glasses & sunglasses.",
    baseUrl: "https://www.eyebuydirect.com",
    category: "online",
    isPreferred: false,
    commission: 10,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "1800contacts",
    name: "1-800 Contacts",
    description: "America's #1 contact lens retailer. Fast delivery.",
    baseUrl: "https://www.1800contacts.com",
    category: "contacts",
    isPreferred: false,
    commission: 9,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "target-optical",
    name: "Target Optical",
    description: "Designer eyewear at Target. Ray-Ban, Oakley & more.",
    baseUrl: "https://www.targetoptical.com",
    category: "retail",
    isPreferred: false,
    commission: 8,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "eyeconic",
    name: "Eyeconic",
    description: "VSP/MetLife integration, virtual try-on, doctor network.",
    baseUrl: "https://www.eyeconic.com",
    category: "online",
    isPreferred: false,
    commission: 8,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "sportrx",
    name: "SportRx",
    description: "Premium sports eyewear and prescription sunglasses.",
    baseUrl: "https://www.sportrx.com",
    category: "online",
    isPreferred: false,
    commission: 7,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "sams-club",
    name: "Sam's Club Optical",
    description: "Quality eyewear at warehouse club prices. Members save on frames, lenses, and contacts.",
    baseUrl: "https://www.samsclub.com/b/optical/1990005",
    category: "retail",
    isPreferred: false,
    commission: 5,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "costco-optical",
    name: "Costco Optical",
    description: "Premium quality eyewear at Costco member prices.",
    baseUrl: "https://www.costco.com/optical.html",
    category: "retail",
    isPreferred: false,
    commission: 4,
    enabled: true,
    affiliateId: "",
  },
  {
    id: "americas-best",
    name: "America's Best",
    description: "2 pairs of glasses for $79.95 including eye exam.",
    baseUrl: "https://www.americasbest.com",
    category: "retail",
    isPreferred: false,
    commission: 4,
    enabled: true,
    affiliateId: "",
  },
];

interface Affiliate {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  category: string;
  isPreferred?: boolean;
  commission: number;
  enabled: boolean;
  affiliateId: string;
}

export default function ShopScreen() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hasEnteredZip, setHasEnteredZip] = useState(false);
  const [affiliates, setAffiliates] = useState<Affiliate[]>(DEFAULT_AFFILIATES);
  
  // Location state
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [usingLocation, setUsingLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showZipFallback, setShowZipFallback] = useState(false);

  const isValidZip = /^\d{5}$/.test(zipCode);

  // Load affiliates from admin settings and request location on mount
  useEffect(() => {
    loadAffiliates();
    requestLocationPermission();
  }, []);

  const loadAffiliates = async () => {
    try {
      const stored = await AsyncStorage.getItem(AFFILIATES_STORAGE_KEY);
      if (stored) {
        const adminAffiliates = JSON.parse(stored);
        // Filter to only enabled affiliates and map to shop format
        const enabledAffiliates = adminAffiliates
          .filter((a: any) => a.enabled)
          .map((a: any) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            baseUrl: a.baseUrl || a.url,
            category: a.category || "online",
            isPreferred: a.isPreferred || false,
            commission: a.commission,
            enabled: a.enabled,
            affiliateId: a.affiliateId || "",
          }));
        
        if (enabledAffiliates.length > 0) {
          setAffiliates(enabledAffiliates);
        }
      }
    } catch (error) {
      console.log("Error loading affiliates:", error);
    }
  };

  // Build affiliate URL with tracking ID if available
  const buildAffiliateUrl = (affiliate: Affiliate): string => {
    let url = affiliate.baseUrl;
    
    // If affiliate ID is set, append it based on the network/partner
    if (affiliate.affiliateId) {
      // Common affiliate URL patterns
      if (url.includes("?")) {
        url += `&ref=${affiliate.affiliateId}`;
      } else {
        url += `?ref=${affiliate.affiliateId}`;
      }
    }
    
    return url;
  };

  const requestLocationPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        console.log("Location permission denied, showing ZIP fallback");
        setShowZipFallback(true);
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(currentLocation);
      console.log("Location obtained:", currentLocation.coords);

      // Get location name (city, state)
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        if (address) {
          const name = [address.city, address.region].filter(Boolean).join(", ");
          setLocationName(name || "Your Location");
          console.log("Location name:", name);
        }
      } catch (geocodeError) {
        console.log("Geocode error:", geocodeError);
        setLocationName("Your Location");
      }

      setUsingLocation(true);
      setHasEnteredZip(true); // Skip ZIP entry, go straight to store list
    } catch (error) {
      console.log("Location error:", error);
      setShowZipFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUseZipInstead = () => {
    setUsingLocation(false);
    setHasEnteredZip(false);
    setShowZipFallback(true);
  };

  const handleContinue = () => {
    if (!isValidZip) {
      Alert.alert("Invalid ZIP Code", "Please enter a valid 5-digit ZIP code.");
      return;
    }
    setUsingLocation(false);
    setHasEnteredZip(true);
  };

  const handleOpenLink = async (affiliate: Affiliate) => {
    let finalUrl = buildAffiliateUrl(affiliate);
    
    // Track the click
    await trackAffiliateClick(affiliate.id, affiliate.name);
    
    // For RETAIL category stores, use location-based search
    if (affiliate.category === "retail") {
      const storeName = encodeURIComponent(affiliate.name);
      
      if (usingLocation && location) {
        const { latitude, longitude } = location.coords;
        // Use Google Maps to find nearest location
        finalUrl = `https://www.google.com/maps/search/${storeName}/@${latitude},${longitude},12z`;
      } else if (zipCode) {
        // Use ZIP code based search
        const searchQuery = encodeURIComponent(`${affiliate.name} near ${zipCode}`);
        
        // Some retailers have specific store locators
        if (affiliate.id === "sams-club") {
          finalUrl = `https://www.samsclub.com/locator?filters=%7B%22services%22%3A%5B%22Optical%22%5D%7D&zip=${zipCode}`;
        } else if (affiliate.id === "target-optical") {
          finalUrl = `https://www.targetoptical.com/to-us/stores?zip=${zipCode}`;
        } else if (affiliate.id === "costco-optical") {
          finalUrl = `https://www.costco.com/warehouse-locations?langId=-1&zipCode=${zipCode}`;
        } else if (affiliate.id === "americas-best") {
          finalUrl = `https://www.americasbest.com/locations?search=${zipCode}`;
        } else if (affiliate.id === "walmart-vision") {
          finalUrl = `https://www.walmart.com/store/finder?location=${zipCode}&distance=50`;
        } else if (affiliate.id === "lenscrafters") {
          finalUrl = `https://www.lenscrafters.com/lc-us/store-locator?zip=${zipCode}`;
        } else if (affiliate.id === "pearle-vision") {
          finalUrl = `https://www.pearlevision.com/pv-us/store-locator?zip=${zipCode}`;
        } else if (affiliate.id === "visionworks") {
          finalUrl = `https://www.visionworks.com/find-a-store?zipcode=${zipCode}`;
        } else {
          // Default: Google search with ZIP
          finalUrl = `https://www.google.com/maps/search/${searchQuery}`;
        }
      } else {
        // No location or ZIP - open Google Maps search
        finalUrl = `https://www.google.com/maps/search/${storeName}`;
      }
    }
    
    try {
      await Linking.openURL(finalUrl);
    } catch (error) {
      console.log("Error opening URL:", error);
      Alert.alert("Error", "Could not open link. Please try again.");
    }
  };

  const filteredAffiliates = selectedCategory
    ? affiliates.filter((a) => a.category === selectedCategory)
    : affiliates;

  // Sort: preferred first, then by commission (highest to lowest)
  const sortedAffiliates = [...filteredAffiliates].sort((a, b) => {
    if (a.isPreferred && !b.isPreferred) return -1;
    if (!a.isPreferred && b.isPreferred) return 1;
    return b.commission - a.commission;
  });

  const categories = [
    { key: null, label: "All" },
    { key: "retail", label: "Retail" },
    { key: "online", label: "Online" },
    { key: "contacts", label: "Contacts" },
  ];

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case "retail":
        return "storefront";
      case "online":
        return "globe";
      case "contacts":
        return "eye";
      default:
        return "pricetag";
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shop Eyewear</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ZIP Code Entry Screen (fallback when location is denied)
  if (!hasEnteredZip && showZipFallback) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Shop Eyewear</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.zipContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="storefront" size={48} color="#4a9eff" />
            </View>

            <Text style={styles.zipTitle}>Find Optical Stores Near You</Text>
            <Text style={styles.zipSubtitle}>
              Enter your ZIP code to see optical retailers and online stores that ship to your area.
            </Text>

            {/* ZIP Code Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={24} color="#4a9eff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter ZIP Code"
                placeholderTextColor="#6b7c8f"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.continueButton, !isValidZip && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!isValidZip}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Main Shop Screen
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Eyewear</Text>
        <TouchableOpacity onPress={handleUseZipInstead} style={styles.zipButton}>
          <Ionicons name="location" size={18} color="#4a9eff" />
          <Text style={styles.zipButtonText} numberOfLines={1}>
            {usingLocation ? (locationName || "Near You") : zipCode}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Category Filter */}
        <View style={styles.filterContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key || "all"}
              style={[
                styles.filterChip,
                selectedCategory === cat.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === cat.key && styles.filterChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* All Affiliates - Sorted by Commission */}
        <Text style={styles.sectionTitle}>Optical Partners</Text>
        {sortedAffiliates.map((affiliate) => (
          <TouchableOpacity
            key={affiliate.id}
            style={[
              styles.affiliateCard,
              affiliate.isPreferred && styles.preferredCard,
            ]}
            onPress={() => handleOpenLink(affiliate)}
          >
            {/* Location Badge for Retail Stores */}
            {affiliate.category === "retail" && (usingLocation || zipCode) && (
              <View style={styles.locationBadge}>
                <Ionicons name="navigate" size={12} color="#4CAF50" />
                <Text style={styles.locationBadgeText}>Find Nearest</Text>
              </View>
            )}
            
            <View style={styles.affiliateIcon}>
              <Ionicons
                name={getCategoryIcon(affiliate.category) as any}
                size={24}
                color="#4a9eff"
              />
            </View>
            <View style={styles.affiliateInfo}>
              <Text style={styles.affiliateName}>
                {affiliate.name}
              </Text>
              <Text style={styles.affiliateDesc} numberOfLines={2}>
                {affiliate.description}
              </Text>
            </View>
            <Ionicons 
              name="open-outline" 
              size={20} 
              color="#6b7c8f" 
            />
          </TouchableOpacity>
        ))}

        {/* Ad Placeholder */}
        <TouchableOpacity
          style={styles.adPlaceholder}
          onPress={() => Linking.openURL("mailto:support@OpticalRxNow.com?subject=Advertising%20Inquiry")}
        >
          <Ionicons name="megaphone-outline" size={24} color="#4a9eff" />
          <Text style={styles.adPlaceholderText}>Advertise with us Here</Text>
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
  keyboardView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8899a6",
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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  zipButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    maxWidth: 140,
  },
  zipButtonText: {
    fontSize: 14,
    color: "#4a9eff",
    fontWeight: "600",
    flexShrink: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  zipContent: {
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  zipTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  zipSubtitle: {
    fontSize: 15,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    width: "100%",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    color: "#fff",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a9eff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    width: "100%",
  },
  continueButtonDisabled: {
    backgroundColor: "#3a4d63",
    opacity: 0.7,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a2d45",
  },
  filterChipActive: {
    backgroundColor: "#4a9eff",
  },
  filterChipText: {
    fontSize: 14,
    color: "#8899a6",
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  affiliateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  preferredCard: {
    // No special border - regular card style
  },
  preferredBanner: {
    position: "absolute",
    top: 8,
    right: -35,
    backgroundColor: "#4a9eff",
    paddingVertical: 4,
    paddingHorizontal: 40,
    transform: [{ rotate: "45deg" }],
    zIndex: 1,
  },
  preferredBannerText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  locationBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
    zIndex: 1,
  },
  locationBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4CAF50",
  },
  affiliateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  affiliateInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  affiliateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  affiliateDesc: {
    fontSize: 13,
    color: "#8899a6",
    marginTop: 2,
    lineHeight: 18,
  },
  adPlaceholder: {
    width: "100%",
    height: 80,
    backgroundColor: "rgba(74, 158, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 158, 255, 0.2)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  adPlaceholderText: {
    fontSize: 14,
    color: "#6b7c8f",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
