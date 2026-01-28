import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#C9D1D9",
    textSecondary: "#8B949E",
    buttonText: "#0D1117",
    tabIconDefault: "#8B949E",
    tabIconSelected: "#00FF87",
    link: "#00FF87",
    backgroundRoot: "#0D1117",
    backgroundDefault: "#161B22",
    backgroundSecondary: "#21262D",
    backgroundTertiary: "#30363D",
    border: "#30363D",
    error: "#FF6B6B",
    warning: "#F59E0B",
    success: "#00FF87",
    primary: "#00FF87",
  },
  dark: {
    text: "#C9D1D9",
    textSecondary: "#8B949E",
    buttonText: "#0D1117",
    tabIconDefault: "#8B949E",
    tabIconSelected: "#00FF87",
    link: "#00FF87",
    backgroundRoot: "#0D1117",
    backgroundDefault: "#161B22",
    backgroundSecondary: "#21262D",
    backgroundTertiary: "#30363D",
    border: "#30363D",
    error: "#FF6B6B",
    warning: "#F59E0B",
    success: "#00FF87",
    primary: "#00FF87",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  terminal: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "JetBrainsMono_400Regular",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "JetBrainsMono_400Regular",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
