import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import {
  getPrescriptionById,
  getFamilyMemberById,
  deletePrescription,
  Prescription,
  FamilyMember,
} from "../services/localStorage";
import { isSmallDevice, moderateScale } from "../services/responsive";
import { useTranslation } from "../services/i18n";
const formatDateSafe = (dateString: string | null | undefined): string => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

const isExpired = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  } catch {
    return false;
  }
};

const isExpiringSoon = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return date >= today && date <= thirtyDaysFromNow;
  } catch {
    return false;
  }
};

const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const getImageAsBase64 = async (imageUri: string): Promise<string> => {
  try {
    if (!imageUri) return "";
    if (imageUri.startsWith("data:")) return imageUri;
    
    const pathsToTry = [
      imageUri,
      imageUri.startsWith("file://") ? imageUri : `file://${imageUri}`,
      `${FileSystem.documentDirectory}prescription_images/${imageUri.split('/').pop()}`,
    ];
    
    for (const filePath of pathsToTry) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
          const base64 = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          if (base64) {
            const extension = filePath.split('.').pop()?.toLowerCase() || 'jpg';
            let mimeType = 'image/jpeg';
            if (extension === 'png') mimeType = 'image/png';
            else if (extension === 'gif') mimeType = 'image/gif';
            else if (extension === 'webp') mimeType = 'image/webp';
            
            return `data:${mimeType};base64,${base64}`;
          }
        }
      } catch (pathError) {
        // Try next path
      }
    }
    
    return "";
  } catch (error) {
    return "";
  }
};

