import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Affiliate program links for management
const AFFILIATE_LINKS = [
  {
    name: "Sam's Club Affiliate",
    url: "https://www.samsclub.com/content/affiliate-program",
    description: "Join Sam's Club affiliate program",
  },
  {
    name: "Zenni Optical Affiliate",
    url: "https://www.zennioptical.com/c/affiliate",
    description: "Impact Radius affiliate network",
  },
  {
    name: "Eyeglasses.com Affiliate",
    url: "https://www.eyeglasses.com/info/affiliate-program",
    description: "Up to 15% commission via IMPACT.com",
  },
  {
    name: "Designer Optics Affiliate",
    url: "https://designeroptics.com/pages/affiliate-program",
    description: "15% commission via Partnerize",
  },
  {
    name: "Clearly Affiliate",
    url: "https://www.clearly.com/affiliate",
    description: "Up to 12% commission",
  },
  {
    name: "Target Optical Affiliate",
    url: "https://www.targetoptical.com/to-us/affiliates-main",
    description: "Up to 8% via Commission Junction",
  },
  {
    name: "Eyeconic Affiliate",
    url: "https://www.eyeconic.com/affiliates.html",
    description: "VSP network affiliate program",
  },
  {
    name: "SportRx Affiliate",
    url: "https://www.sportrx.com/affiliate-program/",
    description: "Sports eyewear affiliate program",
  },
];

const ADMIN_LINKS = [
  {
    name: "App Store Connect",
    url: "https://appstoreconnect.apple.com",
    icon: "logo-apple",
    description: "Manage iOS app",
  },
  {
    name: "Google Play Console",
    url: "https://play.google.com/console",
    icon: "logo-google-playstore",
    description: "Manage Android app",
  },
  {
    name: "Optical Rx Now Website",
    url: "https://opticalrxnow.com",
    icon: "globe-outline",
    description: "Company website",
  },
];

export default function AdminScreen() {
  const router = useRouter();
  const [showAffiliates, setShowAffiliates] = useState(true);

  const handleOpenLink = async (url: string, name: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `Cannot open ${name}`);
      }
    } catch (error) {
      console.log("Error opening link:", error);
      Alert.alert("Error", "Could not open link");
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete ALL prescriptions, family members, and app settings. This action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Done", "All data has been cleared. Please restart the app.");
            } catch (error) {
              console.log("Error clearing data:", error);
              Alert.alert("Error", "Could not clear data");
            }
          },
        },
      ]
    );
  };

  const handleResetAgeVerification = async () => {
    try {
      await AsyncStorage.removeItem("@optical_rx_age_verified");
      Alert.alert("Done", "Age verification has been reset.");
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Admin Links Section */}
        <Text style={styles.sectionTitle}>App Management</Text>
        {ADMIN_LINKS.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={styles.linkCard}
            onPress={() => handleOpenLink(link.url, link.name)}
          >
            <View style={styles.linkIcon}>
              <Ionicons name={link.icon as any} size={24} color="#4a9eff" />
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkName}>{link.name}</Text>
              <Text style={styles.linkDescription}>{link.description}</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#6b7c8f" />
          </TouchableOpacity>
        ))}

        {/* Affiliate Programs Section */}
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => setShowAffiliates(!showAffiliates)}
        >
          <Text style={styles.sectionTitle}>Affiliate Programs</Text>
          <Ionicons 
            name={showAffiliates ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#8899a6" 
          />
        </TouchableOpacity>
        
        {showAffiliates && AFFILIATE_LINKS.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={styles.affiliateCard}
            onPress={() => handleOpenLink(link.url, link.name)}
          >
            <View style={styles.affiliateInfo}>
              <Text style={styles.affiliateName}>{link.name}</Text>
              <Text style={styles.affiliateDescription}>{link.description}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#6b7c8f" />
          </TouchableOpacity>
        ))}

        {/* Data Management Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Data Management</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleResetAgeVerification}
        >
          <Ionicons name="refresh" size={20} color="#4a9eff" />
          <Text style={styles.actionButtonText}>Reset Age Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleClearAllData}
        >
          <Ionicons name="trash" size={20} color="#ff4d4d" />
          <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All App Data</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Optical Rx Now v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2025 Optical Rx Now</Text>
        </View>
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
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  linkInfo: {
    flex: 1,
    marginLeft: 12,
  },
  linkName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  linkDescription: {
    fontSize: 13,
    color: "#8899a6",
    marginTop: 2,
  },
  affiliateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  affiliateInfo: {
    flex: 1,
  },
  affiliateName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fff",
  },
  affiliateDescription: {
    fontSize: 12,
    color: "#8899a6",
    marginTop: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 15,
    color: "#4a9eff",
    fontWeight: "500",
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 77, 77, 0.3)",
  },
  dangerText: {
    color: "#ff4d4d",
  },
  appInfo: {
    marginTop: 32,
    alignItems: "center",
    paddingBottom: 24,
  },
  appInfoText: {
    fontSize: 12,
    color: "#6b7c8f",
    marginBottom: 4,
  },
});
