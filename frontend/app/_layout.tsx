import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import {
  AgeVerificationModal,
  checkAgeVerification,
} from "./components/AgeVerificationModal";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { setupGlobalErrorHandlers } from "../utils/errorHandler";
import { HealthCheck } from "../utils/healthCheck";

export default function RootLayout() {
  const [isAgeVerified, setIsAgeVerified] = useState<boolean | null>(null);
  const [showAgeModal, setShowAgeModal] = useState(false);

  useEffect(() => {
    // Setup global error handlers
    setupGlobalErrorHandlers();
    
    // Run health check on app launch
    HealthCheck.runHealthCheck().then((result) => {
      console.log('[App] Health check result:', result.overall);
      if (result.overall === 'critical') {
        console.warn('[App] Critical health issues detected:', result.recommendations);
      }
    }).catch((error) => {
      console.error('[App] Health check failed:', error);
    });
    
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
    // Exit the app if user is under 18
    BackHandler.exitApp();
  };

  // Don't render main app until age verification is checked
  if (isAgeVerified === null) {
    return null; // Or show a splash screen
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
