import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Switch,
  Linking,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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

  // Confirmation states
  const [deleteTarget, setDeleteTarget] = useState<Affiliate | null>(null);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const openModal = (affiliate?: Affiliate) => {
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
    if (!affName.trim() || !affUrl.trim()) {
      Alert.alert("Error", "Name and URL are required.");
      return;
    }
    try {
      if (editing?.affiliate_id) {
        await updateAffiliate(editing.affiliate_id, {
          ...(editing as Affiliate),
          name: affName.trim(),
          url: affUrl.trim(),
          commission: parseFloat(affCommission) || 0,
        });
      } else {
        await createAffiliate({
          name: affName.trim(),
          url: affUrl.trim(),
          commission: parseFloat(affCommission) || 0,
          is_active: true,
        });
      }
      setModalVisible(false);
      await refreshData();
      Alert.alert("Success", editing?.affiliate_id ? "Affiliate updated!" : "Affiliate created!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAffiliate(deleteTarget.affiliate_id);
      await refreshData();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const confirmSeed = async () => {
    setShowSeedConfirm(false);
    try {
      for (const aff of DEFAULT_AFFILIATES_SEED) {
        await createAffiliate(aff);
      }
      await refreshData();
      Alert.alert("Success", "22 affiliates seeded successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleToggle = async (aff: Affiliate) => {
    try {
      await updateAffiliate(aff.affiliate_id, { ...aff, is_active: !aff.is_active });
      await refreshData();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <>
      <Section
        title="Affiliate Management"
        icon="link-outline"
        iconColor="#E040FB"
        expanded={expanded}
        onToggle={onToggle}
        badge={String(affiliates.length)}
      >
        <View style={styles.sectionActions}>
          <Pressable style={styles.addButton} onPress={() => openModal()}>
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add Affiliate</Text>
          </Pressable>
          {affiliates.length === 0 && (
            <Pressable style={[styles.addButton, { backgroundColor: "#E040FB" }]} onPress={() => setShowSeedConfirm(true)}>
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={styles.addButtonText}>Seed Defaults</Text>
            </Pressable>
          )}
        </View>

        {affiliates.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="link-outline" size={40} color="#3a4d63" />
            <Text style={styles.emptyCardText}>No affiliates yet</Text>
            <Text style={styles.emptyCardSub}>Tap "Seed Defaults" to add 22 optical affiliate partners sorted by commission</Text>
          </View>
        ) : (
          affiliates.map((aff) => (
            <View key={aff.affiliate_id} style={[styles.itemCard, !aff.is_active && styles.itemCardDisabled]}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName}>{aff.name}</Text>
                    <View style={styles.commissionBadge}>
                      <Text style={styles.commissionBadgeText}>{aff.commission}%</Text>
                    </View>
                  </View>
                  <Text style={styles.itemSubtext} numberOfLines={1}>{aff.url}</Text>
                  <Text style={styles.itemMeta}>Clicks: {aff.click_count || 0}</Text>
                </View>
                <Switch
                  value={aff.is_active}
                  onValueChange={() => handleToggle(aff)}
                  trackColor={{ false: "#3a4d63", true: "#4a9eff" }}
                  thumbColor={aff.is_active ? "#fff" : "#8899a6"}
                />
              </View>
              <View style={styles.itemActions}>
                <Pressable style={styles.iconBtn} onPress={() => openModal(aff)}>
                  <Ionicons name="create-outline" size={18} color="#4a9eff" />
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => Linking.openURL(aff.url)}>
                  <Ionicons name="open-outline" size={18} color="#8899a6" />
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => setDeleteTarget(aff)}>
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
        title="Delete Affiliate"
        message={`Remove "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        confirmColor="#ff5c5c"
        icon="trash"
        iconColor="#ff5c5c"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {/* Seed Confirmation */}
      <ConfirmModal
        visible={showSeedConfirm}
        title="Seed Affiliates"
        message="This will add 22 default optical affiliate partners to the database, sorted by commission rate (highest first)."
        confirmText="Seed"
        confirmColor="#E040FB"
        icon="download"
        iconColor="#E040FB"
        onCancel={() => setShowSeedConfirm(false)}
        onConfirm={confirmSeed}
      />

      {/* Affiliate Edit/Add Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="link" size={28} color="#E040FB" />
              <Text style={styles.modalTitle}>{editing?.affiliate_id ? "Edit" : "Add"} Affiliate</Text>
            </View>
            <TextInput style={styles.modalInput} placeholder="Partner Name" placeholderTextColor="#6b7c8f" value={affName} onChangeText={setAffName} />
            <TextInput style={styles.modalInput} placeholder="Website URL" placeholderTextColor="#6b7c8f" value={affUrl} onChangeText={setAffUrl} keyboardType="url" autoCapitalize="none" />
            <TextInput style={styles.modalInput} placeholder="Commission %" placeholderTextColor="#6b7c8f" value={affCommission} onChangeText={setAffCommission} keyboardType="decimal-pad" />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalSaveButton, { backgroundColor: "#E040FB" }]} onPress={saveAffiliate}>
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};
