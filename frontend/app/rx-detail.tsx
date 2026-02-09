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

export default function RxDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
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

  const generatePdfHtml = () => {
    if (!prescription || !member) return "";
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Prescription - ${member.name}</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #4a9eff;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #4a9eff;
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            .header .subtitle {
              color: #666;
              font-size: 14px;
            }
            .patient-info {
              background: #f8f9fa;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 30px;
            }
            .patient-name {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .info-item {
              padding: 10px 0;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .info-value {
              font-size: 16px;
              color: #333;
              font-weight: 500;
            }
            .type-badge {
              display: inline-block;
              background: ${prescription.rxType === "eyeglass" ? "#e3f2fd" : "#e8f5e9"};
              color: ${prescription.rxType === "eyeglass" ? "#1976d2" : "#388e3c"};
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
            }
            .expiry-warning {
              color: #f57c00;
              font-weight: 600;
            }
            .expiry-expired {
              color: #d32f2f;
              font-weight: 600;
            }
            .notes-section {
              background: #fff3e0;
              border-radius: 12px;
              padding: 15px 20px;
              margin-bottom: 30px;
            }
            .notes-title {
              font-size: 12px;
              color: #e65100;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .notes-text {
              font-size: 14px;
              color: #333;
              line-height: 1.5;
            }
            .prescription-image {
              text-align: center;
              margin: 30px 0;
            }
            .prescription-image img {
              max-width: 100%;
              max-height: 500px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .image-caption {
              font-size: 12px;
              color: #666;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              padding-top: 30px;
              border-top: 1px solid #eee;
              margin-top: 30px;
            }
            .footer p {
              font-size: 12px;
              color: #999;
              margin: 5px 0;
            }
            .footer .app-name {
              color: #4a9eff;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 Prescription Record</h1>
            <p class="subtitle">Generated by Optical Rx Now</p>
          </div>

          <div class="patient-info">
            <div class="patient-name">${member.name}</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Prescription Type</div>
                <div class="info-value">
                  <span class="type-badge">
                    ${prescription.rxType === "eyeglass" ? "👓 Eyeglasses" : "👁️ Contact Lenses"}
                  </span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Date Taken</div>
                <div class="info-value">${formatDate(prescription.dateTaken)}</div>
              </div>
              ${prescription.expiryDate ? `
              <div class="info-item">
                <div class="info-label">Expiration Date</div>
                <div class="info-value ${isExpired(prescription.expiryDate) ? 'expiry-expired' : isExpiringSoon(prescription.expiryDate) ? 'expiry-warning' : ''}">
                  ${formatDate(prescription.expiryDate)}
                  ${isExpired(prescription.expiryDate) ? ' (EXPIRED)' : isExpiringSoon(prescription.expiryDate) ? ' (Expiring Soon)' : ''}
                </div>
              </div>
              ` : ''}
              <div class="info-item">
                <div class="info-label">Record Created</div>
                <div class="info-value">${formatDate(prescription.createdAt)}</div>
              </div>
            </div>
          </div>

          ${prescription.notes ? `
          <div class="notes-section">
            <div class="notes-title">📝 Notes</div>
            <div class="notes-text">${prescription.notes}</div>
          </div>
          ` : ''}

          <div class="prescription-image">
            <img src="${prescription.imageBase64}" alt="Prescription Image" />
            <p class="image-caption">Original prescription image</p>
          </div>

          <div class="footer">
            <p>This document was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
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
      // Check if sharing is available
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

      // Generate PDF
      const html = generatePdfHtml();
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Create a more descriptive filename
      const filename = `Prescription_${member.name.replace(/\s+/g, '_')}_${prescription.rxType}_${new Date().toISOString().split('T')[0]}.pdf`;
      const newUri = `${FileSystem.cacheDirectory}${filename}`;
      
      // Move file to cache with proper name
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      // Share the PDF
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

    try {
      const html = generatePdfHtml();
      await Print.printAsync({ html });
    } catch (error) {
      console.log("Error printing:", error);
      Alert.alert("Error", "Failed to print prescription");
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
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
            <Text style={styles.infoValue}>{formatDate(prescription.dateTaken)}</Text>
          </View>
          {prescription.expiryDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expires</Text>
              <View style={styles.expiryContainer}>
                <Text
                  style={[
                    styles.infoValue,
                    isExpired(prescription.expiryDate) && styles.expiredText,
                    isExpiringSoon(prescription.expiryDate) && !isExpired(prescription.expiryDate) && styles.expiringSoonText,
                  ]}
                >
                  {formatDate(prescription.expiryDate)}
                </Text>
                {isExpired(prescription.expiryDate) && (
                  <View style={styles.expiredBadge}>
                    <Text style={styles.expiredBadgeText}>EXPIRED</Text>
                  </View>
                )}
                {isExpiringSoon(prescription.expiryDate) && !isExpired(prescription.expiryDate) && (
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
          <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
            <Ionicons name="print-outline" size={24} color="#4a9eff" />
            <Text style={styles.actionButtonText}>Print</Text>
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
