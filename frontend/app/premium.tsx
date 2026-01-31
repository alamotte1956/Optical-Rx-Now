import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Subscription {
  id: string;
  is_premium: boolean;
  subscription_type: string | null;
  expires_at: string | null;
}

const FEATURES = [
  { icon: "people", title: "Unlimited Family Members", free: "2 members", premium: "Unlimited" },
  { icon: "document-text", title: "Unlimited Prescriptions", free: "5 prescriptions", premium: "Unlimited" },
  { icon: "notifications", title: "Expiry Reminders", free: "Not included", premium: "Included" },
  { icon: "ban", title: "Ad-Free Experience", free: "With ads", premium: "No ads" },
  { icon: "cloud-upload", title: "Cloud Backup", free: "Not included", premium: "Coming soon" },
];

export default function PremiumScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/subscription`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      // In production, this would integrate with App Store / Google Play
      // For MVP, we simulate the upgrade
      const response = await fetch(`${BACKEND_URL}/api/subscription/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_type: selectedPlan }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
        Alert.alert(
          "Welcome to Premium!",
          "You now have unlimited access to all features.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to process upgrade. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your premium subscription?",
      [
        { text: "Keep Premium", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/api/subscription/cancel`, {
                method: "POST",
              });
              if (response.ok) {
                const data = await response.json();
                setSubscription(data);
                Alert.alert("Subscription Cancelled", "You can upgrade again anytime.");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to cancel subscription.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Ionicons name="star" size={40} color="#f5a623" />
          </View>
          <Text style={styles.badgeTitle}>
            {subscription?.is_premium ? "You're Premium!" : "Upgrade to Premium"}
          </Text>
          <Text style={styles.badgeSubtitle}>
            {subscription?.is_premium
              ? "Enjoy unlimited access to all features"
              : "Unlock all features and remove limits"}
          </Text>
        </View>

        {/* Features Comparison */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What You Get</Text>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={20} color="#4a9eff" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <View style={styles.featureComparison}>
                  <Text style={styles.freeText}>{feature.free}</Text>
                  <Ionicons name="arrow-forward" size={14} color="#6b7c8f" />
                  <Text style={styles.premiumText}>{feature.premium}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing Plans */}
        {!subscription?.is_premium && (
          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === "yearly" && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan("yearly")}
            >
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>BEST VALUE</Text>
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Yearly</Text>
                <Text style={styles.planPrice}>$19.99/year</Text>
                <Text style={styles.planSaving}>Save 44%</Text>
              </View>
              <View style={styles.planRadio}>
                {selectedPlan === "yearly" && (
                  <Ionicons name="checkmark-circle" size={24} color="#4a9eff" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === "monthly" && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan("monthly")}
            >
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Monthly</Text>
                <Text style={styles.planPrice}>$2.99/month</Text>
              </View>
              <View style={styles.planRadio}>
                {selectedPlan === "monthly" && (
                  <Ionicons name="checkmark-circle" size={24} color="#4a9eff" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionSection}>
          {subscription?.is_premium ? (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
              disabled={upgrading}
            >
              {upgrading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="star" size={20} color="#fff" />
                  <Text style={styles.upgradeButtonText}>
                    Upgrade to Premium
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Note */}
        <Text style={styles.note}>
          {subscription?.is_premium
            ? `Premium active until ${subscription.expires_at?.split("T")[0] || "N/A"}`
            : "Cancel anytime. No questions asked."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2d45",
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  badgeContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(245, 166, 35, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  badgeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  badgeSubtitle: {
    fontSize: 14,
    color: "#8899a6",
    textAlign: "center",
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2d45",
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },
  featureComparison: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  freeText: {
    fontSize: 12,
    color: "#ff5c5c",
  },
  premiumText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  plansSection: {
    marginBottom: 24,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  planCardSelected: {
    borderColor: "#4a9eff",
  },
  planBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "#f5a623",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  planPrice: {
    fontSize: 14,
    color: "#8899a6",
    marginTop: 4,
  },
  planSaving: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
    marginTop: 2,
  },
  planRadio: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  actionSection: {
    marginBottom: 16,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5a623",
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ff5c5c",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff5c5c",
  },
  note: {
    fontSize: 12,
    color: "#6b7c8f",
    textAlign: "center",
    marginBottom: 32,
  },
});
