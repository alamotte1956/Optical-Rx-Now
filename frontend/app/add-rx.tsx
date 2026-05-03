import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  savePrescription,
  getFamilyMembers,
  FamilyMember,
} from "../services/localStorage";
import { trackPrescriptionForASO } from "../services/asoService";
import { isSmallDevice, moderateScale } from "../services/responsive";
import { useTranslation } from "../services/i18n";
import SmartInvitePrompt, { shouldShowInvitePrompt, incrementSaveCount } from "../components/SmartInvitePrompt";

const RX_TYPES = [
  { value: "eyeglass", labelKey: "eyeglasses", icon: "glasses-outline" },
  { value: "contact", labelKey: "contact_lenses", icon: "eye-outline" },
] as const;

export default function AddRxScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { type, memberId } = useLocalSearchParams<{ type?: "eyeglass" | "contact"; memberId?: string }>();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(memberId || "");
  const [rxType, setRxType] = useState<"eyeglass" | "contact">(type || "eyeglass");
  const [imageUri, setImageUri] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryInput, setExpiryInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  // Set the Rx type from URL parameter
  useEffect(() => {
    if (type === "eyeglass" || type === "contact") {
      setRxType(type);
    }
  }, [type]);

  useFocusEffect(
    useCallback(() => {
      loadFamilyMembers();
    }, [])
  );

  const loadFamilyMembers = async () => {
    const members = await getFamilyMembers();
    setFamilyMembers(members);
    if (members.length > 0 && !selectedMemberId) {
      // Only auto-select first member if no memberId was passed via params
      if (!memberId) {
        setSelectedMemberId(members[0].id);
      }
    }
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.log("Camera permission error:", error);
      return false;
    }
  };

  const requestGalleryPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.log("Gallery permission error:", error);
      return false;
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(t("error"), "Camera permission is needed to take photos. Please enable it in Settings.");
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
      }
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert(t("error"), "Unable to open camera. Please try again.");
    }
  };

  const pickFromGallery = async () => {
    try {
      // iOS requires permission request; Android Photo Picker handles it automatically
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("error"), "Photo library permission is needed to select photos. Please enable it in Settings.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        setShowPreview(true);
      }
    } catch (error) {
      console.log("Gallery picker error:", error);
      Alert.alert(t("error"), "Unable to open photo picker. Please try again.");
    }
  };

  // Parse and validate date input (MM/DD/YYYY format)
  const handleExpiryInput = (text: string) => {
    // Auto-format as user types
    let formatted = text.replace(/\D/g, ''); // Remove non-digits
    
    if (formatted.length > 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    if (formatted.length > 5) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
    }
    
    setExpiryInput(formatted);
    
    // Validate and set if complete date
    if (formatted.length === 10) {
      const [month, day, year] = formatted.split('/').map(Number);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2020 && year <= 2035) {
        const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setExpiryDate(isoDate);
      } else {
        setExpiryDate('');
      }
    } else {
      setExpiryDate('');
    }
  };

  const handleSave = async () => {
    if (!selectedMemberId) {
      Alert.alert(t("error"), t("member_required_message"));
      return;
    }

    if (!imageUri) {
      Alert.alert(t("error"), t("photo_required_message"));
      return;
    }

    // Expiration date is REQUIRED
    if (!expiryDate) {
      Alert.alert(
        "Expiration Date Required",
        "Please enter the expiration date from your optical document. This is needed to send you reminders before it expires."
      );
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
        expiryDate: expiryDate,
      });
      
      // Track for ASO (may trigger review prompt)
      await trackPrescriptionForASO();
      
      // Increment save count and check if we should show invite
      await incrementSaveCount();
      const showPrompt = await shouldShowInvitePrompt();
      
      if (showPrompt) {
        Alert.alert(t("success"), t("prescription_saved"), [
          { text: "OK", onPress: () => setShowInvite(true) }
        ]);
      } else {
        Alert.alert(t("success"), t("prescription_saved"));
        router.back();
      }
    } catch (error) {
      Alert.alert(t("error"), "Failed to save optical document");
      console.log("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => {
    setImageUri("");
    setExpiryDate("");
    setExpiryInput("");
    setShowPreview(false);
  };

  if (familyMembers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>'{t("add_rx_title")}'</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#3a4d63" />
          <Text style={styles.emptyText}>No Family Members</Text>
          <Text style={styles.emptySubtext}>
            Please add a family member first before adding optical documents
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

  // Preview screen - Expiration date at TOP for easy access
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

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
        <ScrollView style={styles.previewScroll} contentContainerStyle={styles.previewScrollContent}>
          {/* Expiration Date - FIRST and MOST PROMINENT */}
          <View style={[styles.expiryCard, !expiryDate && styles.expiryCardRequired]}>
            <View style={styles.expiryHeader}>
              <Ionicons 
                name="calendar" 
                size={24} 
                color={expiryDate ? "#4CAF50" : "#FF9800"} 
              />
              <Text style={styles.expiryTitle}>
                Expiration Date {!expiryDate && <Text style={styles.requiredLabel}>*</Text>}
              </Text>
            </View>
            <View style={styles.expiryInputRow}>
              <TextInput
                style={[
                  styles.expiryInput,
                  expiryDate && styles.expiryInputValid,
                  !expiryDate && styles.expiryInputRequired,
                ]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#6b7c8f"
                value={expiryInput}
                onChangeText={handleExpiryInput}
                keyboardType="numeric"
                maxLength={10}
              />
              {expiryDate && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                </View>
              )}
            </View>
            {!expiryDate && (
              <Text style={styles.expiryHelp}>
                Enter the expiration date from your optical document
              </Text>
            )}
          </View>

          {/* Image Preview - Smaller */}
          <View style={styles.imagePreviewSmall}>
            <Image source={{ uri: imageUri }} style={styles.previewImageSmall} resizeMode="contain" />
          </View>

          <View style={styles.infoSection}>
            {/* Family Member Selector */}
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

            {/* Type Selector */}
            <View style={styles.infoCard}>
              <Ionicons name="glasses-outline" size={20} color="#4a9eff" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Type</Text>
                <View style={styles.typeSelector}>
                  {RX_TYPES.map((rxTypeOption) => (
                    <TouchableOpacity
                      key={rxTypeOption.value}
                      style={[
                        styles.typeChip,
                        rxType === rxTypeOption.value && styles.typeChipActive,
                      ]}
                      onPress={() => setRxType(rxTypeOption.value)}
                    >
                      <Ionicons
                        name={rxTypeOption.icon as any}
                        size={18}
                        color={rxType === rxTypeOption.value ? "#fff" : "#8899a6"}
                      />
                      <Text
                        style={[
                          styles.typeChipText,
                          rxType === rxTypeOption.value && styles.typeChipTextActive,
                        ]}
                      >
                        {t(rxTypeOption.labelKey as any)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* HIPAA Notice */}
            <View style={styles.hipaaNotice}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.hipaaText}>
                Your data stays on this device only
              </Text>
            </View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Ionicons name="camera-reverse" size={20} color="#8899a6" />
            <Text style={styles.retakeButtonText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton, 
              (saving || !selectedMemberId || !expiryDate) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={saving || !selectedMemberId || !expiryDate}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>{t("save_prescription")}</Text>
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
        <Text style={styles.headerTitle}>'{t("add_rx_title")}'</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.captureContainer}>
        <View style={styles.captureContent}>
          <Ionicons name="camera" size={80} color="#4a9eff" />
          <Text style={styles.captureTitle}>Take a Photo of Your Optical Document</Text>
          <Text style={styles.captureSubtitle}>
            You&apos;ll enter the expiration date manually
          </Text>

          <View style={styles.captureButtons}>
            <TouchableOpacity style={styles.primaryCaptureButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
              <Text style={styles.primaryCaptureButtonText}>{t("take_photo")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryCaptureButton} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={24} color="#4a9eff" />
              <Text style={styles.secondaryCaptureButtonText}>{t("choose_from_gallery")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="camera" size={20} color="#4a9eff" />
              <Text style={styles.tipsTitle}>Tips for best results</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="sunny" size={16} color="#FF9800" />
              <Text style={styles.tipItemText}>Ensure good lighting - natural light works best</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="expand" size={16} color="#4CAF50" />
              <Text style={styles.tipItemText}>Capture the full document in frame</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="hand-left" size={16} color="#9C27B0" />
              <Text style={styles.tipItemText}>Hold steady - avoid blurry images</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="calendar" size={16} color="#f44336" />
              <Text style={styles.tipItemText}>Make sure expiration date is visible - you&apos;ll enter it manually</Text>
            </View>
          </View>

          {/* First-time user hint */}
          <View style={styles.hintCard}>
            <Ionicons name="information-circle" size={20} color="#4a9eff" />
            <Text style={styles.hintText}>After taking a photo, you&apos;ll enter the expiration date from your optical document. We&apos;ll remind you before it expires!</Text>
          </View>
        </View>
      </View>

      {/* Smart Invite Prompt */}
      <SmartInvitePrompt
        visible={showInvite}
        onDismiss={() => {
          setShowInvite(false);
          router.back();
        }}
      />
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
    borderWidth: 1,
    borderColor: "rgba(74, 158, 255, 0.2)",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  tipItemText: {
    flex: 1,
    fontSize: 14,
    color: "#8899a6",
    lineHeight: 20,
  },
  tipText: {
    fontSize: 14,
    color: "#8899a6",
    marginBottom: 8,
    lineHeight: 20,
  },
  hintCard: {
    marginTop: 16,
    backgroundColor: "rgba(74, 158, 255, 0.08)",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: "#8899a6",
    lineHeight: 19,
  },
  previewContainer: {
    flex: 1,
  },
  previewScroll: {
    flex: 1,
  },
  previewScrollContent: {
    paddingBottom: 20,
  },
  expiryCard: {
    backgroundColor: "#1a2d45",
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  expiryCardRequired: {
    borderWidth: 2,
    borderColor: "#FF9800",
    backgroundColor: "rgba(255, 152, 0, 0.08)",
  },
  expiryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  expiryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  expiryInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  expiryInput: {
    flex: 1,
    backgroundColor: "#0f1d2f",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    borderWidth: 2,
    borderColor: "#3a4d63",
    textAlign: "center",
    letterSpacing: 2,
  },
  expiryInputValid: {
    borderColor: "#4CAF50",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  expiryInputRequired: {
    borderColor: "#FF9800",
  },
  expiryHelp: {
    fontSize: 13,
    color: "#FF9800",
    marginTop: 10,
    textAlign: "center",
  },
  checkIcon: {
    width: 32,
  },
  imagePreviewSmall: {
    height: 180,
    marginHorizontal: 16,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  previewImageSmall: {
    width: "100%",
    height: "100%",
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
    paddingTop: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
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
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateInput: {
    flex: 1,
    backgroundColor: "#0f1d2f",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#3a4d63",
  },
  dateInputValid: {
    borderColor: "#4CAF50",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  dateInputRequired: {
    borderColor: "#FF9800",
    backgroundColor: "rgba(255, 152, 0, 0.1)",
  },
  dateHelp: {
    fontSize: 12,
    color: "#FF9800",
    marginTop: 6,
    lineHeight: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  requiredLabel: {
    color: "#FF9800",
    fontWeight: "700",
  },
  requiredCard: {
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.5)",
    backgroundColor: "rgba(255, 152, 0, 0.05)",
  },
  autoDetectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  autoDetectedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4CAF50",
  },
  hipaaNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  hipaaText: {
    flex: 1,
    fontSize: 12,
    color: "#4CAF50",
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
