import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { BackHandler, Platform, Alert } from "react-native";
import {
  AgeVerificationModal,
  checkAgeVerification,
} from "./components/AgeVerificationModal";

export default function RootLayout() {
  const [isAgeVerified, setIsAgeVerified] = useState<boolean | null>(null);
  const [showAgeModal, setShowAgeModal] = useState(false);

  useEffect(() => {
    // Check age verification on app launch
    checkAgeVerification().then((verified) => {
      setIsAgeVerified(verified);
      if (!verified) {
        setShowAgeModal(true);
      }
    });
  }, []);

  const handleAgeVerified = () => {
    setIsAgeVerified(true);
    setShowAgeModal(false);
  };

  const handleAgeDeclined = () => {
    if (Platform.OS === 'android') {
      // Exit the app on Android
      BackHandler.exitApp();
    } else {
      // On iOS, apps cannot programmatically exit
      // Show a persistent blocking modal instead
      Alert.alert(
        'Age Requirement Not Met',
        'You must be 18 years or older to use this app. Please close the app.',
        [{ text: 'OK', onPress: () => setShowAgeModal(true) }],
        { cancelable: false }
      );
      // Keep the age modal visible
      setShowAgeModal(true);
    }
  };

  // Don't render main app until age verification is checked
  if (isAgeVerified === null) {
    return null; // Or show a splash screen
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      
      {/* Age Verification Modal */}
      <AgeVerificationModal
        visible={showAgeModal}
        onVerified={handleAgeVerified}
        onDeclined={handleAgeDeclined}
      />

      {/* Main App Stack */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a1628" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="add-rx" options={{ presentation: "modal" }} />
        <Stack.Screen name="rx-detail" options={{ presentation: "card" }} />
        <Stack.Screen name="add-member" options={{ presentation: "modal" }} />
        <Stack.Screen name="shop" options={{ presentation: "card" }} />
        <Stack.Screen name="admin" options={{ presentation: "card" }} />
        <Stack.Screen name="manage-affiliates" options={{ presentation: "card" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
