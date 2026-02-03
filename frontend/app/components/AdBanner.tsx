import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AdBanner() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'ios') {
        try {
          const Tracking = await import('expo-tracking-transparency');
          const { status } = await Tracking.requestTrackingPermissionsAsync();
          setHasPermission(status === 'granted');
        } catch (error) {
          console.log('Tracking transparency not available');
          setHasPermission(true);
        }
      } else {
        setHasPermission(true); // Android doesn't need ATT
      }
    })();
  }, []);

  const handleAdPress = async () => {
    // Track ad click for analytics (non-blocking)
    try {
      const { trackAdClick } = await import("../../services/analytics");
      trackAdClick("shop_banner");
    } catch (e) {}
    // Navigate to shop page with eyewear retailers
    router.push("/shop");
  };

  // Only show ads after permission check
  if (!hasPermission && Platform.OS === 'ios') {
    return null;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleAdPress}>
      <View style={styles.adContent}>
        <Text style={styles.adLabel}>AD</Text>
        <View style={styles.adTextContainer}>
          <Text style={styles.adTitle}>Need new eyewear?</Text>
          <Text style={styles.adText}>Shop our trusted retail partners</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#6b7c8f" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a2d45",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  adContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adLabel: {
    backgroundColor: "#3a4d63",
    color: "#8899a6",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adTextContainer: {
    flex: 1,
  },
  adTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  adText: {
    color: "#8899a6",
    fontSize: 12,
    marginTop: 2,
  },
});
