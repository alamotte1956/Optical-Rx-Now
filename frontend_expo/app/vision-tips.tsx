import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const FAQ_ITEMS = [
  {
    id: "1",
    question: "How often should I get my eyes examined?",
    answer: "Adults should have a comprehensive eye exam every 1-2 years. If you wear contacts or have vision problems, annual exams are recommended. Children should have their first exam at 6 months, then at age 3, and before starting school.",
    icon: "eye",
  },
  {
    id: "2",
    question: "How long is my eyeglass prescription valid?",
    answer: "Eyeglass prescriptions are typically valid for 1-2 years depending on your state. Check with your eye doctor or local regulations. The app will remind you before your prescription expires!",
    icon: "glasses",
  },
  {
    id: "3",
    question: "How long is my contact lens prescription valid?",
    answer: "Contact lens prescriptions are usually valid for 1 year in most states. This is because contacts sit directly on your eye and require more frequent check-ups to ensure proper fit and eye health.",
    icon: "eye-outline",
  },
  {
    id: "4",
    question: "Can I use my eyeglass prescription to buy contacts?",
    answer: "No, eyeglass and contact lens prescriptions are different. Contact lens prescriptions include additional measurements like base curve and diameter that are specific to contacts. You need a separate fitting for contact lenses.",
    icon: "close-circle",
  },
  {
    id: "5",
    question: "What do the numbers on my prescription mean?",
    answer: "OD = right eye, OS = left eye. SPH (sphere) corrects nearsightedness (-) or farsightedness (+). CYL (cylinder) and AXIS correct astigmatism. ADD is for bifocals/progressives. PD is your pupillary distance.",
    icon: "calculator",
  },
  {
    id: "6",
    question: "Why are my eyes getting worse every year?",
    answer: "Vision changes are normal, especially during childhood and after age 40. Genetics, screen time, and age all play a role. If changes are rapid, consult your eye doctor to rule out underlying conditions.",
    icon: "trending-down",
  },
  {
    id: "7",
    question: "Is my data safe in this app?",
    answer: "Yes! All your prescription data is stored only on your device. We never upload, collect, or share your information with anyone. Your data stays private and under your control.",
    icon: "shield-checkmark",
  },
  {
    id: "8",
    question: "How do expiration reminders work?",
    answer: "When you save a prescription with an expiration date, the app schedules local notifications to remind you 30, 14, 7, and 2 days before expiration. You can customize these in Expiry Alert Settings.",
    icon: "notifications",
  },
];

const TIPS = [
  {
    id: "1",
    title: "20-20-20 Rule",
    tip: "Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain from screens.",
    icon: "time",
    color: "#4a9eff",
  },
  {
    id: "2",
    title: "Keep Prescriptions Handy",
    tip: "Always have a copy of your prescription when shopping for glasses or contacts. This app makes it easy!",
    icon: "document-text",
    color: "#4CAF50",
  },
  {
    id: "3",
    title: "UV Protection",
    tip: "Wear sunglasses with 100% UV protection to prevent cataracts and macular degeneration.",
    icon: "sunny",
    color: "#FF9800",
  },
  {
    id: "4",
    title: "Contact Lens Hygiene",
    tip: "Never sleep in daily contacts, always use fresh solution, and replace your case every 3 months.",
    icon: "water",
    color: "#00BCD4",
  },
  {
    id: "5",
    title: "Annual Exams Matter",
    tip: "Eye exams can detect diabetes, high blood pressure, and other conditions early - not just vision problems.",
    icon: "medical",
    color: "#9C27B0",
  },
];

export default function VisionTipsScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vision Care Tips</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Tips Section */}
        <Text style={styles.sectionTitle}>Quick Tips</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tipsContainer}
        >
          {TIPS.map((tip) => (
            <View key={tip.id} style={[styles.tipCard, { borderColor: tip.color }]}>
              <View style={[styles.tipIconContainer, { backgroundColor: `${tip.color}20` }]}>
                <Ionicons name={tip.icon as any} size={24} color={tip.color} />
              </View>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </View>
          ))}
        </ScrollView>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqItem}
            onPress={() => toggleFaq(faq.id)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <View style={styles.faqIconContainer}>
                <Ionicons name={faq.icon as any} size={20} color="#4a9eff" />
              </View>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons 
                name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6b7c8f" 
              />
            </View>
            {expandedFaq === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Resources Section */}
        <Text style={styles.sectionTitle}>Helpful Resources</Text>
        <TouchableOpacity 
          style={styles.resourceCard}
          onPress={() => Linking.openURL("https://www.aao.org/eye-health")}
        >
          <Ionicons name="globe" size={24} color="#4a9eff" />
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceTitle}>American Academy of Ophthalmology</Text>
            <Text style={styles.resourceSubtitle}>Eye health information and resources</Text>
          </View>
          <Ionicons name="open-outline" size={20} color="#6b7c8f" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resourceCard}
          onPress={() => Linking.openURL("https://www.aoa.org/patients-and-public")}
        >
          <Ionicons name="globe" size={24} color="#4a9eff" />
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceTitle}>American Optometric Association</Text>
            <Text style={styles.resourceSubtitle}>Patient education and eye care tips</Text>
          </View>
          <Ionicons name="open-outline" size={20} color="#6b7c8f" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resourceCard}
          onPress={() => Linking.openURL("https://www.nei.nih.gov/learn-about-eye-health")}
        >
          <Ionicons name="globe" size={24} color="#4a9eff" />
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceTitle}>National Eye Institute</Text>
            <Text style={styles.resourceSubtitle}>Research-based eye health information</Text>
          </View>
          <Ionicons name="open-outline" size={20} color="#6b7c8f" />
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
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
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    marginTop: 8,
  },
  tipsContainer: {
    paddingRight: 16,
    marginBottom: 24,
  },
  tipCard: {
    width: 200,
    backgroundColor: "#1a2d45",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderLeftWidth: 4,
  },
  tipIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: "#8899a6",
    lineHeight: 18,
  },
  faqItem: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(74, 158, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  faqAnswer: {
    fontSize: 14,
    color: "#8899a6",
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2a3d55",
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  resourceSubtitle: {
    fontSize: 13,
    color: "#6b7c8f",
  },
  bottomSpacer: {
    height: 40,
  },
});
