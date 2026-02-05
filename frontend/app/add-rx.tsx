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
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { getFamilyMembers, createPrescription, type FamilyMember } from "../services/localStorage";

const MAX_IMAGE_SIZE_MB = 10;

const validateImageSize = (base64: string): boolean => {
  // Base64 is ~33% larger than binary, so multiply by 0.75 to get actual size
  const sizeInMB = (base64.length * 0.75) / (1024 * 1024);
  return sizeInMB <= MAX_IMAGE_SIZE_MB;
};

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [capturingImage, setCapturingImage] = useState(false);

  useEffect(() => {
    fetchFamilyMembers();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      // Check camera permission first
      const { status: cameraExisting } = await ImagePicker.getCameraPermissionsAsync();
      if (cameraExisting !== 'granted') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera permission in your device settings to take photos of prescriptions.'
          );
          return false;
        }
      }
      
      // Check media library permission
      const { status: mediaExisting } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (mediaExisting !== 'granted') {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaStatus !== 'granted') {
          Alert.alert(
            'Photo Library Permission Required',
            'Please enable photo library permission in your device settings to select prescription photos.'
          );
          return false;
        }
      }
    }
    return true;
  };

  const fetchFamilyMembers = async () => {
    try {
      const data = await getFamilyMembers();
      setFamilyMembers(data);
      if (data.length > 0) {
        setSelectedMember(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching family members:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
      
      // If already denied, guide user to settings
      if (existingStatus === 'denied') {
        Alert.alert(
          'Camera Permission Required',
          'Camera access is needed to take photos of prescriptions. Please enable camera permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return false;
      }
      
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        // Show rationale first on Android 12+
        return new Promise((resolve) => {
          Alert.alert(
            'Camera Permission',
            'This app needs camera access to photograph your prescriptions for easy storage and reference.',
            [
              { 
                text: 'Cancel', 
                style: 'cancel',
                onPress: () => resolve(false)
              },
              { 
                text: 'Allow', 
                onPress: async () => {
                  const { status } = await ImagePicker.requestCameraPermissionsAsync();
                  resolve(status === 'granted');
                }
              }
            ]
          );
        });
      } else {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Unable to request camera permission. Please try again.');
      return false;
    }
  };

  const takePhoto = async () => {
    // Prevent double-tap
    if (capturingImage) return;
    setCapturingImage(true);
    
    try {
      // Request permission first
      const granted = await requestCameraPermission();
      if (!granted) {
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,  // Reduce file size to stay under 10MB limit
        maxWidth: 1920,  // Limit dimensions to reduce memory usage
        maxHeight: 1080,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Data = result.assets[0].base64;
        
        if (!validateImageSize(base64Data)) {
          Alert.alert(
            "Image Too Large",
            "The image is too large (max 10MB). Please try again with a smaller image or lower quality."
          );
          return;
        }
        
        setImageBase64(`data:image/jpeg;base64,${base64Data}`);
      }
    } catch (error) {
      console.error('Camera error:', error);
      
      let errorMessage = 'Failed to access camera. Please try again or select an image from your gallery.';
      
      if (error instanceof Error) {
        if (error.message.includes('Camera not available') || error.message.includes('No camera')) {
          errorMessage = 'No camera is available on this device. Please select an image from your gallery instead.';
        } else if (error.message.includes('User cancelled')) {
          // User cancelled, no need to show error
          return;
        } else if (error.message.includes('memory') || error.message.includes('Memory')) {
          errorMessage = 'Not enough memory to capture photo. Please close some apps and try again.';
        }
      }
      
      Alert.alert('Camera Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setCapturingImage(false);
    }
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      
      // If already denied, guide user to settings
      if (existingStatus === 'denied') {
        Alert.alert(
          'Photo Library Permission Required',
          'Photo library access is needed to select prescription images. Please enable photo library permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return false;
      }
      
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        // Show rationale first on Android 12+
        return new Promise((resolve) => {
          Alert.alert(
            'Photo Library Permission',
            'This app needs access to your photo library to select prescription images for easy storage and reference.',
            [
              { 
                text: 'Cancel', 
                style: 'cancel',
                onPress: () => resolve(false)
              },
              { 
                text: 'Allow', 
                onPress: async () => {
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  resolve(status === 'granted');
                }
              }
            ]
          );
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Error requesting photo library permission:', error);
      Alert.alert('Error', 'Unable to request photo library permission. Please try again.');
      return false;
    }
  };

  const pickImage = async () => {
    // Prevent double-tap
    if (capturingImage) return;
    setCapturingImage(true);
    
    try {
      // Request media library permission first
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,  // Reduce file size to stay under 10MB limit
        maxWidth: 1920,  // Limit dimensions to reduce memory usage
        maxHeight: 1080,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Data = result.assets[0].base64;
        
        if (!validateImageSize(base64Data)) {
          Alert.alert(
            "Image Too Large",
            "The image is too large (max 10MB). Please select a smaller image."
          );
          return;
        }
        
        setImageBase64(`data:image/jpeg;base64,${base64Data}`);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      
      let errorMessage = 'Failed to access photo library. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('User cancelled')) {
          // User cancelled, no need to show error
          return;
        } else if (error.message.includes('memory') || error.message.includes('Memory')) {
          errorMessage = 'Not enough memory to load photo. Please select a smaller image.';
        }
      }
      
      Alert.alert('Photo Library Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setCapturingImage(false);
    }
  };

  const handleSave = async () => {
    // Prevent double-submit
    if (saving) return;
    
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
      await createPrescription({
        family_member_id: selectedMember,
        rx_type: rxType,
        imageBase64: imageBase64,
        notes: notes.trim(),
        date_taken: dateTaken,
      });
      router.back();
    } catch (error) {
      console.error('Error saving prescription:', error);
      
      let errorMessage = 'Failed to save prescription. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('storage')) {
          errorMessage = 'Storage is full. Please free up some space and try again.';
        } else if (error.message.includes('image') || error.message.includes('encoding')) {
          errorMessage = 'Failed to process image. Please try a different photo.';
        } else {
          errorMessage = `Failed to save prescription: ${error.message}`;
        }
      }
      
      Alert.alert("Error", errorMessage);
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
                <TouchableOpacity 
                  style={[
                    styles.captureButton,
                    capturingImage && styles.captureButtonDisabled
                  ]} 
                  onPress={takePhoto}
                  disabled={capturingImage}
                >
                  {capturingImage ? (
                    <ActivityIndicator color="#4a9eff" />
                  ) : (
                    <>
                      <Ionicons name="camera" size={40} color="#4a9eff" />
                      <Text style={styles.captureText}>Take Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.captureButton,
                    capturingImage && styles.captureButtonDisabled
                  ]} 
                  onPress={pickImage}
                  disabled={capturingImage}
                >
                  {capturingImage ? (
                    <ActivityIndicator color="#4a9eff" />
                  ) : (
                    <>
                      <Ionicons name="images" size={40} color="#4a9eff" />
                      <Text style={styles.captureText}>Choose from Gallery</Text>
                    </>
                  )}
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
  captureButtonDisabled: {
    opacity: 0.5,
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
    opacity: 0.6,
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
