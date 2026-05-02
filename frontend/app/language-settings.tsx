import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation, LANGUAGE_OPTIONS, LanguageCode } from "../services/i18n";

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, t, isRTL } = useTranslation();

  const handleLanguageSelect = async (code: LanguageCode) => {
    const isArabic = code === "ar" || (code === "auto" && false);
    const currentlyRTL = isRTL;
    const willBeRTL = code === "ar";

    if (currentlyRTL !== willBeRTL) {
      Alert.alert(
        t("language_changed"),
        t("language_changed_message") + "\n\nThe app will restart to apply the layout direction.",
        [
          { text: t("cancel"), style: "cancel" },
          { text: t("ok"), onPress: () => setLanguage(code) },
        ]
      );
    } else {
      await setLanguage(code);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, isRTL && { flexDirection: "row-reverse" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("language_settings")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        {LANGUAGE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.code}
            style={[
              styles.languageOption,
              language === option.code && styles.languageOptionActive,
              isRTL && { flexDirection: "row-reverse" },
            ]}
            onPress={() => handleLanguageSelect(option.code)}
            data-testid={`language-option-${option.code}`}
          >
            <View style={[styles.languageInfo, isRTL && { flexDirection: "row-reverse" }]}>
              <Ionicons
                name={option.code === "auto" ? "globe-outline" : "language-outline"}
                size={24}
                color={language === option.code ? "#4a9eff" : "#6b7c8f"}
              />
              <Text
                style={[
                  styles.languageLabel,
                  language === option.code && styles.languageLabelActive,
                  isRTL && { textAlign: "right" },
                ]}
              >
                {option.label}
              </Text>
            </View>
            {language === option.code && (
              <Ionicons name="checkmark-circle" size={24} color="#4a9eff" />
            )}
          </TouchableOpacity>
        ))}
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
    padding: 16,
    gap: 8,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#1a2d45",
    borderWidth: 1,
    borderColor: "transparent",
  },
  languageOptionActive: {
    borderColor: "#4a9eff",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#c0c8d0",
  },
  languageLabelActive: {
    color: "#4a9eff",
    fontWeight: "600",
  },
});
