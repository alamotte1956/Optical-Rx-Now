import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { BackHandler, Platform, Alert, View, Text, StyleSheet } from "react-native";
import {
  AgeVerificationModal,
  checkAgeVerification,
  checkAgeDeclined,
} from "./components/AgeVerificationModal";
import { setupGlobalErrorHandlers } from "./utils/errorHandler";

export default function RootLayout() {
  const [isAgeVerified, setIsAgeVerified] = useState<boolean | null>(null);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [ageDeclined, setAgeDeclined] = useState(false);

  // Set up global error handlers
  useEffect(() => {
    const cleanup = setupGlobalErrorHandlers();
    return cleanup;
  }, []);

  useEffect(() => {
    // Check age verification on app launch
    const checkAge = async () => {
      const verified = await checkAgeVerification();
      const declined = await checkAgeDeclined();
      
      setIsAgeVerified(verified);
      setAgeDeclined(declined);
      
      if (!verified && !declined) {
        setShowAgeModal(true);
      }
    };
    
    checkAge();
  }, []);

  // Prevent Android back button during age verification
  useEffect(() => {
    if (Platform.OS === 'android' && showAgeModal && !isAgeVerified) {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true // Block back button
      );
      return () => backHandler.remove();
    }
  }, [showAgeModal, isAgeVerified]);

  const handleAgeVerified = () => {
    setIsAgeVerified(true);
    setShowAgeModal(false);
  };

  const handleAgeDeclined = () => {
    if (Platform.OS === 'android') {
      // Exit the app on Android
      BackHandler.exitApp();
    } else {
      // On iOS, show permanent block screen (apps cannot programmatically exit)
      setAgeDeclined(true);
      setShowAgeModal(false);
    }
  };

  // Don't render main app until age verification is checked
  if (isAgeVerified === null) {
    return null; // Or show a splash screen
  }

  // Show permanent block screen for iOS users who declined
  if (ageDeclined && Platform.OS === 'ios') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.blockScreen}>
          <View style={styles.blockContainer}>
            <Text style={styles.blockIcon}>🚫</Text>
            <Text style={styles.blockTitle}>Age Requirement Not Met</Text>
            <Text style={styles.blockMessage}>
              This app is restricted to adults 18 years or older.
            </Text>
            <Text style={styles.blockMessage}>
              You indicated that you do not meet the age requirement.
            </Text>
            <Text style={styles.blockInstructions}>
              To use this app, you must be 18 years of age or older.
            </Text>
            <Text style={styles.blockFooter}>
              Please close the app manually by swiping up from the bottom of the screen.
            </Text>
          </View>
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
  blockScreen: {
    flex: 1,
    backgroundColor: '#0a1628',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  blockContainer: {
    backgroundColor: '#1a2332',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#ff4444',
    alignItems: 'center',
  },
  blockIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  blockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  blockMessage: {
    fontSize: 16,
    color: '#b0b8c0',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  blockInstructions: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
    fontWeight: '600',
    lineHeight: 24,
  },
  blockFooter: {
    fontSize: 14,
    color: '#8a929a',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
