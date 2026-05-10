import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  Linking,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Section } from "./Section";
import { ConfirmModal } from "./ConfirmModal";
import { adminStyles as styles } from "../../styles/adminStyles";
import {
  createBanner,
  updateBanner,
  deleteBanner,
  type Banner,
} from "../../services/adminApi";

interface Props {
  banners: Banner[];
  expanded: boolean;
  onToggle: () => void;
  refreshData: () => Promise<void>;
}

export const BannerManagement: React.FC<Props> = ({ banners, expanded, onToggle, refreshData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [banTitle, setBanTitle] = useState("");
  const [banImageUrl, setBanImageUrl] = useState("");
  const [banDestUrl, setBanDestUrl] = useState("");
  const [banStartDate, setBanStartDate] = useState("");
  const [banEndDate, setBanEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const openModal = (banner?: Banner) => {
    setStatusMsg(null);
    setSaving(false);
    if (banner) {
      setEditing(banner);
      setBanTitle(banner.title || "");
      setBanImageUrl(banner.image_url);
      setBanDestUrl(banner.destination_url);
      setBanStartDate(banner.start_date || "");
      setBanEndDate(banner.end_date || "");
    } else {
      setEditing(null);
      setBanTitle("");
      setBanImageUrl("");
      setBanDestUrl("");
      setBanStartDate("");
      setBanEndDate("");
    }
    setModalVisible(true);
  };

  const saveBanner = async () => {
    setStatusMsg(null);

    if (!banImageUrl.trim()) {
      setStatusMsg({ type: "error", text: "Image URL is required." });
      return;
    }
    if (!banDestUrl.trim()) {
      setStatusMsg({ type: "error", text: "Destination URL is required." });
      return;
    }

    setSaving(true);
    try {
      if (editing?.banner_id) {
        await updateBanner(editing.banner_id, {
          ...(editing as Banner),
          title: banTitle.trim() || null,
          image_url: banImageUrl.trim(),
          destination_url: banDestUrl.trim(),
          start_date: banStartDate.trim() || null,
          end_date: banEndDate.trim() || null,
        });
      } else {
        await createBanner({
          title: banTitle.trim() || null,
          image_url: banImageUrl.trim(),
          destination_url: banDestUrl.trim(),
          start_date: banStartDate.trim() || null,
          end_date: banEndDate.trim() || null,
          is_active: true,
        });
      }
      setSaving(false);
      setModalVisible(false);
      await refreshData();
    } catch (error: any) {
      setSaving(false);
      setStatusMsg({ type: "error", text: error.message || "Failed to save banner. Check your connection." });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBanner(deleteTarget.banner_id);
      await refreshData();
    } catch (error: any) {
      console.log("Delete banner error:", error.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggle = async (ban: Banner) => {
    try {
      await updateBanner(ban.banner_id, { ...ban, is_active: !ban.is_active });
      await refreshData();
    } catch (error: any) {
      console.log("Toggle banner error:", error.message);
    }
  };

  return (
    <>
      <Section
        title="Banner Management"
        icon="images-outline"
        iconColor="#FF9800"
        expanded={expanded}
        onToggle={onToggle}
        badge={String(banners.length)}
      >
        <View style={styles.sectionActions}>
          <Pressable style={[styles.addButton, { backgroundColor: "#FF9800" }]} onPress={() => openModal()}>
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add Banner</Text>
          </Pressable>
        </View>

        {banners.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="images-outline" size={40} color="#3a4d63" />
            <Text style={styles.emptyCardText}>No banners yet</Text>
            <Text style={styles.emptyCardSub}>Create banners to display in the app carousel</Text>
          </View>
        ) : (
          banners.map((ban) => (
            <View key={ban.banner_id} style={[styles.itemCard, !ban.is_active && styles.itemCardDisabled]}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{ban.title || "Untitled Banner"}</Text>
                  <Text style={styles.itemSubtext} numberOfLines={1}>{ban.image_url}</Text>
                  <Text style={styles.itemMeta}>
                    Views: {ban.view_count || 0} | Clicks: {ban.click_count || 0}
                  </Text>
                  {(ban.start_date || ban.end_date) && (
                    <Text style={styles.itemMeta}>
                      {ban.start_date ? `From: ${ban.start_date.split("T")[0]}` : ""}{" "}
                      {ban.end_date ? `To: ${ban.end_date.split("T")[0]}` : ""}
                    </Text>
                  )}
                </View>
                <Switch
                  value={ban.is_active}
                  onValueChange={() => handleToggle(ban)}
                  trackColor={{ false: "#3a4d63", true: "#FF9800" }}
                  thumbColor={ban.is_active ? "#fff" : "#8899a6"}
                />
              </View>
              <View style={styles.itemActions}>
                <Pressable style={styles.iconBtn} onPress={() => openModal(ban)}>
                  <Ionicons name="create-outline" size={18} color="#FF9800" />
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => Linking.openURL(ban.destination_url)}>
                  <Ionicons name="open-outline" size={18} color="#8899a6" />
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => setDeleteTarget(ban)}>
                  <Ionicons name="trash-outline" size={18} color="#ff5c5c" />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </Section>

      {/* Delete Confirmation */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Banner"
        message={`Remove "${deleteTarget?.title || "Untitled"}"? This cannot be undone.`}
        confirmText="Delete"
        confirmColor="#ff5c5c"
        icon="trash"
        iconColor="#ff5c5c"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {/* Banner Edit/Add Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="images" size={28} color="#FF9800" />
                <Text style={styles.modalTitle}>{editing?.banner_id ? "Edit" : "Add"} Banner</Text>
              </View>

              {/* Inline status message - replaces Alert.alert */}
              {statusMsg && (
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: statusMsg.type === "error" ? "rgba(255,92,92,0.15)" : "rgba(76,175,80,0.15)",
                  borderWidth: 1,
                  borderColor: statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                }}>
                  <Ionicons
                    name={statusMsg.type === "error" ? "alert-circle" : "checkmark-circle"}
                    size={20}
                    color={statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50"}
                  />
                  <Text style={{
                    flex: 1,
                    fontSize: 14,
                    color: statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50",
                    fontWeight: "600",
                  }}>{statusMsg.text}</Text>
                </View>
              )}

              <TextInput style={styles.modalInput} placeholder="Banner Title (optional)" placeholderTextColor="#6b7c8f" value={banTitle} onChangeText={(t) => { setStatusMsg(null); setBanTitle(t); }} />
              <TextInput style={styles.modalInput} placeholder="Image URL (required)" placeholderTextColor="#6b7c8f" value={banImageUrl} onChangeText={(t) => { setStatusMsg(null); setBanImageUrl(t); }} keyboardType="url" autoCapitalize="none" />
              <TextInput style={styles.modalInput} placeholder="Destination URL (required)" placeholderTextColor="#6b7c8f" value={banDestUrl} onChangeText={(t) => { setStatusMsg(null); setBanDestUrl(t); }} keyboardType="url" autoCapitalize="none" />
              <TextInput style={styles.modalInput} placeholder="Start Date (YYYY-MM-DD)" placeholderTextColor="#6b7c8f" value={banStartDate} onChangeText={setBanStartDate} />
              <TextInput style={styles.modalInput} placeholder="End Date (YYYY-MM-DD)" placeholderTextColor="#6b7c8f" value={banEndDate} onChangeText={setBanEndDate} />
              <View style={styles.modalButtons}>
                <Pressable style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalSaveButton, { backgroundColor: saving ? "#6b7c8f" : "#FF9800" }]}
                  onPress={saveBanner}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};
