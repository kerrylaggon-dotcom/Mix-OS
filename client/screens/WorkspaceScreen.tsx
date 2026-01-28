import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useServer } from "@/context/ServerContext";
import TerminalView from "@/components/TerminalView";
import CodeServerView from "@/components/CodeServerView";

const { width } = Dimensions.get("window");

const tabs = [
  { id: "terminal", label: "Terminal", icon: "terminal" },
  { id: "code", label: "Code Editor", icon: "code" },
];

export default function WorkspaceScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleTabPress = (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentPage(index);
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newPage = Math.round(offsetX / width);
    if (newPage !== currentPage) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentPage(newPage);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: tabBarHeight }]}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, currentPage === index && styles.tabActive]}
            onPress={() => handleTabPress(index)}
          >
            <Feather
              name={tab.icon as any}
              size={16}
              color={
                currentPage === index
                  ? Colors.dark.primary
                  : Colors.dark.textSecondary
              }
            />
            <ThemedText
              style={[
                styles.tabLabel,
                currentPage === index && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.pager}
        contentContainerStyle={styles.pagerContent}
      >
        <View style={[styles.page, { width }]}>
          <TerminalView />
        </View>
        <View style={[styles.page, { width }]}>
          <CodeServerView />
        </View>
      </ScrollView>

      <View style={styles.swipeHint}>
        <View style={[styles.dot, currentPage === 0 && styles.dotActive]} />
        <View style={[styles.dot, currentPage === 1 && styles.dotActive]} />
        <ThemedText style={styles.swipeText}>Swipe to switch views</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.backgroundDefault,
  },
  tabActive: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  tabLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.xs,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: Colors.dark.primary,
  },
  pager: {
    flex: 1,
  },
  pagerContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
  },
  swipeHint: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.dark.backgroundDefault,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.dark.primary,
    width: 18,
    borderRadius: 3,
  },
  swipeText: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.md,
  },
});
