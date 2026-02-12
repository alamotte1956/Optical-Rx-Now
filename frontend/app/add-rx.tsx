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
import {
  getFamilyMembers,
  savePrescription,
  FamilyMember,
} from "../services/localStorage";
import {
  getTodayFormatted,
  formatDateForInput,
  normalizeDate,
  isValidDate,
} from "../services/dateUtils";

export default function AddRxScreen() {
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [rxType, setRxType] = useState<"eyeglass" | "contact">("eyeglass");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageUri, setImageUri] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [dateTaken, setDateTaken] = useState(getTodayFormatted());
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
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

  const loadFamilyMembers = async () => {
    try {
      const members = await getFamilyMembers();
      setFamilyMembers(members);
      if (members.length > 0) {
        setSelectedMember(members[0].id);
      }
    } catch (error) {
      console.error("Error loading family members:", error);
    } finally {
      setLoading(false);
    }
  };

  const scanForExpiryDate = async (base64Image: string) => {
    // OCR is disabled - it was causing crashes
    // Users will need to enter the expiration date manually
    console.log("OCR disabled - manual date entry required");
    return;
  };

  // Maximum image size (4MB in base64 ~ safe for AsyncStorage)
  const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

  const validateAndSetImage = (base64Data: string): boolean => {
    if (!base64Data || base64Data.length < 100) {
      console.log("Invalid image data - too small or empty");
      Alert.alert("Error", "Could not process image. Please try again.");
      return false;
    }
    
    if (base64Data.length > MAX_IMAGE_SIZE) {
      console.log(`Image too large: ${base64Data.length} bytes`);
      Alert.alert(
        "Image Too Large", 
        "The photo is too large. Please take a photo with lower resolution or try again."
      );
      return false;
    }
    
    console.log(`Image validated, size: ${base64Data.length} chars`);
    setImageBase64(base64Data);
    return true;
  };

  const takePhoto = async () => {
    try {
      console.log("Opening camera...");
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.3,
        base64: true,
        exif: false,
      });

      console.log("Camera result:", result.canceled ? "canceled" : "captured");

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log("Asset received, uri:", asset.uri);
        
        // Use URI for preview (more efficient)
        if (asset.uri) {
          setImageUri(asset.uri);
        }
        
        // Store base64 for saving
        if (asset.base64 && asset.base64.length > 0) {
          const base64Data = `data:image/jpeg;base64,${asset.base64}`;
          if (base64Data.length <= MAX_IMAGE_SIZE) {
            setImageBase64(base64Data);
            console.log("Photo captured successfully, size:", base64Data.length);
          } else {
            console.log("Image too large:", base64Data.length);
            Alert.alert("Image Too Large", "Please take a lower resolution photo.");
            setImageUri("");
          }
        } else {
          console.log("No base64 data");
          Alert.alert("Error", "Could not capture photo. Please try again.");
          setImageUri("");
        }
      }
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert("Error", "Could not access camera.");
    }
  };

  const pickImage = async () => {
    try {
      console.log("Opening image library...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.3,
        base64: true,
        exif: false,
      });

      console.log("Library result:", result.canceled ? "canceled" : "selected");

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log("Asset received, uri:", asset.uri);
        
        // Use URI for preview (more efficient)
        if (asset.uri) {
          setImageUri(asset.uri);
        }
        
        // Store base64 for saving
        if (asset.base64 && asset.base64.length > 0) {
          const base64Data = `data:image/jpeg;base64,${asset.base64}`;
          if (base64Data.length <= MAX_IMAGE_SIZE) {
            setImageBase64(base64Data);
            console.log("Photo selected successfully, size:", base64Data.length);
          } else {
            console.log("Image too large:", base64Data.length);
            Alert.alert("Image Too Large", "Please select a smaller image.");
            setImageUri("");
          }
        } else {
          console.log("No base64 data");
          Alert.alert("Error", "Could not load image. Please try another.");
          setImageUri("");
        }
      }
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Could not access photos.");
    }
  };

  const handleRescan = () => {
    // OCR disabled
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
    
    // Validate dates
    if (dateTaken && !isValidDate(dateTaken)) {
      Alert.alert("Invalid Date", "Please enter the prescription date in MM/DD/YYYY format");
      return;
    }
    if (expiryDate && !isValidDate(expiryDate)) {
      Alert.alert("Invalid Date", "Please enter the expiration date in MM/DD/YYYY format");
      return;
    }

    setSaving(true);
    try {
      // Normalize dates to YYYY-MM-DD for storage
      let normalizedDateTaken = normalizeDate(dateTaken);
      if (!normalizedDateTaken) {
        // Fallback: create today's date in YYYY-MM-DD format
        const today = new Date();
        normalizedDateTaken = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      }
      const normalizedExpiryDate = expiryDate ? normalizeDate(expiryDate) : null;
      
      console.log("Saving prescription with image size:", imageBase64.length);
      
      const savedRx = await savePrescription({
        familyMemberId: selectedMember,
        rxType,
        imageBase64,
        notes: notes.trim(),
        dateTaken: normalizedDateTaken,
        expiryDate: normalizedExpiryDate,
      });

      console.log("Prescription saved with ID:", savedRx.id);

      // Show success and navigate back
      Alert.alert(
        "Success",
        normalizedExpiryDate 
          ? "Prescription saved! You'll receive notifications before it expires."
          : "Prescription saved successfully!",
        [{ 
          text: "OK", 
          onPress: () => {
            try {
              router.dismiss();
            } catch (navError) {
              console.log("Navigation error:", navError);
              router.back();
            }
          }
        }]
      );
    } catch (error) {
      console.log("Save error:", error);
      Alert.alert("Error", "Failed to save prescription. Please try again.");
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
          <TouchableOpacity onPress={() => router.dismiss()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Prescription</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#3a4d63" />
          <Text style={styles.emptyText}>No Family Members</Text>
          <Text style={styles.emptySubtext}>
            Please add a family member before adding prescriptions
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              router.dismiss();
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
          <TouchableOpacity onPress={() => router.dismiss()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Prescription</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !imageBase64}
            style={[styles.saveButton, (!imageBase64 || saving) && styles.saveButtonDisabled]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Family Member Selection */}
          <Text style={styles.label}>Family Member</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.memberSelector}
          >
            {familyMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.memberChip,
                  selectedMember === member.id && styles.memberChipActive,
                ]}
                onPress={() => setSelectedMember(member.id)}
              >
                <Text
                  style={[
                    styles.memberChipText,
                    selectedMember === member.id && styles.memberChipTextActive,
                  ]}
                >
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Prescription Type */}
          <Text style={styles.label}>Prescription Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, rxType === "eyeglass" && styles.typeButtonActive]}
              onPress={() => setRxType("eyeglass")}
            >
              <Ionicons
                name="glasses-outline"
                size={24}
                color={rxType === "eyeglass" ? "#fff" : "#8899a6"}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  rxType === "eyeglass" && styles.typeButtonTextActive,
                ]}
              >
                Eyeglasses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, rxType === "contact" && styles.typeButtonActive]}
              onPress={() => setRxType("contact")}
            >
              <Ionicons
                name="eye-outline"
                size={24}
                color={rxType === "contact" ? "#fff" : "#8899a6"}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  rxType === "contact" && styles.typeButtonTextActive,
                ]}
              >
                Contacts
              </Text>
            </TouchableOpacity>
          </View>

          {/* Image Capture */}
          <Text style={styles.label}>Prescription Image</Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="contain" />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setImageBase64("");
                  setImageUri("");
                  setExpiryDate("");
                }}
              >
                <Ionicons name="close-circle" size={28} color="#ff5c5c" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Ionicons name="camera" size={32} color="#4a9eff" />
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="images" size={32} color="#4a9eff" />
                <Text style={styles.imageButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Date */}
          <Text style={styles.label}>Prescription Date</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#6b7c8f"
            value={dateTaken}
            onChangeText={setDateTaken}
            keyboardType="numbers-and-punctuation"
          />

          {/* Expiry Date */}
          <Text style={styles.label}>Expiration Date</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/DD/YYYY (optional)"
            placeholderTextColor="#6b7c8f"
            value={expiryDate}
            onChangeText={setExpiryDate}
            keyboardType="numbers-and-punctuation"
          />
          {expiryDate ? (
            <Text style={styles.expiryHint}>
              ✓ You'll receive notifications at 30 days, 14 days, 7 days, 2 days, and the morning of expiration
            </Text>
          ) : (
            <Text style={styles.expiryHintEmpty}>
              Add an expiration date to receive reminder notifications
            </Text>
          )}

          {/* Notes */}
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add any notes about this prescription..."
            placeholderTextColor="#6b7c8f"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </ScrollView>
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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  placeholder: {
    width: 60,
  },
  saveButton: {
    backgroundColor: "#4a9eff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#3a4d63",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 8,
    marginTop: 16,
  },
  memberSelector: {
    flexDirection: "row",
    marginBottom: 8,
  },
  memberChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1a2d45",
    marginRight: 8,
  },
  memberChipActive: {
    backgroundColor: "#4a9eff",
  },
  memberChipText: {
    fontSize: 14,
    color: "#8899a6",
  },
  memberChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#1a2d45",
  },
  typeButtonActive: {
    backgroundColor: "#4a9eff",
  },
  typeButtonText: {
    fontSize: 14,
    color: "#8899a6",
  },
  typeButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  imageButtons: {
    flexDirection: "row",
    gap: 12,
  },
  imageButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    borderRadius: 12,
    backgroundColor: "#1a2d45",
    borderWidth: 2,
    borderColor: "#2a3d55",
    borderStyle: "dashed",
  },
  imageButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: "#4a9eff",
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#1a2d45",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 14,
  },
  input: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
  },
  notesInput: {
    height: 100,
    paddingTop: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
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
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: "#4a9eff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  expiryHint: {
    color: "#4CAF50",
    fontSize: 12,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  expiryHintEmpty: {
    color: "#8899a6",
    fontSize: 12,
    marginTop: 8,
    paddingHorizontal: 4,
    fontStyle: "italic",
  },
});
