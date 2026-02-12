import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import * as Location from "expo-location";

export default function FindOptometristsScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [locationCity, setLocationCity] = useState<string>("");
  const [locationState, setLocationState] = useState<string>("");
  const [locationStateAbbrev, setLocationStateAbbrev] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    setLoading(true);
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        setPermissionDenied(true);
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
          
          // Store city and state for Healthgrades search
          if (address.city) {
            setLocationCity(address.city.toLowerCase().replace(/\s+/g, '-'));
          }
          if (address.region) {
            setLocationState(address.region.toLowerCase().replace(/\s+/g, '-'));
            // Store region code if available (e.g., "CA", "NY")
            setLocationStateAbbrev(address.region.length === 2 ? address.region.toLowerCase() : getStateAbbreviation(address.region));
          }
          
          console.log("Location name:", name);
          console.log("City:", address.city, "State:", address.region);
        }
      } catch (geocodeError) {
        console.log("Geocode error:", geocodeError);
        setLocationName("Your Location");
      }
    } catch (error) {
      console.log("Location error:", error);
      setPermissionDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchGoogle = async () => {
    if (!location) {
      Alert.alert("Location Required", "Please enable location access to search.");
      return;
    }

    const { latitude, longitude } = location.coords;
    const searchTerm = `optometrist near me`;
    const encodedSearch = encodeURIComponent(searchTerm);
    // Use Google Maps search with coordinates
    const url = `https://www.google.com/maps/search/optometrist/@${latitude},${longitude},14z`;
    
    console.log("Opening Google Maps URL:", url);
    
    try {
      await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: 'close',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        toolbarColor: '#ffffff',
      });
    } catch (error) {
      console.error("WebBrowser error:", error);
      try {
        await Linking.openURL(url);
      } catch (linkError) {
        Alert.alert("Error", "Could not open browser.");
      }
    }
  };

  const handleSearchYelp = async () => {
    if (!location) {
      Alert.alert("Location Required", "Please enable location access to search.");
      return;
    }

    const { latitude, longitude } = location.coords;
    // Yelp supports lat/lng parameters
    const url = `https://www.yelp.com/search?find_desc=Optometrists&l=g:${longitude},${latitude},${longitude},${latitude}`;
    
    console.log("Opening Yelp URL:", url);
    
    try {
      await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: 'close',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });
    } catch (error) {
      console.log("WebBrowser error:", error);
      try {
        await Linking.openURL(url);
      } catch (linkError) {
        Alert.alert("Error", "Could not open Yelp.");
      }
    }
  };

  const handleSearchHealthgrades = async () => {
    if (!location) {
      Alert.alert("Location Required", "Please enable location access to search.");
      return;
    }

    const { latitude, longitude } = location.coords;
    // Healthgrades with coordinates
    const url = `https://www.healthgrades.com/optometry-directory?lat=${latitude}&lon=${longitude}`;
    
    console.log("Opening Healthgrades URL:", url);
    
    try {
      await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: 'close',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });
    } catch (error) {
      console.log("WebBrowser error:", error);
      try {
        await Linking.openURL(url);
      } catch (linkError) {
        Alert.alert("Error", "Could not open browser.");
      }
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  // Loading Screen
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Optometrists</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Permission Denied Screen
  if (permissionDenied) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Optometrists</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={48} color="#ff6b6b" />
          </View>
          <Text style={styles.title}>Location Access Required</Text>
          <Text style={styles.subtitle}>
            To find optometrists near you, please enable location access for this app.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenSettings}>
            <Ionicons name="settings-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={requestLocationPermission}>
            <Text style={styles.secondaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main Search Screen
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Optometrists</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Location Info */}
        <View style={styles.locationCard}>
          <Ionicons name="location" size={24} color="#4a9eff" />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Your Location</Text>
            <Text style={styles.locationName}>{locationName || "Location detected"}</Text>
          </View>
          <TouchableOpacity onPress={requestLocationPermission}>
            <Ionicons name="refresh" size={20} color="#4a9eff" />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View style={styles.iconContainerSmall}>
          <Ionicons name="eye" size={36} color="#4a9eff" />
        </View>

        <Text style={styles.titleSmall}>Search for Optometrists</Text>
        <Text style={styles.subtitleSmall}>
          Find eye doctors and optometrists near your current location
        </Text>

        {/* Search Buttons */}
        <View style={styles.searchButtons}>
          <TouchableOpacity
            style={[styles.searchButton, styles.googleButton]}
            onPress={handleSearchGoogle}
          >
            <Ionicons name="search" size={22} color="#fff" />
            <Text style={styles.searchButtonText}>Search on Google Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.searchButton, styles.healthButton]}
            onPress={handleSearchHealthgrades}
          >
            <Ionicons name="medkit" size={22} color="#fff" />
            <Text style={styles.searchButtonText}>Search Healthgrades</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.searchButton, styles.yelpButton]}
            onPress={handleSearchYelp}
          >
            <Ionicons name="star" size={22} color="#fff" />
            <Text style={styles.searchButtonText}>Search on Yelp</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#4a9eff" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Prescription Tip</Text>
            <Text style={styles.infoText}>
              Eye prescriptions typically expire 1-2 years from the exam date. Schedule regular eye exams to keep your prescription current.
            </Text>
          </View>
        </View>

        {/* Ad Banner Placeholder */}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    alignItems: "center",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 24,
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: "#8899a6",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  locationName: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginTop: 2,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainerSmall: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  titleSmall: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  subtitleSmall: {
    fontSize: 14,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a9eff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    width: "100%",
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: "#4a9eff",
    textDecorationLine: "underline",
  },
  searchButtons: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
  },
  googleButton: {
    backgroundColor: "#4a9eff",
  },
  yelpButton: {
    backgroundColor: "#d32323",
  },
  healthButton: {
    backgroundColor: "#00a67c",
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    width: "100%",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#8899a6",
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
    gap: 8,
  },
  adPlaceholderText: {
    fontSize: 14,
    color: "#6b7c8f",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
