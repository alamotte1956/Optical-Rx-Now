import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
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
import { isSmallDevice, moderateScale } from "../../services/responsive";
import { useTranslation } from "../../services/i18n";
import { VersionFooter } from "../../components/VersionFooter";

export default function FamilyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [prescriptionCounts, setPrescriptionCounts] = useState<{[key: string]: number}>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      let membersData: FamilyMember[] = [];
      for (let i = 0; i < 5; i++) {
        membersData = await getFamilyMembers();
        if (membersData.length > 0) break;
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setMembers(membersData);
      
      const counts: {[key: string]: number} = {};
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
      Alert.alert(t("success"), `${memberToDelete.name} ${t("deleting")}`);
    } catch (error) {
      Alert.alert(t("error"), "Failed to delete family member");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0a1628", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4a9eff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a1628" }} edges={["top"]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1a2d45" }}>
        <TouchableOpacity onPress={() => router.replace("/welcome")} style={{ width: 44, height: 44, justifyContent: "center", alignItems: "center" }} accessibilityLabel="Home" accessibilityRole="button">
          <Ionicons name="home-outline" size={22} color="#4a9eff" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff", flex: 1, textAlign: "center" }}>{t("family")}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: "#4a9eff", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" }}
          onPress={() => router.push("/add-member")}
          accessibilityLabel="Add family member"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />}
      >
        {members.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Ionicons name="people-outline" size={64} color="#3a4d63" />
            <Text style={{ fontSize: 18, color: "#8899a6", marginTop: 16 }}>{t("no_members")}</Text>
            <TouchableOpacity 
              style={{ marginTop: 24, backgroundColor: "#4a9eff", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
              onPress={() => router.push("/add-member")}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>{t("add_family_member")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={{ color: "#4a9eff", fontSize: 14, marginBottom: 16 }}>
              {members.length} family member(s) found:
            </Text>
            
            {members.map((member) => (
              <View 
                key={member.id} 
                style={{ 
                  backgroundColor: "#1a2d45", 
                  borderRadius: 12, 
                  marginBottom: 16,
                  overflow: "hidden",
                }}
              >
                {/* RED DELETE BUTTON - FULL WIDTH AT TOP */}
                <TouchableOpacity 
                  style={{
                    backgroundColor: "#ff5c5c",
                    paddingVertical: 16,
                    alignItems: "center",
                  }}
                  onPress={() => confirmDelete(member)}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>
                    {t("delete")} {member.name.toUpperCase()}
                  </Text>
                </TouchableOpacity>

                {/* Member Info */}
                <TouchableOpacity 
                  style={{ padding: 16 }}
                  onPress={() => router.push(`/member/${member.id}`)}
                >
                  <Text style={{ fontSize: 22, fontWeight: "700", color: "#fff" }}>{member.name}</Text>
                  <Text style={{ fontSize: 14, color: "#8899a6", marginTop: 4 }}>{member.relationship}</Text>
                  <Text style={{ fontSize: 12, color: "#4a9eff", marginTop: 4 }}>
                    {prescriptionCounts[member.id] || 0} {t("prescriptions_count")}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <VersionFooter />
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 24 }}>
          <View style={{ width: "100%", backgroundColor: "#1a2d45", borderRadius: 20, padding: 24, alignItems: "center" }}>
            <Ionicons name="warning" size={48} color="#ff5c5c" />
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff", marginTop: 16 }}>{t("delete_member")} {memberToDelete?.name}?</Text>
            <Text style={{ fontSize: 14, color: "#8899a6", textAlign: "center", marginTop: 12, marginBottom: 24 }}>
              {t("delete_member_confirm")}
            </Text>
            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#2a3d55", alignItems: "center" }}
                onPress={() => { setDeleteModalVisible(false); setMemberToDelete(null); }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#ff5c5c", alignItems: "center" }}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: "#fff", fontWeight: "600" }}>{t("delete")}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
