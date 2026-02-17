import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AGE_VERIFIED_KEY = "@optical_rx_age_verified";

export default function IndexScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Small delay to ensure AsyncStorage is ready on mobile
    const timer = setTimeout(() => {
      checkAgeVerification();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const checkAgeVerification = async () => {
    try {
      const verified = await AsyncStorage.getItem(AGE_VERIFIED_KEY);
      console.log("Age verification status:", verified);
      
      // Explicit check for the string "true"
      if (verified !== null && verified === "true") {
        router.replace("/welcome");
      } else {
        // Not verified or null - show age verification
        router.replace("/age-verify");
      }
    } catch (error) {
      console.log("Error checking age verification:", error);
      // On error, always show age verification
      router.replace("/age-verify");
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4a9eff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
    justifyContent: "center",
    alignItems: "center",
  },
});
