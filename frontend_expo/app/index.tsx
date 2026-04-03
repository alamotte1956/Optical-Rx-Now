import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trackAppOpen } from "../services/analytics";
import { trackAppOpenForASO } from "../services/asoService";

const AGE_VERIFIED_KEY = "@optical_rx_age_verified";
const ONBOARDING_COMPLETE_KEY = "@optical_rx_onboarding_complete";

export default function IndexScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Track app open for analytics and ASO
    trackAppOpen();
    trackAppOpenForASO();
    
    // Small delay to ensure AsyncStorage is ready on mobile
    const timer = setTimeout(() => {
      checkAppState();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const checkAppState = async () => {
    try {
      const verified = await AsyncStorage.getItem(AGE_VERIFIED_KEY);
      const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      
      console.log("Age verification status:", verified);
      console.log("Onboarding status:", onboardingComplete);
      
      // First check age verification
      if (verified !== "true") {
        router.replace("/age-verify");
        return;
      }
      
      // Then check onboarding
      if (onboardingComplete !== "true") {
        router.replace("/onboarding");
        return;
      }
      
      // Both complete - go to welcome
      router.replace("/welcome");
    } catch (error) {
      console.log("Error checking app state:", error);
      // On error, show age verification
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
