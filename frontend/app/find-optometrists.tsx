import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

export default function FindOptometristsScreen() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState("");
  const [hasEnteredZip, setHasEnteredZip] = useState(false);

  const isValidZip = /^\d{5}$/.test(zipCode);

  const handleContinue = () => {
    if (!isValidZip) {
      Alert.alert("Invalid ZIP Code", "Please enter a valid 5-digit ZIP code.");
      return;
    }
    setHasEnteredZip(true);
  };

  const handleSearchGoogle = async () => {
    // Get current zip code value
    const currentZip = zipCode.trim();
    
    // Validate zipCode presence
    if (!currentZip || currentZip.length !== 5) {
      Alert.alert("Input Required", "Please enter a valid 5-digit zip code first.");
      return;
    }

    // Build URL with proper encoding
    const searchTerm = `optometrist near ${currentZip}`;
    const encodedSearch = encodeURIComponent(searchTerm);
    const url = `https://www.google.com/search?q=${encodedSearch}`;
    
    console.log("ZIP Code:", currentZip);
    console.log("Opening Google URL:", url);
    
    try {
      // Try WebBrowser first (in-app browser)
      const result = await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: 'close',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        toolbarColor: '#ffffff',
      });
      
      console.log("WebBrowser result:", result);
    } catch (error) {
      console.error("WebBrowser error, attempting fallback:", error);
      
      // Fallback to system browser via Linking
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          throw new Error("Cannot open URL");
        }
      } catch (fallbackError) {
        Alert.alert(
          "Error", 
          "Could not open browser. Please check your device settings or try again later."
        );
      }
    }
  };

  const handleSearchYelp = async () => {
    const currentZip = zipCode.trim();
    if (!currentZip) return;
    
    const url = `https://www.yelp.com/search?find_desc=Optometrists&find_loc=${currentZip}`;
    console.log("ZIP Code:", currentZip);
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
        Alert.alert("Error", "Could not open Yelp. Please try again.");
      }
    }
  };

  const handleSearchHealthgrades = async () => {
    const currentZip = zipCode.trim();
    if (!currentZip) return;
    
    const url = `https://www.healthgrades.com/optometry-directory?loc=${currentZip}`;
    console.log("ZIP Code:", currentZip);
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
        Alert.alert("Error", "Could not open browser. Please try again.");
      }
    }
  };

  // ZIP Code Entry Screen
  if (!hasEnteredZip) {
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
            <Text style={styles.headerTitle}>Find Optometrists</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="eye" size={48} color="#4a9eff" />
            </View>

            <Text style={styles.title}>Find Eye Doctors Near You</Text>
            <Text style={styles.subtitle}>
              Enter your ZIP code to find optometrists and eye care professionals in your area.
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
              <Text style={styles.continueButtonText}>Find Optometrists</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Ad Banner Placeholder */}
            <TouchableOpacity 
              style={styles.adPlaceholder}
              onPress={() => Linking.openURL("https://opticalrxnow.com")}
            >
              <Ionicons name="megaphone-outline" size={24} color="#4a9eff" />
              <Text style={styles.adPlaceholderText}>Advertise with us Here</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Search Results Screen
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Optometrists</Text>
        <TouchableOpacity onPress={() => setHasEnteredZip(false)} style={styles.zipButton}>
          <Ionicons name="location" size={18} color="#4a9eff" />
          <Text style={styles.zipButtonText}>{zipCode}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Icon */}
        <View style={styles.iconContainerSmall}>
          <Ionicons name="eye" size={36} color="#4a9eff" />
        </View>

        <Text style={styles.titleSmall}>Search for Optometrists</Text>
        <Text style={styles.subtitleSmall}>
          Choose a service below to find eye doctors near ZIP code {zipCode}
        </Text>

        {/* Search Buttons */}
        <View style={styles.searchButtons}>
          <TouchableOpacity
            style={[styles.searchButton, styles.healthButton]}
            onPress={handleSearchHealthgrades}
          >
            <Ionicons name="medkit" size={22} color="#fff" />
            <Text style={styles.searchButtonText}>Search Healthgrades</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.searchButton, styles.primaryButton]}
            onPress={handleSearchGoogle}
          >
            <Ionicons name="search" size={22} color="#fff" />
            <Text style={styles.searchButtonText}>Search on Google</Text>
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
          onPress={() => Linking.openURL("https://opticalrxnow.com")}
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
  },
  subtitleSmall: {
    fontSize: 14,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
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
    marginBottom: 24,
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
  primaryButton: {
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
