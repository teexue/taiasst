// src/themes/purple.ts
// 紫色主题 - 2024年薰衣草紫色调 (现代浅色风格)
import { ThemeConfig } from "./base";
import { baseTheme } from "./base";

export const purpleTheme: ThemeConfig = {
  extend: "light",
  layout: baseTheme.light.layout,
  colors: {
    background: {
      DEFAULT: "#faf8ff", // 极浅薰衣草背景
      foreground: "#1e1b2e",
    },
    foreground: {
      DEFAULT: "#1e1b2e",
      50: "#faf8ff",
      100: "#f4f1fe",
      200: "#e9e5fd",
      300: "#ddd6fb",
      400: "#c7b8f7",
      500: "#a991f0",
      600: "#8b6ce8",
      700: "#7352d3",
      800: "#5a3fb1",
      900: "#4a2d91",
    },
    primary: {
      DEFAULT: "#8b5cf6", // 2024年流行薰衣草紫
      foreground: "#ffffff",
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7c3aed",
      800: "#6b46c1",
      900: "#581c87",
    },
    secondary: {
      DEFAULT: "#a78bfa", // 柔和次要紫
      foreground: "#ffffff",
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
    success: {
      DEFAULT: "#10d96b", // 薄荷翠绿
      foreground: "#ffffff",
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },
    warning: {
      DEFAULT: "#f59e0b", // 温和琥珀
      foreground: "#ffffff",
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
    danger: {
      DEFAULT: "#ef4444", // 柔和珊瑚红
      foreground: "#ffffff",
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
    divider: {
      DEFAULT: "#e9d5ff", // 薰衣草分割线
      foreground: "#6b7280",
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7c3aed",
      800: "#6b46c1",
      900: "#581c87",
    },
    content1: {
      DEFAULT: "#ffffff",
      foreground: "#1e1b2e",
    },
    content2: {
      DEFAULT: "#faf5ff", // 极浅紫
      foreground: "#2d2438",
    },
    content3: {
      DEFAULT: "#f3e8ff", // 浅紫雾
      foreground: "#3c2d4f",
    },
    content4: {
      DEFAULT: "#e9d5ff", // 薰衣草雾
      foreground: "#4a3566",
    },
    default: {
      DEFAULT: "#f8fafc",
      foreground: "#1e1b2e",
      50: "#ffffff",
      100: "#faf5ff",
      200: "#f3e8ff",
      300: "#e9d5ff",
      400: "#d8b4fe",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
    focus: {
      DEFAULT: "#8b5cf6", // 与primary保持一致
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7c3aed",
      800: "#6b46c1",
      900: "#581c87",
    },
  },
};
