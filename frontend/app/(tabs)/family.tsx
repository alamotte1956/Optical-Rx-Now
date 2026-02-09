import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFamilyMembers,
  getPrescriptionsByMember,
  deleteFamilyMember,
  FamilyMember,
} from "../../services/localStorage";

interface Stats {
  [memberId: string]: number;
}

export default function FamilyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [prescriptionCounts, setPrescriptionCounts] = useState<Stats>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Navigate back to welcome screen
  const goToHome = () => {
    router.dismissAll();
    router.replace("/welcome");
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const membersData = await getFamilyMembers();
      setMembers(membersData);

      // Load prescription counts for each member
      const counts: Stats = {};
      for (const member of membersData) {
        const rxs = await getPrescriptionsByMember(member.id);
        counts[member.id] = rxs.length;
      }
      setPrescriptionCounts(counts);
    } catch (error) {
      console.log("Error loading family members:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const confirmDelete = (member: FamilyMember) => {
    setMemberToDelete(member);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;

    setDeleting(true);
    try {
      await deleteFamilyMember(memberToDelete.id);
      setDeleteModalVisible(false);
      setMemberToDelete(null);
      loadData();
    } catch (error) {
      Alert.alert("Error", "Failed to delete family member");
    } finally {
      setDeleting(false);
    }
  };

  const getRelationshipIcon = (relationship: string): string => {
    const rel = relationship.toLowerCase();
    if (rel.includes("self") || rel.includes("me")) return "person";
    if (rel.includes("spouse") || rel.includes("wife") || rel.includes("husband") || rel.includes("partner"))
      return "heart";
    if (rel.includes("child") || rel.includes("son") || rel.includes("daughter") || rel.includes("kid"))
      return "happy";
    if (rel.includes("parent") || rel.includes("mother") || rel.includes("father") || rel.includes("mom") || rel.includes("dad"))
      return "people";
    return "person-outline";
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={goToHome}
          activeOpacity={0.7}
        >
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />
        }
      >
        {members.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#3a4d63" />
            <Text style={styles.emptyText}>No family members yet</Text>
            <Text style={styles.emptySubtext}>
              Add family members to organize prescriptions
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/add-member")}
            >
              <Text style={styles.emptyButtonText}>Add First Member</Text>
            </TouchableOpacity>
          </View>
        ) : (
          members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberIcon}>
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
                  {prescriptionCounts[member.id] !== 1 ? "s" : ""}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(member)}
              >
                <Ionicons name="trash-outline" size={20} color="#ff5c5c" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="warning" size={40} color="#ff5c5c" />
            </View>
            <Text style={styles.modalTitle}>Delete Family Member?</Text>
            <Text style={styles.modalText}>
              This will also delete all prescriptions for {memberToDelete?.name}. This
              action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setMemberToDelete(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalDeleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4a9eff",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#8899a6",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7c8f",
    marginTop: 8,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: "#4a9eff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  memberIcon: {
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
    fontSize: 13,
    color: "#4a9eff",
    marginTop: 4,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#1a2d45",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 92, 92, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2a3d55",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#ff5c5c",
    alignItems: "center",
  },
  modalDeleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
