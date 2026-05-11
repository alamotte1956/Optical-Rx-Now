import React, { createContext, useContext, useState, useEffect } from "react";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import * as Updates from "expo-updates";
import { en } from "./en";
import { es } from "./es";
import { es_419 } from "./es_419";
import { fr } from "./fr";
import { zh } from "./zh";
import { pt } from "./pt";
import { hi } from "./hi";
import { ar } from "./ar";
import { ja } from "./ja";
import { ko } from "./ko";
import { de } from "./de";
import { it } from "./it";
import { ru } from "./ru";
import { tr } from "./tr";
import { vi } from "./vi";
import { th } from "./th";
import { id } from "./id";
import { pl } from "./pl";
import { nl } from "./nl";
import { sv } from "./sv";
import { uk } from "./uk";
import { bn } from "./bn";
import { tl } from "./tl";
import { cs } from "./cs";
import { da } from "./da";
import { fi } from "./fi";
import { hu } from "./hu";
import { he } from "./he";
import { nb } from "./nb";
import { ro } from "./ro";
import { sk } from "./sk";

export type LanguageCode = "en" | "es" | "es_419" | "fr" | "zh" | "pt" | "hi" | "ar" | "ja" | "ko" | "de" | "it" | "ru" | "tr" | "vi" | "th" | "id" | "pl" | "nl" | "sv" | "uk" | "bn" | "tl" | "cs" | "da" | "fi" | "hu" | "he" | "nb" | "ro" | "sk" | "auto";

const LANGUAGE_STORAGE_KEY = "@optical_rx_language";

const RTL_LANGUAGES = ["ar", "he"];

const translations: Record<string, typeof en> = { en, es, es_419, fr, zh, pt, hi, ar, ja, ko, de, it, ru, tr, vi, th, id, pl, nl, sv, uk, bn, tl, cs, da, fi, hu, he, nb, ro, sk };

export type TranslationKey = keyof typeof en;

function getDeviceLanguage(): string {
  const locales = getLocales();
  if (locales && locales.length > 0) {
    const code = locales[0].languageCode || "en";
    const region = locales[0].regionCode || "";
    if (code.startsWith("es") && (region === "419" || region === "MX" || region === "AR" || region === "CO" || region === "CL" || region === "PE")) return "es_419";
    if (code.startsWith("es")) return "es";
    if (code.startsWith("fr")) return "fr";
    if (code.startsWith("zh")) return "zh";
    if (code.startsWith("pt")) return "pt";
    if (code.startsWith("hi")) return "hi";
    if (code.startsWith("ar")) return "ar";
    if (code.startsWith("ja")) return "ja";
    if (code.startsWith("ko")) return "ko";
    if (code.startsWith("de")) return "de";
    if (code.startsWith("it")) return "it";
    if (code.startsWith("ru")) return "ru";
    if (code.startsWith("tr")) return "tr";
    if (code.startsWith("vi")) return "vi";
    if (code.startsWith("th")) return "th";
    if (code.startsWith("id") || code.startsWith("ms")) return "id";
    if (code.startsWith("pl")) return "pl";
    if (code.startsWith("nl")) return "nl";
    if (code.startsWith("sv")) return "sv";
    if (code.startsWith("uk")) return "uk";
    if (code.startsWith("bn")) return "bn";
    if (code.startsWith("tl") || code.startsWith("fil")) return "tl";
    if (code.startsWith("cs")) return "cs";
    if (code.startsWith("da")) return "da";
    if (code.startsWith("fi")) return "fi";
    if (code.startsWith("hu")) return "hu";
    if (code.startsWith("he") || code.startsWith("iw")) return "he";
    if (code.startsWith("nb") || code.startsWith("no") || code.startsWith("nn")) return "nb";
    if (code.startsWith("ro")) return "ro";
    if (code.startsWith("sk")) return "sk";
  }
  return "en";
}

export function isRTL(): boolean {
  return I18nManager.isRTL;
}

