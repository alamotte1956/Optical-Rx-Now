import { StyleSheet } from "react-native";

export const adminStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 14, color: "#8899a6", marginTop: 12 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2d45",
  },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, color: "#8899a6" },

  content: { flex: 1 },

  // Warning Banner
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 152, 0, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FF9800",
  },
  warningText: { flex: 1, fontSize: 13, color: "#FF9800" },

  // Section
  section: { marginTop: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#1a2d45",
    borderBottomWidth: 1,
    borderBottomColor: "#0f1d2f",
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#fff" },
  badge: {
    backgroundColor: "rgba(74, 158, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#4a9eff" },
  sectionContent: { padding: 16, backgroundColor: "#0f1d2f" },

  // Subsection
  subsectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 10,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Metrics
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  metricValue: { fontSize: 24, fontWeight: "700" },
  metricLabel: { fontSize: 11, color: "#8899a6", textAlign: "center" },

  // Finance
  financeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  financeCard: {
    flex: 1,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
  },
  financeCardLabel: { fontSize: 12, color: "#8899a6", marginBottom: 4 },
  financeCardValue: { fontSize: 22, fontWeight: "700" },

  // Invoice Summary
  invoiceSummaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  invoiceSummaryItem: {
    flex: 1,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  invoiceSummaryCount: { fontSize: 24, fontWeight: "700" },
  invoiceSummaryLabel: { fontSize: 12, color: "#8899a6", marginTop: 2 },
  invoiceSummaryAmount: { fontSize: 11, color: "#6b7c8f", marginTop: 2 },

  // Affiliate Stats
  affiliateStatsCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#0f1d2f",
  },
  statLabel: { fontSize: 13, color: "#8899a6" },
  statValue: { fontSize: 13, fontWeight: "600", color: "#fff" },

  // Refresh
  refreshRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  refreshText: { fontSize: 13, color: "#4a9eff", fontWeight: "600" },

  // Platform Breakdown
  platformContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  platformCard: {
    flex: 1,
    minWidth: "28%",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  platformIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  platformCount: {
    fontSize: 22,
    fontWeight: "800",
  },
  platformLabel: {
    fontSize: 12,
    color: "#8899a6",
    fontWeight: "600",
    marginTop: 2,
  },
  platformBarBg: {
    width: "100%",
    height: 4,
    backgroundColor: "#0f1d2f",
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  platformBarFill: {
    height: 4,
    borderRadius: 2,
  },
  platformPct: {
    fontSize: 11,
    color: "#6b7c8f",
    fontWeight: "600",
    marginTop: 2,
  },
  platformDetailSection: {
    marginBottom: 12,
  },
  platformEventCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  platformEventHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2a3d55",
    paddingBottom: 8,
  },
  platformEventTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  platformEventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#0f1d2f",
  },
  platformEventLabel: {
    fontSize: 13,
    color: "#8899a6",
  },
  platformEventValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  // Android vs iOS Split View
  platformSplitHeader: {
    flexDirection: "row",
    marginBottom: 2,
  },
  platformSplitTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    backgroundColor: "#1a2d45",
    borderRadius: 8,
    marginHorizontal: 2,
  },
  platformSplitTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  platformSplitRow: {
    flexDirection: "row",
    marginVertical: 2,
  },
  platformSplitCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#142236",
    borderRadius: 6,
    marginHorizontal: 2,
  },
  platformSplitValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  platformSplitLabel: {
    fontSize: 11,
    color: "#8899a6",
    fontWeight: "600",
    marginTop: 2,
  },

  // Section Actions
  sectionActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4a9eff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: { fontSize: 13, fontWeight: "600", color: "#fff" },

  // Empty state
  emptyCard: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    gap: 8,
  },
  emptyCardText: { fontSize: 16, fontWeight: "600", color: "#8899a6" },
  emptyCardSub: { fontSize: 13, color: "#6b7c8f", textAlign: "center" },
  emptyText: { fontSize: 14, color: "#6b7c8f", textAlign: "center", paddingVertical: 16 },

  // Item Card (shared for affiliates, banners, invoices)
  itemCard: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2a3d55",
  },
  itemCardDisabled: { opacity: 0.5 },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  itemName: { fontSize: 15, fontWeight: "700", color: "#fff" },
  itemSubtext: { fontSize: 12, color: "#6b7c8f", marginBottom: 2 },
  itemMeta: { fontSize: 12, color: "#8899a6", marginTop: 2 },
  itemActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#2a3d55",
    paddingTop: 10,
  },
  iconBtn: {
    width: 40,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
  },

  // Commission Badge
  commissionBadge: {
    backgroundColor: "rgba(224, 64, 251, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  commissionBadgeText: { fontSize: 12, fontWeight: "700", color: "#E040FB" },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },

  // Invoice Amount
  invoiceAmount: { fontSize: 18, fontWeight: "700", marginTop: 4 },

  // Link Card
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  linkInfo: { flex: 1 },
  linkName: { fontSize: 14, fontWeight: "600", color: "#fff", marginBottom: 2 },
  linkDescription: { fontSize: 12, color: "#6b7c8f" },

  // Action Buttons
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
  },
  actionButtonText: { fontSize: 14, fontWeight: "600", color: "#4a9eff" },
  dangerButton: {
    backgroundColor: "rgba(255, 92, 92, 0.1)",
    borderWidth: 1,
    borderColor: "#ff5c5c",
  },
  dangerText: { color: "#ff5c5c" },

  // Footer
  footer: { alignItems: "center", padding: 24, marginTop: 8, marginBottom: 20 },
  footerText: { fontSize: 14, color: "#8899a6", marginBottom: 2 },
  footerSubtext: { fontSize: 12, color: "#6b7c8f" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1a2d45",
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  modalInput: {
    width: "100%",
    backgroundColor: "#0f1d2f",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#2a3d55",
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#2a3d55",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalSaveText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // Type Toggle
  typeToggle: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#0f1d2f",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a3d55",
  },
  typeButtonActive: {
    backgroundColor: "rgba(0, 188, 212, 0.15)",
    borderColor: "#00BCD4",
  },
  typeButtonText: { fontSize: 14, color: "#8899a6", fontWeight: "600" },
  typeButtonTextActive: { color: "#00BCD4" },
});
