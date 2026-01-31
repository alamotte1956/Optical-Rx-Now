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

// Swipeable Member Card Component
const SwipeableMemberCard = ({ 
  member, 
  prescriptionCount, 
  onDelete, 
  getRelationshipIcon 
}: { 
  member: FamilyMember; 
  prescriptionCount: number;
  onDelete: () => void;
  getRelationshipIcon: (rel: string) => string;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDeleting, setIsDeleting] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -120));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          // Show delete button
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
        } else {
          // Reset position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete();
    resetPosition();
    setIsDeleting(false);
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Delete Button Background */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteBackgroundButton}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          <Ionicons name="trash" size={24} color="#fff" />
          <Text style={styles.deleteBackgroundText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable Card */}
      <Animated.View
        style={[
          styles.memberCard,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
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
            {prescriptionCount} prescription{prescriptionCount !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#ff5c5c" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

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
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/")}
        >
          <Ionicons name="home" size={22} color="#4a9eff" />
        </TouchableOpacity>
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
          <>
            <Text style={styles.swipeHint}>
              <Ionicons name="arrow-back" size={12} color="#6b7c8f" /> Swipe left to delete
            </Text>
            {members.map((member) => (
              <SwipeableMemberCard
                key={member.id}
                member={member}
                prescriptionCount={prescriptionCounts[member.id] || 0}
                onDelete={() => handleDeleteMember(member)}
                getRelationshipIcon={getRelationshipIcon}
              />
            ))}
          </>
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
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
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
  swipeContainer: {
    marginTop: 12,
    position: "relative",
  },
  deleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: "#ff5c5c",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBackgroundButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  deleteBackgroundText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  swipeHint: {
    fontSize: 12,
    color: "#6b7c8f",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
});
