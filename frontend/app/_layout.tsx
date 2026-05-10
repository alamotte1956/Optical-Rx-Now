import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { I18nProvider } from "../services/i18n";
import { ThemeProvider, useTheme } from "../services/theme";
import { logAnalyticsEvent } from "../services/adminApi";

// Recommendation 5: Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Recommendation 6: Crash Reporting — log errors to backend analytics
    try {
      logAnalyticsEvent("app_crash", {
        error: error.message,
        stack: error.stack?.substring(0, 500),
        componentStack: errorInfo.componentStack?.substring(0, 500),
      });
    } catch {
      // Silent fail — don't crash the crash handler
    }
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.emoji}>!</Text>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>
            The app encountered an unexpected error. Please try again.
          </Text>
          <TouchableOpacity
            style={errorStyles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={errorStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emoji: {
    fontSize: 48,
    fontWeight: "800",
    color: "#ff5c5c",
    marginBottom: 16,
    width: 64,
    height: 64,
    lineHeight: 64,
    textAlign: "center",
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#ff5c5c",
    overflow: "hidden",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#4a9eff",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});

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
        <Stack.Screen name="add-rx" options={{ presentation: "card" }} />
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
        <Stack.Screen name="insurance-cards" options={{ presentation: "card" }} />
      </Stack>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <I18nProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </I18nProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
