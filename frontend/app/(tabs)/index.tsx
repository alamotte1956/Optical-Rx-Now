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
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getPrescriptions,
  getFamilyMembers,
  deletePrescription,
  deleteFamilyMember,
  Prescription,
  FamilyMember,
} from "../../services/localStorage";
import { isSmallDevice, moderateScale } from "../../services/responsive";
import { useTranslation } from "../../services/i18n";

export default function PrescriptionsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

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
      const [membersData, rxData] = await Promise.all([
        getFamilyMembers(),
        getPrescriptions(),
      ]);
      setFamilyMembers(membersData);
      setPrescriptions(rxData);
    } catch (error) {
      console.log("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDeletePrescription = (rx: Prescription) => {
    Alert.alert(
      "Delete Optical Document",
      "Are you sure you want to delete this optical document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePrescription(rx.id);
              loadData();
            } catch (error) {
              console.log("Delete error:", error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteMember = () => {
    if (familyMembers.length === 0) {
      Alert.alert("No Members", "There are no family members to delete.");
      return;
    }
    const buttons = familyMembers.map((member) => ({
      text: member.name,
      style: "destructive" as const,
      onPress: () => {
        Alert.alert(
          `Delete ${member.name}?`,
          "This will also remove all their optical documents. This cannot be undone.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteFamilyMember(member.id);
                  if (selectedMember === member.id) setSelectedMember(null);
                  loadData();
                } catch (error) {
                  console.log("Delete member error:", error);
                }
              },
            },
          ]
        );
      },
    }));
    buttons.push({ text: "Cancel", style: "cancel" as const, onPress: () => {} });
    Alert.alert("Delete Family Member", "Select the member to delete:", buttons);
  };

  const getMemberName = (memberId: string) => {
    const member = familyMembers.find((m) => m.id === memberId);
    return member?.name || "Unknown";
  };

  const filteredPrescriptions = selectedMember
    ? prescriptions.filter((rx) => rx.familyMemberId === selectedMember)
    : prescriptions;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
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
        <Text style={styles.headerTitle}>{t("prescriptions")}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Member Filter */}
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
              !selectedMember && styles.filterChipActive,
            ]}
            onPress={() => setSelectedMember(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedMember && styles.filterChipTextActive,
              ]}
            >
              {t("all_members")}
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

      {/* Add Optical Document & Delete Family Member Buttons */}
      {familyMembers.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
          <TouchableOpacity
            style={styles.addDocButton}
            onPress={() => router.push("/add-member")}
            accessibilityLabel="Add Family Member"
            accessibilityRole="button"
          >
            <Ionicons name="person-add-outline" size={20} color="#fff" />
            <Text style={styles.addDocButtonText}>Add Family Member</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteMember}
            accessibilityLabel="Delete Family Member"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.deleteButtonText}>Delete Family Member</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Prescriptions List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />
        }
      >
        {filteredPrescriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#3a4d63" />
            <Text style={styles.emptyText}>{t("no_prescriptions")}</Text>
            <Text style={styles.emptySubtext}>
              {familyMembers.length === 0
                ? t("no_members_desc")
                : t("no_prescriptions_desc")}
            </Text>
            {familyMembers.length === 0 ? (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/add-member")}
              >
                <Text style={styles.emptyButtonText}>{t("add_family_member")}</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ gap: 12, width: "100%", paddingHorizontal: 32 }}>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push("/add-rx")}
                >
                  <Text style={styles.emptyButtonText}>Add Optical Document</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          filteredPrescriptions.map((rx) => (
            <TouchableOpacity
              key={rx.id}
              style={[
                styles.rxCard,
                isExpired(rx.expiryDate) && styles.rxCardExpired,
                isExpiringSoon(rx.expiryDate) && !isExpired(rx.expiryDate) && styles.rxCardExpiringSoon,
              ]}
              onPress={() => router.push(`/rx-detail?id=${rx.id}`)}
              onLongPress={() => handleDeletePrescription(rx)}
            >
              {rx.imageBase64 ? (
                <Image
                  source={{ uri: rx.imageBase64 }}
                  style={styles.rxImage}
                  resizeMode="cover"
                  onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                />
              ) : (
                <View style={[styles.rxImage, styles.rxImagePlaceholder]}>
                  <Ionicons name="image-outline" size={24} color="#6b7c8f" />
                </View>
              )}
              <View style={styles.rxInfo}>
                <View style={styles.rxHeader}>
                  <Text style={styles.rxMember}>{getMemberName(rx.familyMemberId)}</Text>
                  <View
                    style={[
                      styles.rxTypeBadge,
                      rx.rxType === "contact" && styles.rxTypeBadgeContact,
                    ]}
                  >
                    <Text style={styles.rxTypeText}>
                      {rx.rxType === "eyeglass" ? t("eyeglasses") : t("contact_lenses")}
                    </Text>
                  </View>
                </View>
                <Text style={styles.rxDate}>Taken: {formatDate(rx.dateTaken)}</Text>
                {rx.expiryDate && (
                  <View style={styles.expiryRow}>
                    <Ionicons
                      name={isExpired(rx.expiryDate) ? "warning" : "calendar-outline"}
                      size={14}
                      color={isExpired(rx.expiryDate) ? "#ff5c5c" : isExpiringSoon(rx.expiryDate) ? "#ff9500" : "#8899a6"}
                    />
                    <Text
                      style={[
                        styles.expiryText,
                        isExpired(rx.expiryDate) && styles.expiryTextExpired,
                        isExpiringSoon(rx.expiryDate) && !isExpired(rx.expiryDate) && styles.expiryTextSoon,
                      ]}
                    >
                      {isExpired(rx.expiryDate) ? t("expired") : t("expires")}: {formatDate(rx.expiryDate)}
                    </Text>
                  </View>
                )}
                {rx.notes && (
                  <Text style={styles.rxNotes} numberOfLines={1}>
                    {rx.notes}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7c8f" />
            </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingVertical: isSmallDevice ? 8 : 12,
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
    fontSize: moderateScale(20),
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
  filterContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2d45",
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#1a2d45",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#4a9eff",
  },
  filterChipText: {
    fontSize: 14,
    color: "#8899a6",
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
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
    paddingHorizontal: 32,
  },
  emptyButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#4a9eff",
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  addDocButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4a9eff",
    paddingVertical: 14,
    borderRadius: 10,
  },
  addDocButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  rxCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  rxCardExpired: {
    borderWidth: 1,
    borderColor: "rgba(255, 92, 92, 0.5)",
  },
  rxCardExpiringSoon: {
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.5)",
  },
  rxImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#0a1628",
  },
  rxImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a2d45",
  },
  rxInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rxHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  rxMember: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  rxTypeBadge: {
    backgroundColor: "rgba(74, 158, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rxTypeBadgeContact: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  rxTypeText: {
    fontSize: 11,
    color: "#4a9eff",
    fontWeight: "500",
  },
  rxDate: {
    fontSize: 13,
    color: "#8899a6",
    marginBottom: 2,
  },
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  expiryText: {
    fontSize: 12,
    color: "#8899a6",
  },
  expiryTextExpired: {
    color: "#ff5c5c",
  },
  expiryTextSoon: {
    color: "#ff9500",
  },
  rxNotes: {
    fontSize: 12,
    color: "#6b7c8f",
    marginTop: 4,
    fontStyle: "italic",
  },
});