interface I18nContextType {
  language: LanguageCode;
  resolvedLanguage: string;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType>({
  language: "auto",
  resolvedLanguage: "en",
  setLanguage: async () => {},
  t: (key) => key,
  isRTL: false,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("auto");
  const [resolvedLanguage, setResolvedLanguage] = useState<string>("en");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  useEffect(() => {
    if (language === "auto") {
      setResolvedLanguage(getDeviceLanguage());
    } else {
      setResolvedLanguage(language);
    }
  }, [language]);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && (Object.keys(translations).includes(saved) || saved === "auto")) {
        setLanguageState(saved as LanguageCode);
        // Apply RTL on app load
        const resolved = saved === "auto" ? getDeviceLanguage() : saved;
        const shouldBeRTL = RTL_LANGUAGES.includes(resolved);
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.allowRTL(shouldBeRTL);
          I18nManager.forceRTL(shouldBeRTL);
        }
      }
    } catch (e) {
      console.log("Error loading language:", e);
    } finally {
      setLoaded(true);
    }
  };

  const setLanguage = async (lang: LanguageCode) => {
    const resolved = lang === "auto" ? getDeviceLanguage() : lang;
    const shouldBeRTL = RTL_LANGUAGES.includes(resolved);
    const needsReload = I18nManager.isRTL !== shouldBeRTL;

    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.log("Error saving language:", e);
    }

    if (needsReload) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
      // Reload the app to apply RTL changes
      try {
        await Updates.reloadAsync();
      } catch (e) {
        // In development, Updates.reloadAsync may not work
        console.log("Please restart the app for RTL changes to take effect.");
      }
    }
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[resolvedLanguage] || en;
    return dict[key] || en[key] || key;
  };

  if (!loaded) return null;

  return (
    <I18nContext.Provider value={{ language, resolvedLanguage, setLanguage, t, isRTL: I18nManager.isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

export const LANGUAGE_OPTIONS = [
  { code: "auto" as LanguageCode, label: "Auto-detect" },
  { code: "en" as LanguageCode, label: "English" },
  { code: "ar" as LanguageCode, label: "العربية" },
  { code: "cs" as LanguageCode, label: "Čeština" },
  { code: "da" as LanguageCode, label: "Dansk" },
  { code: "de" as LanguageCode, label: "Deutsch" },
  { code: "es" as LanguageCode, label: "Español (España)" },
  { code: "es_419" as LanguageCode, label: "Español (Latinoamérica)" },
  { code: "fi" as LanguageCode, label: "Suomi" },
  { code: "fr" as LanguageCode, label: "Français" },
  { code: "he" as LanguageCode, label: "עברית" },
  { code: "hi" as LanguageCode, label: "हिन्दी" },
  { code: "hu" as LanguageCode, label: "Magyar" },
  { code: "id" as LanguageCode, label: "Bahasa Indonesia" },
  { code: "it" as LanguageCode, label: "Italiano" },
  { code: "ja" as LanguageCode, label: "日本語" },
  { code: "ko" as LanguageCode, label: "한국어" },
  { code: "nb" as LanguageCode, label: "Norsk" },
  { code: "nl" as LanguageCode, label: "Nederlands" },
  { code: "pl" as LanguageCode, label: "Polski" },
  { code: "pt" as LanguageCode, label: "Português (Brasil)" },
  { code: "ro" as LanguageCode, label: "Română" },
  { code: "ru" as LanguageCode, label: "Русский" },
  { code: "sk" as LanguageCode, label: "Slovenčina" },
  { code: "sv" as LanguageCode, label: "Svenska" },
  { code: "th" as LanguageCode, label: "ภาษาไทย" },
  { code: "tr" as LanguageCode, label: "Türkçe" },
  { code: "uk" as LanguageCode, label: "Українська" },
  { code: "vi" as LanguageCode, label: "Tiếng Việt" },
  { code: "zh" as LanguageCode, label: "中文" },
  { code: "bn" as LanguageCode, label: "বাংলা" },
  { code: "tl" as LanguageCode, label: "Tagalog" },
];
