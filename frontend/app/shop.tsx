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

// Static affiliate data - only stores with verified affiliate programs
// Ordered by commission rate (highest to lowest)
// Sam's Club is always first as preferred partner
const AFFILIATES = [
  {
    id: "1",
    name: "Sam's Club Optical",
    description: "Quality eyewear at warehouse club prices. Members save on frames, lenses, and contacts.",
    url: "https://www.samsclub.com/b/optical/1990005",
    category: "retail",
    isPreferred: true,
    commissionRank: 0, // Always first
  },
  {
    id: "2",
    name: "Zenni Optical",
    description: "Affordable prescription glasses starting at $6.95. Huge selection of frames.",
    url: "https://www.zennioptical.com",
    category: "online",
    isPreferred: false,
    commissionRank: 1,
  },
  {
    id: "3",
    name: "Eyeglasses.com",
    description: "Over 200,000 frames from 300+ brands. Up to 15% affiliate commission.",
    url: "https://www.eyeglasses.com",
    category: "online",
    isPreferred: false,
    commissionRank: 2,
  },
  {
    id: "4",
    name: "Designer Optics",
    description: "400+ designer brands including Gucci, Ray-Ban, Prada. 15% commission.",
    url: "https://www.designeroptics.com",
    category: "online",
    isPreferred: false,
    commissionRank: 3,
  },
  {
    id: "5",
    name: "Clearly",
    description: "Quality contacts, eyeglasses & sunglasses. Up to 12% commission.",
    url: "https://www.clearly.ca/en-ca",
    category: "contacts",
    isPreferred: false,
    commissionRank: 4,
  },
  {
    id: "6",
    name: "Target Optical",
    description: "Designer eyewear at Target. Ray-Ban, Oakley & more. Up to 8% commission.",
    url: "https://www.targetoptical.com",
    category: "retail",
    isPreferred: false,
    commissionRank: 5,
  },
  {
    id: "7",
    name: "Eyeconic",
    description: "VSP/MetLife integration, virtual try-on, doctor network. Competitive rates.",
    url: "https://www.eyeconic.com",
    category: "online",
    isPreferred: false,
    commissionRank: 6,
  },
  {
    id: "8",
    name: "SportRx",
    description: "Premium sports eyewear and prescription sunglasses. High average order value.",
    url: "https://www.sportrx.com",
    category: "online",
    isPreferred: false,
    commissionRank: 7,
  },
];

interface Affiliate {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  isPreferred: boolean;
  commissionRank: number;
}

export default function ShopScreen() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hasEnteredZip, setHasEnteredZip] = useState(false);
  
  // Location state
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [usingLocation, setUsingLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showZipFallback, setShowZipFallback] = useState(false);

  const isValidZip = /^\d{5}$/.test(zipCode);

  // Request location on mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

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

  const handleOpenLink = async (url: string, name: string) => {
    let finalUrl = url;
    
    // For Sam's Club, use store locator
    if (url.includes("samsclub.com")) {
      if (usingLocation && location) {
        // Use coordinates for location-based search
        const { latitude, longitude } = location.coords;
        finalUrl = `https://www.google.com/maps/search/Sam's+Club+Optical/@${latitude},${longitude},12z`;
      } else {
        // Use ZIP code
        finalUrl = `https://www.samsclub.com/locator?filters=%7B%22services%22%3A%5B%22Optical%22%5D%7D&zip=${zipCode}`;
      }
    }
    // For Target Optical
    else if (url.includes("targetoptical.com")) {
      if (usingLocation && location) {
        const { latitude, longitude } = location.coords;
        finalUrl = `https://www.google.com/maps/search/Target+Optical/@${latitude},${longitude},12z`;
      } else {
        const searchQuery = encodeURIComponent(`Target Optical near ${zipCode}`);
        finalUrl = `https://www.google.com/search?q=${searchQuery}`;
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
    ? AFFILIATES.filter((a) => a.category === selectedCategory)
    : AFFILIATES;

  // Sort by commission rank (Sam's Club always first)
  const sortedAffiliates = [...filteredAffiliates].sort((a, b) => a.commissionRank - b.commissionRank);

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
        <TouchableOpacity onPress={() => setHasEnteredZip(false)} style={styles.zipButton}>
          <Ionicons name="location" size={18} color="#4a9eff" />
          <Text style={styles.zipButtonText}>{zipCode}</Text>
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
            onPress={() => handleOpenLink(affiliate.url, affiliate.name)}
          >
            {/* Preferred Banner */}
            {affiliate.isPreferred && (
              <View style={styles.preferredBanner}>
                <Text style={styles.preferredBannerText}>PREFERRED</Text>
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
  },
  zipButtonText: {
    fontSize: 14,
    color: "#4a9eff",
    fontWeight: "600",
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
    borderWidth: 2,
    borderColor: "#c41e3a",
  },
  preferredBanner: {
    position: "absolute",
    top: 8,
    right: -35,
    backgroundColor: "#8B0000",
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
