import { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRootNavigationState, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";

export default function HomeTab() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    // Get the parent navigator (root stack) and reset to welcome screen
    const parent = navigation.getParent();
    if (parent) {
      parent.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'index' }],
        })
      );
    } else {
      // Fallback - navigate directly
      router.push("/");
    }
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4a9eff" />
      <Text style={styles.text}>Redirecting to Home...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a1628",
  },
  text: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
});
