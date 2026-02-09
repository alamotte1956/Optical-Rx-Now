import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AGE_VERIFIED_KEY = "@optical_rx_age_verified";

export default function AgeVerificationScreen() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);

  const handleVerifyAge = async (isOver18: boolean) => {
    if (isOver18) {
      setVerifying(true);
      try {
        await AsyncStorage.setItem(AGE_VERIFIED_KEY, "true");
        router.replace("/welcome");
      } catch (error) {
        console.log("Error saving age verification:", error);
        router.replace("/welcome");
      }
    } else {
      Alert.alert(
        "Age Requirement",
        "You must be 18 years or older to use this app.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Age Verification Card */}
        <View style={styles.verificationCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={48} color="#4a9eff" />
          </View>
          
          <Text style={styles.title}>Age Verification Required</Text>
          
          <Text style={styles.description}>
            You must be 18 years of age or older to use Optical Rx Now.
          </Text>

          <Text style={styles.question}>
            Are you 18 years of age or older?
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.yesButton}
              onPress={() => handleVerifyAge(true)}
              disabled={verifying}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.yesButtonText}>Yes, I am 18+</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.noButton}
              onPress={() => handleVerifyAge(false)}
              disabled={verifying}
            >
              <Ionicons name="close-circle" size={24} color="#ff5c5c" />
              <Text style={styles.noButtonText}>No, I am under 18</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Disclaimer */}
        <Text style={styles.disclaimer}>
          By continuing, you confirm that you are at least 18 years old and agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 200,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  verificationCard: {
    width: "100%",
    backgroundColor: "#1a2d45",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  yesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
  },
  yesButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  noButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 92, 92, 0.15)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff5c5c",
    gap: 10,
  },
  noButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff5c5c",
  },
  disclaimer: {
    fontSize: 12,
    color: "#6b7c8f",
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
});
