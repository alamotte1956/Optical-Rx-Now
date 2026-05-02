import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveSettings } from "../services/localStorage";

const { width } = Dimensions.get("window");

const ONBOARDING_COMPLETE_KEY = "@optical_rx_onboarding_complete";

const DEFAULT_REMINDERS = [
  { days: 30, label: "30 days before", enabled: true },
  { days: 14, label: "14 days before", enabled: true },
  { days: 7, label: "7 days before", enabled: true },
  { days: 2, label: "2 days before", enabled: true },
  { days: 0, label: "Day of expiration", enabled: true },
];

const slides = [
  {
    id: "1",
    icon: "camera",
    title: "Snap & Save",
    description: "Take a photo of your optical document and save it instantly. Enter the expiration date to get timely reminders.",
    color: "#4a9eff",
    isReminderSlide: false,
  },
  {
    id: "2",
    icon: "people",
    title: "Family Management",
    description: "Add unlimited family members and keep everyone's eyeglass and contact lens optical documents organized in one place.",
    color: "#4CAF50",
    isReminderSlide: false,
  },
  {
    id: "3",
    icon: "notifications",
    title: "Customize Your Reminders",
    description: "Choose when to receive alerts before your optical documents expire. You can change these anytime in settings.",
    color: "#FF9800",
    isReminderSlide: true,
  },
  {
    id: "4",
    icon: "share",
    title: "Share & Print",
    description: "Easily share optical documents as PDFs with your optometrist or optical store. Print directly from the app when needed.",
    color: "#9C27B0",
    isReminderSlide: false,
  },
  {
    id: "5",
    icon: "shield-checkmark",
    title: "Private & Secure",
    description: "Your data stays on YOUR device. We never upload your optical documents to any server. Complete privacy, always.",
    color: "#00BCD4",
    isReminderSlide: false,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const [reminderSettings, setReminderSettings] = useState(DEFAULT_REMINDERS);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const toggleReminder = (days: number) => {
    setReminderSettings(prev => 
      prev.map(r => r.days === days ? { ...r, enabled: !r.enabled } : r)
    );
  };

  const scrollToNext = async () => {
    // Save reminder settings when leaving the reminder slide
    if (slides[currentIndex].isReminderSlide) {
      await saveSettings({ notificationsEnabled: true, email: null, reminderDays: reminderSettings });
    }
    
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await saveSettings({ notificationsEnabled: true, email: null, reminderDays: reminderSettings });
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    } catch (error) {
      console.log("Error saving onboarding state:", error);
    }
    router.replace("/welcome");
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon as any} size={80} color={item.color} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      
      {item.isReminderSlide && (
        <View style={styles.reminderOptions}>
          {reminderSettings.map((reminder) => (
            <TouchableOpacity
              key={reminder.days}
              style={styles.reminderRow}
              onPress={() => toggleReminder(reminder.days)}
            >
              <Ionicons 
                name={reminder.enabled ? "checkbox" : "square-outline"} 
                size={24} 
                color={reminder.enabled ? "#FF9800" : "#6b7c8f"} 
              />
              <Text style={[styles.reminderLabel, reminder.enabled && styles.reminderLabelActive]}>
                {reminder.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const Pagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 24, 10],
          extrapolate: "clamp",
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });
        return (
          <Animated.View
            key={index}
            style={[styles.dot, { width: dotWidth, opacity, backgroundColor: slides[index].color }]}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.footer}>
        <Pagination />
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: slides[currentIndex].color }]}
          onPress={scrollToNext}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons
            name={currentIndex === slides.length - 1 ? "checkmark" : "arrow-forward"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: "#8899a6",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#8899a6",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  reminderOptions: {
    marginTop: 24,
    width: "100%",
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderRadius: 16,
    padding: 16,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  reminderLabel: {
    fontSize: 16,
    color: "#8899a6",
  },
  reminderLabelActive: {
    color: "#fff",
    fontWeight: "500",
  },
});
