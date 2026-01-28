import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { useServer, Environment } from "@/context/ServerContext";
import { StatusIndicator } from "@/components/StatusIndicator";

const envTypes = [
  { id: "nix", label: "NixOS", icon: "box", desc: "Reproducible builds" },
  { id: "qemu", label: "QEMU VM", icon: "cpu", desc: "Full virtualization" },
  { id: "ubuntu", label: "Ubuntu", icon: "server", desc: "Linux environment" },
] as const;

export default function EnvironmentsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { environments, addEnvironment, removeEnvironment, updateEnvironment, addLog, addTerminalOutput, components } =
    useServer();
  const [showModal, setShowModal] = useState(false);
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvType, setNewEnvType] = useState<"nix" | "qemu" | "ubuntu">("nix");

  const requiredComponents = {
    nix: ["nix", "busybox"],
    qemu: ["qemu", "rootfs"],
    ubuntu: ["rootfs", "busybox"],
  };

  const isTypeAvailable = (type: "nix" | "qemu" | "ubuntu") => {
    return requiredComponents[type].every(
      (id) => components.find((c) => c.id === id)?.status === "downloaded"
    );
  };

  const handleCreate = () => {
    if (!newEnvName.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addEnvironment({
      name: newEnvName.trim(),
      type: newEnvType,
      status: "stopped",
    });
    addTerminalOutput(`$ create-env ${newEnvType} "${newEnvName.trim()}"`);
    addTerminalOutput(`Environment "${newEnvName.trim()}" created`);
    addTerminalOutput("");
    setNewEnvName("");
    setNewEnvType("nix");
    setShowModal(false);
  };

  const handleToggleEnv = (env: Environment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (env.status === "stopped") {
      updateEnvironment(env.id, { status: "starting" });
      addLog("info", `Starting ${env.name}...`);
      addTerminalOutput(`$ start-env "${env.name}"`);
      addTerminalOutput(`Starting ${env.type} environment...`);
      
      setTimeout(() => {
        updateEnvironment(env.id, {
          status: "running",
          cpuUsage: Math.floor(Math.random() * 30) + 10,
          memoryUsage: Math.floor(Math.random() * 40) + 20,
        });
        addLog("info", `${env.name} is now running`);
        addTerminalOutput(`${env.name} started successfully`);
        addTerminalOutput("");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 2000);
    } else if (env.status === "running") {
      updateEnvironment(env.id, { status: "stopped", cpuUsage: 0, memoryUsage: 0 });
      addLog("info", `${env.name} stopped`);
      addTerminalOutput(`$ stop-env "${env.name}"`);
      addTerminalOutput(`${env.name} stopped`);
      addTerminalOutput("");
    }
  };

  const handleDelete = (env: Environment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    removeEnvironment(env.id);
    addTerminalOutput(`$ delete-env "${env.name}"`);
    addTerminalOutput(`Environment deleted`);
    addTerminalOutput("");
  };

  const getTypeIcon = (type: string) => {
    const found = envTypes.find((t) => t.id === type);
    return found?.icon || "box";
  };

  const renderItem = ({ item, index }: { item: Environment; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <Pressable
        style={({ pressed }) => [
          styles.envCard,
          pressed && styles.envCardPressed,
        ]}
      >
        <View style={styles.envHeader}>
          <View style={styles.envIcon}>
            <Feather
              name={getTypeIcon(item.type) as any}
              size={20}
              color={Colors.dark.primary}
            />
          </View>
          <View style={styles.envInfo}>
            <ThemedText style={styles.envName}>{item.name}</ThemedText>
            <ThemedText style={styles.envType}>
              {envTypes.find((t) => t.id === item.type)?.label || item.type}
            </ThemedText>
          </View>
          <StatusIndicator status={item.status} showLabel={false} />
        </View>

        {item.status === "running" ? (
          <View style={styles.envStats}>
            <View style={styles.statItem}>
              <Feather name="cpu" size={12} color={Colors.dark.textSecondary} />
              <ThemedText style={styles.statValue}>{item.cpuUsage || 0}%</ThemedText>
            </View>
            <View style={styles.statItem}>
              <Feather name="database" size={12} color={Colors.dark.textSecondary} />
              <ThemedText style={styles.statValue}>{item.memoryUsage || 0}%</ThemedText>
            </View>
          </View>
        ) : null}

        <View style={styles.envActions}>
          <Pressable
            style={[
              styles.envActionButton,
              item.status === "running" ? styles.stopButton : styles.startButton,
            ]}
            onPress={() => handleToggleEnv(item)}
            disabled={item.status === "starting"}
          >
            <Feather
              name={item.status === "running" ? "square" : "play"}
              size={14}
              color={
                item.status === "running" ? Colors.dark.error : Colors.dark.buttonText
              }
            />
            <ThemedText
              style={[
                styles.envActionText,
                item.status === "running" && { color: Colors.dark.error },
              ]}
            >
              {item.status === "starting"
                ? "Starting..."
                : item.status === "running"
                  ? "Stop"
                  : "Start"}
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.envActionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Feather name="trash-2" size={14} color={Colors.dark.error} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Feather name="server" size={48} color={Colors.dark.textSecondary} />
      </View>
      <ThemedText style={styles.emptyTitle}>No Environments</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Create your first development environment to get started
      </ThemedText>
      <Pressable
        style={styles.createFirstButton}
        onPress={() => setShowModal(true)}
      >
        <Feather name="plus" size={18} color={Colors.dark.buttonText} />
        <ThemedText style={styles.createFirstText}>Create Environment</ThemedText>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: tabBarHeight }]}>
      <FlatList
        data={environments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          environments.length === 0 && styles.listContentEmpty,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {environments.length > 0 ? (
        <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
          <Feather name="plus" size={24} color={Colors.dark.buttonText} />
        </Pressable>
      ) : null}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeInUp.springify()}
            style={[styles.modalContent, { paddingBottom: insets.bottom + Spacing.lg }]}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>New Environment</ThemedText>
              <Pressable onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color={Colors.dark.text} />
              </Pressable>
            </View>

            <ThemedText style={styles.inputLabel}>Name</ThemedText>
            <TextInput
              style={styles.input}
              value={newEnvName}
              onChangeText={setNewEnvName}
              placeholder="my-environment"
              placeholderTextColor={Colors.dark.textSecondary}
            />

            <ThemedText style={styles.inputLabel}>Type</ThemedText>
            <View style={styles.typeSelector}>
              {envTypes.map((type) => {
                const available = isTypeAvailable(type.id);
                return (
                  <Pressable
                    key={type.id}
                    style={[
                      styles.typeOption,
                      newEnvType === type.id && styles.typeOptionSelected,
                      !available && styles.typeOptionDisabled,
                    ]}
                    onPress={() => {
                      if (available) {
                        setNewEnvType(type.id);
                      }
                    }}
                    disabled={!available}
                  >
                    <Feather
                      name={type.icon as any}
                      size={20}
                      color={
                        !available
                          ? Colors.dark.border
                          : newEnvType === type.id
                            ? Colors.dark.buttonText
                            : Colors.dark.textSecondary
                      }
                    />
                    <ThemedText
                      style={[
                        styles.typeLabel,
                        newEnvType === type.id && styles.typeLabelSelected,
                        !available && styles.typeLabelDisabled,
                      ]}
                    >
                      {type.label}
                    </ThemedText>
                    {!available ? (
                      <Feather
                        name="lock"
                        size={10}
                        color={Colors.dark.border}
                        style={styles.lockIcon}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.requirementsNote}>
              <Feather name="info" size={14} color={Colors.dark.textSecondary} />
              <ThemedText style={styles.requirementsText}>
                Some environment types require specific components to be downloaded first.
              </ThemedText>
            </View>

            <Pressable
              style={[styles.createButton, !newEnvName.trim() && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={!newEnvName.trim()}
            >
              <ThemedText style={styles.createButtonText}>Create</ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  listContent: {
    padding: Spacing.lg,
  },
  listContentEmpty: {
    flex: 1,
  },
  separator: {
    height: Spacing.md,
  },
  envCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  envCardPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  envHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  envIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  envInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  envName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  envType: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  envStats: {
    flexDirection: "row",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Spacing.xl,
  },
  statValue: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.xs,
  },
  envActions: {
    flexDirection: "row",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  envActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.sm,
  },
  startButton: {
    backgroundColor: Colors.dark.primary,
  },
  stopButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.dark.error,
  },
  deleteButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  envActionText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: Spacing.xs,
    color: Colors.dark.buttonText,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
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
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  createFirstButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xl,
  },
  createFirstText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.buttonText,
    marginLeft: Spacing.sm,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.lg + 60,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.xs,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.dark.text,
    fontFamily: Fonts?.mono || "monospace",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: Spacing.lg,
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  typeOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginHorizontal: 2,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  typeOptionSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  typeOptionDisabled: {
    opacity: 0.5,
  },
  typeLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.sm,
  },
  typeLabelSelected: {
    color: Colors.dark.buttonText,
  },
  typeLabelDisabled: {
    color: Colors.dark.border,
  },
  lockIcon: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  requirementsNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  requirementsText: {
    flex: 1,
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.sm,
    lineHeight: 16,
  },
  createButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.buttonText,
  },
});
