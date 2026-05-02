/**
 * SmartInvitePrompt
 * Shows a share prompt after a user saves an optical document.
 * Uses native device sharing (no contact access).
 * Tracks invite events via analytics.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Share,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logAnalyticsEvent } from "../services/adminApi";

const INVITE_DISMISS_KEY = "@mow_invite_dismissals";
const MAX_DISMISSALS_BEFORE_HIDE = 5;
const SHOW_AFTER_SAVES = 1; // Show after every N saves

interface SmartInvitePromptProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function SmartInvitePrompt({ visible, onDismiss }: SmartInvitePromptProps) {
  const [animValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(animValue, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      animValue.setValue(0);
    }
  }, [visible]);

  const handleShare = async () => {
    try {
      logAnalyticsEvent("invite_share", { source: "post_save_prompt" }).catch(() => {});
      
      const result = await Share.share({
        message:
          "I'm using My Optical Wallet to store my family's eyeglass and contact lens documents. It's free and keeps everything private on your phone! Download it here: https://play.google.com/store/apps/details?id=com.opticalrxnow.mobile.v1",
        title: "My Optical Wallet",
      });

      if (result.action === Share.sharedAction) {
        logAnalyticsEvent("invite_completed", { source: "post_save_prompt" }).catch(() => {});
      }
    } catch (error) {
      console.log("Share error:", error);
    }
    onDismiss();
  };

  const handleDismiss = async () => {
    try {
      const stored = await AsyncStorage.getItem(INVITE_DISMISS_KEY);
      const count = stored ? parseInt(stored, 10) : 0;
      await AsyncStorage.setItem(INVITE_DISMISS_KEY, String(count + 1));
    } catch {}
    onDismiss();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: animValue }],
              opacity: animValue,
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={36} color="#ff6b9d" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Enjoying My Optical Wallet?</Text>
          <Text style={styles.subtitle}>
            Help friends and family keep their optical documents organized too!
          </Text>

          {/* Share Button */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Share with Friends & Family</Text>
          </TouchableOpacity>

          {/* Dismiss */}
          <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
            <Text style={styles.dismissText}>Maybe Later</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Check if invite prompt should be shown based on save count and dismissals.
 */
export async function shouldShowInvitePrompt(): Promise<boolean> {
  try {
    // Check dismissal count
    const dismissals = await AsyncStorage.getItem(INVITE_DISMISS_KEY);
    const dismissCount = dismissals ? parseInt(dismissals, 10) : 0;
    if (dismissCount >= MAX_DISMISSALS_BEFORE_HIDE) return false;

    // Check save count (show after every N saves)
    const saves = await AsyncStorage.getItem("@mow_save_count");
    const saveCount = saves ? parseInt(saves, 10) : 0;
    return saveCount > 0 && saveCount % SHOW_AFTER_SAVES === 0;
  } catch {
    return false;
  }
}

/**
 * Increment the save count (call after successful save).
 */
export async function incrementSaveCount(): Promise<void> {
  try {
    const saves = await AsyncStorage.getItem("@mow_save_count");
    const count = saves ? parseInt(saves, 10) : 0;
    await AsyncStorage.setItem("@mow_save_count", String(count + 1));
  } catch {}
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#1a2d45",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a3d55",
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 107, 157, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#8899a6",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  shareButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#4a9eff",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  dismissButton: {
    paddingVertical: 10,
  },
  dismissText: {
    fontSize: 14,
    color: "#6b7c8f",
    fontWeight: "500",
  },
});
