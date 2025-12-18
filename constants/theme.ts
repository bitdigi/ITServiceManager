/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0066CC"; // Professional Blue
const tintColorDark = "#fff";

const successGreen = "#00A86B";
const alertOrange = "#FF6B35";
const dangerRed = "#DC143C";
const lightGray = "#F8F9FA";
const mediumGray = "#666666";
const borderGray = "#E0E0E0";

export const Colors = {
  light: {
    text: "#1A1A1A",
    background: lightGray,
    tint: tintColorLight,
    icon: mediumGray,
    tabIconDefault: mediumGray,
    tabIconSelected: tintColorLight,
    surface: "#FFFFFF",
    textSecondary: mediumGray,
    border: borderGray,
    success: successGreen,
    warning: alertOrange,
    danger: dangerRed,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    surface: "#1E1E1E",
    textSecondary: "#A0A0A0",
    border: "#333333",
    success: successGreen,
    warning: alertOrange,
    danger: dangerRed,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
