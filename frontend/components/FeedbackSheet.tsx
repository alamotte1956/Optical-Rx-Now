/**
 * FeedbackSheet
 * Anonymous feedback system via a bottom modal.
 * No personal info collected - feedback is stored in backend for admin review.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { logAnalyticsEvent } from "../services/adminApi";

interface FeedbackSheetProps {
  visible: boolean;
  onClose: () => void;
}

const RATING_EMOJIS = [
  { value: 1, emoji: "sad-outline", label: "Poor", color: "#ff5c5c" },
  { value: 2, emoji: "sad-outline", label: "Fair", color: "#FF9800" },
  { value: 3, emoji: "happy-outline", label: "Good", color: "#FFD700" },
  { value: 4, emoji: "happy-outline", label: "Great", color: "#4CAF50" },
  { value: 5, emoji: "heart", label: "Love it!", color: "#ff6b9d" },
];

const CATEGORIES = [
  { id: "general", label: "General", icon: "chatbox-outline" },
  { id: "feature", label: "Feature Request", icon: "bulb-outline" },
  { id: "bug", label: "Bug Report", icon: "bug-outline" },
  { id: "design", label: "Design", icon: "color-palette-outline" },
];

export default function FeedbackSheet({ visible, onClose }: FeedbackSheetProps) {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const resetForm = () => {
    setRating(0);
    setCategory("general");
    setFeedbackText("");
    setSubmitted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await logAnalyticsEvent("feedback_submitted", {
        rating,
        category,
        feedback: feedbackText.trim() || null,
        timestamp: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (error) {
      Alert.alert("Error", "Could not submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {submitted ? (
              /* Success State */
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={56} color="#4CAF50" />
                </View>
                <Text style={styles.successTitle}>Thank You!</Text>
                <Text style={styles.successSubtitle}>
                  Your anonymous feedback helps us improve My Optical Wallet for everyone.
                </Text>
                <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Feedback Form */
              <>
                <Text style={styles.title}>Send Feedback</Text>
                <Text style={styles.subtitle}>
                  Your feedback is 100% anonymous — no personal info is collected.
                </Text>

                {/* Rating */}
                <Text style={styles.label}>How would you rate your experience?</Text>
                <View style={styles.ratingRow}>
                  {RATING_EMOJIS.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.ratingItem,
                        rating === item.value && { backgroundColor: item.color + "22", borderColor: item.color },
                      ]}
                      onPress={() => setRating(item.value)}
                    >
                      <Ionicons
                        name={item.emoji as any}
                        size={28}
                        color={rating === item.value ? item.color : "#6b7c8f"}
                      />
                      <Text
                        style={[
                          styles.ratingLabel,
                          rating === item.value && { color: item.color },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Category */}
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        category === cat.id && styles.categoryChipActive,
                      ]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={16}
                        color={category === cat.id ? "#4a9eff" : "#6b7c8f"}
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          category === cat.id && styles.categoryTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Text Feedback */}
                <Text style={styles.label}>Anything else? (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tell us what you think..."
                  placeholderTextColor="#6b7c8f"
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{feedbackText.length}/500</Text>

                {/* Submit */}
                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  <Text style={styles.submitButtonText}>
                    {submitting ? "Sending..." : "Submit Anonymous Feedback"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  sheet: {
    backgroundColor: "#1a2d45",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#3a4d63",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7c8f",
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 10,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  ratingItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a3d55",
    backgroundColor: "#0f1d2f",
    gap: 4,
  },
  ratingLabel: {
    fontSize: 10,
    color: "#6b7c8f",
    fontWeight: "600",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2a3d55",
    backgroundColor: "#0f1d2f",
  },
  categoryChipActive: {
    borderColor: "#4a9eff",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
  },
  categoryText: {
    fontSize: 13,
    color: "#6b7c8f",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#4a9eff",
  },
  textInput: {
    backgroundColor: "#0f1d2f",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#2a3d55",
    minHeight: 100,
  },
  charCount: {
    fontSize: 11,
    color: "#6b7c8f",
    textAlign: "right",
    marginTop: 4,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#4a9eff",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#8899a6",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  doneButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
