/**
 * BannerCarousel
 * Fetches active banners from the backend and displays them in an auto-rotating carousel.
 * Falls back to "Advertise with us" placeholder when no banners are available.
 * Tracks views and clicks via analytics API.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getBanners, logAnalyticsEvent, type Banner } from "../services/adminApi";

const ROTATION_INTERVAL = 4000; // 4 seconds
const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface BannerCarouselProps {
  fallbackEmail?: string;
  fallbackText?: string;
}

export default function BannerCarousel({
  fallbackEmail = "alamotte1956@gmail.com",
  fallbackText = "Advertise with us Here",
}: BannerCarouselProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewTrackedRef = useRef<Set<string>>(new Set());

  const loadBanners = useCallback(async () => {
    try {
      const allBanners = await getBanners();
      const now = new Date();
      const activeBanners = allBanners.filter((b) => {
        if (!b.is_active) return false;
        if (b.start_date && new Date(b.start_date) > now) return false;
        if (b.end_date && new Date(b.end_date) < now) return false;
        return true;
      });
      setBanners(activeBanners);
    } catch (error) {
      console.log("[BannerCarousel] Load failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  // Auto-rotate
  useEffect(() => {
    if (banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, ROTATION_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  // Track banner view
  useEffect(() => {
    if (banners.length === 0) return;
    const banner = banners[currentIndex];
    if (banner && !viewTrackedRef.current.has(banner.banner_id)) {
      viewTrackedRef.current.add(banner.banner_id);
      logAnalyticsEvent("banner_view", { banner_id: banner.banner_id }).catch(() => {});
    }
  }, [currentIndex, banners]);

  const handleBannerPress = async (banner: Banner) => {
    try {
      await logAnalyticsEvent("banner_click", { banner_id: banner.banner_id });
      if (banner.destination_url) {
        await Linking.openURL(banner.destination_url);
      }
    } catch (error) {
      console.log("[BannerCarousel] Click tracking failed:", error);
    }
  };

  const handleFallbackPress = () => {
    Linking.openURL(
      `mailto:${fallbackEmail}?subject=Advertising%20Inquiry%20-%20My%20Optical%20Wallet`
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#4a9eff" />
      </View>
    );
  }

  // Fallback when no banners
  if (banners.length === 0) {
    return (
      <TouchableOpacity style={styles.fallbackContainer} onPress={handleFallbackPress}>
        <Ionicons name="megaphone-outline" size={24} color="#4a9eff" />
        <Text style={styles.fallbackText}>{fallbackText}</Text>
      </TouchableOpacity>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <View style={styles.carouselWrapper}>
      <TouchableOpacity
        style={styles.bannerContainer}
        onPress={() => handleBannerPress(currentBanner)}
        activeOpacity={0.8}
      >
        {currentBanner.image_url ? (
          <Image
            source={{ uri: currentBanner.image_url }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.bannerPlaceholder}>
            <Ionicons name="image-outline" size={32} color="#4a9eff" />
          </View>
        )}
        {currentBanner.title && (
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle} numberOfLines={2}>
              {currentBanner.title}
            </Text>
          </View>
        )}
        {/* SAMPLE watermark stamp */}
        <View style={styles.sampleOverlay} pointerEvents="none">
          <Text style={styles.sampleText}>SAMPLE</Text>
        </View>
      </TouchableOpacity>

      {/* Dots indicator */}
      {banners.length > 1 && (
        <View style={styles.dotsContainer}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  fallbackContainer: {
    width: "100%",
    height: 80,
    backgroundColor: "rgba(74, 158, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 158, 255, 0.2)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  fallbackText: {
    fontSize: 14,
    color: "#6b7c8f",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  carouselWrapper: {
    width: "100%",
    marginBottom: 16,
  },
  bannerContainer: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  sampleOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  sampleText: {
    fontSize: 36,
    fontWeight: "900",
    color: "rgba(0, 0, 0, 0.30)",
    letterSpacing: 12,
    transform: [{ rotate: "-20deg" }],
  },
  bannerPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a2d45",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: "#4a9eff",
    width: 16,
  },
  dotInactive: {
    backgroundColor: "#3a4d63",
  },
});
