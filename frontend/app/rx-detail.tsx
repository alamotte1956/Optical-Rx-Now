import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Print from "expo-print";
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
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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

  const handleShare = async () => {
    if (!prescription || !member) return;

    try {
      await Share.share({
        message: `Prescription for ${member.name}\nType: ${prescription.rxType === "eyeglass" ? "Eyeglasses" : "Contact Lenses"}\nDate: ${formatDate(prescription.dateTaken)}${prescription.expiryDate ? `\nExpires: ${formatDate(prescription.expiryDate)}` : ""}${prescription.notes ? `\nNotes: ${prescription.notes}` : ""}`,
        title: `${member.name}'s Prescription`,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const handlePrint = async () => {
    if (!prescription || !member) return;

    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              .info { margin: 10px 0; }
              .label { font-weight: bold; color: #666; }
              img { max-width: 100%; height: auto; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>Prescription - ${member.name}</h1>
            <div class="info"><span class="label">Type:</span> ${prescription.rxType === "eyeglass" ? "Eyeglasses" : "Contact Lenses"}</div>
            <div class="info"><span class="label">Date:</span> ${formatDate(prescription.dateTaken)}</div>
            ${prescription.expiryDate ? `<div class="info"><span class="label">Expires:</span> ${formatDate(prescription.expiryDate)}</div>` : ""}
            ${prescription.notes ? `<div class="info"><span class="label">Notes:</span> ${prescription.notes}</div>` : ""}
            <img src="${prescription.imageBase64}" />
          </body>
        </html>
      `;
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
      return new Date(dateString).toLocaleDateString();
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
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#4a9eff" />
            <Text style={styles.actionButtonText}>Share</Text>
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
  actionButtonText: {
    fontSize: 16,
    color: "#4a9eff",
    fontWeight: "600",
  },
});
