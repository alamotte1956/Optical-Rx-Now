import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFamilyMembers,
  getPrescriptions,
  deleteFamilyMember,
  type FamilyMember,
} from "../../services/localStorage";

type MemberWithCount = FamilyMember & {
  prescription_count?: number;
};

export default function FamilyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState<MemberWithCount[]>([]);
  const [deleting, setDeleting] = useState(false);

  const goToHome = () => {
    router.push("/");
  };

  useFocusEffect(
    useCallback(() => {
      fetchMembers();
    }, [])
  );

  const fetchMembers = async () => {
    try {
      const family = await getFamilyMembers();
      const prescriptions = await getPrescriptions();

      console.log("Family:", family);
      console.log("Prescriptions:", prescriptions);

      const membersWithCounts = family.map((member) => {
        const count = prescriptions.filter((p) => {
          if (!p) return false;
          if (!p.family_member_id) return false;
          return String(p.family_member_id) === String(member.id);
        }).length;

        return {
          ...member,
          prescription_count: count,
        };
      });

      setMembers(membersWithCounts);
    } catch (error) {
      console.error("Error fetching members:", error);
      Alert.alert("Error", "Failed to load family members");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (deleting) return;

    Alert.alert(
      "Delete Family Member",
      `Delete ${memberName}? This will also delete all prescriptions.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteFamilyMember(memberId);
              await fetchMembers();
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete family member");
            } finally {
              setDeleting(false);
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
          <Text style={styles.loadingText}>Loading family members...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.homeButton} onPress={goToHome}>
          <Ionicons name="home-outline" size={22} color="#4a9eff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Family Members</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-member")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* List */}
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
            <Text style={styles.emptyTitle}>No Family Members Yet</Text>
            <Text style={styles.emptyText}>
              Tap the + button to add your first family member
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/add-member")}
            >
              <Text style={styles.emptyButtonText}>Add Family Member</Text>
            </TouchableOpacity>
          </View>
        ) : (
          members.map((member) => {
            const count = member.prescription_count || 0;

            return (
              <TouchableOpacity
                key={member.id}
                style={styles.memberCard}
                onPress={() =>
                  router.push({
                    pathname: "/member/[id]",
                    params: { id: member.id },
                  })
                }
                onLongPress={() =>
                  handleDeleteMember(member.id, member.name)
                }
              >
                <View style={styles.memberIcon}>
                  <Ionicons name="person" size={32} color="#4a9eff" />
                </View>

                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRelationship}>
                    {member.relationship}
                  </Text>
                  <Text style={styles.memberStats}>
                    {count} prescription{count !== 1 ? "s" : ""}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMember(member.id, member.name)}
                >
                  <Ionicons name="trash" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: { color: "#8899a6", marginTop: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginLeft: 12,
  },

  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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

  scrollView: { flex: 1 },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

  emptyState: {
    alignItems: "center",
    marginTop: 100,
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
  },

  emptyButton: {
    marginTop: 24,
    backgroundColor: "#4a9eff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },

  emptyButtonText: { color: "#fff", fontWeight: "600" },

  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },

  memberIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  memberInfo: { flex: 1 },

  memberName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },

  memberRelationship: {
    fontSize: 14,
    color: "#4a9eff",
  },

  memberStats: {
    fontSize: 12,
    color: "#8899a6",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
