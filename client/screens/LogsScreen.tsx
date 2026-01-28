import React, { useRef, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { useServer } from "@/context/ServerContext";

export default function LogsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { logs, clearLogs } = useServer();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [logs]);

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearLogs();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return Colors.dark.error;
      case "warn":
        return Colors.dark.warning;
      case "info":
        return Colors.dark.primary;
      default:
        return Colors.dark.textSecondary;
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case "error":
        return "rgba(255, 107, 107, 0.1)";
      case "warn":
        return "rgba(245, 158, 11, 0.1)";
      default:
        return "transparent";
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: tabBarHeight }]}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.headerTitle}>Server Logs</ThemedText>
          <ThemedText style={styles.headerCount}>
            {logs.length} entries
          </ThemedText>
        </View>
        <Pressable style={styles.clearButton} onPress={handleClear}>
          <Feather name="trash-2" size={16} color={Colors.dark.textSecondary} />
          <ThemedText style={styles.clearText}>Clear</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.logsContainer}
        contentContainerStyle={[
          styles.logsContent,
          logs.length === 0 && styles.logsContentEmpty,
        ]}
      >
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather
                name="file-text"
                size={48}
                color={Colors.dark.textSecondary}
              />
            </View>
            <ThemedText style={styles.emptyTitle}>No Logs</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Server logs will appear here when the server is running
            </ThemedText>
          </View>
        ) : (
          logs.map((log, index) => {
            const showDate =
              index === 0 ||
              formatDate(log.timestamp) !==
                formatDate(logs[index - 1].timestamp);

            return (
              <View key={log.id}>
                {showDate ? (
                  <View style={styles.dateHeader}>
                    <View style={styles.dateLine} />
                    <ThemedText style={styles.dateText}>
                      {formatDate(log.timestamp)}
                    </ThemedText>
                    <View style={styles.dateLine} />
                  </View>
                ) : null}
                <View
                  style={[
                    styles.logEntry,
                    { backgroundColor: getLevelBg(log.level) },
                  ]}
                >
                  <View style={styles.logMeta}>
                    <ThemedText style={styles.logTime}>
                      {formatTime(log.timestamp)}
                    </ThemedText>
                    <View
                      style={[
                        styles.logLevelBadge,
                        { borderColor: getLevelColor(log.level) },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.logLevel,
                          { color: getLevelColor(log.level) },
                        ]}
                      >
                        {log.level.toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.logMessage}>
                    {log.message}
                  </ThemedText>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  headerCount: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  clearText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.xs,
  },
  logsContainer: {
    flex: 1,
  },
  logsContent: {
    padding: Spacing.lg,
  },
  logsContentEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.backgroundDefault,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  dateText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    paddingHorizontal: Spacing.md,
    textTransform: "uppercase",
  },
  logEntry: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
  },
  logMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  logTime: {
    fontSize: 11,
    fontFamily: Fonts?.mono || "monospace",
    color: Colors.dark.textSecondary,
  },
  logLevelBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  logLevel: {
    fontSize: 9,
    fontWeight: "600",
    fontFamily: Fonts?.mono || "monospace",
  },
  logMessage: {
    fontSize: 13,
    fontFamily: Fonts?.mono || "monospace",
    color: Colors.dark.text,
    lineHeight: 20,
  },
});
