import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { requestTrackingPermission } from "./utils/tracking";

export default function RootLayout() {
  useEffect(() => {
    // Request App Tracking Transparency permission on iOS
    // This should be done after the app is fully loaded
    if (Platform.OS === 'ios') {
      // Small delay to ensure app is ready before showing the ATT dialog
      const timer = setTimeout(() => {
        requestTrackingPermission().then((granted) => {
          if (granted) {
            console.log('Tracking permission granted');
          } else {
            console.log('Tracking permission denied');
          }
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
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
