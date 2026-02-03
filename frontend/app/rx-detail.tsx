import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import * as MailComposer from "expo-mail-composer";
import { File } from "expo-file-system";
import { getPrescriptionById, getFamilyMembers, deletePrescription, clonePrescription, type Prescription, type FamilyMember } from "../services/localStorage";

const escapeHtml = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export default function RxDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [familyMember, setFamilyMember] = useState<FamilyMember | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const fetchPrescription = async () => {
    try {
      const rxData = await getPrescriptionById(id);
      if (rxData) {
        setPrescription(rxData);

        // Fetch family member info
        const members = await getFamilyMembers();
        const member = members.find(m => m.id === rxData.family_member_id);
        if (member) {
          setFamilyMember(member);
        }
      } else {
        Alert.alert("Error", "Prescription not found");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
      Alert.alert("Error", "Failed to load prescription");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!prescription) return;

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Error", "Sharing is not available on this device");
      return;
    }

    try {
      // Read the image from local file system
      const imageFile = new File(prescription.image_uri);
      const imageBase64 = await imageFile.text();
      const imageDataUri = `data:image/jpeg;base64,${imageBase64}`;

      // Create HTML for sharing
      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>${escapeHtml(familyMember?.name || "")}'s ${prescription.rx_type === "eyeglass" ? "Eyeglass" : "Contact Lens"} Prescription</h1>
            <p><strong>Date:</strong> ${escapeHtml(prescription.date_taken)}</p>
            ${prescription.notes ? `<p><strong>Notes:</strong> ${escapeHtml(prescription.notes)}</p>` : ""}
            <img src="${imageDataUri}" style="max-width: 100%; margin-top: 20px;" />
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share prescription");
    }
  };

  const handleEmail = async () => {
    if (!prescription) return;

    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Error", "Email is not available on this device");
      return;
    }

    try {
      const subject = `${familyMember?.name || ""}'s ${prescription.rx_type === "eyeglass" ? "Eyeglass" : "Contact Lens"} Prescription`;
      const body = `
Prescription Details:

Patient: ${familyMember?.name || "N/A"}
Type: ${prescription.rx_type === "eyeglass" ? "Eyeglass" : "Contact Lens"}
Date: ${prescription.date_taken}
${prescription.notes ? `Notes: ${prescription.notes}` : ""}

Please see attached prescription image.
      `;

      // Read the image from local file system
      const imageFile = new File(prescription.image_uri);
      const imageBase64 = await imageFile.text();
      const imageDataUri = `data:image/jpeg;base64,${imageBase64}`;

      // Create PDF to attach
      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>${escapeHtml(familyMember?.name || "")}'s ${prescription.rx_type === "eyeglass" ? "Eyeglass" : "Contact Lens"} Prescription</h1>
            <p><strong>Date:</strong> ${escapeHtml(prescription.date_taken)}</p>
            ${prescription.notes ? `<p><strong>Notes:</strong> ${escapeHtml(prescription.notes)}</p>` : ""}
            <img src="${imageDataUri}" style="max-width: 100%; margin-top: 20px;" />
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      await MailComposer.composeAsync({
        subject,
        body,
        attachments: [uri],
      });
    } catch (error) {
      console.error("Error emailing:", error);
      Alert.alert("Error", "Failed to compose email");
    }
  };

  const handlePrint = async () => {
    if (!prescription) return;

    try {
      // Read the image from local file system
      const imageFile = new File(prescription.image_uri);
      const imageBase64 = await imageFile.text();
      const imageDataUri = `data:image/jpeg;base64,${imageBase64}`;

      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>${escapeHtml(familyMember?.name || "")}'s ${prescription.rx_type === "eyeglass" ? "Eyeglass" : "Contact Lens"} Prescription</h1>
            <p><strong>Date:</strong> ${escapeHtml(prescription.date_taken)}</p>
            ${prescription.notes ? `<p><strong>Notes:</strong> ${escapeHtml(prescription.notes)}</p>` : ""}
            <img src="${imageDataUri}" style="max-width: 100%; margin-top: 20px;" />
          </body>
        </html>
      `;

      await Print.printAsync({ html });
    } catch (error) {
      console.error("Error printing:", error);
      Alert.alert("Error", "Failed to print prescription");
    }
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const handleClone = async () => {
    if (!prescription) return;
    
    setCloning(true);
    try {
      const clonedPrescription = await clonePrescription(id);
      Alert.alert(
        "Success",
        "Prescription cloned successfully!",
        [
          {
            text: "View Clone",
            onPress: () => router.replace(`/rx-detail?id=${clonedPrescription.id}`)
          },
          {
            text: "OK",
            style: "cancel"
          }
        ]
      );
    } catch (error) {
      console.error("Error cloning prescription:", error);
      Alert.alert("Error", "Failed to clone prescription");
    } finally {
      setCloning(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deletePrescription(id);
      setDeleteModalVisible(false);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to delete prescription");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
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

  if (!prescription) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prescription</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Prescription not found</Text>
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
        <Text style={styles.headerTitle}>Prescription</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="#ff5c5c" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Prescription Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: prescription.image_uri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="person" size={20} color="#4a9eff" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Patient</Text>
              <Text style={styles.detailValue}>
                {familyMember?.name || "Unknown"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name={prescription.rx_type === "eyeglass" ? "glasses" : "eye"}
                size={20}
                color="#4a9eff"
              />
            </View>
            <View>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {prescription.rx_type === "eyeglass" ? "Eyeglass" : "Contact Lens"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar" size={20} color="#4a9eff" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{prescription.date_taken}</Text>
            </View>
          </View>

          {prescription.notes && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="document-text" size={20} color="#4a9eff" />
                </View>
                <View style={styles.notesContainer}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.detailValue}>{prescription.notes}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleClone}
              disabled={cloning}
            >
              <View style={styles.actionIconContainer}>
                {cloning ? (
                  <ActivityIndicator size="small" color="#4a9eff" />
                ) : (
                  <Ionicons name="copy-outline" size={24} color="#4a9eff" />
                )}
              </View>
              <Text style={styles.actionText}>Clone</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.actionsTitle, { marginTop: 24 }]}>Share & Export</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="share-outline" size={24} color="#4a9eff" />
              </View>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="mail-outline" size={24} color="#4a9eff" />
              </View>
              <Text style={styles.actionText}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="print-outline" size={24} color="#4a9eff" />
              </View>
              <Text style={styles.actionText}>Print</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning" size={48} color="#ff5c5c" />
            <Text style={styles.modalTitle}>Delete Prescription?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this prescription? This cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDelete}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: "#0f1d30",
    padding: 16,
  },
  image: {
    width: "100%",
    height: 280,
    borderRadius: 12,
  },
  detailsCard: {
    backgroundColor: "#1a2d45",
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#8899a6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: "#fff",
    marginTop: 2,
  },
  notesContainer: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#0f1d30",
    marginVertical: 16,
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#8899a6",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1a2d45",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: "#8899a6",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#3a4d63",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#ff5c5c",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmDeleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
