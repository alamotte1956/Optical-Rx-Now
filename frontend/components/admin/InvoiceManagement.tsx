import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Section } from "./Section";
import { ConfirmModal } from "./ConfirmModal";
import { adminStyles as styles } from "../../styles/adminStyles";
import { statusColor } from "../../constants/adminConstants";
import {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  autoGenerateInvoices,
  type Invoice,
  type LineItem,
} from "../../services/adminApi";

interface Props {
  invoices: Invoice[];
  expanded: boolean;
  onToggle: () => void;
  refreshData: () => Promise<void>;
}

export const InvoiceManagement: React.FC<Props> = ({ invoices, expanded, onToggle, refreshData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Partial<Invoice> | null>(null);
  const [invRecipient, setInvRecipient] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invType, setInvType] = useState<"advertiser" | "affiliate">("advertiser");
  const [invAmount, setInvAmount] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invDescription, setInvDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Confirmation states
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [showAutoGenConfirm, setShowAutoGenConfirm] = useState(false);

  const openModal = (invoice?: Invoice) => {
    setStatusMsg(null);
    setSaving(false);
    if (invoice) {
      setEditing(invoice);
      setInvRecipient(invoice.recipient_name);
      setInvEmail(invoice.recipient_email || "");
      setInvType(invoice.invoice_type);
      setInvAmount(String(invoice.total_amount));
      setInvDueDate(invoice.due_date || "");
      setInvDescription(invoice.line_items?.[0]?.description || "");
    } else {
      setEditing(null);
      setInvRecipient("");
      setInvEmail("");
      setInvType("advertiser");
      setInvAmount("");
      setInvDueDate("");
      setInvDescription("");
    }
    setModalVisible(true);
  };

  const saveInvoice = async () => {
    setStatusMsg(null);
    if (!invRecipient.trim()) {
      setStatusMsg({ type: "error", text: "Recipient name is required." });
      return;
    }
    const amount = parseFloat(invAmount) || 0;
    const lineItems: LineItem[] = invDescription.trim()
      ? [{ description: invDescription.trim(), quantity: 1, unit_price: amount, total: amount }]
      : [];

    setSaving(true);
    try {
      if (editing?.invoice_id) {
        await updateInvoice(editing.invoice_id, {
          recipient_name: invRecipient.trim(),
          recipient_email: invEmail.trim() || null,
          invoice_type: invType,
          total_amount: amount,
          line_items: lineItems,
          due_date: invDueDate.trim() || null,
        });
      } else {
        await createInvoice({
          recipient_name: invRecipient.trim(),
          recipient_email: invEmail.trim() || null,
          invoice_type: invType,
          total_amount: amount,
          line_items: lineItems,
          due_date: invDueDate.trim() || null,
          status: "pending",
        });
      }
      setSaving(false);
      setModalVisible(false);
      await refreshData();
    } catch (error: any) {
      setSaving(false);
      setStatusMsg({ type: "error", text: error.message || "Failed to save invoice. Check your connection." });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInvoice(deleteTarget.invoice_id);
      await refreshData();
    } catch (error: any) {
      console.log("Delete invoice error:", error.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const confirmAutoGenerate = async () => {
    setShowAutoGenConfirm(false);
    try {
      await autoGenerateInvoices();
      await refreshData();
    } catch (error: any) {
      console.log("Auto-generate error:", error.message);
    }
  };

  const cycleStatus = async (inv: Invoice) => {
    const statusOrder: Invoice["status"][] = ["pending", "paid", "overdue"];
    const currentIdx = statusOrder.indexOf(inv.status);
    const nextStatus = statusOrder[(currentIdx + 1) % statusOrder.length];
    try {
      await updateInvoice(inv.invoice_id, { status: nextStatus });
      await refreshData();
    } catch (error: any) {
      console.log("Cycle status error:", error.message);
    }
  };

  return (
    <>
      <Section
        title="Invoicing"
        icon="receipt-outline"
        iconColor="#00BCD4"
        expanded={expanded}
        onToggle={onToggle}
        badge={String(invoices.length)}
      >
        <View style={styles.sectionActions}>
          <Pressable style={[styles.addButton, { backgroundColor: "#00BCD4" }]} onPress={() => openModal()}>
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Create Invoice</Text>
          </Pressable>
          <Pressable style={[styles.addButton, { backgroundColor: "#4CAF50" }]} onPress={() => setShowAutoGenConfirm(true)}>
            <Ionicons name="flash" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Auto-Generate</Text>
          </Pressable>
        </View>

        {invoices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={40} color="#3a4d63" />
            <Text style={styles.emptyCardText}>No invoices yet</Text>
            <Text style={styles.emptyCardSub}>Create invoices for advertisers or affiliates</Text>
          </View>
        ) : (
          invoices.map((inv) => (
            <View key={inv.invoice_id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName}>{inv.recipient_name}</Text>
                    <Pressable
                      style={[styles.statusBadge, { backgroundColor: statusColor(inv.status) + "22", borderColor: statusColor(inv.status) }]}
                      onPress={() => cycleStatus(inv)}
                    >
                      <Text style={[styles.statusBadgeText, { color: statusColor(inv.status) }]}>
                        {inv.status.toUpperCase()}
                      </Text>
                    </Pressable>
                  </View>
                  <Text style={styles.itemSubtext}>
                    {inv.invoice_type === "advertiser" ? "Advertiser" : "Affiliate"}{" "}
                    {inv.recipient_email ? `\u2022 ${inv.recipient_email}` : ""}
                  </Text>
                  <Text style={[styles.invoiceAmount, { color: statusColor(inv.status) }]}>
                    ${inv.total_amount.toFixed(2)}
                  </Text>
                  {inv.due_date && <Text style={styles.itemMeta}>Due: {inv.due_date.split("T")[0]}</Text>}
                  {inv.line_items?.length > 0 && (
                    <Text style={styles.itemMeta}>{inv.line_items[0]?.description}</Text>
                  )}
                </View>
              </View>
              <View style={styles.itemActions}>
                <Pressable style={styles.iconBtn} onPress={() => openModal(inv)}>
                  <Ionicons name="create-outline" size={18} color="#00BCD4" />
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => setDeleteTarget(inv)}>
                  <Ionicons name="trash-outline" size={18} color="#ff5c5c" />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </Section>

      {/* Delete Confirmation */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Invoice"
        message={`Remove invoice for "${deleteTarget?.recipient_name}"? This cannot be undone.`}
        confirmText="Delete"
        confirmColor="#ff5c5c"
        icon="trash"
        iconColor="#ff5c5c"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {/* Auto-Generate Confirmation */}
      <ConfirmModal
        visible={showAutoGenConfirm}
        title="Auto-Generate Invoices"
        message="This will create invoices based on current affiliate click data and commission rates."
        confirmText="Generate"
        confirmColor="#4CAF50"
        icon="flash"
        iconColor="#4CAF50"
        onCancel={() => setShowAutoGenConfirm(false)}
        onConfirm={confirmAutoGenerate}
      />

      {/* Invoice Edit/Add Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="receipt" size={28} color="#00BCD4" />
                <Text style={styles.modalTitle}>{editing?.invoice_id ? "Edit" : "Create"} Invoice</Text>
              </View>

              {/* Inline status message */}
              {statusMsg && (
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: statusMsg.type === "error" ? "rgba(255,92,92,0.15)" : "rgba(76,175,80,0.15)",
                  borderWidth: 1,
                  borderColor: statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                }}>
                  <Ionicons
                    name={statusMsg.type === "error" ? "alert-circle" : "checkmark-circle"}
                    size={20}
                    color={statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50"}
                  />
                  <Text style={{
                    flex: 1,
                    fontSize: 14,
                    color: statusMsg.type === "error" ? "#ff5c5c" : "#4CAF50",
                    fontWeight: "600",
                  }}>{statusMsg.text}</Text>
                </View>
              )}

              <TextInput style={styles.modalInput} placeholder="Recipient Name (required)" placeholderTextColor="#6b7c8f" value={invRecipient} onChangeText={(t) => { setStatusMsg(null); setInvRecipient(t); }} />
              <TextInput style={styles.modalInput} placeholder="Email (optional)" placeholderTextColor="#6b7c8f" value={invEmail} onChangeText={setInvEmail} keyboardType="email-address" autoCapitalize="none" />
              <View style={styles.typeToggle}>
                <Pressable
                  style={[styles.typeButton, invType === "advertiser" && styles.typeButtonActive]}
                  onPress={() => setInvType("advertiser")}
                >
                  <Text style={[styles.typeButtonText, invType === "advertiser" && styles.typeButtonTextActive]}>Advertiser</Text>
                </Pressable>
                <Pressable
                  style={[styles.typeButton, invType === "affiliate" && styles.typeButtonActive]}
                  onPress={() => setInvType("affiliate")}
                >
                  <Text style={[styles.typeButtonText, invType === "affiliate" && styles.typeButtonTextActive]}>Affiliate</Text>
                </Pressable>
              </View>
              <TextInput style={styles.modalInput} placeholder="Description" placeholderTextColor="#6b7c8f" value={invDescription} onChangeText={setInvDescription} />
              <TextInput style={styles.modalInput} placeholder="Total Amount ($)" placeholderTextColor="#6b7c8f" value={invAmount} onChangeText={setInvAmount} keyboardType="decimal-pad" />
              <TextInput style={styles.modalInput} placeholder="Due Date (YYYY-MM-DD)" placeholderTextColor="#6b7c8f" value={invDueDate} onChangeText={setInvDueDate} />
              <View style={styles.modalButtons}>
                <Pressable style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalSaveButton, { backgroundColor: saving ? "#6b7c8f" : "#00BCD4" }]}
                  onPress={saveInvoice}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};
