import React from "react";
import { TouchableOpacity, Text, View, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Section } from "./Section";
import { adminStyles as styles } from "../../styles/adminStyles";
import { ADMIN_LINKS } from "../../constants/adminConstants";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export const AppManagementSection: React.FC<Props> = ({ expanded, onToggle }) => (
  <Section title="App Management" icon="settings-outline" iconColor="#4a9eff" expanded={expanded} onToggle={onToggle}>
    {ADMIN_LINKS.map((link) => (
      <TouchableOpacity key={link.name} style={styles.linkCard} onPress={() => Linking.openURL(link.url)} activeOpacity={0.7}>
        <Ionicons name={link.icon as any} size={22} color="#4a9eff" />
        <View style={styles.linkInfo}>
          <Text style={styles.linkName}>{link.name}</Text>
          <Text style={styles.linkDescription}>{link.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7c8f" />
      </TouchableOpacity>
    ))}
  </Section>
);
