import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Affiliate {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  discount: string;
  commission?: string;
  is_featured: boolean;
  is_active: boolean;
  order: number;
}

const EMPTY_AFFILIATE: Omit<Affiliate, "id"> = {
  name: "",
  description: "",
  url: "",
  category: "eyeglasses",
  discount: "",
  commission: "",
  is_featured: false,
  is_active: true,
  order: 100,
};

export default function ManageAffiliatesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [formData, setFormData] = useState<Omit<Affiliate, "id">>(EMPTY_AFFILIATE);

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/affiliates/all`);
      if (response.ok) {
        const data = await response.json();
        setAffiliates(data.partners);
      }
    } catch (error) {
      console.error("Error fetching affiliates:", error);
      Alert.alert("Error", "Failed to load affiliates");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAffiliate(null);
    setFormData(EMPTY_AFFILIATE);
    setModalVisible(true);
  };

  const openEditModal = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    setFormData({
      name: affiliate.name,
      description: affiliate.description,
      url: affiliate.url,
      category: affiliate.category,
      discount: affiliate.discount,
      commission: affiliate.commission || "",
      is_featured: affiliate.is_featured,
      is_active: affiliate.is_active,
      order: affiliate.order,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      Alert.alert("Error", "Name and URL are required");
      return;
    }

    setSaving(true);
    try {
      const url = editingAffiliate
        ? `${BACKEND_URL}/api/affiliates/${editingAffiliate.id}`
        : `${BACKEND_URL}/api/affiliates`;
      
      const method = editingAffiliate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setModalVisible(false);
        fetchAffiliates();
        Alert.alert("Success", editingAffiliate ? "Affiliate updated!" : "Affiliate added!");
      } else {
        Alert.alert("Error", "Failed to save affiliate");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save affiliate");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (affiliate: Affiliate) => {
    Alert.alert(
      "Delete Affiliate",
      `Are you sure you want to delete "${affiliate.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${BACKEND_URL}/api/affiliates/${affiliate.id}`,
                { method: "DELETE" }
              );
              if (response.ok) {
                fetchAffiliates();
              } else {
                Alert.alert("Error", "Failed to delete affiliate");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete affiliate");
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (affiliate: Affiliate) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/affiliates/${affiliate.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...affiliate,
            is_active: !affiliate.is_active,
          }),
        }
      );
      if (response.ok) {
        fetchAffiliates();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update affiliate");
    }
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Affiliates</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Ionicons name="information-circle" size={20} color="#4a9eff" />
        <Text style={styles.instructionsText}>
          Add your affiliate tracking URLs here. Changes appear instantly in the app.
        </Text>
      </View>

      {/* Affiliates List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {affiliates.map((affiliate) => (
          <View
            key={affiliate.id}
            style={[
              styles.affiliateCard,
              !affiliate.is_active && styles.affiliateCardInactive,
            ]}
          >
            <View style={styles.affiliateHeader}>
              <View style={styles.affiliateInfo}>
                <View style={styles.affiliateNameRow}>
                  <Text style={styles.affiliateName}>{affiliate.name}</Text>
                  {affiliate.is_featured && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredText}>FEATURED</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.affiliateCategory}>
                  {affiliate.category} • Order: {affiliate.order}
                </Text>
              </View>
              <Switch
                value={affiliate.is_active}
                onValueChange={() => toggleActive(affiliate)}
                trackColor={{ false: "#3a4d63", true: "#4CAF50" }}
                thumbColor={affiliate.is_active ? "#fff" : "#8899a6"}
              />
            </View>
            
            <Text style={styles.affiliateUrl} numberOfLines={1}>
              {affiliate.url}
            </Text>

            {affiliate.commission && (
              <Text style={styles.affiliateCommission}>
                Commission: {affiliate.commission}
              </Text>
            )}

            <View style={styles.affiliateActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(affiliate)}
              >
                <Ionicons name="pencil" size={16} color="#4a9eff" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(affiliate)}
              >
                <Ionicons name="trash" size={16} color="#ff5c5c" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContent}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingAffiliate ? "Edit Affiliate" : "Add Affiliate"}
              </Text>
              <TouchableOpacity onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#4a9eff" />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              {/* Name */}
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Zenni Optical"
                placeholderTextColor="#6b7c8f"
              />

              {/* URL */}
              <Text style={styles.label}>Affiliate URL *</Text>
              <TextInput
                style={styles.input}
                value={formData.url}
                onChangeText={(text) => setFormData({ ...formData, url: text })}
                placeholder="https://www.example.com?ref=YOUR_ID"
                placeholderTextColor="#6b7c8f"
                autoCapitalize="none"
                keyboardType="url"
              />

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Short description for users"
                placeholderTextColor="#6b7c8f"
              />

              {/* Category */}
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryOptions}>
                {["eyeglasses", "contacts", "both"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      formData.category === cat && styles.categoryOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        formData.category === cat && styles.categoryTextActive,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Discount/Offer */}
              <Text style={styles.label}>Discount/Offer Text</Text>
              <TextInput
                style={styles.input}
                value={formData.discount}
                onChangeText={(text) => setFormData({ ...formData, discount: text })}
                placeholder="e.g., Up to 50% off"
                placeholderTextColor="#6b7c8f"
              />

              {/* Commission */}
              <Text style={styles.label}>Commission Rate (for your reference)</Text>
              <TextInput
                style={styles.input}
                value={formData.commission || ""}
                onChangeText={(text) => setFormData({ ...formData, commission: text })}
                placeholder="e.g., 15%"
                placeholderTextColor="#6b7c8f"
              />

              {/* Order */}
              <Text style={styles.label}>Display Order (lower = higher in list)</Text>
              <TextInput
                style={styles.input}
                value={formData.order.toString()}
                onChangeText={(text) =>
                  setFormData({ ...formData, order: parseInt(text) || 100 })
                }
                placeholder="100"
                placeholderTextColor="#6b7c8f"
                keyboardType="number-pad"
              />

              {/* Toggles */}
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Featured Partner</Text>
                <Switch
                  value={formData.is_featured}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_featured: value })
                  }
                  trackColor={{ false: "#3a4d63", true: "#f5a623" }}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Active (show to users)</Text>
                <Switch
                  value={formData.is_active}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value })
                  }
                  trackColor={{ false: "#3a4d63", true: "#4CAF50" }}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2d45",
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4a9eff",
    borderRadius: 22,
  },
  instructions: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: "#8899a6",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  affiliateCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  affiliateCardInactive: {
    opacity: 0.5,
  },
  affiliateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  affiliateInfo: {
    flex: 1,
  },
  affiliateNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  affiliateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  featuredBadge: {
    backgroundColor: "#f5a623",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
  },
  affiliateCategory: {
    fontSize: 12,
    color: "#8899a6",
    marginTop: 4,
  },
  affiliateUrl: {
    fontSize: 12,
    color: "#4a9eff",
    marginTop: 8,
  },
  affiliateCommission: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 4,
  },
  affiliateActions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editButtonText: {
    fontSize: 13,
    color: "#4a9eff",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 13,
    color: "#ff5c5c",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2d45",
  },
  cancelText: {
    fontSize: 16,
    color: "#8899a6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  saveText: {
    fontSize: 16,
    color: "#4a9eff",
    fontWeight: "600",
  },
  form: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
  categoryOptions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  categoryOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1a2d45",
    alignItems: "center",
  },
  categoryOptionActive: {
    backgroundColor: "#4a9eff",
  },
  categoryText: {
    fontSize: 14,
    color: "#8899a6",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1a2d45",
  },
  toggleLabel: {
    fontSize: 15,
    color: "#fff",
  },
});
