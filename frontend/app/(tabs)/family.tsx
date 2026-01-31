import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = -80;

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  created_at: string;
}

interface Stats {
  [key: string]: number;
}

export default function FamilyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [prescriptionCounts, setPrescriptionCounts] = useState<Stats>({});

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const [membersRes, rxRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/family-members`),
        fetch(`${BACKEND_URL}/api/prescriptions`),
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      if (rxRes.ok) {
        const rxData = await rxRes.json();
        const counts: Stats = {};
        rxData.forEach((rx: any) => {
          counts[rx.family_member_id] = (counts[rx.family_member_id] || 0) + 1;
        });
        setPrescriptionCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load family members");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDeleteMember = (member: FamilyMember) => {
    Alert.alert(
      "Delete Family Member",
      `Are you sure you want to delete ${member.name}? All their prescriptions will also be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${BACKEND_URL}/api/family-members/${member.id}`,
                { method: "DELETE" }
              );
              if (response.ok) {
                fetchData();
              } else {
                Alert.alert("Error", "Failed to delete family member");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete family member");
            }
          },
        },
      ]
    );
  };

  const getRelationshipIcon = (relationship: string) => {
    const rel = relationship.toLowerCase();
    if (rel.includes("self") || rel.includes("me")) return "person";
    if (rel.includes("spouse") || rel.includes("wife") || rel.includes("husband"))
      return "heart";
    if (rel.includes("child") || rel.includes("son") || rel.includes("daughter"))
      return "happy";
    if (rel.includes("parent") || rel.includes("mom") || rel.includes("dad"))
      return "people";
    return "person-outline";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
          <Text style={styles.loadingText}>Loading family members...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Members</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-member")}
        >
          <Ionicons name="person-add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Members List */}
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
        {members.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#3a4d63" />
            <Text style={styles.emptyTitle}>No Family Members</Text>
            <Text style={styles.emptyText}>
              Add your family members to start managing prescriptions
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/add-member")}
            >
              <Ionicons name="person-add" size={18} color="#fff" />
              <Text style={styles.emptyButtonText}>Add Family Member</Text>
            </TouchableOpacity>
          </View>
        ) : (
          members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberIconContainer}>
                <Ionicons
                  name={getRelationshipIcon(member.relationship) as any}
                  size={28}
                  color="#4a9eff"
                />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRelationship}>{member.relationship}</Text>
                <Text style={styles.memberRxCount}>
                  {prescriptionCounts[member.id] || 0} prescription
                  {(prescriptionCounts[member.id] || 0) !== 1 ? "s" : ""}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteMember(member)}
              >
                <Ionicons name="trash-outline" size={20} color="#ff5c5c" />
              </TouchableOpacity>
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4a9eff",
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: "#4a9eff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  memberIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  memberRelationship: {
    fontSize: 14,
    color: "#8899a6",
    marginTop: 2,
  },
  memberRxCount: {
    fontSize: 12,
    color: "#4a9eff",
    marginTop: 4,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 92, 92, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});
