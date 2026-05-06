import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Pressable,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  getInsuranceCards,
  saveInsuranceCard,
  deleteInsuranceCard,
  getFamilyMembers,
  InsuranceCard,
  FamilyMember,
} from "../services/localStorage";

export default function InsuranceCardsScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<InsuranceCard[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [label, setLabel] = useState("Vision Insurance");
  const [insurerName, setInsurerName] = useState("");
  const [memberIdField, setMemberIdField] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [cardsData, membersData] = await Promise.all([
        getInsuranceCards(),
        getFamilyMembers(),
      ]);
      setCards(cardsData);
      setMembers(membersData);
      if (membersData.length > 0 && !selectedMemberId) {
        setSelectedMemberId(membersData[0].id);
      }
    } catch (error) {
      console.log("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pickImage = async (side: "front" | "back") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (side === "front") setFrontImage(base64);
      else setBackImage(base64);
    }
  };

  const takePhoto = async (side: "front" | "back") => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Camera access is required to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (side === "front") setFrontImage(base64);
      else setBackImage(base64);
    }
  };

  const showImageOptions = (side: "front" | "back") => {
    Alert.alert(
      `${side === "front" ? "Front" : "Back"} of Card`,
      "Choose an option",
      [
        { text: "Take Photo", onPress: () => takePhoto(side) },
        { text: "Choose from Gallery", onPress: () => pickImage(side) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleSave = async () => {
    if (!frontImage) {
      Alert.alert("Photo Required", "Please capture the front of your insurance card.");
      return;
    }
    if (!selectedMemberId) {
      Alert.alert("Member Required", "Please select a family member.");
      return;
    }
    setSaving(true);
    try {
      await saveInsuranceCard({
        familyMemberId: selectedMemberId,
        label: label || "Vision Insurance",
        frontImageBase64: frontImage,
        backImageBase64: backImage,
        insurerName,
        memberId: memberIdField,
        groupNumber,
        notes,
      });
      resetForm();
      setShowAddForm(false);
      loadData();
    } catch (error) {
      Alert.alert("Error", "Failed to save insurance card.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (card: InsuranceCard) => {
    Alert.alert("Delete Insurance Card?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteInsuranceCard(card.id);
          loadData();
        },
      },
    ]);
  };

  const resetForm = () => {
    setLabel("Vision Insurance");
    setInsurerName("");
    setMemberIdField("");
    setGroupNumber("");
    setNotes("");
    setFrontImage(null);
    setBackImage(null);
  };

  const getMemberName = (id: string) => members.find((m) => m.id === id)?.name || "Unknown";

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4a9eff" style={{ flex: 1 }} />
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
        <Text style={styles.headerTitle}>Insurance Cards</Text>
        <TouchableOpacity onPress={() => router.replace("/welcome")} style={styles.backButton} accessibilityLabel="Home" accessibilityRole="button">
          <Ionicons name="home-outline" size={22} color="#4a9eff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#4a9eff" />}
        >
          {/* Add Card Button */}
          {!showAddForm && (
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddForm(true)}>
              <Ionicons name="add-circle" size={22} color="#fff" />
              <Text style={styles.addButtonText}>Add Insurance Card</Text>
            </TouchableOpacity>
          )}

          {/* Add Form */}
          {showAddForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Add Insurance Card</Text>
              <Text style={styles.formSubtitle}>All fields are optional except the photo</Text>

              {/* Member Selection */}
              {members.length > 0 && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Family Member</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberChips}>
                    {members.map((m) => (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.chip, selectedMemberId === m.id && styles.chipActive]}
                        onPress={() => setSelectedMemberId(m.id)}
                      >
                        <Text style={[styles.chipText, selectedMemberId === m.id && styles.chipTextActive]}>{m.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Card Label */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Card Label</Text>
                <TextInput style={styles.input} value={label} onChangeText={setLabel} placeholder="e.g., Vision Insurance" placeholderTextColor="#6b7c8f" />
              </View>

              {/* Insurer Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Insurance Company (optional)</Text>
                <TextInput style={styles.input} value={insurerName} onChangeText={setInsurerName} placeholder="e.g., VSP, EyeMed" placeholderTextColor="#6b7c8f" />
              </View>

              {/* Member ID & Group */}
              <View style={styles.rowFields}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Member ID (optional)</Text>
                  <TextInput style={styles.input} value={memberIdField} onChangeText={setMemberIdField} placeholder="ID number" placeholderTextColor="#6b7c8f" />
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Group # (optional)</Text>
                  <TextInput style={styles.input} value={groupNumber} onChangeText={setGroupNumber} placeholder="Group #" placeholderTextColor="#6b7c8f" />
                </View>
              </View>

              {/* Front of Card */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Front of Card *</Text>
                <TouchableOpacity style={styles.imageCapture} onPress={() => showImageOptions("front")}>
                  {frontImage ? (
                    <Image source={{ uri: frontImage }} style={styles.cardImage} resizeMode="contain" />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera-outline" size={32} color="#4a9eff" />
                      <Text style={styles.imagePlaceholderText}>Tap to capture front</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Back of Card */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Back of Card (optional)</Text>
                <TouchableOpacity style={styles.imageCapture} onPress={() => showImageOptions("back")}>
                  {backImage ? (
                    <Image source={{ uri: backImage }} style={styles.cardImage} resizeMode="contain" />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera-outline" size={28} color="#6b7c8f" />
                      <Text style={styles.imagePlaceholderText}>Tap to capture back</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Notes */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Notes (optional)</Text>
                <TextInput style={[styles.input, { height: 60, textAlignVertical: "top" }]} value={notes} onChangeText={setNotes} placeholder="Any additional notes" placeholderTextColor="#6b7c8f" multiline />
              </View>

              {/* Buttons */}
              <View style={styles.formButtons}>
                <Pressable style={styles.cancelButton} onPress={() => { resetForm(); setShowAddForm(false); }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.saveButton, !frontImage && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving || !frontImage}>
                  {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Save Card</Text>}
                </Pressable>
              </View>
            </View>
          )}

          {/* Existing Cards */}
          {cards.length === 0 && !showAddForm ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color="#3a4d63" />
              <Text style={styles.emptyTitle}>No Insurance Cards</Text>
              <Text style={styles.emptySubtitle}>Store your vision insurance cards here for easy access</Text>
            </View>
          ) : (
            cards.map((card) => (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardLabel}>{card.label}</Text>
                    <Text style={styles.cardMember}>{getMemberName(card.familyMemberId)}</Text>
                  </View>
                  <Pressable onPress={() => handleDelete(card)} style={{ padding: 8 }}>
                    <Ionicons name="trash-outline" size={20} color="#ff5c5c" />
                  </Pressable>
                </View>
                {card.insurerName ? <Text style={styles.cardDetail}>{card.insurerName}</Text> : null}
                {card.memberId ? <Text style={styles.cardDetail}>Member ID: {card.memberId}</Text> : null}
                {card.groupNumber ? <Text style={styles.cardDetail}>Group: {card.groupNumber}</Text> : null}
                <Image source={{ uri: card.frontImageBase64 }} style={styles.cardPreview} resizeMode="contain" />
                {card.backImageBase64 && (
                  <Image source={{ uri: card.backImageBase64 }} style={styles.cardPreview} resizeMode="contain" />
                )}
                {card.notes ? <Text style={styles.cardNotes}>{card.notes}</Text> : null}
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1a2d45" },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff", flex: 1, textAlign: "center" },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#4a9eff", paddingVertical: 14, borderRadius: 12, marginBottom: 16 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  formCard: { backgroundColor: "#1a2d45", borderRadius: 16, padding: 20, marginBottom: 16 },
  formTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 2 },
  formSubtitle: { fontSize: 13, color: "#6b7c8f", marginBottom: 16 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#8899a6", marginBottom: 6 },
  input: { backgroundColor: "#0f1d2f", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: "#fff", fontSize: 15, borderWidth: 1, borderColor: "#2a3d55" },
  rowFields: { flexDirection: "row", gap: 12 },
  memberChips: { flexDirection: "row" },
  chip: { backgroundColor: "#0f1d2f", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: "#2a3d55" },
  chipActive: { backgroundColor: "#4a9eff", borderColor: "#4a9eff" },
  chipText: { fontSize: 13, color: "#8899a6", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  imageCapture: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#2a3d55", borderStyle: "dashed" },
  cardImage: { width: "100%", height: 180, borderRadius: 12 },
  imagePlaceholder: { alignItems: "center", justifyContent: "center", paddingVertical: 32, backgroundColor: "#0f1d2f" },
  imagePlaceholderText: { fontSize: 13, color: "#6b7c8f", marginTop: 8 },
  formButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: "#2a3d55", alignItems: "center" },
  cancelButtonText: { color: "#8899a6", fontWeight: "600", fontSize: 15 },
  saveButton: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: "#4a9eff", alignItems: "center" },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: "#6b7c8f", marginTop: 6, textAlign: "center" },
  cardItem: { backgroundColor: "#1a2d45", borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardLabel: { fontSize: 16, fontWeight: "700", color: "#fff" },
  cardMember: { fontSize: 13, color: "#4a9eff", fontWeight: "600", marginTop: 2 },
  cardDetail: { fontSize: 13, color: "#8899a6", marginBottom: 2 },
  cardPreview: { width: "100%", height: 160, borderRadius: 10, marginTop: 10, backgroundColor: "#0f1d2f" },
  cardNotes: { fontSize: 13, color: "#6b7c8f", marginTop: 8, fontStyle: "italic" },
});
