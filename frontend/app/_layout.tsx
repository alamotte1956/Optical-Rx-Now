import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
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
        <Stack.Screen name="age-verify" options={{ gestureEnabled: false }} />
        <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="add-rx" options={{ presentation: "modal" }} />
        <Stack.Screen name="rx-detail" options={{ presentation: "card" }} />
        <Stack.Screen name="add-member" options={{ presentation: "modal" }} />
        <Stack.Screen name="shop" options={{ presentation: "card" }} />
        <Stack.Screen name="admin" options={{ presentation: "card" }} />
        <Stack.Screen name="manage-affiliates" options={{ presentation: "card" }} />
        <Stack.Screen name="optical-stores" options={{ presentation: "card" }} />
        <Stack.Screen name="find-optometrists" options={{ presentation: "card" }} />
        <Stack.Screen name="email-alerts" options={{ presentation: "card" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
