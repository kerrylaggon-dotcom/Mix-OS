import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootNavigator from "@/navigation/RootNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Colors } from "@/constants/theme";
import { ServerProvider } from "@/context/ServerContext";

SplashScreen.preventAutoHideAsync();

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.backgroundRoot,
    card: Colors.dark.backgroundDefault,
    text: Colors.dark.text,
    border: Colors.dark.border,
    primary: Colors.dark.primary,
  },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <KeyboardProvider>
              <ServerProvider>
                <NavigationContainer theme={customDarkTheme}>
                  <RootNavigator />
                </NavigationContainer>
              </ServerProvider>
              <StatusBar style="light" />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
    alignItems: "center",
    justifyContent: "center",
  },
});
