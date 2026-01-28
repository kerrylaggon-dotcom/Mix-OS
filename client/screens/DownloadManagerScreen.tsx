import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useServer, DownloadStatus } from "@/context/ServerContext";

const getStatusColor = (status: DownloadStatus) => {
  switch (status) {
    case "downloaded":
      return Colors.dark.success;
    case "downloading":
      return Colors.dark.warning;
    case "error":
      return Colors.dark.error;
    default:
      return Colors.dark.textSecondary;
  }
};

const getStatusIcon = (status: DownloadStatus): string => {
  switch (status) {
    case "downloaded":
      return "check-circle";
    case "downloading":
      return "loader";
    case "error":
      return "alert-circle";
    default:
      return "download";
  }
};

export default function DownloadManagerScreen() {
  const insets = useSafeAreaInsets();
  const { components, downloadComponent, addLog } = useServer();

  const downloadedCount = components.filter((c) => c.status === "downloaded").length;
  const totalSize = components.reduce((acc, c) => {
    const size = parseInt(c.size.replace(/[^0-9]/g, ""), 10);
    return acc + (isNaN(size) ? 0 : size);
  }, 0);

  const handleDownload = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    downloadComponent(id);
  };

  const handleDownloadAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    addLog("info", "Starting batch download of all components");
    components
      .filter((c) => c.status === "not_downloaded")
      .forEach((c, index) => {
        setTimeout(() => {
          downloadComponent(c.id);
        }, index * 3000);
      });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryValue}>
              {downloadedCount}/{components.length}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Downloaded</ThemedText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryValue}>~{totalSize}MB</ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Size</ThemedText>
          </View>
        </View>

        {downloadedCount < components.length ? (
          <Pressable style={styles.downloadAllButton} onPress={handleDownloadAll}>
            <Feather name="download-cloud" size={18} color={Colors.dark.buttonText} />
            <ThemedText style={styles.downloadAllText}>Download All</ThemedText>
          </Pressable>
        ) : (
          <View style={styles.allDownloadedBadge}>
            <Feather name="check-circle" size={16} color={Colors.dark.success} />
            <ThemedText style={styles.allDownloadedText}>
              All components installed
            </ThemedText>
          </View>
        )}
      </View>

      <ThemedText style={styles.sectionTitle}>Components</ThemedText>

      {components.map((component, index) => (
        <Animated.View
          key={component.id}
          entering={FadeInDown.delay(index * 100).springify()}
        >
          <View style={styles.componentCard}>
            <View style={styles.componentHeader}>
              <View style={styles.componentIcon}>
                <Feather
                  name={
                    component.id === "code-server"
                      ? "code"
                      : component.id === "nix"
                        ? "box"
                        : component.id === "qemu"
                          ? "cpu"
                          : component.id === "busybox"
                            ? "terminal"
                            : "hard-drive"
                  }
                  size={20}
                  color={Colors.dark.primary}
                />
              </View>
              <View style={styles.componentInfo}>
                <ThemedText style={styles.componentName}>{component.name}</ThemedText>
                <ThemedText style={styles.componentDesc}>
                  {component.description}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { borderColor: getStatusColor(component.status) },
                ]}
              >
                <Feather
                  name={getStatusIcon(component.status) as any}
                  size={12}
                  color={getStatusColor(component.status)}
                />
              </View>
            </View>

            <View style={styles.componentMeta}>
              <ThemedText style={styles.metaText}>{component.size}</ThemedText>
              <ThemedText style={styles.metaText}>
                {component.status === "downloaded"
                  ? "Installed"
                  : component.status === "downloading"
                    ? `${component.progress}%`
                    : "Not installed"}
              </ThemedText>
            </View>

            {component.status === "downloading" ? (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${component.progress}%` }]}
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.componentActions}>
              {component.status === "not_downloaded" ? (
                <Pressable
                  style={styles.downloadButton}
                  onPress={() => handleDownload(component.id)}
                >
                  <Feather name="download" size={14} color={Colors.dark.buttonText} />
                  <ThemedText style={styles.downloadButtonText}>Download</ThemedText>
                </Pressable>
              ) : component.status === "downloaded" ? (
                <View style={styles.installedRow}>
                  <Pressable style={styles.actionButtonOutline}>
                    <Feather name="refresh-cw" size={14} color={Colors.dark.primary} />
                    <ThemedText style={styles.actionButtonOutlineText}>
                      Update
                    </ThemedText>
                  </Pressable>
                  <Pressable style={styles.actionButtonOutline}>
                    <Feather name="trash-2" size={14} color={Colors.dark.error} />
                  </Pressable>
                </View>
              ) : component.status === "downloading" ? (
                <Pressable style={styles.cancelButton}>
                  <Feather name="x" size={14} color={Colors.dark.error} />
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </Pressable>
              ) : null}
            </View>
          </View>
        </Animated.View>
      ))}

      <View style={styles.infoCard}>
        <Feather name="info" size={16} color={Colors.dark.textSecondary} />
        <ThemedText style={styles.infoText}>
          Components are stored locally on your device. Downloads may take a few
          minutes depending on your connection speed.
        </ThemedText>
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
  summaryCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: Spacing.xl,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.dark.border,
    marginHorizontal: Spacing.lg,
  },
  downloadAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  downloadAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.buttonText,
    marginLeft: Spacing.sm,
  },
  allDownloadedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    backgroundColor: "rgba(0, 255, 135, 0.1)",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.success,
  },
  allDownloadedText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.success,
    marginLeft: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  componentCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: Spacing.md,
  },
  componentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  componentIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  componentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  componentName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  componentDesc: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  componentMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  metaText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
  },
  componentActions: {
    marginTop: Spacing.md,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  downloadButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.buttonText,
    marginLeft: Spacing.xs,
  },
  installedRow: {
    flexDirection: "row",
  },
  actionButtonOutline: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginRight: Spacing.sm,
  },
  actionButtonOutlineText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.dark.primary,
    marginLeft: Spacing.xs,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.dark.error,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.dark.error,
    marginLeft: Spacing.xs,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
});