export default function RxDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadData = async () => {
    try {
      const rx = await getPrescriptionById(id as string);
      if (rx) {
        setPrescription(rx);
        const memberData = await getFamilyMemberById(rx.familyMemberId);
        setMember(memberData);
      }
    } catch (error) {
      console.log("Error loading prescription:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePdfHtml = async (): Promise<string> => {
    if (!prescription || !member) return "";
    
    const formattedDateTaken = formatDateSafe(prescription.dateTaken);
    const formattedExpiryDate = prescription.expiryDate ? formatDateSafe(prescription.expiryDate) : null;
    const formattedCreatedAt = formatDateSafe(prescription.createdAt);
    const expired = isExpired(prescription.expiryDate);
    const expiringSoon = isExpiringSoon(prescription.expiryDate);
    
    let imageBase64 = "";
    try {
      imageBase64 = await getImageAsBase64(prescription.imageBase64);
    } catch (e) {
      console.log("Could not load image for PDF:", e);
    }
    
    const safeMemberName = escapeHtml(member.name);
    const safeNotes = escapeHtml(prescription.notes);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Prescription - ${safeMemberName}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; font-size: 14px; }
            .header { text-align: center; border-bottom: 3px solid #4a9eff; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { color: #4a9eff; font-size: 24px; }
            .patient-info { background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
            .patient-name { font-size: 20px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .info-label { font-size: 12px; color: #666; font-weight: bold; }
            .info-value { font-size: 14px; }
            .type-badge { background: #e3f2fd; color: #1976d2; padding: 4px 10px; border-radius: 15px; font-size: 12px; }
            .expiry-expired { color: #d32f2f; font-weight: bold; }
            .expiry-warning { color: #f57c00; font-weight: bold; }
            .notes-section { background: #fff8e1; border: 1px solid #ffcc02; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
            .prescription-image { text-align: center; margin: 20px 0; }
            .prescription-image img { max-width: 100%; max-height: 400px; border: 1px solid #ddd; border-radius: 8px; }
            .no-image { padding: 40px; background: #f5f5f5; border: 1px dashed #ddd; border-radius: 8px; color: #999; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; margin-top: 20px; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Prescription Record</h1>
            <p>Generated by My Optical Wallet</p>
          </div>
          <div class="patient-info">
            <div class="patient-name">${safeMemberName}</div>
            <div class="info-row">
              <span class="info-label">TYPE</span>
              <span class="type-badge">${prescription.rxType === "eyeglass" ? "Eyeglasses" : "Contact Lenses"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">DATE TAKEN</span>
              <span class="info-value">${formattedDateTaken}</span>
            </div>
            ${formattedExpiryDate ? `
            <div class="info-row">
              <span class="info-label">EXPIRES</span>
              <span class="info-value ${expired ? 'expiry-expired' : expiringSoon ? 'expiry-warning' : ''}">${formattedExpiryDate}${expired ? ' (EXPIRED)' : expiringSoon ? ' (Expiring Soon)' : ''}</span>
            </div>` : ''}
            <div class="info-row">
              <span class="info-label">CREATED</span>
              <span class="info-value">${formattedCreatedAt}</span>
            </div>
          </div>
          ${prescription.notes ? `<div class="notes-section"><strong>Notes:</strong> ${safeNotes}</div>` : ''}
          <div class="prescription-image">
            ${imageBase64 ? `<img src="${imageBase64}" alt="Prescription" />` : '<div class="no-image">Image not available</div>'}
          </div>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>My Optical Wallet</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleShare = async () => {
    if (!prescription || !member) return;
    setSharing(true);
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing Not Available", "Sharing is not available on this device.");
        setSharing(false);
        return;
      }

      const html = await generatePdfHtml();
      if (!html) {
        Alert.alert("Error", "Could not generate PDF content");
        setSharing(false);
        return;
      }
      
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { 
        mimeType: 'application/pdf', 
        dialogTitle: `Share Prescription for ${member.name}` 
      });
    } catch (error: any) {
      Alert.alert("Error", `Failed to create PDF: ${error?.message || 'Unknown error'}`);
    } finally {
      setSharing(false);
    }
  };

  const handlePrint = async () => {
    if (!prescription || !member) return;
    setPrinting(true);
    try {
      const html = await generatePdfHtml();
      if (!html) {
        Alert.alert("Error", "Could not generate print content");
        setPrinting(false);
        return;
      }
      await Print.printAsync({ html });
    } catch (error: any) {
      Alert.alert("Print Error", `Unable to print: ${error?.message || 'Unknown error'}`);
    } finally {
      setPrinting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t("delete_prescription"),
      t("delete_confirm"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deletePrescription(id as string);
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete prescription");
            }
          },
        },
      ]
    );
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
          <TouchableOpacity onPress={() => router.replace("/welcome")} style={styles.placeholder} accessibilityLabel="Home" accessibilityRole="button">
            <Ionicons name="home-outline" size={22} color="#4a9eff" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff5c5c" />
          <Text style={styles.emptyText}>Prescription not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescription</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="#ff5c5c" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {prescription.imageBase64 && !imageError ? (
            <Image
              source={{ uri: prescription.imageBase64 }}
              style={styles.image}
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={48} color="#6b7c8f" />
              <Text style={styles.imagePlaceholderText}>Image not available</Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Patient</Text>
            <Text style={styles.infoValue}>{member?.name || "Unknown"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <View style={[styles.typeBadge, prescription.rxType === "contact" && styles.typeBadgeContact]}>
              <Text style={styles.typeText}>{prescription.rxType === "eyeglass" ? t("eyeglasses") : t("contact_lenses")}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date Taken</Text>
            <Text style={styles.infoValue}>{formatDateSafe(prescription.dateTaken)}</Text>
          </View>
          {prescription.expiryDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expires</Text>
              <View style={styles.expiryContainer}>
                <Text style={[styles.infoValue, isExpired(prescription.expiryDate) && styles.expiredText, isExpiringSoon(prescription.expiryDate) && !isExpired(prescription.expiryDate) && styles.expiringSoonText]}>
                  {formatDateSafe(prescription.expiryDate)}
                </Text>
                {isExpired(prescription.expiryDate) && (
                  <View style={styles.expiredBadge}><Text style={styles.expiredBadgeText}>EXPIRED</Text></View>
                )}
              </View>
            </View>
          )}
          {prescription.notes ? (
            <View style={[styles.infoRow, styles.notesRow]}>
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.notesText}>{prescription.notes}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, sharing && styles.actionButtonDisabled]} onPress={handleShare} disabled={sharing}>
            {sharing ? <ActivityIndicator size="small" color="#4a9eff" /> : (
              <><Ionicons name="share-outline" size={24} color="#4a9eff" /><Text style={styles.actionButtonText}>Share PDF</Text></>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, printing && styles.actionButtonDisabled]} onPress={handlePrint} disabled={printing}>
            {printing ? <ActivityIndicator size="small" color="#4a9eff" /> : (
              <><Ionicons name="print-outline" size={24} color="#4a9eff" /><Text style={styles.actionButtonText}>Print</Text></>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1a2d45" },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  deleteButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  placeholder: { width: 40 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#8899a6", marginTop: 16 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  imageContainer: { backgroundColor: "#1a2d45", borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  image: { width: "100%", height: 300 },
  imagePlaceholder: { justifyContent: "center", alignItems: "center", backgroundColor: "#1a2d45" },
  imagePlaceholderText: { color: "#6b7c8f", marginTop: 8, fontSize: 14 },
  infoCard: { backgroundColor: "#1a2d45", borderRadius: 16, padding: 16, marginBottom: 16 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#2a3d55" },
  notesRow: { flexDirection: "column", alignItems: "flex-start", borderBottomWidth: 0 },
  infoLabel: { fontSize: 14, color: "#8899a6" },
  infoValue: { fontSize: 16, color: "#fff", fontWeight: "500" },
  typeBadge: { backgroundColor: "rgba(74, 158, 255, 0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  typeBadgeContact: { backgroundColor: "rgba(76, 175, 80, 0.2)" },
  typeText: { fontSize: 14, color: "#4a9eff", fontWeight: "500" },
  expiryContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  expiredText: { color: "#ff5c5c" },
  expiringSoonText: { color: "#ff9500" },
  expiredBadge: { backgroundColor: "rgba(255, 92, 92, 0.2)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  expiredBadgeText: { fontSize: 10, color: "#ff5c5c", fontWeight: "bold" },
  notesText: { fontSize: 15, color: "#fff", marginTop: 8, lineHeight: 22 },
  actions: { flexDirection: "row", gap: 12 },
  actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#1a2d45", paddingVertical: 16, borderRadius: 12 },
  actionButtonDisabled: { opacity: 0.7 },
  actionButtonText: { fontSize: 16, color: "#4a9eff", fontWeight: "600" },
});
