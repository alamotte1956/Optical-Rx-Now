import { ScrollView, Text, StyleSheet, TouchableOpacity, View, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL("mailto:support@MyOpticalWallet.com");
  };

  const handleWebsitePress = () => {
    Linking.openURL("https://www.MyOpticalWallet.com");
  };

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
        <Text style={styles.lastUpdated}>Last Updated: April 17, 2026</Text>

        {/* Section 1 */}
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          My Optical Wallet (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how our mobile application (&quot;App&quot;), available on the Apple App Store and Google Play Store, handles your information. By downloading, installing, or using the App, you acknowledge that you have read and understood this Privacy Policy.
        </Text>
        <Text style={styles.paragraph}>
          This policy applies to all users of the My Optical Wallet mobile application, regardless of location, and is designed to comply with applicable privacy laws including the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), the California Privacy Rights Act (CPRA), and other applicable data protection regulations.
        </Text>

        {/* Section 2 */}
        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          My Optical Wallet is a local-only utility. We do not require account creation or registration. The only information processed by the app consists of the prescription photos and family names you choose to save locally on your device.
        </Text>
        <Text style={styles.subSectionTitle}>Data we do NOT collect:</Text>
        <Text style={styles.bulletPoint}>• Personal identifiers (name, email address, phone number, mailing address)</Text>
        <Text style={styles.bulletPoint}>• Financial or payment information</Text>
        <Text style={styles.bulletPoint}>• Location data (GPS or IP-based)</Text>
        <Text style={styles.bulletPoint}>• Device identifiers or advertising IDs</Text>
        <Text style={styles.bulletPoint}>• Browsing or search history</Text>
        <Text style={styles.bulletPoint}>• Contacts or address book data</Text>
        <Text style={styles.bulletPoint}>• Health data beyond what you voluntarily store as prescription photos</Text>
        <Text style={styles.bulletPoint}>• Usage analytics or behavioral tracking data</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Device permissions:</Text> The App may request access to your device&apos;s camera and photo library solely for the purpose of allowing you to photograph or select prescription images to store locally. These permissions are optional and can be managed through your device&apos;s settings at any time. No images are transmitted from your device.
        </Text>

        {/* Section 3 */}
        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          Since all data remains on your device, we do not access, process, or use your personal information on any server or cloud service. The App processes your prescription photos and family member names exclusively on your device to:
        </Text>
        <Text style={styles.bulletPoint}>• Display and organize your saved prescription photos within the App</Text>
        <Text style={styles.bulletPoint}>• Associate prescription photos with family member names you provide</Text>
        <Text style={styles.bulletPoint}>• Enable you to view your prescriptions at any time on your device</Text>
        <Text style={styles.paragraph}>
          We do not use your data for advertising, analytics, profiling, or any purpose beyond the core functionality described above.
        </Text>

        {/* Section 4 */}
        <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          All prescription data, including photos and names, is stored exclusively on your device&apos;s local storage. My Optical Wallet does not transmit, store, or access this data on any external servers or cloud infrastructure. Your data never leaves your device.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Security measures:</Text> Your data is protected by your device&apos;s built-in security features, including device encryption, passcode/biometric lock, and operating system sandboxing. We recommend that you keep your device&apos;s operating system up to date and use a strong passcode or biometric authentication to protect access to your stored prescriptions.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Data encryption:</Text> Data stored within the App benefits from the encryption provided by your device&apos;s operating system (iOS Data Protection or Android file-based encryption) when your device is locked.
        </Text>

        {/* Section 5 */}
        <Text style={styles.sectionTitle}>5. Data Sharing and Third Parties</Text>
        <Text style={styles.paragraph}>
          We do not sell, trade, rent, share, or transfer your personal information to any third party. Since the App operates entirely on your device with no server communication, there is no data available for us to share.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Third-party SDKs and services:</Text> The App does not integrate any third-party analytics, advertising, or tracking SDKs. No third-party service receives data from the App.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>App Store platforms:</Text> Please note that the Apple App Store and Google Play Store may independently collect certain data related to your download and use of apps, such as app installation data and crash reports. This data collection is governed by Apple&apos;s and Google&apos;s respective privacy policies, not by this Privacy Policy.
        </Text>

        {/* Section 6 */}
        <Text style={styles.sectionTitle}>6. Data Retention</Text>
        <Text style={styles.paragraph}>
          Your prescription photos and family member names are retained on your device for as long as the App is installed and you choose to keep them. We do not retain any copy of your data on our servers, as no data is ever transmitted from your device. You may delete individual prescriptions within the App at any time, or remove all data by uninstalling the App or clearing the App&apos;s data in your device settings.
        </Text>

        {/* Section 7 */}
        <Text style={styles.sectionTitle}>7. Your Rights and Choices</Text>
        <Text style={styles.paragraph}>
          You have full control over your data. Because all information is stored locally on your device, you can exercise the following rights at any time without needing to contact us:
        </Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Access:</Text> View all stored prescription photos and names directly within the App</Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Deletion:</Text> Delete individual prescriptions within the App, or delete all data by uninstalling the App or clearing the App&apos;s data in your device settings</Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Portability:</Text> Export or share your prescription photos using your device&apos;s built-in sharing features</Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Withdraw consent:</Text> Revoke camera or photo library permissions at any time through your device settings</Text>

        <Text style={styles.subSectionTitle}>For Users in the European Economic Area (GDPR)</Text>
        <Text style={styles.paragraph}>
          If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have additional rights under the General Data Protection Regulation (GDPR). Since we do not collect or process personal data on our servers, most GDPR data subject rights are automatically fulfilled by the local-only nature of the App. You retain full control of your data at all times. The legal basis for any on-device processing is your consent, which you provide by choosing to use the App and voluntarily entering data. You may withdraw this consent at any time by deleting your data or uninstalling the App.
        </Text>

        <Text style={styles.subSectionTitle}>For Users in California (CCPA/CPRA)</Text>
        <Text style={styles.paragraph}>
          If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA). We confirm the following:
        </Text>
        <Text style={styles.bulletPoint}>• We do not sell your personal information</Text>
        <Text style={styles.bulletPoint}>• We do not share your personal information for cross-context behavioral advertising</Text>
        <Text style={styles.bulletPoint}>• We do not collect or use sensitive personal information beyond what is necessary for the App&apos;s core functionality</Text>
        <Text style={styles.bulletPoint}>• We do not use or disclose your personal information for purposes other than those disclosed in this Privacy Policy</Text>

        {/* Section 8 */}
        <Text style={styles.sectionTitle}>8. Tracking and Advertising</Text>
        <Text style={styles.paragraph}>
          My Optical Wallet does not track you across other apps or websites. We do not use advertising identifiers (IDFA on iOS or Advertising ID on Android). We do not display advertisements within the App. We do not engage in cross-app or cross-site tracking of any kind.
        </Text>

        {/* Section 9 */}
        <Text style={styles.sectionTitle}>9. Children&apos;s Privacy</Text>
        <Text style={styles.paragraph}>
          The App is not directed at children under the age of 13 (or under 16 in the European Economic Area). We do not knowingly collect personal information from children. Since the App does not collect any personal data and does not require account creation, there is no mechanism through which children&apos;s data could be collected by us. If you are a parent or guardian and believe your child is using the App inappropriately, you may uninstall the App from the child&apos;s device to remove all locally stored data.
        </Text>

        {/* Section 10 */}
        <Text style={styles.sectionTitle}>10. International Data Transfers</Text>
        <Text style={styles.paragraph}>
          Since all data is stored exclusively on your device and is never transmitted to our servers or any third party, there are no international data transfers associated with the use of this App.
        </Text>

        {/* Section 11 */}
        <Text style={styles.sectionTitle}>11. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of any material changes by posting the updated Privacy Policy within the App and updating the &quot;Last Updated&quot; date at the top of this page. We encourage you to review this Privacy Policy periodically. Your continued use of the App after any changes constitutes your acceptance of the updated Privacy Policy.
        </Text>

        {/* Section 12 */}
        <Text style={styles.sectionTitle}>12. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
        </Text>
        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.contactLink}>support@MyOpticalWallet.com</Text>
        </TouchableOpacity>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>My Optical Wallet</Text>
        </Text>
        <TouchableOpacity onPress={handleWebsitePress}>
          <Text style={styles.contactLink}>www.MyOpticalWallet.com</Text>
        </TouchableOpacity>
        <Text style={styles.paragraph}>
          We will respond to your inquiry within 30 days. If you are not satisfied with our response, you may have the right to lodge a complaint with your local data protection authority.
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 My Optical Wallet. All rights reserved.</Text>
          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={styles.footerLink}>support@MyOpticalWallet.com</Text>
          </TouchableOpacity>
        </View>

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
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8899a6",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: "#c0c8d0",
    lineHeight: 24,
    marginBottom: 12,
  },
  bold: {
    fontWeight: "700",
    color: "#fff",
  },
  bulletPoint: {
    fontSize: 15,
    color: "#c0c8d0",
    lineHeight: 26,
    paddingLeft: 8,
    marginBottom: 4,
  },
  contactLink: {
    fontSize: 16,
    color: "#4a9eff",
    fontWeight: "600",
    marginVertical: 8,
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#1a2d45",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#6b7c8f",
    marginBottom: 8,
  },
  footerLink: {
    fontSize: 14,
    color: "#4a9eff",
  },
  bottomSpacer: {
    height: 40,
  },
});
