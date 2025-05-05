// src/themes/red.ts
// 红色主题 - 热情红色调
import { ThemeConfig } from "./base";

export const redTheme: ThemeConfig = {
  extend: "light", // 继承浅色主题的基本设置
  colors: {
    background: {
      DEFAULT: "#fff0f0", // 淡红背景
      foreground: "#332424",
    },
    foreground: {
      DEFAULT: "#11181C", // Updated for contrast
      50: "#fcf7f7",
      100: "#e5e7ea",
      200: "#c5c9ce",
      300: "#a5abb2",
      400: "#7d8695",
      500: "#5c6370",
      600: "#4a4a4a",
      700: "#332424",
      800: "#2a1d1d",
      900: "#211616",
    },
    primary: {
      DEFAULT: "#ef4444", // 红色主色调
      foreground: "#ffffff",
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444", // 主色
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
    secondary: {
      DEFAULT: "#f87171", // 辅助红色
      foreground: "#ffffff",
      50: "#fef2f2",
      100: "#fee5e5",
      200: "#fdcccc",
      300: "#fcb2b2",
      400: "#fa9999",
      500: "#f87171", // 辅助色
      600: "#c65a5a",
      700: "#954444",
      800: "#632d2d",
      900: "#321717",
    },
    success: {
      DEFAULT: "#10b981",
      foreground: "#ffffff",
      50: "#e6f9f2",
      100: "#ccf3e5",
      200: "#99e7cb",
      300: "#66dbb1",
      400: "#33cf97",
      500: "#10b981",
      600: "#0d9468",
      700: "#0a6f4d",
      800: "#064a33",
      900: "#03251a",
    },
    warning: {
      DEFAULT: "#f59e0b",
      foreground: "#ffffff",
      50: "#fdf9e6",
      100: "#fdf3cc",
      200: "#fbe799",
      300: "#f9db66",
      400: "#f7cf33",
      500: "#f59e0b",
      600: "#c47e09",
      700: "#935f06",
      800: "#623f04",
      900: "#312002",
    },
    danger: {
      DEFAULT: "#dc2626", // 更强烈的红色
      foreground: "#ffffff",
      50: "#fbe9e9",
      100: "#f7d3d3",
      200: "#efa7a7",
      300: "#e77b7b",
      400: "#df4f4f",
      500: "#dc2626",
      600: "#b01e1e",
      700: "#841717",
      800: "#580f0f",
      900: "#2c0808",
    },
    divider: {
      DEFAULT: "#f7e6e6",
      foreground: "#332424",
      50: "#fff7f7",
      100: "#fff0f0",
      200: "#f7e6e6",
      300: "#efd8d8",
      400: "#e7caca",
      500: "#dfbcbc",
      600: "#d79c9c",
      700: "#af7c7c",
      800: "#875c5c",
      900: "#5f3c3c",
    },
    content1: {
      DEFAULT: "#ffffff",
      foreground: "#332424",
    },
    content2: {
      DEFAULT: "#fcf7f7",
      foreground: "#332424",
    },
    content3: {
      DEFAULT: "#fff0f0",
      foreground: "#332424",
    },
    content4: {
      DEFAULT: "#fef2f2",
      foreground: "#332424",
    },
    default: {
      DEFAULT: "#fcf7f7",
      foreground: "#332424",
      50: "#ffffff",
      100: "#fdfbfb",
      200: "#fcf7f7",
      300: "#f5efef",
      400: "#eee7e7",
      500: "#4a4a4a",
      600: "#d7cfcf",
      700: "#c7bfbf",
      800: "#b7afaf",
      900: "#a79f9f",
    },
    focus: {
      DEFAULT: "#ef4444", // 对应主色
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
  },
};
