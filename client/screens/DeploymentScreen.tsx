import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors, Spacing } from "@/constants/theme";

interface ReleaseNote {
  version: string;
  date: string;
  features: string[];
  bugFixes: string[];
  improvements: string[];
}

export default function DeploymentGuide() {
  const releaseNotes: ReleaseNote[] = [
    {
      version: "0.1.0",
      date: "2026-01-28",
      features: [
        "Phase 0: UI Foundation with swipeable workspace",
        "Phase 1: Backend integration with QEMU VM management",
        "Phase 2: Native terminal emulation and APK build",
        "Code Server integration via WebView",
        "Environment management (create/delete/start/stop)",
        "File downloads with progress tracking",
        "WebSocket real-time logs",
        "WASM sandbox execution",
      ],
      bugFixes: [],
      improvements: [
        "Structured logging with Winston",
        "Rate limiting for API security",
        "Comprehensive error handling",
        "GitHub Actions CI/CD pipeline",
        "EAS Build integration",
      ],
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="h1" style={styles.title}>
          Deployment & Release Guide
        </ThemedText>

        <ThemedText type="h2" style={styles.section}>
          Building APK
        </ThemedText>
        <ThemedText style={styles.text}>
          {`1. Install EAS CLI:\n$ npm install -g eas-cli\n\n2. Login to Expo:\n$ eas login\n\n3. Build APK:\n$ npm run prebuild\n$ eas build --platform android\n\n4. Download APK from EAS dashboard`}
        </ThemedText>

        <ThemedText type="h2" style={styles.section}>
          GitHub Actions CI/CD
        </ThemedText>
        <ThemedText style={styles.text}>
          {`Workflows automatically trigger on:\n- Push to main: Full production build\n- Push to develop: Preview build\n- Pull requests: Testing only\n\nWorkflow includes:\n✓ Dependency installation\n✓ Type checking\n✓ Linting\n✓ Unit tests\n✓ Prebuild assets\n✓ EAS APK build\n✓ Artifact upload`}
        </ThemedText>

        <ThemedText type="h2" style={styles.section}>
          Release Notes
        </ThemedText>
        {releaseNotes.map((release) => (
          <View key={release.version} style={styles.releaseCard}>
            <ThemedText type="h3">
              v{release.version} - {release.date}
            </ThemedText>

            {release.features.length > 0 && (
              <>
                <ThemedText style={styles.sectionHeader}>Features</ThemedText>
                {release.features.map((feature, i) => (
                  <ThemedText key={i} style={styles.listItem}>
                    • {feature}
                  </ThemedText>
                ))}
              </>
            )}

            {release.bugFixes.length > 0 && (
              <>
                <ThemedText style={styles.sectionHeader}>Bug Fixes</ThemedText>
                {release.bugFixes.map((fix, i) => (
                  <ThemedText key={i} style={styles.listItem}>
                    • {fix}
                  </ThemedText>
                ))}
              </>
            )}

            {release.improvements.length > 0 && (
              <>
                <ThemedText style={styles.sectionHeader}>
                  Improvements
                </ThemedText>
                {release.improvements.map((improvement, i) => (
                  <ThemedText key={i} style={styles.listItem}>
                    • {improvement}
                  </ThemedText>
                ))}
              </>
            )}
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: Spacing.lg,
  },
  section: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  text: {
    marginBottom: Spacing.lg,
    lineHeight: 1.6,
  },
  listItem: {
    marginLeft: Spacing.md,
    marginBottom: Spacing.sm,
  },
  releaseCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
    paddingLeft: Spacing.md,
    marginBottom: Spacing.lg,
  },
});
