import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
}

export default function AddRxScreen() {
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [rxType, setRxType] = useState<"eyeglass" | "contact">("eyeglass");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [dateTaken, setDateTaken] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extractingExpiry, setExtractingExpiry] = useState(false);

  useEffect(() => {
    fetchFamilyMembers();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to capture prescriptions"
      );
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/family-members`);
      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data);
        if (data.length > 0) {
          setSelectedMember(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching family members:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractExpiryDate = async (base64Image: string) => {
    setExtractingExpiry(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/ocr/extract-expiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64Image }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.expiry_date) {
          setExpiryDate(data.expiry_date);
          Alert.alert(
            "Expiration Date Found",
            `Detected expiration date: ${data.expiry_date}\n\nPlease verify this is correct.`,
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "No Expiration Date Found",
            data.message || "Please enter the expiration date manually.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.log("OCR extraction error:", error);
    } finally {
      setExtractingExpiry(false);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
      base64: true,
      exif: false,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Data = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImageBase64(base64Data);
      // Auto-extract expiry date
      extractExpiryDate(base64Data);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
      base64: true,
      exif: false,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Data = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImageBase64(base64Data);
      // Auto-extract expiry date
      extractExpiryDate(base64Data);
    }
  };

  const handleSave = async () => {
    if (!selectedMember) {
      Alert.alert("Error", "Please select a family member");
      return;
    }
    if (!imageBase64) {
      Alert.alert("Error", "Please capture or select an image of the prescription");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family_member_id: selectedMember,
          rx_type: rxType,
          image_base64: imageBase64,
          notes: notes.trim(),
          date_taken: dateTaken,
          expiry_date: expiryDate || null,
        }),
      });

      if (response.ok) {
        const savedRx = await response.json();
        
        // Schedule expiry alerts if we have an expiry date
        if (expiryDate && savedRx.id) {
          try {
            await fetch(`${BACKEND_URL}/api/alerts/schedule/${savedRx.id}`, {
              method: "POST",
            });
          } catch (alertError) {
            console.log("Could not schedule alerts:", alertError);
          }
        }
        
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to save prescription");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save prescription");
    } finally {
      setSaving(false);
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

  if (familyMembers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Prescription</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#3a4d63" />
          <Text style={styles.emptyTitle}>No Family Members</Text>
          <Text style={styles.emptyText}>
            Add a family member first before creating a prescription
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              router.back();
              setTimeout(() => router.push("/add-member"), 100);
            }}
          >
            <Text style={styles.emptyButtonText}>Add Family Member</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Prescription</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Capture Section */}
          <View style={styles.imageSection}>
            {imageBase64 ? (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: imageBase64 }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageBase64("")}
                >
                  <Ionicons name="close-circle" size={32} color="#ff5c5c" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.captureContainer}>
                <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={40} color="#4a9eff" />
                  <Text style={styles.captureText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.captureButton} onPress={pickImage}>
                  <Ionicons name="images" size={40} color="#4a9eff" />
                  <Text style={styles.captureText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Family Member Selection */}
          <Text style={styles.label}>Family Member</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.memberScroll}
          >
            {familyMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.memberOption,
                  selectedMember === member.id && styles.memberOptionActive,
                ]}
                onPress={() => setSelectedMember(member.id)}
              >
                <Text
                  style={[
                    styles.memberText,
                    selectedMember === member.id && styles.memberTextActive,
                  ]}
                >
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Rx Type Selection */}
          <Text style={styles.label}>Prescription Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                rxType === "eyeglass" && styles.typeOptionActive,
              ]}
              onPress={() => setRxType("eyeglass")}
            >
              <Ionicons
                name="glasses"
                size={24}
                color={rxType === "eyeglass" ? "#fff" : "#6b7c8f"}
              />
              <Text
                style={[
                  styles.typeText,
                  rxType === "eyeglass" && styles.typeTextActive,
                ]}
              >
                Eyeglass
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeOption,
                rxType === "contact" && styles.typeOptionActive,
              ]}
              onPress={() => setRxType("contact")}
            >
              <Ionicons
                name="eye"
                size={24}
                color={rxType === "contact" ? "#fff" : "#6b7c8f"}
              />
              <Text
                style={[
                  styles.typeText,
                  rxType === "contact" && styles.typeTextActive,
                ]}
              >
                Contact Lens
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date */}
          <Text style={styles.label}>Prescription Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#6b7c8f"
            value={dateTaken}
            onChangeText={setDateTaken}
          />

          {/* Notes */}
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any notes about this prescription..."
            placeholderTextColor="#6b7c8f"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!imageBase64 || !selectedMember) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving || !imageBase64 || !selectedMember}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={22} color="#fff" />
                <Text style={styles.saveButtonText}>Save Prescription</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  flex: {
    flex: 1,
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
  placeholder: {
    width: 44,
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  captureContainer: {
    flexDirection: "row",
    gap: 12,
  },
  captureButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1a2d45",
    borderStyle: "dashed",
  },
  captureText: {
    color: "#4a9eff",
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  previewContainer: {
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "#1a2d45",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  memberScroll: {
    marginBottom: 24,
  },
  memberOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#1a2d45",
    marginRight: 10,
  },
  memberOptionActive: {
    backgroundColor: "#4a9eff",
  },
  memberText: {
    fontSize: 14,
    color: "#8899a6",
    fontWeight: "500",
  },
  memberTextActive: {
    color: "#fff",
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#1a2d45",
    gap: 8,
  },
  typeOptionActive: {
    backgroundColor: "#4a9eff",
  },
  typeText: {
    fontSize: 14,
    color: "#8899a6",
    fontWeight: "500",
  },
  typeTextActive: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
    marginBottom: 24,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a9eff",
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#3a4d63",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#8899a6",
    textAlign: "center",
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: "#4a9eff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
