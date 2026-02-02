import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";

export default function TabLayout() {
  const router = useRouter();
  const navigation = useNavigation();
  
  const goToWelcome = () => {
    // Get the root navigator and reset to welcome screen
    const rootNav = navigation.getParent();
    if (rootNav) {
      rootNav.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'index' }],
        })
      );
    }
  };
  
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0f1d30",
          borderTopColor: "#1a2d45",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#4a9eff",
        tabBarInactiveTintColor: "#6b7c8f",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Prescriptions",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: "Family",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            goToWelcome();
          },
        }}
      />
    </Tabs>
  );
}
