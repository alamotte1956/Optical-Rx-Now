import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { createFamilyMember } from "../services/localStorage";

const RELATIONSHIP_OPTIONS = [
  "Self",
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Other",
];

export default function AddMemberScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    if (!relationship) {
      Alert.alert("Error", "Please select a relationship");
      return;
    }

    setSaving(true);
    try {
      await createFamilyMember({ name: name.trim(), relationship });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to add family member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Family Member</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          {/* Name Input */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            placeholderTextColor="#6b7c8f"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Relationship Selection */}
          <Text style={styles.label}>Relationship</Text>
          <View style={styles.relationshipContainer}>
            {RELATIONSHIP_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.relationshipOption,
                  relationship === option && styles.relationshipOptionActive,
                ]}
                onPress={() => setRelationship(option)}
              >
                <Text
                  style={[
                    styles.relationshipText,
                    relationship === option && styles.relationshipTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!name.trim() || !relationship) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving || !name.trim() || !relationship}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={22} color="#fff" />
                <Text style={styles.saveButtonText}>Add Member</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  flex: {
    flex: 1,
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
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  placeholder: {
    width: 44,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
    marginBottom: 24,
  },
  relationshipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  relationshipOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#1a2d45",
  },
  relationshipOptionActive: {
    backgroundColor: "#4a9eff",
  },
  relationshipText: {
    fontSize: 14,
    color: "#8899a6",
    fontWeight: "500",
  },
  relationshipTextActive: {
    color: "#fff",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a9eff",
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#3a4d63",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
