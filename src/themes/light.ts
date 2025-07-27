// src/themes/light.ts
// 浅色主题 - 2024年现代设计更新版
import { ThemeConfig } from "./base";
import { baseTheme } from "./base";

export const lightTheme: ThemeConfig = {
  extend: "light",
  layout: baseTheme.light.layout,
  colors: {
    default: {
      "50": "#fafafa",
      "100": "#f4f4f5",
      "200": "#e4e4e7",
      "300": "#d4d4d8",
      "400": "#a1a1aa",
      "500": "#71717a",
      "600": "#52525b",
      "700": "#3f3f46",
      "800": "#27272a",
      "900": "#18181b",
      foreground: "#18181b",
      DEFAULT: "#71717a",
    },
    primary: {
      "50": "#f0f3ff",
      "100": "#e0e7ff",
      "200": "#c7d2fe",
      "300": "#a5b4fc",
      "400": "#818cf8",
      "500": "#6366f1", // 现代靛蓝 - 2024年流行色
      "600": "#4f46e5",
      "700": "#4338ca",
      "800": "#3730a3",
      "900": "#312e81",
      foreground: "#ffffff",
      DEFAULT: "#6366f1",
    },
    secondary: {
      "50": "#f8fafc",
      "100": "#f1f5f9",
      "200": "#e2e8f0",
      "300": "#cbd5e1",
      "400": "#94a3b8",
      "500": "#64748b", // 柔和石板蓝
      "600": "#475569",
      "700": "#334155",
      "800": "#1e293b",
      "900": "#0f172a",
      foreground: "#ffffff",
      DEFAULT: "#64748b",
    },
    success: {
      "50": "#f0fdf4",
      "100": "#dcfce7",
      "200": "#bbf7d0",
      "300": "#86efac",
      "400": "#4ade80",
      "500": "#22c55e", // 现代翠绿
      "600": "#16a34a",
      "700": "#15803d",
      "800": "#166534",
      "900": "#14532d",
      foreground: "#ffffff",
      DEFAULT: "#22c55e",
    },
    warning: {
      "50": "#fffbeb",
      "100": "#fef3c7",
      "200": "#fde68a",
      "300": "#fcd34d",
      "400": "#fbbf24",
      "500": "#f59e0b", // 柔和琥珀色
      "600": "#d97706",
      "700": "#b45309",
      "800": "#92400e",
      "900": "#78350f",
      foreground: "#ffffff",
      DEFAULT: "#f59e0b",
    },
    danger: {
      "50": "#fef2f2",
      "100": "#fee2e2",
      "200": "#fecaca",
      "300": "#fca5a5",
      "400": "#f87171",
      "500": "#ef4444", // 柔和红色
      "600": "#dc2626",
      "700": "#b91c1c",
      "800": "#991b1b",
      "900": "#7f1d1d",
      foreground: "#ffffff",
      DEFAULT: "#ef4444",
    },
    background: "#ffffff", // 纯白背景
    foreground: "#0f172a", // 深度文字色
    content1: {
      DEFAULT: "#ffffff",
      foreground: "#0f172a",
    },
    content2: {
      DEFAULT: "#f8fafc",
      foreground: "#1e293b",
    },
    content3: {
      DEFAULT: "#f1f5f9",
      foreground: "#334155",
    },
    content4: {
      DEFAULT: "#e2e8f0",
      foreground: "#475569",
    },
    focus: "#6366f1", // 与primary保持一致
    overlay: "#000000",
    divider: {
      DEFAULT: "#e2e8f0",
      foreground: "#64748b",
    },
  },
};
