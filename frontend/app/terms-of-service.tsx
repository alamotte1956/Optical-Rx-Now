import { ScrollView, Text, StyleSheet, TouchableOpacity, View, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsOfServiceScreen() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL("mailto:alamotte1956@gmail.com");
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <TouchableOpacity onPress={() => router.replace("/welcome")} style={styles.placeholder} accessibilityLabel="Home" accessibilityRole="button">
          <Ionicons name="home-outline" size={22} color="#4a9eff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.lastUpdated}>Effective Date: April 17, 2026</Text>
        <Text style={styles.lastUpdated}>Last Updated: April 17, 2026</Text>

        {/* Section 1 */}
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By downloading, installing, or using the My Optical Wallet mobile application (&quot;App&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not download, install, or use the App. These Terms constitute a legally binding agreement between you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and My Optical Wallet (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
        </Text>
        <Text style={styles.paragraph}>
          These Terms apply in addition to any terms and conditions imposed by the platform from which you downloaded the App (Apple App Store or Google Play Store). In the event of a conflict between these Terms and the applicable platform terms, the platform terms shall prevail to the extent of the conflict.
        </Text>

        {/* Section 2 */}
        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          My Optical Wallet is a local-only optical document storage application that allows users to upload, save, and access photos of their eyeglass and contact lens optical documents directly on their device. The App is designed for personal convenience and organization purposes only. No account creation or registration is required. All data is stored exclusively on your device and is never transmitted to external servers.
        </Text>
        <Text style={styles.paragraph}>
          The App is provided as a utility tool and is not a medical device, healthcare service, or medical records system. The App does not interpret, validate, or verify the accuracy of any optical document information you store.
        </Text>

        {/* Section 3 */}
        <Text style={styles.sectionTitle}>3. Eligibility</Text>
        <Text style={styles.paragraph}>
          You must be at least 13 years of age (or 16 years of age in the European Economic Area) to use this App. By using the App, you represent and warrant that you meet this age requirement. If you are under the age of 18 (or the age of legal majority in your jurisdiction), you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf.
        </Text>

        {/* Section 4 */}
        <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
        <Text style={styles.paragraph}>You agree to:</Text>
        <Text style={styles.bulletPoint}>• Use the App only for lawful purposes and in accordance with these Terms</Text>
        <Text style={styles.bulletPoint}>• Not share optical document information belonging to others without their consent</Text>
        <Text style={styles.bulletPoint}>• Not use the App for any commercial, professional medical, or diagnostic purposes</Text>
        <Text style={styles.bulletPoint}>• Maintain the security of your own device, as all data is stored locally</Text>
        <Text style={styles.bulletPoint}>• Be solely responsible for backing up any data stored within the App</Text>
        <Text style={styles.bulletPoint}>• Not attempt to reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code of the App</Text>
        <Text style={styles.bulletPoint}>• Not modify, adapt, translate, or create derivative works based on the App</Text>
        <Text style={styles.bulletPoint}>• Not use the App in any manner that could damage, disable, overburden, or impair the App</Text>

        {/* Section 5 */}
        <Text style={styles.sectionTitle}>5. Medical Disclaimer</Text>
        <Text style={styles.disclaimerBox}>
          My Optical Wallet is not a medical service, medical device, or healthcare provider and does not provide medical advice, diagnosis, or treatment. The App is solely a storage and organization tool for your optical document information. The App does not replace professional eye care services.
        </Text>
        <Text style={styles.paragraph}>
          Always consult with a qualified eye care professional for any questions regarding your vision, eye health, or optical documents. Never disregard professional medical advice or delay seeking it because of information stored in or accessed through the App. We make no representations or warranties regarding the accuracy, completeness, or timeliness of any optical document information you store in the App.
        </Text>

        {/* Section 6 */}
        <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content, features, and functionality of the App, including but not limited to text, graphics, logos, icons, images, software, and the overall design and arrangement thereof, are the exclusive property of My Optical Wallet and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.
        </Text>
        <Text style={styles.paragraph}>
          We grant you a limited, non-exclusive, non-transferable, revocable license to use the App for your personal, non-commercial use in accordance with these Terms. This license does not include the right to sublicense, sell, resell, or commercially exploit the App or any content therein.
        </Text>
        <Text style={styles.paragraph}>
          You retain full ownership of any optical document photos and personal data you store within the App. We claim no ownership rights over your content.
        </Text>

        {/* Section 7 */}
        <Text style={styles.sectionTitle}>7. Disclaimer of Warranties</Text>
        <Text style={styles.legalText}>
          THE APP IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        </Text>
        <Text style={styles.paragraph}>
          We do not warrant that the App will be uninterrupted, error-free, secure, or free of viruses or other harmful components. We do not warrant the accuracy, reliability, or completeness of any information displayed or stored through the App. You acknowledge that your use of the App is at your sole risk.
        </Text>

        {/* Section 8 */}
        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.legalText}>
          TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MY OPTICAL WALLET, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO:
        </Text>
        <Text style={styles.bulletPoint}>• Your use of or inability to use the App</Text>
        <Text style={styles.bulletPoint}>• Any errors in optical document information you upload or store</Text>
        <Text style={styles.bulletPoint}>• Any data loss resulting from device damage, loss, theft, malfunction, or software issues</Text>
        <Text style={styles.bulletPoint}>• Any unauthorized access to your device or data stored within the App</Text>
        <Text style={styles.bulletPoint}>• Any reliance on optical document information stored in the App for medical decisions</Text>
        <Text style={styles.bulletPoint}>• Any interruption or cessation of the App&apos;s availability</Text>
        <Text style={styles.paragraph}>
          Because all data is stored locally on your device, we are not liable for any data loss or corruption. You are solely responsible for maintaining backups of your data. Our total aggregate liability to you for all claims arising out of or relating to these Terms or the App shall not exceed the amount you paid for the App, if any.
        </Text>
        <Text style={styles.paragraph}>
          Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, our liability shall be limited to the greatest extent permitted by law.
        </Text>

        {/* Section 9 */}
        <Text style={styles.sectionTitle}>9. Indemnification</Text>
        <Text style={styles.paragraph}>
          You agree to indemnify, defend, and hold harmless My Optical Wallet and its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including reasonable attorney&apos;s fees) arising from: (a) your use of the App; (b) your violation of these Terms; (c) your violation of any third-party right, including any intellectual property or privacy right; or (d) any claim that your use of the App caused damage to a third party.
        </Text>

        {/* Section 10 */}
        <Text style={styles.sectionTitle}>10. Third-Party Platform Terms</Text>
        <Text style={styles.paragraph}>
          The App is made available through the Apple App Store and Google Play Store. Your use of the App is also subject to the terms and conditions of the respective platform:
        </Text>
        <Text style={styles.subSectionTitle}>Apple App Store</Text>
        <Text style={styles.paragraph}>
          If you downloaded the App from the Apple App Store, you acknowledge that these Terms are between you and My Optical Wallet, not Apple. Apple has no obligation to furnish any maintenance or support services with respect to the App. Apple is not responsible for any product warranties or claims relating to the App. You acknowledge that Apple and its subsidiaries are third-party beneficiaries of these Terms, and Apple will have the right to enforce these Terms against you.
        </Text>
        <Text style={styles.subSectionTitle}>Google Play Store</Text>
        <Text style={styles.paragraph}>
          If you downloaded the App from the Google Play Store, you acknowledge that Google has no obligation or liability to you with respect to the App or these Terms. You acknowledge that My Optical Wallet, not Google, is responsible for addressing any claims relating to the App.
        </Text>

        {/* Section 11 */}
        <Text style={styles.sectionTitle}>11. Governing Law and Dispute Resolution</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with the laws of the State of Florida, United States, without regard to its conflict of law provisions.
        </Text>
        <Text style={styles.paragraph}>
          Any dispute arising out of or relating to these Terms or the App shall first be attempted to be resolved through good-faith negotiation between the parties. If the dispute cannot be resolved through negotiation within 30 days, either party may pursue resolution through binding arbitration administered by the American Arbitration Association (AAA) in accordance with its Commercial Arbitration Rules. The arbitration shall take place in the State of Florida, and the language of the arbitration shall be English.
        </Text>
        <Text style={styles.paragraph}>
          You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. If for any reason a claim proceeds in court rather than in arbitration, you waive any right to a jury trial.
        </Text>
        <Text style={styles.paragraph}>
          Nothing in this section shall prevent either party from seeking injunctive or other equitable relief from a court of competent jurisdiction.
        </Text>

        {/* Section 12 */}
        <Text style={styles.sectionTitle}>12. Modifications to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms at any time at our sole discretion. We will notify users of any material changes by posting the updated Terms within the App and updating the &quot;Last Updated&quot; date at the top of this page. Material changes will be effective 30 days after posting. Your continued use of the App after such modifications constitutes your acceptance of the revised Terms. If you do not agree to the modified Terms, you must stop using the App and uninstall it from your device.
        </Text>

        {/* Section 13 */}
        <Text style={styles.sectionTitle}>13. Termination</Text>
        <Text style={styles.paragraph}>
          You may stop using the App at any time by uninstalling it from your device. Upon uninstallation, all locally stored data, including optical document photos and family member names, will be permanently deleted from your device.
        </Text>
        <Text style={styles.paragraph}>
          We reserve the right to discontinue the App at any time, with or without notice. In the event of discontinuation, your locally stored data will remain on your device until you choose to remove it by uninstalling the App or clearing its data.
        </Text>
        <Text style={styles.paragraph}>
          The following sections shall survive termination of these Terms: Intellectual Property, Disclaimer of Warranties, Limitation of Liability, Indemnification, Governing Law and Dispute Resolution, and Severability.
        </Text>

        {/* Section 14 */}
        <Text style={styles.sectionTitle}>14. Severability</Text>
        <Text style={styles.paragraph}>
          If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it valid and enforceable, or if modification is not possible, shall be severed from these Terms. The invalidity or unenforceability of any provision shall not affect the validity or enforceability of the remaining provisions, which shall continue in full force and effect.
        </Text>

        {/* Section 15 */}
        <Text style={styles.sectionTitle}>15. Entire Agreement</Text>
        <Text style={styles.paragraph}>
          These Terms, together with our Privacy Policy, constitute the entire agreement between you and My Optical Wallet regarding your use of the App and supersede all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, regarding the App.
        </Text>

        {/* Section 16 */}
        <Text style={styles.sectionTitle}>16. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions, concerns, or feedback about these Terms of Service, please contact us at:
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>My Optical Wallet</Text>
        </Text>
        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.contactLink}>Email: alamotte1956@gmail.com</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleWebsitePress}>
          <Text style={styles.contactLink}>Website: www.MyOpticalWallet.com</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 My Optical Wallet. All rights reserved.</Text>
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
    marginBottom: 4,
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
    marginTop: 12,
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
  disclaimerBox: {
    fontSize: 15,
    color: "#FF9800",
    lineHeight: 24,
    marginBottom: 12,
    padding: 16,
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
    overflow: "hidden",
  },
  legalText: {
    fontSize: 13,
    color: "#8899a6",
    lineHeight: 22,
    marginBottom: 12,
    fontStyle: "italic",
  },
  contactLink: {
    fontSize: 16,
    color: "#4a9eff",
    fontWeight: "600",
    marginVertical: 6,
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
  },
  bottomSpacer: {
    height: 40,
  },
});
