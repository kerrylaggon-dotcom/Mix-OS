import React from "react";
import { View, StyleSheet, ScrollView, Switch, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { useServer } from "@/context/ServerContext";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, codeServerUrl, setCodeServerUrl, components } = useServer();

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ [key]: value });
  };

  const handlePortChange = (text: string) => {
    const port = parseInt(text, 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      updateSettings({ serverPort: port });
    }
  };

  const downloadedCount = components.filter((c) => c.status === "downloaded").length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
    >
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>General</ThemedText>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Feather name="power" size={18} color={Colors.dark.primary} />
            </View>
            <View style={styles.settingText}>
              <ThemedText style={styles.settingLabel}>Auto-start Server</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Start code-server when app opens
              </ThemedText>
            </View>
          </View>
          <Switch
            value={settings.autoStart}
            onValueChange={(value) => handleToggle("autoStart", value)}
            trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
            thumbColor={Colors.dark.text}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Feather name="cpu" size={18} color={Colors.dark.primary} />
            </View>
            <View style={styles.settingText}>
              <ThemedText style={styles.settingLabel}>Auto-setup VM</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Automatically configure virtual machine
              </ThemedText>
            </View>
          </View>
          <Switch
            value={settings.autoSetupVm}
            onValueChange={(value) => handleToggle("autoSetupVm", value)}
            trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
            thumbColor={Colors.dark.text}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Server Configuration</ThemedText>

        <View style={styles.inputRow}>
          <ThemedText style={styles.inputLabel}>Server Port</ThemedText>
          <TextInput
            style={styles.input}
            value={settings.serverPort.toString()}
            onChangeText={handlePortChange}
            keyboardType="numeric"
            placeholderTextColor={Colors.dark.textSecondary}
          />
        </View>

        <View style={styles.inputRow}>
          <ThemedText style={styles.inputLabel}>Code Server URL</ThemedText>
          <TextInput
            style={styles.input}
            value={codeServerUrl || ""}
            onChangeText={setCodeServerUrl}
            placeholder="http://localhost:8080"
            placeholderTextColor={Colors.dark.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <ThemedText style={styles.inputHint}>
            Enter the URL of your running code-server instance
          </ThemedText>
        </View>

        <View style={styles.inputRow}>
          <ThemedText style={styles.inputLabel}>Default Environment</ThemedText>
          <View style={styles.envSelector}>
            {(["nix", "qemu", "ubuntu"] as const).map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.envOption,
                  settings.defaultEnvironment === type && styles.envOptionSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateSettings({ defaultEnvironment: type });
                }}
              >
                <ThemedText
                  style={[
                    styles.envOptionText,
                    settings.defaultEnvironment === type && styles.envOptionTextSelected,
                  ]}
                >
                  {type === "nix" ? "NixOS" : type === "qemu" ? "QEMU" : "Ubuntu"}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Status</ThemedText>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <ThemedText style={styles.statusLabel}>Components Downloaded</ThemedText>
            <ThemedText style={styles.statusValue}>
              {downloadedCount}/{components.length}
            </ThemedText>
          </View>
          <View style={styles.statusRow}>
            <ThemedText style={styles.statusLabel}>Storage Used</ThemedText>
            <ThemedText style={styles.statusValue}>
              ~{downloadedCount * 50}MB
            </ThemedText>
          </View>
          <View style={styles.statusRow}>
            <ThemedText style={styles.statusLabel}>App Version</ThemedText>
            <ThemedText style={styles.statusValue}>0.1.0</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>About</ThemedText>

        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <View style={styles.aboutIcon}>
              <Feather name="terminal" size={24} color={Colors.dark.primary} />
            </View>
            <View style={styles.aboutInfo}>
              <ThemedText style={styles.aboutTitle}>Code Server Terminal</ThemedText>
              <ThemedText style={styles.aboutVersion}>Version 0.1.0 - Phase 0</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.aboutDescription}>
            Run code-server, QEMU, and development tools on Android.
            Built with Expo for cross-platform deployment.
          </ThemedText>
          <View style={styles.aboutBadges}>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>Phase 0</ThemedText>
            </View>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>NixOS</ThemedText>
            </View>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>QEMU</ThemedText>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  inputRow: {
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.xs,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.dark.text,
    fontFamily: Fonts?.mono || "monospace",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  inputHint: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.sm,
  },
  envSelector: {
    flexDirection: "row",
  },
  envOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    marginHorizontal: 2,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  envOptionSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  envOptionText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
  },
  envOptionTextSelected: {
    color: Colors.dark.buttonText,
  },
  statusCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  statusLabel: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  aboutCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  aboutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  aboutIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutInfo: {
    marginLeft: Spacing.md,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  aboutVersion: {
    fontSize: 12,
    color: Colors.dark.primary,
    marginTop: 2,
  },
  aboutDescription: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  aboutBadges: {
    flexDirection: "row",
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.dark.primary,
    textTransform: "uppercase",
  },
});
