import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { useServer } from "@/context/ServerContext";

export default function TerminalView() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const { terminalOutput, addTerminalOutput, clearTerminalOutput, status, setStatus, addLog, components, downloadComponent } =
    useServer();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [terminalOutput]);

  const handleCommand = () => {
    if (!input.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const cmd = input.trim().toLowerCase();
    addTerminalOutput(`$ ${input}`);
    setInput("");

    switch (cmd) {
      case "help":
        addTerminalOutput("Available commands:");
        addTerminalOutput("  help       - Show this help message");
        addTerminalOutput("  status     - Show server status");
        addTerminalOutput("  start      - Start code-server");
        addTerminalOutput("  stop       - Stop code-server");
        addTerminalOutput("  download   - Download components");
        addTerminalOutput("  ls         - List files");
        addTerminalOutput("  clear      - Clear terminal");
        addTerminalOutput("  version    - Show version info");
        addTerminalOutput("");
        break;

      case "status":
        addTerminalOutput(`Server status: ${status}`);
        addTerminalOutput(`Components downloaded: ${components.filter((c) => c.status === "downloaded").length}/${components.length}`);
        addTerminalOutput("");
        break;

      case "start":
        if (status === "stopped") {
          setStatus("starting");
          addTerminalOutput("Starting code-server...");
          addLog("info", "Starting code-server from terminal");
          setTimeout(() => {
            setStatus("running");
            addTerminalOutput("code-server started on port 8080");
            addTerminalOutput("");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }, 1500);
        } else {
          addTerminalOutput("Server is already running");
          addTerminalOutput("");
        }
        break;

      case "stop":
        if (status === "running") {
          setStatus("stopped");
          addTerminalOutput("code-server stopped");
          addLog("info", "Stopped code-server from terminal");
          addTerminalOutput("");
        } else {
          addTerminalOutput("Server is not running");
          addTerminalOutput("");
        }
        break;

      case "download":
        addTerminalOutput("Available components:");
        components.forEach((c) => {
          addTerminalOutput(`  ${c.id} (${c.status}) - ${c.size}`);
        });
        addTerminalOutput("");
        addTerminalOutput("Use 'download <component>' to install");
        addTerminalOutput("");
        break;

      case "ls":
        addTerminalOutput("drwxr-xr-x  2 user user 4096 Jan 28 12:00 .");
        addTerminalOutput("drwxr-xr-x  3 user user 4096 Jan 28 12:00 ..");
        addTerminalOutput("-rw-r--r--  1 user user  220 Jan 28 12:00 .bashrc");
        addTerminalOutput("drwxr-xr-x  2 user user 4096 Jan 28 12:00 workspace");
        addTerminalOutput("");
        break;

      case "clear":
        clearTerminalOutput();
        break;

      case "version":
        addTerminalOutput("Code Server Terminal v0.1.0");
        addTerminalOutput("Phase 0 - AI Development Preview");
        addTerminalOutput("Built with Expo for cross-platform deployment");
        addTerminalOutput("");
        break;

      default:
        if (cmd.startsWith("download ")) {
          const componentId = cmd.replace("download ", "").trim();
          const component = components.find((c) => c.id === componentId);
          if (component) {
            if (component.status === "downloaded") {
              addTerminalOutput(`${component.name} is already downloaded`);
              addTerminalOutput("");
            } else {
              downloadComponent(componentId);
            }
          } else {
            addTerminalOutput(`Component '${componentId}' not found`);
            addTerminalOutput("");
          }
        } else {
          addTerminalOutput(`command not found: ${cmd}`);
          addTerminalOutput("Type 'help' for available commands");
          addTerminalOutput("");
        }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={120}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.output}
        contentContainerStyle={styles.outputContent}
      >
        {terminalOutput.map((line, index) => (
          <ThemedText key={index} style={styles.outputLine}>
            {line}
          </ThemedText>
        ))}
        <View style={styles.cursorLine}>
          <ThemedText style={styles.cursor}>_</ThemedText>
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <ThemedText style={styles.prompt}>$</ThemedText>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleCommand}
          placeholder="Type a command..."
          placeholderTextColor={Colors.dark.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
        />
        <Pressable style={styles.sendButton} onPress={handleCommand}>
          <Feather name="corner-down-left" size={18} color={Colors.dark.primary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  output: {
    flex: 1,
  },
  outputContent: {
    padding: Spacing.md,
  },
  outputLine: {
    fontSize: 13,
    fontFamily: Fonts?.mono || "monospace",
    color: Colors.dark.text,
    lineHeight: 20,
  },
  cursorLine: {
    marginTop: Spacing.xs,
  },
  cursor: {
    fontSize: 13,
    fontFamily: Fonts?.mono || "monospace",
    color: Colors.dark.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  prompt: {
    fontSize: 14,
    fontFamily: Fonts?.mono || "monospace",
    color: Colors.dark.primary,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
    fontFamily: Fonts?.mono || "monospace",
    color: Colors.dark.text,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
});
