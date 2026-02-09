import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AGE_VERIFIED_KEY = "@optical_rx_age_verified";

export default function IndexScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAgeVerification();
  }, []);

  const checkAgeVerification = async () => {
    try {
      const verified = await AsyncStorage.getItem(AGE_VERIFIED_KEY);
      if (verified === "true") {
        router.replace("/welcome");
      } else {
        router.replace("/age-verify");
      }
    } catch (error) {
      console.log("Error checking age verification:", error);
      router.replace("/age-verify");
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
