import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInRight,
  FadeOutLeft,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useServer } from "@/context/ServerContext";
import { RootStackParamList } from "@/navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const steps = [
  {
    id: "welcome",
    title: "Welcome to Code Server",
    description:
      "Run VS Code in your browser, powered by NixOS and QEMU. Build and develop anywhere on your Android device.",
    icon: "terminal",
  },
  {
    id: "components",
    title: "Download Components",
    description:
      "To run code-server, you need to download the required components. This can be done now or later from the Download Manager.",
    icon: "download",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description:
      "Your code-server environment is ready to be configured. Start by downloading the required components.",
    icon: "check-circle",
  },
];

export default function SetupWizardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { completeSetup, addLog, components } = useServer();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep === steps.length - 1) {
      completeSetup();
      addLog("info", "Setup wizard completed");
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeSetup();
    addLog("info", "Setup wizard skipped");
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  const step = steps[currentStep];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.progressBar}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        {currentStep < steps.length - 1 ? (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <ThemedText style={styles.skipText}>Skip</ThemedText>
          </Pressable>
        ) : null}
      </View>

      <Animated.View
        key={currentStep}
        entering={FadeInRight.springify()}
        exiting={FadeOutLeft.springify()}
        style={styles.content}
      >
        <View style={styles.iconContainer}>
          <Feather
            name={step.icon as any}
            size={64}
            color={Colors.dark.primary}
          />
        </View>

        <ThemedText style={styles.title}>{step.title}</ThemedText>
        <ThemedText style={styles.description}>{step.description}</ThemedText>

        {currentStep === 1 ? (
          <View style={styles.componentsList}>
            {components.slice(0, 3).map((component) => (
              <View key={component.id} style={styles.componentItem}>
                <View style={styles.componentIcon}>
                  <Feather
                    name={
                      component.id === "code-server"
                        ? "code"
                        : component.id === "nix"
                          ? "box"
                          : "cpu"
                    }
                    size={16}
                    color={Colors.dark.primary}
                  />
                </View>
                <View style={styles.componentInfo}>
                  <ThemedText style={styles.componentName}>
                    {component.name}
                  </ThemedText>
                  <ThemedText style={styles.componentSize}>
                    {component.size}
                  </ThemedText>
                </View>
                <Feather
                  name={
                    component.status === "downloaded"
                      ? "check-circle"
                      : "circle"
                  }
                  size={18}
                  color={
                    component.status === "downloaded"
                      ? Colors.dark.success
                      : Colors.dark.textSecondary
                  }
                />
              </View>
            ))}
            <ThemedText style={styles.moreComponentsNote}>
              + {components.length - 3} more components available
            </ThemedText>
          </View>
        ) : null}

        {currentStep === 2 ? (
          <View style={styles.completeContainer}>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Feather
                  name="terminal"
                  size={16}
                  color={Colors.dark.primary}
                />
                <ThemedText style={styles.featureText}>
                  Interactive terminal with command support
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <Feather name="code" size={16} color={Colors.dark.primary} />
                <ThemedText style={styles.featureText}>
                  WebView-based code editor integration
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <Feather name="server" size={16} color={Colors.dark.primary} />
                <ThemedText style={styles.featureText}>
                  Environment management for VMs
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <Feather
                  name="download"
                  size={16}
                  color={Colors.dark.primary}
                />
                <ThemedText style={styles.featureText}>
                  Download manager for components
                </ThemedText>
              </View>
            </View>
          </View>
        ) : null}
      </Animated.View>

      <View style={styles.footer}>
        {currentStep > 0 ? (
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Feather name="arrow-left" size={20} color={Colors.dark.text} />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}

        <Pressable style={styles.nextButton} onPress={handleNext}>
          <ThemedText style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
          </ThemedText>
          <Feather
            name="arrow-right"
            size={20}
            color={Colors.dark.buttonText}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  progressBar: {
    flexDirection: "row",
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.border,
    marginRight: Spacing.sm,
  },
  progressDotActive: {
    backgroundColor: Colors.dark.primary,
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  skipText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.dark.backgroundDefault,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["3xl"],
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  componentsList: {
    width: "100%",
    marginTop: Spacing["3xl"],
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  componentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  componentIcon: {
    width: 32,
    height: 32,
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
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  componentSize: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  moreComponentsNote: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  completeContainer: {
    width: "100%",
    marginTop: Spacing["3xl"],
  },
  featureList: {
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  featureText: {
    fontSize: 13,
    color: Colors.dark.text,
    marginLeft: Spacing.md,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spacer: {
    flex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  backButtonText: {
    fontSize: 14,
    color: Colors.dark.text,
    marginLeft: Spacing.sm,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.buttonText,
    marginRight: Spacing.sm,
  },
});
