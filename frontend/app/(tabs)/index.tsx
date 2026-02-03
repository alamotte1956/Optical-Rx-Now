import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AdBanner from "../components/AdBanner";
import { getFamilyMembers, getPrescriptions, type FamilyMember, type Prescription } from "../../services/localStorage";

export default function PrescriptionsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Navigate back to welcome screen
  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'index' }],
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const [membersData, rxData] = await Promise.all([
        getFamilyMembers(),
        getPrescriptions(),
      ]);

      setFamilyMembers(membersData);
      setPrescriptions(rxData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load prescriptions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getMemberName = (memberId: string) => {
    const member = familyMembers.find((m) => m.id === memberId);
    return member?.name || "Unknown";
  };

  const filteredPrescriptions = selectedMember
    ? prescriptions.filter((p) => p.family_member_id === selectedMember)
    : prescriptions;

  const groupedPrescriptions = filteredPrescriptions.reduce((acc, rx) => {
    const memberName = getMemberName(rx.family_member_id);
    if (!acc[memberName]) {
      acc[memberName] = [];
    }
    acc[memberName].push(rx);
    return acc;
  }, {} as Record<string, Prescription[]>);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Loading prescriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            // Navigate to welcome screen using Linking
            const url = Linking.createURL("/");
            Linking.openURL(url);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={22} color="#4a9eff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescriptions</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/shop")}
          >
            <Ionicons name="cart" size={20} color="#4a9eff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/add-rx")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ad Banner */}
      <AdBanner />

      {/* Filter Chips */}
      {familyMembers.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedMember === null && styles.filterChipActive,
            ]}
            onPress={() => setSelectedMember(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedMember === null && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {familyMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.filterChip,
                selectedMember === member.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedMember(member.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedMember === member.id && styles.filterChipTextActive,
                ]}
              >
                {member.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Prescriptions List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4a9eff"
          />
        }
      >
        {prescriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#3a4d63" />
            <Text style={styles.emptyTitle}>No Prescriptions Yet</Text>
            <Text style={styles.emptyText}>
              {familyMembers.length === 0
                ? "Add a family member first, then capture their Rx"
                : "Tap the + button to add your first prescription"}
            </Text>
            {familyMembers.length === 0 && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/add-member")}
              >
                <Text style={styles.emptyButtonText}>Add Family Member</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : filteredPrescriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#3a4d63" />
            <Text style={styles.emptyTitle}>No Results</Text>
            <Text style={styles.emptyText}>
              No prescriptions found for the selected filter
            </Text>
          </View>
        ) : (
          Object.entries(groupedPrescriptions).map(([memberName, rxList]) => (
            <View key={memberName} style={styles.memberSection}>
              <Text style={styles.memberSectionTitle}>{memberName}</Text>
              <View style={styles.rxGrid}>
                {rxList.map((rx) => (
                  <TouchableOpacity
                    key={rx.id}
                    style={styles.rxCard}
                    onPress={() =>
                      router.push({ pathname: "/rx-detail", params: { id: rx.id } })
                    }
                  >
                    <Image
                      source={{ uri: rx.image_uri }}
                      style={styles.rxImage}
                      resizeMode="cover"
                    />
                    <View style={styles.rxInfo}>
                      <View style={styles.rxTypeContainer}>
                        <Ionicons
                          name={rx.rx_type === "eyeglass" ? "glasses" : "eye"}
                          size={14}
                          color="#4a9eff"
                        />
                        <Text style={styles.rxType}>
                          {rx.rx_type === "eyeglass" ? "Eyeglass" : "Contact"}
                        </Text>
                      </View>
                      <Text style={styles.rxDate}>{rx.date_taken}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
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
  loadingText: {
    color: "#8899a6",
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  homeButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  homeButtonText: {
    color: "#4a9eff",
    fontSize: 14,
    fontWeight: "500",
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginLeft: 12,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4a9eff",
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a2d45",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#4a9eff",
  },
  filterChipText: {
    color: "#8899a6",
    fontSize: 14,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#8899a6",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: "#4a9eff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  memberSection: {
    marginTop: 24,
  },
  memberSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  rxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  rxCard: {
    width: "47%",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    overflow: "hidden",
  },
  rxImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#0f1d30",
  },
  rxInfo: {
    padding: 12,
  },
  rxTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rxType: {
    fontSize: 13,
    color: "#4a9eff",
    fontWeight: "500",
  },
  rxDate: {
    fontSize: 12,
    color: "#8899a6",
    marginTop: 4,
  },
});
