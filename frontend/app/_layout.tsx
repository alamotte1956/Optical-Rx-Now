import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { I18nProvider } from "../services/i18n";
import { ThemeProvider, useTheme } from "../services/theme";

function AppContent() {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="age-verify" options={{ gestureEnabled: false }} />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="add-rx" options={{ presentation: "modal" }} />
        <Stack.Screen name="rx-detail" options={{ presentation: "card" }} />
        <Stack.Screen name="add-member" options={{ presentation: "modal" }} />
        <Stack.Screen name="member/[id]" options={{ presentation: "card" }} />
        <Stack.Screen name="shop" options={{ presentation: "card" }} />
        <Stack.Screen name="find-optometrists" options={{ presentation: "card" }} />
        <Stack.Screen name="notification-settings" options={{ presentation: "card" }} />
        <Stack.Screen name="admin" options={{ presentation: "modal" }} />
        <Stack.Screen name="language-settings" options={{ presentation: "modal" }} />
        <Stack.Screen name="feedback" options={{ presentation: "modal" }} />
        <Stack.Screen name="vision-tips" options={{ presentation: "card" }} />
        <Stack.Screen name="privacy-policy" options={{ presentation: "card" }} />
        <Stack.Screen name="terms-of-service" options={{ presentation: "card" }} />
      </Stack>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </I18nProvider>
  );
}
