import { ScrollView, Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.lastUpdated}>Last Updated: March 2026</Text>

        <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By downloading, installing, or using Optical Rx Now ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
        </Text>

        <Text style={styles.sectionTitle}>Description of Service</Text>
        <Text style={styles.paragraph}>
          Optical Rx Now is a mobile application designed to help users store and manage eyeglass and contact lens prescriptions for themselves and their family members. The App stores all data locally on your device.
        </Text>

        <Text style={styles.sectionTitle}>User Responsibilities</Text>
        <Text style={styles.bulletPoint}>• You must be 18 years of age or older to use this App.</Text>
        <Text style={styles.bulletPoint}>• You are responsible for maintaining the security of your device.</Text>
        <Text style={styles.bulletPoint}>• You are responsible for backing up your own data.</Text>
        <Text style={styles.bulletPoint}>• You agree to use the App only for lawful purposes.</Text>

        <Text style={styles.sectionTitle}>Medical Disclaimer</Text>
        <Text style={styles.paragraph}>
          This App is intended for organizational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your eye care professional with any questions you may have regarding your vision or prescriptions.
        </Text>
        <Text style={styles.paragraph}>
          The App does not provide medical advice, and any prescription information stored is solely for your personal reference. We are not responsible for any decisions made based on information stored in the App.
        </Text>

        <Text style={styles.sectionTitle}>Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content, features, and functionality of the App, including but not limited to text, graphics, logos, and software, are the exclusive property of Optical Rx Now and are protected by copyright and other intellectual property laws.
        </Text>

        <Text style={styles.sectionTitle}>Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the fullest extent permitted by law, Optical Rx Now shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, arising from your use of the App.
        </Text>

        <Text style={styles.sectionTitle}>Data Loss</Text>
        <Text style={styles.paragraph}>
          Since all data is stored locally on your device, we are not responsible for any data loss due to device failure, loss, theft, or accidental deletion. We recommend regularly backing up your device.
        </Text>

        <Text style={styles.sectionTitle}>Third-Party Links</Text>
        <Text style={styles.paragraph}>
          The App may contain links to third-party websites or services (such as optical store finders). We are not responsible for the content, privacy policies, or practices of any third-party sites or services.
        </Text>

        <Text style={styles.sectionTitle}>Modifications to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms of Service at any time. Continued use of the App after any changes constitutes your acceptance of the new terms.
        </Text>

        <Text style={styles.sectionTitle}>Termination</Text>
        <Text style={styles.paragraph}>
          You may stop using the App at any time by uninstalling it from your device. All locally stored data will be deleted upon uninstallation.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about these Terms of Service, please contact us at:
        </Text>
        <Text style={styles.contactEmail}>support@OpticalRxNow.com</Text>

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
  },
  contentContainer: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#6b7c8f",
    marginBottom: 20,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4a9eff",
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: "#c0c8d0",
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    color: "#c0c8d0",
    lineHeight: 28,
    paddingLeft: 8,
  },
  contactEmail: {
    fontSize: 16,
    color: "#4a9eff",
    fontWeight: "600",
    marginTop: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});
