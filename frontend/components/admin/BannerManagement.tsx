import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Section } from "./Section";
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

  const openModal = (banner?: Banner) => {
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
    if (!banImageUrl.trim() || !banDestUrl.trim()) {
      Alert.alert("Error", "Image URL and Destination URL are required.");
      return;
    }
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
      setModalVisible(false);
      await refreshData();
      Alert.alert("Success", editing?.banner_id ? "Banner updated!" : "Banner created!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDelete = (ban: Banner) => {
    Alert.alert("Delete Banner", `Remove "${ban.title || "Untitled"}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBanner(ban.banner_id);
            await refreshData();
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const handleToggle = async (ban: Banner) => {
    try {
      await updateBanner(ban.banner_id, { ...ban, is_active: !ban.is_active });
      await refreshData();
    } catch (error: any) {
      Alert.alert("Error", error.message);
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
          <TouchableOpacity style={[styles.addButton, { backgroundColor: "#FF9800" }]} onPress={() => openModal()}>
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
                <TouchableOpacity style={styles.iconBtn} onPress={() => openModal(ban)}>
                  <Ionicons name="create-outline" size={18} color="#FF9800" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => Linking.openURL(ban.destination_url)}>
                  <Ionicons name="open-outline" size={18} color="#8899a6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(ban)}>
                  <Ionicons name="trash-outline" size={18} color="#ff5c5c" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </Section>

      {/* Banner Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="images" size={28} color="#FF9800" />
                <Text style={styles.modalTitle}>{editing?.banner_id ? "Edit" : "Add"} Banner</Text>
              </View>
              <TextInput style={styles.modalInput} placeholder="Banner Title (optional)" placeholderTextColor="#6b7c8f" value={banTitle} onChangeText={setBanTitle} />
              <TextInput style={styles.modalInput} placeholder="Image URL" placeholderTextColor="#6b7c8f" value={banImageUrl} onChangeText={setBanImageUrl} keyboardType="url" autoCapitalize="none" />
              <TextInput style={styles.modalInput} placeholder="Destination URL" placeholderTextColor="#6b7c8f" value={banDestUrl} onChangeText={setBanDestUrl} keyboardType="url" autoCapitalize="none" />
              <TextInput style={styles.modalInput} placeholder="Start Date (YYYY-MM-DD)" placeholderTextColor="#6b7c8f" value={banStartDate} onChangeText={setBanStartDate} />
              <TextInput style={styles.modalInput} placeholder="End Date (YYYY-MM-DD)" placeholderTextColor="#6b7c8f" value={banEndDate} onChangeText={setBanEndDate} />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalSaveButton, { backgroundColor: "#FF9800" }]} onPress={saveBanner}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};
