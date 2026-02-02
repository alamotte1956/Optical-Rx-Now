import { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function HomeTab() {
  const router = useRouter();

  useEffect(() => {
    // Go back to welcome screen
    router.back();
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
