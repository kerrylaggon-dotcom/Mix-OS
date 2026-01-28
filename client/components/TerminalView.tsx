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

const API_BASE = "http://localhost:5000/api";

export default function TerminalView() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const {
    terminalOutput,
    addTerminalOutput,
    clearTerminalOutput,
    status,
    setStatus,
    addLog,
    components,
    downloadComponent,
    startCodeServer,
    stopCodeServer,
    checkCodeServerStatus,
  } = useServer();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [terminalOutput]);

  const handleCommand = async () => {
    if (!input.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const fullCmd = input.trim();
    const [cmd, ...args] = fullCmd.split(" ");
    const lowerCmd = cmd.toLowerCase();
    addTerminalOutput(`$ ${fullCmd}`);
    setInput("");

    // Special commands
    if (["start", "stop", "download"].includes(lowerCmd)) {
      // Handle locally or via API
      switch (lowerCmd) {
        case "start":
          addTerminalOutput("Starting code-server...");
          startCodeServer();
          break;
        case "stop":
          addTerminalOutput("Stopping code-server...");
          stopCodeServer();
          break;
        case "download":
          if (args.length === 0) {
            addTerminalOutput("Available components:");
            components.forEach((c) => {
              addTerminalOutput(`  ${c.id} (${c.status}) - ${c.size}`);
            });
            addTerminalOutput("");
            addTerminalOutput("Use 'download <component>' to install");
            addTerminalOutput("");
          } else {
            const componentId = args[0];
            const component = components.find((c) => c.id === componentId);
            if (component) {
              downloadComponent(componentId);
            } else {
              addTerminalOutput(`Component '${componentId}' not found`);
              addTerminalOutput("");
            }
          }
          break;
      }
    } else {
      // Execute via API
      try {
        const response = await fetch(`${API_BASE}/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: fullCmd }),
        });
        const data = await response.json();
        if (data.output) {
          data.output
            .split("\n")
            .forEach((line: string) => addTerminalOutput(line));
        }
        addTerminalOutput("");
      } catch (error) {
        addTerminalOutput(`Error: ${(error as Error).message}`);
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
          <Feather
            name="corner-down-left"
            size={18}
            color={Colors.dark.primary}
          />
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
