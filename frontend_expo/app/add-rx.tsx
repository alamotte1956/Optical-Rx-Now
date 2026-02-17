import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  savePrescription,
  getFamilyMembers,
  FamilyMember,
} from "../services/localStorage";
import { extractExpirationDate } from "../services/ocrService";

const RX_TYPES = [
  { value: "eyeglass", label: "Eyeglasses", icon: "glasses-outline" },
  { value: "contact", label: "Contact Lenses", icon: "eye-outline" },
] as const;

export default function AddRxScreen() {
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [rxType, setRxType] = useState<"eyeglass" | "contact">("eyeglass");
  const [imageUri, setImageUri] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [processingOCR, setProcessingOCR] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFamilyMembers();
    }, [])
  );

  const loadFamilyMembers = async () => {
    const members = await getFamilyMembers();
    setFamilyMembers(members);
    if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission Required", "Camera permission is needed to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setShowPreview(true);
      await processImageWithOCR(uri);
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert("Permission Required", "Gallery permission is needed to select photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setShowPreview(true);
      await processImageWithOCR(uri);
    }
  };

  const processImageWithOCR = async (uri: string) => {
    setProcessingOCR(true);
    try {
      console.log("Starting OCR processing...");
      const result = await extractExpirationDate(uri);
      
      if (result.expiryDate) {
        setExpiryDate(result.expiryDate);
      } else {
        console.log("No expiration date found in image");
      }
    } catch (error) {
      console.log("OCR processing error:", error);
    } finally {
      setProcessingOCR(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMemberId) {
      Alert.alert("Error", "Please select a family member");
      return;
    }

    if (!imageUri) {
      Alert.alert("Error", "Please add a prescription photo");
      return;
    }

    setSaving(true);
    try {
      await savePrescription({
        familyMemberId: selectedMemberId,
        rxType,
        imageBase64: imageUri,
        notes: "",
        dateTaken: new Date().toISOString(),
        expiryDate: expiryDate || null,
      });
      Alert.alert("Success", "Prescription saved successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save prescription");
      console.log("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => {
    setImageUri("");
    setExpiryDate("");
    setShowPreview(false);
  };

  if (familyMembers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Prescription</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#3a4d63" />
          <Text style={styles.emptyText}>No Family Members</Text>
          <Text style={styles.emptySubtext}>
            Please add a family member first before adding prescriptions
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              router.back();
              router.push("/add-member");
            }}
          >
            <Text style={styles.emptyButtonText}>Add Family Member</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showPreview && imageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleRetake} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review & Save</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.previewContainer}>
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
            {processingOCR && (
              <View style={styles.ocrOverlay}>
                <ActivityIndicator size="large" color="#4a9eff" />
                <Text style={styles.ocrText}>Detecting expiration date...</Text>
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="person" size={20} color="#4a9eff" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Family Member</Text>
                <View style={styles.memberSelector}>
                  {familyMembers.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberChip,
                        selectedMemberId === member.id && styles.memberChipActive,
                      ]}
                      onPress={() => setSelectedMemberId(member.id)}
                    >
                      <Text
                        style={[
                          styles.memberChipText,
                          selectedMemberId === member.id && styles.memberChipTextActive,
                        ]}
                      >
                        {member.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="glasses-outline" size={20} color="#4a9eff" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Type</Text>
                <View style={styles.typeSelector}>
                  {RX_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeChip,
                        rxType === type.value && styles.typeChipActive,
                      ]}
                      onPress={() => setRxType(type.value)}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={18}
                        color={rxType === type.value ? "#fff" : "#8899a6"}
                      />
                      <Text
                        style={[
                          styles.typeChipText,
                          rxType === type.value && styles.typeChipTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {expiryDate && (
              <View style={styles.infoCard}>
                <Ionicons name="calendar" size={20} color="#4CAF50" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Expiration Date (Auto-detected)</Text>
                  <Text style={styles.expiryValue}>{expiryDate}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}

            {!expiryDate && !processingOCR && (
              <View style={[styles.infoCard, styles.warningCard]}>
                <Ionicons name="alert-circle" size={20} color="#FF9800" />
                <View style={styles.infoContent}>
                  <Text style={styles.warningText}>
                    No expiration date detected. You can still save the prescription.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Ionicons name="camera-reverse" size={20} color="#8899a6" />
            <Text style={styles.retakeButtonText}>Retake Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, (saving || !selectedMemberId) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving || !selectedMemberId}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Prescription</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Prescription</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.captureContainer}>
        <View style={styles.captureContent}>
          <Ionicons name="camera" size={80} color="#4a9eff" />
          <Text style={styles.captureTitle}>Take a Photo of Your Prescription</Text>
          <Text style={styles.captureSubtitle}>
            We'll automatically detect the expiration date
          </Text>

          <View style={styles.captureButtons}>
            <TouchableOpacity style={styles.primaryCaptureButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
              <Text style={styles.primaryCaptureButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryCaptureButton} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={24} color="#4a9eff" />
              <Text style={styles.secondaryCaptureButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>📸 Tips for best results:</Text>
            <Text style={styles.tipText}>• Ensure good lighting</Text>
            <Text style={styles.tipText}>• Capture the full prescription</Text>
            <Text style={styles.tipText}>• Keep the image steady and clear</Text>
            <Text style={styles.tipText}>• Make sure expiration date is visible</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
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
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
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
  },
  captureContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  captureContent: {
    alignItems: "center",
    width: "100%",
  },
  captureTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 24,
    textAlign: "center",
  },
  captureSubtitle: {
    fontSize: 16,
    color: "#8899a6",
    marginTop: 12,
    textAlign: "center",
  },
  captureButtons: {
    width: "100%",
    gap: 12,
    marginTop: 32,
  },
  primaryCaptureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#4a9eff",
    paddingVertical: 18,
    borderRadius: 12,
  },
  primaryCaptureButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  secondaryCaptureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#1a2d45",
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4a9eff",
  },
  secondaryCaptureButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a9eff",
  },
  tipsCard: {
    marginTop: 32,
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: "#8899a6",
    marginBottom: 8,
    lineHeight: 20,
  },
  previewContainer: {
    flex: 1,
  },
  imagePreview: {
    height: 300,
    backgroundColor: "#1a2d45",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  ocrOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10, 22, 40, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  ocrText: {
    color: "#4a9eff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoSection: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#8899a6",
    marginBottom: 8,
    fontWeight: "600",
  },
  memberSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  memberChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#0f1d2f",
    borderWidth: 1,
    borderColor: "#3a4d63",
  },
  memberChipActive: {
    backgroundColor: "#4a9eff",
    borderColor: "#4a9eff",
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
    gap: 8,
  },
  typeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#0f1d2f",
    borderWidth: 1,
    borderColor: "#3a4d63",
  },
  typeChipActive: {
    backgroundColor: "#4a9eff",
    borderColor: "#4a9eff",
  },
  typeChipText: {
    fontSize: 13,
    color: "#8899a6",
  },
  typeChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  expiryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
  },
  warningCard: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.3)",
  },
  warningText: {
    fontSize: 13,
    color: "#FF9800",
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: "#0a1628",
    borderTopWidth: 1,
    borderTopColor: "#1a2d45",
  },
  retakeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1a2d45",
    paddingVertical: 14,
    borderRadius: 12,
  },
  retakeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8899a6",
  },
  saveButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4a9eff",
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    backgroundColor: "#3a4d63",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
