import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getFamilyMemberById,
  getPrescriptionsByMember,
  deleteFamilyMember,
  FamilyMember,
  Prescription,
} from "../../services/localStorage";
import { useTranslation } from "../../services/i18n";
import { VersionFooter } from "../../components/VersionFooter";

const formatDateSafe = (dateString: string | null | undefined): string => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

const isExpired = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  } catch {
    return false;
  }
};

export default function MemberDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (id) loadData();
    }, [id])
  );

  const loadData = async () => {
    try {
      const memberData = await getFamilyMemberById(id as string);
      setMember(memberData);
      if (memberData) {
        const rxs = await getPrescriptionsByMember(memberData.id);
        setPrescriptions(rxs);
      }
    } catch (error) {
      console.log("Error loading member:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDeleteMember = () => {
    if (!member) return;
    Alert.alert(
      `${t("delete")} ${member.name}?`,
      t("delete_member_confirm"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFamilyMember(member.id);
              router.back();
            } catch (error) {
              Alert.alert(t("error"), "Failed to delete member");
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

  if (!member) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Member</Text>
          <TouchableOpacity onPress={() => router.replace("/welcome")} style={styles.placeholder} accessibilityLabel="Home" accessibilityRole="button">
            <Ionicons name="home-outline" size={22} color="#4a9eff" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff5c5c" />
          <Text style={styles.emptyText}>Member not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/welcome")} style={{ width: 36, height: 36, justifyContent: "center", alignItems: "center" }} accessibilityLabel="Home" accessibilityRole="button">
            <Ionicons name="home-outline" size={20} color="#4a9eff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>{member.name}</Text>
        <TouchableOpacity onPress={handleDeleteMember} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="#ff5c5c" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />}
      >
        {/* Member Info Card */}
        <View style={styles.memberCard}>
          <View style={styles.memberAvatarRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="#4a9eff" />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRelationship}>{member.relationship}</Text>
              <Text style={styles.memberDate}>Added {formatDateSafe(member.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Optical Documents Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Optical Documents ({prescriptions.length})
          </Text>
          <TouchableOpacity
            style={styles.addRxButton}
            onPress={() => router.push(`/add-rx?memberId=${member.id}`)}
          >
            <Ionicons name="add-circle" size={20} color="#4a9eff" />
            <Text style={styles.addRxText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {prescriptions.length === 0 ? (
          <View style={styles.noRxContainer}>
            <Ionicons name="document-outline" size={48} color="#3a4d63" />
            <Text style={styles.noRxText}>No optical documents yet</Text>
            <TouchableOpacity
              style={styles.addFirstRxButton}
              onPress={() => router.push(`/add-rx?memberId=${member.id}`)}
            >
              <Ionicons name="camera-outline" size={20} color="#fff" />
              <Text style={styles.addFirstRxText}>Capture First Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          prescriptions.map((rx) => {
            const expired = isExpired(rx.expiryDate);
            return (
              <TouchableOpacity
                key={rx.id}
                style={styles.rxCard}
                onPress={() => router.push(`/rx-detail?id=${rx.id}`)}
                activeOpacity={0.7}
              >
                {/* Thumbnail */}
                <View style={styles.rxThumbnailContainer}>
                  {rx.imageBase64 ? (
                    <Image
                      source={{ uri: rx.imageBase64 }}
                      style={styles.rxThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.rxThumbnail, styles.rxThumbnailPlaceholder]}>
                      <Ionicons name="image-outline" size={24} color="#6b7c8f" />
                    </View>
                  )}
                </View>

                {/* Rx Info */}
                <View style={styles.rxInfo}>
                  <View style={styles.rxTypeRow}>
                    <View style={[styles.typeBadge, rx.rxType === "contact" && styles.typeBadgeContact]}>
                      <Ionicons
                        name={rx.rxType === "eyeglass" ? "glasses-outline" : "eye-outline"}
                        size={14}
                        color={rx.rxType === "eyeglass" ? "#4a9eff" : "#4CAF50"}
                      />
                      <Text style={[styles.typeText, rx.rxType === "contact" && styles.typeTextContact]}>
                        {rx.rxType === "eyeglass" ? t("eyeglasses") : t("contact_lenses")}
                      </Text>
                    </View>
                    {expired && (
                      <View style={styles.expiredBadge}>
                        <Text style={styles.expiredBadgeText}>EXPIRED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.rxDate}>
                    {formatDateSafe(rx.dateTaken)}
                  </Text>
                  {rx.expiryDate && (
                    <Text style={[styles.rxExpiry, expired && styles.rxExpiryExpired]}>
                      Expires: {formatDateSafe(rx.expiryDate)}
                    </Text>
                  )}
                  {rx.notes ? (
                    <Text style={styles.rxNotes} numberOfLines={1}>
                      {rx.notes}
                    </Text>
                  ) : null}
                </View>

                {/* Arrow */}
                <Ionicons name="chevron-forward" size={20} color="#4a9eff" />
              </TouchableOpacity>
            );
          })
        )}
        <VersionFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2d45",
  },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff", flex: 1, textAlign: "center" },
  deleteButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  placeholder: { width: 44 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#8899a6", marginTop: 16 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },

  // Member card
  memberCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  memberAvatarRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 22, fontWeight: "800", color: "#fff" },
  memberRelationship: { fontSize: 14, color: "#4a9eff", marginTop: 2, fontWeight: "600" },
  memberDate: { fontSize: 12, color: "#6b7c8f", marginTop: 4 },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  addRxButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  addRxText: { fontSize: 14, color: "#4a9eff", fontWeight: "600" },

  // No Rx
  noRxContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#1a2d45",
    borderRadius: 16,
  },
  noRxText: { fontSize: 16, color: "#8899a6", marginTop: 12, marginBottom: 20 },
  addFirstRxButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4a9eff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addFirstRxText: { fontSize: 15, color: "#fff", fontWeight: "600" },

  // Rx card
  rxCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  rxThumbnailContainer: { borderRadius: 10, overflow: "hidden" },
  rxThumbnail: { width: 64, height: 64, borderRadius: 10 },
  rxThumbnailPlaceholder: {
    backgroundColor: "#0f1d2f",
    justifyContent: "center",
    alignItems: "center",
  },
  rxInfo: { flex: 1 },
  rxTypeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeContact: { backgroundColor: "rgba(76, 175, 80, 0.15)" },
  typeText: { fontSize: 12, color: "#4a9eff", fontWeight: "600" },
  typeTextContact: { color: "#4CAF50" },
  expiredBadge: {
    backgroundColor: "rgba(255, 92, 92, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expiredBadgeText: { fontSize: 10, color: "#ff5c5c", fontWeight: "bold" },
  rxDate: { fontSize: 15, color: "#fff", fontWeight: "600" },
  rxExpiry: { fontSize: 12, color: "#8899a6", marginTop: 2 },
  rxExpiryExpired: { color: "#ff5c5c" },
  rxNotes: { fontSize: 12, color: "#6b7c8f", marginTop: 2 },
});
