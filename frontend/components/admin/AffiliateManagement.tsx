import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Section } from "./Section";
import { ConfirmModal } from "./ConfirmModal";
import { adminStyles as styles } from "../../styles/adminStyles";
import { DEFAULT_AFFILIATES_SEED } from "../../constants/adminConstants";
import {
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
  type Affiliate,
} from "../../services/adminApi";

interface Props {
  affiliates: Affiliate[];
  expanded: boolean;
  onToggle: () => void;
  refreshData: () => Promise<void>;
}

export const AffiliateManagement: React.FC<Props> = ({ affiliates, expanded, onToggle, refreshData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Affiliate> | null>(null);
  const [affName, setAffName] = useState("");
  const [affUrl, setAffUrl] = useState("");
  const [affCommission, setAffCommission] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Affiliate | null>(null);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const openModal = (affiliate?: Affiliate) => {
    setStatusMsg(null);
    setSaving(false);
    if (affiliate) {
      setEditing(affiliate);
      setAffName(affiliate.name);
      setAffUrl(affiliate.url);
      setAffCommission(String(affiliate.commission));
    } else {
      setEditing(null);
      setAffName("");
      setAffUrl("");
      setAffCommission("");
    }
    setModalVisible(true);
  };

  const saveAffiliate = async () => {
    setStatusMsg(null);
    if (!affName.trim()) { setStatusMsg({ type: "error", text: "Partner name is required." }); return; }
    if (!affUrl.trim()) { setStatusMsg({ type: "error", text: "Website URL is required." }); return; }
    setSaving(true);
    try {
      if (editing?.affiliate_id) {
        await updateAffiliate(editing.affiliate_id, { ...(editing as Affiliate), name: affName.trim(), url: affUrl.trim(), commission: parseFloat(affCommission) || 0 });
      } else {
        await createAffiliate({ name: affName.trim(), url: affUrl.trim(), commission: parseFloat(affCommission) || 0, is_active: true });
      }
      setSaving(false);
      setModalVisible(false);
      await refreshData();
    } catch (error: any) {
      setSaving(false);
      setStatusMsg({ type: "error", text: error.message || "Failed to save." });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteAffiliate(deleteTarget.affiliate_id); await refreshData(); } catch {}
    setDeleteTarget(null);
  };

  const confirmSeed = async () => {
    setShowSeedConfirm(false);
    try { for (const aff of DEFAULT_AFFILIATES_SEED) { await createAffiliate(aff); } await refreshData(); } catch {}
  };

  const handleToggle = async (aff: Affiliate) => {
    try { await updateAffiliate(aff.affiliate_id, { ...aff, is_active: !aff.is_active }); await refreshData(); } catch {}
  };

  return (
    <>
      <Section title="Affiliate Management" icon="link-outline" iconColor="#E040FB" expanded={expanded} onToggle={onToggle} badge={String(affiliates.length)}>
        <View style={styles.sectionActions}>
          <TouchableOpacity style={styles.addButton} onPress={() => openModal()} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add Affiliate</Text>
          </TouchableOpacity>
          {affiliates.length === 0 && (
            <TouchableOpacity style={[styles.addButton, { backgroundColor: "#E040FB" }]} onPress={() => setShowSeedConfirm(true)} activeOpacity={0.7}>
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={styles.addButtonText}>Seed Defaults</Text>
            </TouchableOpacity>
          )}
        </View>
        {affiliates.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="link-outline" size={40} color="#3a4d63" />
            <Text style={styles.emptyCardText}>No affiliates yet</Text>
            <Text style={styles.emptyCardSub}>Tap "Seed Defaults" to add default partners</Text>
          </View>
        ) : (
          affiliates.map((aff) => (
            <View key={aff.affiliate_id} style={[styles.itemCard, !aff.is_active && styles.itemCardDisabled]}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName}>{aff.name}</Text>
                    <View style={styles.commissionBadge}><Text style={styles.commissionBadgeText}>{aff.commission}%</Text></View>
                  </View>
                  <Text style={styles.itemSubtext} numberOfLines={1}>{aff.url}</Text>
                  <Text style={styles.itemMeta}>Clicks: {aff.click_count || 0}</Text>
                </View>
                <Switch value={aff.is_active} onValueChange={() => handleToggle(aff)} trackColor={{ false: "#3a4d63", true: "#4a9eff" }} thumbColor={aff.is_active ? "#fff" : "#8899a6"} />
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => openModal(aff)} activeOpacity={0.7}><Ionicons name="create-outline" size={18} color="#4a9eff" /></TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => Linking.openURL(aff.url)} activeOpacity={0.7}><Ionicons name="open-outline" size={18} color="#4a9eff" /></TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setDeleteTarget(aff)} activeOpacity={0.7}><Ionicons name="trash-outline" size={18} color="#ff5c5c" /></TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </Section>

      <ConfirmModal visible={!!deleteTarget} title="Delete Affiliate" message={`Remove "${deleteTarget?.name}"?`} confirmText="Delete" confirmColor="#ff5c5c" icon="trash" iconColor="#ff5c5c" onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
      <ConfirmModal visible={showSeedConfirm} title="Seed Affiliates" message="Add default optical affiliate partners sorted by commission rate?" confirmText="Seed" confirmColor="#E040FB" icon="download" iconColor="#E040FB" onCancel={() => setShowSeedConfirm(false)} onConfirm={confirmSeed} />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1 }} onStartShouldSetResponder={() => true}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="link" size={28} color="#E040FB" />
                <Text style={styles.modalTitle}>{editing?.affiliate_id ? "Edit" : "Add"} Affiliate</Text>
              </View>
              {statusMsg && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: statusMsg.type === "error" ? "rgba(255,92,92,0.15)" : "rgba(76,175,80,0.15)", borderWidth: 1, borderColor: statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  <Ionicons name={statusMsg.type === "error" ? "alert-circle" : "checkmark-circle"} size={20} color={statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50"} />
                  <Text style={{ flex: 1, fontSize: 14, color: statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50", fontWeight: "600" }}>{statusMsg.text}</Text>
                </View>
              )}
              <TextInput style={styles.modalInput} placeholder="Partner Name (required)" placeholderTextColor="#6b7c8f" value={affName} onChangeText={(t) => { setStatusMsg(null); setAffName(t); }} />
              <TextInput style={styles.modalInput} placeholder="Website URL (required)" placeholderTextColor="#6b7c8f" value={affUrl} onChangeText={(t) => { setStatusMsg(null); setAffUrl(t); }} keyboardType="url" autoCapitalize="none" />
              <TextInput style={styles.modalInput} placeholder="Commission %" placeholderTextColor="#6b7c8f" value={affCommission} onChangeText={setAffCommission} keyboardType="decimal-pad" />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)} activeOpacity={0.7}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalSaveButton, { backgroundColor: saving ? "#6b7c8f" : "#E040FB" }]} onPress={saveAffiliate} activeOpacity={0.7} disabled={saving}>
                  {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.modalSaveText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
};
