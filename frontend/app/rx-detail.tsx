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
  Platform,
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
import {
  formatDateForDisplay,
  isDateExpired,
  isDateExpiringSoon,
} from "../services/dateUtils";

// HTML escape function to prevent XSS in PDF generation
const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default function RxDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [member, setMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
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

  const generatePdfHtml = (): string => {
    if (!prescription || !member) return "";
    
    const formattedDateTaken = formatDateForDisplay(prescription.dateTaken);
    const formattedExpiryDate = prescription.expiryDate ? formatDateForDisplay(prescription.expiryDate) : null;
    const formattedCreatedAt = formatDateForDisplay(prescription.createdAt);
    const expired = isDateExpired(prescription.expiryDate);
    const expiringSoon = isDateExpiringSoon(prescription.expiryDate);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Prescription - ${member.name}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: Arial, Helvetica, sans-serif;
              padding: 30px;
              max-width: 100%;
              color: #333;
              font-size: 14px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #4a9eff;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 {
              color: #4a9eff;
              margin: 0 0 5px 0;
              font-size: 24px;
            }
            .header .subtitle {
              color: #666;
              font-size: 12px;
            }
            .patient-info {
              background: #f5f5f5;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .patient-name {
              font-size: 20px;
              font-weight: bold;
              color: #333;
              margin-bottom: 15px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              font-weight: bold;
            }
            .info-value {
              font-size: 14px;
              color: #333;
              text-align: right;
            }
            .type-badge {
              display: inline-block;
              background: ${prescription.rxType === "eyeglass" ? "#e3f2fd" : "#e8f5e9"};
              color: ${prescription.rxType === "eyeglass" ? "#1976d2" : "#388e3c"};
              padding: 4px 10px;
              border-radius: 15px;
              font-size: 12px;
              font-weight: bold;
            }
            .expiry-warning {
              color: #f57c00;
              font-weight: bold;
            }
            .expiry-expired {
              color: #d32f2f;
              font-weight: bold;
            }
            .expiry-ok {
              color: #388e3c;
            }
            .notes-section {
              background: #fff8e1;
              border: 1px solid #ffcc02;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .notes-title {
              font-size: 12px;
              color: #f57c00;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .notes-text {
              font-size: 13px;
              color: #333;
            }
            .prescription-image {
              text-align: center;
              margin: 20px 0;
              page-break-inside: avoid;
            }
            .prescription-image img {
              max-width: 100%;
              max-height: 400px;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .image-caption {
              font-size: 11px;
              color: #666;
              margin-top: 8px;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              margin-top: 20px;
            }
            .footer p {
              font-size: 10px;
              color: #999;
              margin: 3px 0;
            }
            .footer .app-name {
              color: #4a9eff;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Prescription Record</h1>
            <p class="subtitle">Generated by Optical Rx Now</p>
          </div>

          <div class="patient-info">
            <div class="patient-name">${member.name}</div>
            
            <div class="info-row">
              <span class="info-label">PRESCRIPTION TYPE</span>
              <span class="info-value">
                <span class="type-badge">
                  ${prescription.rxType === "eyeglass" ? "Eyeglasses" : "Contact Lenses"}
                </span>
              </span>
            </div>
            
            <div class="info-row">
              <span class="info-label">DATE TAKEN</span>
              <span class="info-value">${formattedDateTaken}</span>
            </div>
            
            ${formattedExpiryDate ? `
            <div class="info-row">
              <span class="info-label">EXPIRATION DATE</span>
              <span class="info-value ${expired ? 'expiry-expired' : expiringSoon ? 'expiry-warning' : 'expiry-ok'}">
                ${formattedExpiryDate}
                ${expired ? ' (EXPIRED)' : expiringSoon ? ' (Expiring Soon)' : ''}
              </span>
            </div>
            ` : ''}
            
            <div class="info-row">
              <span class="info-label">RECORD CREATED</span>
              <span class="info-value">${formattedCreatedAt}</span>
            </div>
          </div>

          ${prescription.notes ? `
          <div class="notes-section">
            <div class="notes-title">NOTES</div>
            <div class="notes-text">${prescription.notes}</div>
          </div>
          ` : ''}

          <div class="prescription-image">
            <img src="${prescription.imageBase64}" alt="Prescription Image" />
            <p class="image-caption">Original prescription image</p>
          </div>

          <div class="footer">
            <p>This document was generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
            <p>Created with <span class="app-name">Optical Rx Now</span></p>
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
        Alert.alert(
          "Sharing Not Available",
          "Sharing is not available on this device. Would you like to print instead?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Print", onPress: handlePrint },
          ]
        );
        return;
      }

      const html = generatePdfHtml();
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const filename = `Prescription_${member.name.replace(/\s+/g, '_')}_${prescription.rxType}_${new Date().toISOString().split('T')[0]}.pdf`;
      const newUri = `${FileSystem.cacheDirectory}${filename}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${member.name}'s Prescription`,
        UTI: 'com.adobe.pdf',
      });

    } catch (error) {
      console.log("Error sharing PDF:", error);
      Alert.alert(
        "Error",
        "Failed to create PDF. Would you like to try printing instead?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Print", onPress: handlePrint },
        ]
      );
    } finally {
      setSharing(false);
    }
  };

  const handlePrint = async () => {
    if (!prescription || !member) return;

    setPrinting(true);
    try {
      const html = generatePdfHtml();
      await Print.printAsync({ 
        html,
        orientation: Print.Orientation.portrait,
      });
    } catch (error) {
      console.log("Error printing:", error);
      Alert.alert("Print Error", "Unable to print. Please try again or use the Share option to save as PDF.");
    } finally {
      setPrinting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Prescription",
      "Are you sure you want to delete this prescription? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
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
          <View style={styles.placeholder} />
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Prescription Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: prescription.imageBase64 }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Patient</Text>
            <Text style={styles.infoValue}>{member?.name || "Unknown"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <View
              style={[
                styles.typeBadge,
                prescription.rxType === "contact" && styles.typeBadgeContact,
              ]}
            >
              <Text style={styles.typeText}>
                {prescription.rxType === "eyeglass" ? "Eyeglasses" : "Contact Lenses"}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date Taken</Text>
            <Text style={styles.infoValue}>{formatDateForDisplay(prescription.dateTaken)}</Text>
          </View>
          {prescription.expiryDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expires</Text>
              <View style={styles.expiryContainer}>
                <Text
                  style={[
                    styles.infoValue,
                    isDateExpired(prescription.expiryDate) && styles.expiredText,
                    isDateExpiringSoon(prescription.expiryDate) && !isDateExpired(prescription.expiryDate) && styles.expiringSoonText,
                  ]}
                >
                  {formatDateForDisplay(prescription.expiryDate)}
                </Text>
                {isDateExpired(prescription.expiryDate) && (
                  <View style={styles.expiredBadge}>
                    <Text style={styles.expiredBadgeText}>EXPIRED</Text>
                  </View>
                )}
                {isDateExpiringSoon(prescription.expiryDate) && !isDateExpired(prescription.expiryDate) && (
                  <View style={styles.expiringSoonBadge}>
                    <Text style={styles.expiringSoonBadgeText}>EXPIRING SOON</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          {prescription.notes && (
            <View style={[styles.infoRow, styles.notesRow]}>
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.notesText}>{prescription.notes}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, sharing && styles.actionButtonDisabled]} 
            onPress={handleShare}
            disabled={sharing}
          >
            {sharing ? (
              <ActivityIndicator size="small" color="#4a9eff" />
            ) : (
              <>
                <Ionicons name="share-outline" size={24} color="#4a9eff" />
                <Text style={styles.actionButtonText}>Share PDF</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, printing && styles.actionButtonDisabled]} 
            onPress={handlePrint}
            disabled={printing}
          >
            {printing ? (
              <ActivityIndicator size="small" color="#4a9eff" />
            ) : (
              <>
                <Ionicons name="print-outline" size={24} color="#4a9eff" />
                <Text style={styles.actionButtonText}>Print</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#8899a6",
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 300,
  },
  infoCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a3d55",
  },
  notesRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: "#8899a6",
  },
  infoValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  typeBadge: {
    backgroundColor: "rgba(74, 158, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeContact: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  typeText: {
    fontSize: 14,
    color: "#4a9eff",
    fontWeight: "500",
  },
  expiryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  expiredText: {
    color: "#ff5c5c",
  },
  expiringSoonText: {
    color: "#ff9500",
  },
  expiredBadge: {
    backgroundColor: "rgba(255, 92, 92, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expiredBadgeText: {
    fontSize: 10,
    color: "#ff5c5c",
    fontWeight: "bold",
  },
  expiringSoonBadge: {
    backgroundColor: "rgba(255, 149, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expiringSoonBadgeText: {
    fontSize: 10,
    color: "#ff9500",
    fontWeight: "bold",
  },
  notesText: {
    fontSize: 15,
    color: "#fff",
    marginTop: 8,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1a2d45",
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#4a9eff",
    fontWeight: "600",
  },
});
