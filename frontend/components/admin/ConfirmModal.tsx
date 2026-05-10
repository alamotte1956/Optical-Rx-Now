import React from "react";
import { View, Text, Modal, StyleSheet } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: string;
  cancelText?: string;
  icon?: string;
  iconColor?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  confirmColor = "#ff5c5c",
  cancelText = "Cancel",
  icon = "alert-circle",
  iconColor = "#FF9800",
  onCancel,
  onConfirm,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={modalStyles.overlay}>
      <View style={modalStyles.content}>
        <View style={modalStyles.header}>
          <Ionicons name={icon as any} size={32} color={iconColor} />
          <Text style={modalStyles.title}>{title}</Text>
        </View>
        <Text style={modalStyles.message}>{message}</Text>
        <View style={modalStyles.buttons}>
          <Pressable style={modalStyles.cancelBtn} onPress={onCancel}>
            <Text style={modalStyles.cancelText}>{cancelText}</Text>
          </Pressable>
          <Pressable style={[modalStyles.confirmBtn, { backgroundColor: confirmColor }]} onPress={onConfirm}>
            <Text style={modalStyles.confirmText}>{confirmText}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#1a2d45",
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  message: {
    fontSize: 15,
    color: "#8899a6",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#2a3d55",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
