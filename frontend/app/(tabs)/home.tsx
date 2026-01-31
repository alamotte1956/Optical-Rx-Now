import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

// This is a placeholder screen that immediately redirects to the welcome screen
export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, []);

  return <View style={{ flex: 1, backgroundColor: "#0a1628" }} />;
}
