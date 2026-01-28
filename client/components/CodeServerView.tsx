import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import WebView from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { useServer } from "@/context/ServerContext";

export default function CodeServerView() {
  const { codeServerUrl, setCodeServerUrl, status, components, addLog } = useServer();
  const [inputUrl, setInputUrl] = useState(codeServerUrl || "");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWebView, setShowWebView] = useState(false);

  const codeServerDownloaded = components.find((c) => c.id === "code-server")?.status === "downloaded";

  const handleConnect = () => {
    if (!inputUrl.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCodeServerUrl(inputUrl.trim());
    setIsConnecting(true);
    addLog("info", `Connecting to code-server at ${inputUrl.trim()}`);
    setTimeout(() => {
      setIsConnecting(false);
      setShowWebView(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1000);
  };

  const handleDisconnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowWebView(false);
    addLog("info", "Disconnected from code-server");
  };

  if (showWebView && codeServerUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.webViewHeader}>
          <Pressable style={styles.backButton} onPress={handleDisconnect}>
            <Feather name="arrow-left" size={18} color={Colors.dark.text} />
          </Pressable>
          <View style={styles.urlBar}>
            <Feather name="lock" size={12} color={Colors.dark.primary} />
            <ThemedText style={styles.urlText} numberOfLines={1}>
              {codeServerUrl}
            </ThemedText>
          </View>
          <Pressable style={styles.refreshButton}>
            <Feather name="refresh-cw" size={16} color={Colors.dark.text} />
          </Pressable>
        </View>
        <WebView
          source={{ uri: codeServerUrl }}
          style={styles.webView}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.dark.primary} />
              <ThemedText style={styles.loadingText}>
                Loading code-server...
              </ThemedText>
            </View>
          )}
          onError={() => {
            addLog("error", "Failed to load code-server");
            setShowWebView(false);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="code" size={48} color={Colors.dark.primary} />
        </View>

        <ThemedText style={styles.title}>Code Editor</ThemedText>
        <ThemedText style={styles.description}>
          Connect to a running code-server instance to start coding
        </ThemedText>

        {!codeServerDownloaded ? (
          <View style={styles.warningBox}>
            <Feather name="alert-triangle" size={16} color={Colors.dark.warning} />
            <ThemedText style={styles.warningText}>
              code-server not downloaded. Go to Download Manager to install it.
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.connectBox}>
          <ThemedText style={styles.inputLabel}>Server URL</ThemedText>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder="http://localhost:8080"
              placeholderTextColor={Colors.dark.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <Pressable
            style={[styles.connectButton, !inputUrl.trim() && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={!inputUrl.trim() || isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color={Colors.dark.buttonText} />
            ) : (
              <>
                <Feather name="link" size={18} color={Colors.dark.buttonText} />
                <ThemedText style={styles.buttonText}>Connect</ThemedText>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.helpBox}>
          <ThemedText style={styles.helpTitle}>Quick Start</ThemedText>
          <View style={styles.helpStep}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              Download code-server from Download Manager
            </ThemedText>
          </View>
          <View style={styles.helpStep}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              Run: code-server --bind-addr 0.0.0.0:8080
            </ThemedText>
          </View>
          <View style={styles.helpStep}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              Enter the URL above and connect
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.backgroundDefault,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing["3xl"],
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.dark.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: Colors.dark.warning,
    marginLeft: Spacing.sm,
  },
  connectBox: {
    width: "100%",
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  inputRow: {
    marginBottom: Spacing.md,
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
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.buttonText,
    marginLeft: Spacing.sm,
  },
  helpBox: {
    width: "100%",
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  helpStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.dark.buttonText,
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  urlBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginHorizontal: Spacing.sm,
  },
  urlText: {
    flex: 1,
    fontSize: 12,
    color: Colors.dark.text,
    marginLeft: Spacing.sm,
    fontFamily: Fonts?.mono || "monospace",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.backgroundRoot,
  },
  loadingText: {
    marginTop: Spacing.lg,
    color: Colors.dark.textSecondary,
  },
});
