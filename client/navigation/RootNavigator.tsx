import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import SetupWizardScreen from "@/screens/SetupWizardScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import DownloadManagerScreen from "@/screens/DownloadManagerScreen";
import { Colors, Fonts } from "@/constants/theme";
import { useServer } from "@/context/ServerContext";

export type RootStackParamList = {
  Main: undefined;
  Setup: undefined;
  Settings: undefined;
  DownloadManager: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isFirstRun } = useServer();

  return (
    <Stack.Navigator
      initialRouteName={isFirstRun ? "Setup" : "Main"}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.dark.backgroundRoot,
        },
        headerTintColor: Colors.dark.text,
        headerTitleStyle: {
          fontFamily: Fonts?.mono || "monospace",
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: Colors.dark.backgroundRoot,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Setup"
        component={SetupWizardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="DownloadManager"
        component={DownloadManagerScreen}
        options={{ title: "Download Manager" }}
      />
    </Stack.Navigator>
  );
}
