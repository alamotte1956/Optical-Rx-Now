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
import { saveFamilyMember } from "../services/localStorage";

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
  const [customRelationship, setCustomRelationship] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }

    const finalRelationship =
      relationship === "Other" ? customRelationship.trim() : relationship;

    if (!finalRelationship) {
      Alert.alert("Error", "Please select or enter a relationship");
      return;
    }

    setSaving(true);
    try {
      await saveFamilyMember(name.trim(), finalRelationship);
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
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Family Member</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !name.trim()}
            style={[styles.saveButton, (!name.trim() || saving) && styles.saveButtonDisabled]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Name Input */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            placeholderTextColor="#6b7c8f"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
          />

          {/* Relationship Selection */}
          <Text style={styles.label}>Relationship</Text>
          <View style={styles.relationshipGrid}>
            {RELATIONSHIP_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.relationshipButton,
                  relationship === option && styles.relationshipButtonActive,
                ]}
                onPress={() => setRelationship(option)}
              >
                <Text
                  style={[
                    styles.relationshipButtonText,
                    relationship === option && styles.relationshipButtonTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Relationship Input */}
          {relationship === "Other" && (
            <>
              <Text style={styles.label}>Specify Relationship</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Grandparent, Friend"
                placeholderTextColor="#6b7c8f"
                value={customRelationship}
                onChangeText={setCustomRelationship}
                autoCapitalize="words"
              />
            </>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#4a9eff" />
            <Text style={styles.infoText}>
              Add family members to organize prescriptions. You can add prescriptions for each member separately.
            </Text>
          </View>
        </ScrollView>
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
  saveButton: {
    backgroundColor: "#4a9eff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#3a4d63",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8899a6",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#1a2d45",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
  },
  relationshipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  relationshipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#1a2d45",
  },
  relationshipButtonActive: {
    backgroundColor: "#4a9eff",
  },
  relationshipButtonText: {
    fontSize: 14,
    color: "#8899a6",
  },
  relationshipButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(74, 158, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#8899a6",
    lineHeight: 20,
  },
});
