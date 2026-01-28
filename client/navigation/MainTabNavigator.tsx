import React from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import WorkspaceScreen from "@/screens/WorkspaceScreen";
import EnvironmentsScreen from "@/screens/EnvironmentsScreen";
import LogsScreen from "@/screens/LogsScreen";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { useServer } from "@/context/ServerContext";
import { StatusIndicator } from "@/components/StatusIndicator";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootNavigator";

export type MainTabParamList = {
  Workspace: undefined;
  Environments: undefined;
  Logs: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function CustomHeader() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { status, components } = useServer();

  const downloadedCount = components.filter(
    (c) => c.status === "downloaded",
  ).length;
  const totalCount = components.length;

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.headerLeft}>
        <View style={styles.logoContainer}>
          <Feather name="terminal" size={20} color={Colors.dark.primary} />
        </View>
        <View style={styles.headerTitle}>
          <ThemedText style={styles.appName}>Code Server</ThemedText>
          <View style={styles.statusRow}>
            <StatusIndicator status={status} showLabel={false} size="small" />
            <ThemedText style={styles.statusText}>
              {downloadedCount}/{totalCount} components
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.headerRight}>
        <Pressable
          style={styles.headerButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("DownloadManager");
          }}
        >
          <Feather name="download" size={20} color={Colors.dark.text} />
        </Pressable>
        <Pressable
          style={styles.headerButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("Settings");
          }}
        >
          <Feather name="settings" size={20} color={Colors.dark.text} />
        </Pressable>
      </View>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <View style={styles.container}>
      <CustomHeader />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.dark.primary,
          tabBarInactiveTintColor: Colors.dark.textSecondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                intensity={100}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            ) : null,
        }}
      >
        <Tab.Screen
          name="Workspace"
          component={WorkspaceScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name="monitor" size={size} color={color} />
            ),
            tabBarLabel: "Workspace",
          }}
        />
        <Tab.Screen
          name="Environments"
          component={EnvironmentsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name="server" size={size} color={color} />
            ),
            tabBarLabel: "Environments",
          }}
        />
        <Tab.Screen
          name="Logs"
          component={LogsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name="file-text" size={size} color={color} />
            ),
            tabBarLabel: "Logs",
          }}
        />
      </Tab.Navigator>
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
    paddingBottom: Spacing.md,
    backgroundColor: Colors.dark.backgroundDefault,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    marginLeft: Spacing.md,
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.sm,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
  },
  tabBar: {
    position: "absolute",
    backgroundColor: Platform.select({
      ios: "transparent",
      android: Colors.dark.backgroundDefault,
    }),
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    height: 60,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 10,
    fontFamily: Fonts?.mono || "monospace",
    fontWeight: "500",
  },
});
