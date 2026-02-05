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
import { getFamilyMembers, deleteFamilyMember, type FamilyMember } from "../../services/localStorage";

export default function FamilyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [deleting, setDeleting] = useState(false);

  const goToHome = () => {
    router.replace("/");
  };

  useFocusEffect(
    useCallback(() => {
      fetchMembers();
    }, [])
  );

  const fetchMembers = async () => {
    try {
      const data = await getFamilyMembers();
      setMembers(data);
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
    // Prevent double-tap
    if (deleting) return;
    
    Alert.alert(
      "Delete Family Member",
      `Are you sure you want to delete ${memberName}? This will also delete all their prescriptions.`,
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
              console.error('Error deleting family member:', error);
              
              let errorMessage = 'Failed to delete family member. Please try again.';
              
              if (error instanceof Error) {
                if (error.message.includes('storage') || error.message.includes('quota')) {
                  errorMessage = 'Storage error occurred. Please try again.';
                } else {
                  errorMessage = `Failed to delete: ${error.message}`;
                }
              }
              
              Alert.alert("Error", errorMessage);
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

      {/* Family Members List */}
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
            const prescriptionCount = member.prescription_count || 0;
            return (
            <TouchableOpacity
              key={member.id}
              style={styles.memberCard}
              onPress={() =>
                router.push({ pathname: "/member/[id]", params: { id: member.id } })
              }
              onLongPress={() => handleDeleteMember(member.id, member.name)}
            >
              <View style={styles.memberIcon}>
                <Ionicons name="person" size={32} color="#4a9eff" />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRelationship}>{member.relationship}</Text>
                <Text style={styles.memberStats}>
                  {prescriptionCount} prescription{prescriptionCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6b7c8f" />
            </TouchableOpacity>
          );
          })
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
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginLeft: 12,
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
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  memberRelationship: {
    fontSize: 14,
    color: "#4a9eff",
    marginBottom: 2,
  },
  memberStats: {
    fontSize: 12,
    color: "#8899a6",
  },
});