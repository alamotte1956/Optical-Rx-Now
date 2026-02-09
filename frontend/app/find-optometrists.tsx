import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FindOptometristsScreen() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    const url = `https://www.google.com/search?q=optometrists+near+me`;
    
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log("Error opening Google:", error);
    }
  };

  const handleSearchYelp = async () => {
    if (!zipCode || zipCode.length < 5) {
      return;
    }
    
    const yelpUrl = `https://www.yelp.com/search?find_desc=Optometrists&find_loc=${zipCode}`;
    
    try {
      await Linking.openURL(yelpUrl);
    } catch (error) {
      console.log("Error opening Yelp:", error);
    }
  };

  const handleSearchHealthgrades = async () => {
    const url = `https://www.healthgrades.com/optometry-directory`;
    
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log("Error opening Healthgrades:", error);
    }
  };

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

          {/* Search Buttons */}
          <View style={styles.searchButtons}>
            <TouchableOpacity
              style={[styles.searchButton, styles.primaryButton]}
              onPress={handleSearch}
            >
              <Ionicons name="search" size={22} color="#fff" />
              <Text style={styles.searchButtonText}>Search on Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.searchButton, styles.yelpButton]}
              onPress={handleSearchYelp}
              disabled={!zipCode || zipCode.length < 5}
            >
              <Ionicons name="star" size={22} color="#fff" />
              <Text style={styles.searchButtonText}>Search on Yelp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.searchButton, styles.healthButton]}
              onPress={handleSearchHealthgrades}
            >
              <Ionicons name="medkit" size={22} color="#fff" />
              <Text style={styles.searchButtonText}>Search Healthgrades</Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#4a9eff" />
            <Text style={styles.infoText}>
              We'll open your preferred service to show optometrists near your location. You can compare ratings, read reviews, and find contact information.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: 24,
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
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    width: "100%",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#8899a6",
    lineHeight: 20,
  },
});
