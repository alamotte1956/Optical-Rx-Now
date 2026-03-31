import { ScrollView, Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.lastUpdated}>Last Updated: March 2026</Text>

        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.paragraph}>
          Optical Rx Now ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>Data Storage</Text>
        <Text style={styles.paragraph}>
          All your prescription data, family member information, and app settings are stored locally on your device only. We do not collect, transmit, or store any of your personal data on external servers.
        </Text>

        <Text style={styles.sectionTitle}>Information We Do NOT Collect</Text>
        <Text style={styles.bulletPoint}>• Prescription images or data</Text>
        <Text style={styles.bulletPoint}>• Personal health information</Text>
        <Text style={styles.bulletPoint}>• Family member details</Text>
        <Text style={styles.bulletPoint}>• Location data (used only locally to find nearby stores)</Text>
        <Text style={styles.bulletPoint}>• Contact information</Text>
        <Text style={styles.bulletPoint}>• Usage analytics or tracking data</Text>

        <Text style={styles.sectionTitle}>Camera and Photo Access</Text>
        <Text style={styles.paragraph}>
          The app requests access to your camera and photo library solely to allow you to capture and import prescription images. These images are stored locally on your device and are never uploaded to any server.
        </Text>

        <Text style={styles.sectionTitle}>Location Services</Text>
        <Text style={styles.paragraph}>
          If you choose to use the "Find Optical Stores" or "Find Optometrists" features, the app may request access to your location. This data is used only to display nearby providers and is not stored or transmitted.
        </Text>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.paragraph}>
          The app may send local notifications to remind you about prescription expirations. These notifications are generated entirely on your device and do not involve any external servers.
        </Text>

        <Text style={styles.sectionTitle}>Data Security</Text>
        <Text style={styles.paragraph}>
          Since all data remains on your device, the security of your information depends on your device's security settings. We recommend using device passcodes and keeping your operating system updated.
        </Text>

        <Text style={styles.sectionTitle}>Children's Privacy</Text>
        <Text style={styles.paragraph}>
          This app is intended for users 18 years of age and older. We include an age verification screen to ensure compliance.
        </Text>

        <Text style={styles.sectionTitle}>Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. Any changes will be reflected in the app with an updated "Last Updated" date.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy, please contact us at:
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
