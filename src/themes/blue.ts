// src/themes/blue.ts
// 蓝色主题 - 2024年天空蓝色调 (现代浅色风格)
import { ThemeConfig } from "./base";
import { baseTheme } from "./base";

export const blueTheme: ThemeConfig = {
  extend: "light",
  layout: baseTheme.light.layout,
  colors: {
    default: {
      "50": "#f8fafc",
      "100": "#f1f5f9",
      "200": "#e2e8f0",
      "300": "#cbd5e1",
      "400": "#94a3b8",
      "500": "#64748b",
      "600": "#475569",
      "700": "#334155",
      "800": "#1e293b",
      "900": "#0f172a",
      foreground: "#0f172a",
      DEFAULT: "#64748b",
    },
    primary: {
      "50": "#eff6ff",
      "100": "#dbeafe",
      "200": "#bfdbfe",
      "300": "#93c5fd",
      "400": "#60a5fa",
      "500": "#3b82f6", // 现代天空蓝 - 2024年流行色
      "600": "#2563eb",
      "700": "#1d4ed8",
      "800": "#1e40af",
      "900": "#1e3a8a",
      foreground: "#ffffff",
      DEFAULT: "#3b82f6",
    },
    secondary: {
      "50": "#f0f9ff",
      "100": "#e0f2fe",
      "200": "#bae6fd",
      "300": "#7dd3fc",
      "400": "#38bdf8",
      "500": "#0ea5e9", // 现代青蓝
      "600": "#0284c7",
      "700": "#0369a1",
      "800": "#075985",
      "900": "#0c4a6e",
      foreground: "#ffffff",
      DEFAULT: "#0ea5e9",
    },
    success: {
      "50": "#ecfdf5",
      "100": "#d1fae5",
      "200": "#a7f3d0",
      "300": "#6ee7b7",
      "400": "#34d399",
      "500": "#10b981", // 翠绿
      "600": "#059669",
      "700": "#047857",
      "800": "#065f46",
      "900": "#064e3b",
      foreground: "#ffffff",
      DEFAULT: "#10b981",
    },
    warning: {
      "50": "#fffbeb",
      "100": "#fef3c7",
      "200": "#fde68a",
      "300": "#fcd34d",
      "400": "#fbbf24",
      "500": "#f59e0b", // 琥珀
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
      "500": "#ef4444", // 柔和红
      "600": "#dc2626",
      "700": "#b91c1c",
      "800": "#991b1b",
      "900": "#7f1d1d",
      foreground: "#ffffff",
      DEFAULT: "#ef4444",
    },
    background: "#fafbfc", // 极浅蓝灰背景
    foreground: "#0f172a", // 深蓝灰文字
    content1: {
      DEFAULT: "#ffffff",
      foreground: "#0f172a",
    },
    content2: {
      DEFAULT: "#f8fafc", // 极浅灰蓝
      foreground: "#1e293b",
    },
    content3: {
      DEFAULT: "#f1f5f9", // 浅蓝灰
      foreground: "#334155",
    },
    content4: {
      DEFAULT: "#e2e8f0", // 蓝灰雾
      foreground: "#475569",
    },
    focus: "#3b82f6", // 与primary保持一致
    overlay: "#000000",
    divider: {
      DEFAULT: "#e2e8f0", // 蓝灰分割线
      foreground: "#64748b",
    },
  },
};
