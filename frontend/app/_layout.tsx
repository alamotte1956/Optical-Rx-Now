import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { BackHandler, Platform, View, Text, StyleSheet } from "react-native";
import {
  AgeVerificationModal,
  checkAgeVerification,
} from "./components/AgeVerificationModal";

export default function RootLayout() {
  const [isAgeVerified, setIsAgeVerified] = useState<boolean | null>(null);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [ageDeclined, setAgeDeclined] = useState(false);

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
    setAgeDeclined(false);
  };

  const handleAgeDeclined = () => {
    if (Platform.OS === 'android') {
      // Exit the app on Android
      BackHandler.exitApp();
    } else {
      // On iOS, show a blocking screen since we can't exit
      setAgeDeclined(true);
      setShowAgeModal(false);
    }
  };

  // Don't render main app until age verification is checked
  if (isAgeVerified === null) {
    return null; // Or show a splash screen
  }

  // Show blocking screen on iOS if age verification was declined
  if (ageDeclined && Platform.OS === 'ios') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.blockingContainer}>
          <Text style={styles.blockingTitle}>Age Requirement Not Met</Text>
          <Text style={styles.blockingText}>
            You must be 18 years or older to use this app.
          </Text>
          <Text style={styles.blockingSubtext}>
            Please close this app by swiping up from the bottom of the screen.
          </Text>
        </View>
      </SafeAreaProvider>
    );
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

const styles = StyleSheet.create({
  blockingContainer: {
    flex: 1,
    backgroundColor: '#0a1628',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  blockingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  blockingText: {
    fontSize: 16,
    color: '#8899a6',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  blockingSubtext: {
    fontSize: 14,
    color: '#6b7c8f',
    textAlign: 'center',
    lineHeight: 22,
  },
});
