import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";
import { ServerStatus } from "@/context/ServerContext";

interface StatusIndicatorProps {
  status: ServerStatus;
  showLabel?: boolean;
  size?: "small" | "medium";
}

const statusConfig: Record<
  ServerStatus,
  { color: string; label: string; pulse: boolean }
> = {
  running: { color: Colors.dark.success, label: "Running", pulse: true },
  starting: { color: Colors.dark.warning, label: "Starting", pulse: true },
  stopped: { color: Colors.dark.textSecondary, label: "Stopped", pulse: false },
  error: { color: Colors.dark.error, label: "Error", pulse: false },
};

export function StatusIndicator({
  status,
  showLabel = true,
  size = "small",
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (config.pulse) {
      opacity.value = withRepeat(
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      opacity.value = 1;
    }
  }, [config.pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const dotSize = size === "small" ? 8 : 10;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, backgroundColor: config.color },
          animatedStyle,
        ]}
      />
      {showLabel ? (
        <ThemedText style={[styles.label, { color: config.color }]}>
          {config.label}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: Spacing.sm,
  },
});
