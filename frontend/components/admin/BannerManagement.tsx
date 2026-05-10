import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Linking,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
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
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [banShowSample, setBanShowSample] = useState(true);

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
      setBanShowSample(banner.show_sample_overlay !== false);
    } else {
      setEditing(null);
      setBanTitle("");
      setBanImageUrl("");
      setBanDestUrl("");
      setBanStartDate("");
      setBanEndDate("");
      setBanShowSample(true);
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
          show_sample_overlay: banShowSample,
        });
      } else {
        await createBanner({
          title: banTitle.trim() || null,
          image_url: banImageUrl.trim(),
          destination_url: banDestUrl.trim(),
          start_date: banStartDate.trim() || null,
          end_date: banEndDate.trim() || null,
          is_active: true,
          show_sample_overlay: banShowSample,
        });
      }
      setSaving(false);
      setModalVisible(false);
      await refreshData();
    } catch (error: any) {
      setSaving(false);
      setStatusMsg({ type: "error", text: error.message || "Failed to save. Check connection." });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBanner(deleteTarget.banner_id);
      await refreshData();
    } catch {}
    setDeleteTarget(null);
  };

  const handleToggle = async (ban: Banner) => {
    try {
      await updateBanner(ban.banner_id, { ...ban, is_active: !ban.is_active });
      await refreshData();
    } catch {}
  };

  return (
    <>
      <Section title="Banner Management" icon="images-outline" iconColor="#FF9800" expanded={expanded} onToggle={onToggle} badge={String(banners.length)}>
        <View style={styles.sectionActions}>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: "#FF9800" }]} onPress={() => openModal()} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add Banner</Text>
          </TouchableOpacity>
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
                  <Text style={styles.itemMeta}>Views: {ban.view_count || 0} | Clicks: {ban.click_count || 0}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <Ionicons name={ban.show_sample_overlay !== false ? "flag" : "flag-outline"} size={14} color={ban.show_sample_overlay !== false ? "#ff5c5c" : "#6b7c8f"} />
                    <Text style={{ fontSize: 11, color: ban.show_sample_overlay !== false ? "#ff5c5c" : "#6b7c8f", marginLeft: 4, fontWeight: "600" }}>
                      {ban.show_sample_overlay !== false ? "SAMPLE AD overlay ON" : "SAMPLE AD overlay OFF"}
                    </Text>
                  </View>
                </View>
                <Switch value={ban.is_active} onValueChange={() => handleToggle(ban)} trackColor={{ false: "#3a4d63", true: "#FF9800" }} thumbColor={ban.is_active ? "#fff" : "#8899a6"} />
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => openModal(ban)} activeOpacity={0.7}>
                  <Ionicons name="create-outline" size={18} color="#FF9800" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => Linking.openURL(ban.destination_url)} activeOpacity={0.7}>
                  <Ionicons name="open-outline" size={18} color="#4a9eff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setDeleteTarget(ban)} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={18} color="#ff5c5c" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </Section>

      <ConfirmModal visible={!!deleteTarget} title="Delete Banner" message={`Remove "${deleteTarget?.title || "Untitled"}"?`} confirmText="Delete" confirmColor="#ff5c5c" icon="trash" iconColor="#ff5c5c" onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />

      {/* Banner Modal — onStartShouldSetResponder fixes Android touch bug (RN 0.76+) */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1 }} onStartShouldSetResponder={() => true}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Ionicons name="images" size={28} color="#FF9800" />
                  <Text style={styles.modalTitle}>{editing?.banner_id ? "Edit" : "Add"} Banner</Text>
                </View>

                {statusMsg && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: statusMsg.type === "error" ? "rgba(255,92,92,0.15)" : "rgba(76,175,80,0.15)", borderWidth: 1, borderColor: statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <Ionicons name={statusMsg.type === "error" ? "alert-circle" : "checkmark-circle"} size={20} color={statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50"} />
                    <Text style={{ flex: 1, fontSize: 14, color: statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50", fontWeight: "600" }}>{statusMsg.text}</Text>
                  </View>
                )}

                <TextInput style={styles.modalInput} placeholder="Banner Title (optional)" placeholderTextColor="#6b7c8f" value={banTitle} onChangeText={(t) => { setStatusMsg(null); setBanTitle(t); }} />
                <TextInput style={styles.modalInput} placeholder="Image URL (required)" placeholderTextColor="#6b7c8f" value={banImageUrl} onChangeText={(t) => { setStatusMsg(null); setBanImageUrl(t); }} keyboardType="url" autoCapitalize="none" />
                <TextInput style={styles.modalInput} placeholder="Destination URL (required)" placeholderTextColor="#6b7c8f" value={banDestUrl} onChangeText={(t) => { setStatusMsg(null); setBanDestUrl(t); }} keyboardType="url" autoCapitalize="none" />
                <TextInput style={styles.modalInput} placeholder="Start Date (YYYY-MM-DD)" placeholderTextColor="#6b7c8f" value={banStartDate} onChangeText={setBanStartDate} />
                <TextInput style={styles.modalInput} placeholder="End Date (YYYY-MM-DD)" placeholderTextColor="#6b7c8f" value={banEndDate} onChangeText={setBanEndDate} />
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,92,92,0.08)", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Ionicons name="flag" size={20} color="#ff5c5c" />
                    <Text style={{ fontSize: 14, color: "#c8d6e5", fontWeight: "600", marginLeft: 8 }}>Show SAMPLE AD overlay</Text>
                  </View>
                  <Switch value={banShowSample} onValueChange={setBanShowSample} trackColor={{ false: "#3a4d63", true: "#ff5c5c" }} thumbColor={banShowSample ? "#fff" : "#8899a6"} />
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalSaveButton, { backgroundColor: saving ? "#6b7c8f" : "#FF9800" }]} onPress={saveBanner} activeOpacity={0.7} disabled={saving}>
                    {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.modalSaveText}>Save</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
};
