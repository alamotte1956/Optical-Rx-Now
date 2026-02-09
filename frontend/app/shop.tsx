import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Static affiliate data - no backend needed
const AFFILIATES = [
  {
    id: "1",
    name: "Sam's Club Optical",
    description: "Quality eyewear at warehouse club prices. Members save on frames, lenses, and contacts.",
    url: "https://www.samsclub.com/b/optical/1990005",
    logo_url: null,
    category: "retail",
    is_featured: true,
  },
  {
    id: "2",
    name: "Costco Optical",
    description: "Premium eyewear and eye exams at Costco locations.",
    url: "https://www.costco.com/optical.html",
    logo_url: null,
    category: "retail",
    is_featured: true,
  },
  {
    id: "3",
    name: "Zenni Optical",
    description: "Affordable prescription glasses starting at $6.95. Huge selection of frames.",
    url: "https://www.zennioptical.com",
    logo_url: null,
    category: "online",
    is_featured: true,
  },
  {
    id: "4",
    name: "Warby Parker",
    description: "Designer eyewear at revolutionary prices. Free home try-on program.",
    url: "https://www.warbyparker.com",
    logo_url: null,
    category: "online",
    is_featured: false,
  },
  {
    id: "5",
    name: "EyeBuyDirect",
    description: "Quality glasses starting at $6. 2-year warranty included.",
    url: "https://www.eyebuydirect.com",
    logo_url: null,
    category: "online",
    is_featured: false,
  },
  {
    id: "6",
    name: "LensCrafters",
    description: "Expert eye care and designer eyewear. Same-day glasses available.",
    url: "https://www.lenscrafters.com",
    logo_url: null,
    category: "retail",
    is_featured: false,
  },
  {
    id: "7",
    name: "1-800 Contacts",
    description: "America's #1 contact lens store. Price match guarantee.",
    url: "https://www.1800contacts.com",
    logo_url: null,
    category: "contacts",
    is_featured: true,
  },
  {
    id: "8",
    name: "AC Lens",
    description: "Discount contact lenses with fast, free shipping.",
    url: "https://www.aclens.com",
    logo_url: null,
    category: "contacts",
    is_featured: false,
  },
];

interface Affiliate {
  id: string;
  name: string;
  description: string;
  url: string;
  logo_url: string | null;
  category: string;
  is_featured: boolean;
}

export default function ShopScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log("Error opening URL:", error);
    }
  };

  const filteredAffiliates = selectedCategory
    ? AFFILIATES.filter((a) => a.category === selectedCategory)
    : AFFILIATES;

  const featuredAffiliates = AFFILIATES.filter((a) => a.is_featured);

  const categories = [
    { key: null, label: "All" },
    { key: "retail", label: "Retail" },
    { key: "online", label: "Online" },
    { key: "contacts", label: "Contacts" },
  ];

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case "retail":
        return "storefront";
      case "online":
        return "globe";
      case "contacts":
        return "eye";
      default:
        return "pricetag";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Eyewear</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Featured Section */}
        {featuredAffiliates.length > 0 && !selectedCategory && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Featured Partners</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredAffiliates.map((affiliate) => (
                <TouchableOpacity
                  key={affiliate.id}
                  style={styles.featuredCard}
                  onPress={() => handleOpenLink(affiliate.url)}
                >
                  <View style={styles.featuredIcon}>
                    <Ionicons
                      name={getCategoryIcon(affiliate.category) as any}
                      size={28}
                      color="#4a9eff"
                    />
                  </View>
                  <Text style={styles.featuredName} numberOfLines={1}>
                    {affiliate.name}
                  </Text>
                  <Text style={styles.featuredDesc} numberOfLines={2}>
                    {affiliate.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category Filter */}
        <View style={styles.filterContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key || "all"}
              style={[
                styles.filterChip,
                selectedCategory === cat.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === cat.key && styles.filterChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* All Affiliates */}
        <Text style={styles.sectionTitle}>All Partners</Text>
        {filteredAffiliates.map((affiliate) => (
          <TouchableOpacity
            key={affiliate.id}
            style={styles.affiliateCard}
            onPress={() => handleOpenLink(affiliate.url)}
          >
            <View style={styles.affiliateIcon}>
              <Ionicons
                name={getCategoryIcon(affiliate.category) as any}
                size={24}
                color="#4a9eff"
              />
            </View>
            <View style={styles.affiliateInfo}>
              <Text style={styles.affiliateName}>{affiliate.name}</Text>
              <Text style={styles.affiliateDesc} numberOfLines={2}>
                {affiliate.description}
              </Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#6b7c8f" />
          </TouchableOpacity>
        ))}

        {/* Ad Placeholder */}
        <TouchableOpacity
          style={styles.adPlaceholder}
          onPress={() => Linking.openURL("https://opticalrxnow.com")}
        >
          <Ionicons name="megaphone-outline" size={24} color="#4a9eff" />
          <Text style={styles.adPlaceholderText}>Advertise with us Here</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  featuredScroll: {
    gap: 12,
  },
  featuredCard: {
    width: 160,
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
  },
  featuredIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featuredName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 12,
    color: "#8899a6",
    lineHeight: 16,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a2d45",
  },
  filterChipActive: {
    backgroundColor: "#4a9eff",
  },
  filterChipText: {
    fontSize: 14,
    color: "#8899a6",
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  affiliateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  affiliateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  affiliateInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  affiliateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  affiliateDesc: {
    fontSize: 13,
    color: "#8899a6",
    marginTop: 2,
    lineHeight: 18,
  },
  adPlaceholder: {
    width: "100%",
    height: 80,
    backgroundColor: "rgba(74, 158, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 158, 255, 0.2)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  adPlaceholderText: {
    fontSize: 14,
    color: "#6b7c8f",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
