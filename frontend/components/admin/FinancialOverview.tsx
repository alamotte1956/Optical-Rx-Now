import React from "react";
import { View, Text } from "react-native";
import { Section } from "./Section";
import { adminStyles as styles } from "../../styles/adminStyles";
import type { FinancialDashboard } from "../../services/adminApi";

interface Props {
  financials: FinancialDashboard | null;
  expanded: boolean;
  onToggle: () => void;
}

export const FinancialOverview: React.FC<Props> = ({ financials, expanded, onToggle }) => (
  <Section
    title="Financial Overview"
    icon="cash-outline"
    iconColor="#4CAF50"
    expanded={expanded}
    onToggle={onToggle}
    badge={financials ? `$${financials.total_revenue.toFixed(0)}` : undefined}
  >
    {financials ? (
      <>
        <View style={styles.financeRow}>
          <View style={[styles.financeCard, { borderLeftColor: "#4CAF50" }]}>
            <Text style={styles.financeCardLabel}>Total Revenue</Text>
            <Text style={[styles.financeCardValue, { color: "#4CAF50" }]}>
              ${financials.total_revenue.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.financeCard, { borderLeftColor: "#E040FB" }]}>
            <Text style={styles.financeCardLabel}>Commission Potential</Text>
            <Text style={[styles.financeCardValue, { color: "#E040FB" }]}>
              ${financials.commission.potential.toFixed(2)}
            </Text>
          </View>
        </View>
        <Text style={styles.subsectionLabel}>Invoice Summary</Text>
        <View style={styles.invoiceSummaryRow}>
          <View style={styles.invoiceSummaryItem}>
            <Text style={[styles.invoiceSummaryCount, { color: "#4CAF50" }]}>{financials.invoices.paid.count}</Text>
            <Text style={styles.invoiceSummaryLabel}>Paid</Text>
            <Text style={styles.invoiceSummaryAmount}>${financials.invoices.paid.amount.toFixed(0)}</Text>
          </View>
          <View style={styles.invoiceSummaryItem}>
            <Text style={[styles.invoiceSummaryCount, { color: "#FF9800" }]}>{financials.invoices.pending.count}</Text>
            <Text style={styles.invoiceSummaryLabel}>Pending</Text>
            <Text style={styles.invoiceSummaryAmount}>${financials.invoices.pending.amount.toFixed(0)}</Text>
          </View>
          <View style={styles.invoiceSummaryItem}>
            <Text style={[styles.invoiceSummaryCount, { color: "#ff5c5c" }]}>{financials.invoices.overdue.count}</Text>
            <Text style={styles.invoiceSummaryLabel}>Overdue</Text>
            <Text style={styles.invoiceSummaryAmount}>${financials.invoices.overdue.amount.toFixed(0)}</Text>
          </View>
        </View>
        <View style={styles.affiliateStatsCard}>
          <Text style={styles.subsectionLabel}>Affiliate Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Active Affiliates</Text>
            <Text style={styles.statValue}>{financials.commission.active_affiliates}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Clicks</Text>
            <Text style={styles.statValue}>{financials.commission.total_affiliate_clicks}</Text>
          </View>
        </View>
      </>
    ) : (
      <Text style={styles.emptyText}>Financial data unavailable.</Text>
    )}
  </Section>
);
