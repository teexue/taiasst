// src/themes/dark.ts
// 深色主题 - 2024年现代设计更新版
import { ThemeConfig } from "./base";
import { baseTheme } from "./base";

export const darkTheme: ThemeConfig = {
  extend: "dark",
  layout: baseTheme.dark.layout,
  colors: {
    default: {
      "50": "#09090b",
      "100": "#18181b",
      "200": "#27272a",
      "300": "#3f3f46",
      "400": "#52525b",
      "500": "#71717a",
      "600": "#a1a1aa",
      "700": "#d4d4d8",
      "800": "#e4e4e7",
      "900": "#f4f4f5",
      foreground: "#f4f4f5",
      DEFAULT: "#71717a",
    },
    primary: {
      "50": "#312e81",
      "100": "#3730a3",
      "200": "#4338ca",
      "300": "#4f46e5",
      "400": "#6366f1",
      "500": "#818cf8", // 亮化主色以适应深色背景
      "600": "#a5b4fc",
      "700": "#c7d2fe",
      "800": "#e0e7ff",
      "900": "#f0f3ff",
      foreground: "#000000",
      DEFAULT: "#818cf8",
    },
    secondary: {
      "50": "#0f172a",
      "100": "#1e293b",
      "200": "#334155",
      "300": "#475569",
      "400": "#64748b",
      "500": "#94a3b8", // 柔和石板蓝(深色版)
      "600": "#cbd5e1",
      "700": "#e2e8f0",
      "800": "#f1f5f9",
      "900": "#f8fafc",
      foreground: "#000000",
      DEFAULT: "#94a3b8",
    },
    success: {
      "50": "#14532d",
      "100": "#166534",
      "200": "#15803d",
      "300": "#16a34a",
      "400": "#22c55e",
      "500": "#4ade80", // 提亮绿色
      "600": "#86efac",
      "700": "#bbf7d0",
      "800": "#dcfce7",
      "900": "#f0fdf4",
      foreground: "#000000",
      DEFAULT: "#4ade80",
    },
    warning: {
      "50": "#78350f",
      "100": "#92400e",
      "200": "#b45309",
      "300": "#d97706",
      "400": "#f59e0b",
      "500": "#fbbf24", // 提亮琥珀色
      "600": "#fcd34d",
      "700": "#fde68a",
      "800": "#fef3c7",
      "900": "#fffbeb",
      foreground: "#000000",
      DEFAULT: "#fbbf24",
    },
    danger: {
      "50": "#7f1d1d",
      "100": "#991b1b",
      "200": "#b91c1c",
      "300": "#dc2626",
      "400": "#ef4444",
      "500": "#f87171", // 提亮红色
      "600": "#fca5a5",
      "700": "#fecaca",
      "800": "#fee2e2",
      "900": "#fef2f2",
      foreground: "#000000",
      DEFAULT: "#f87171",
    },
    background: "#0a0a0b", // 更深邃的黑色背景
    foreground: "#fafafa", // 高对比度白色文字
    content1: {
      DEFAULT: "#18181b", // 深灰卡片
      foreground: "#fafafa",
    },
    content2: {
      DEFAULT: "#27272a", // 中灰层级
      foreground: "#f4f4f5",
    },
    content3: {
      DEFAULT: "#3f3f46", // 浅灰层级
      foreground: "#e4e4e7",
    },
    content4: {
      DEFAULT: "#52525b", // 最浅层级
      foreground: "#d4d4d8",
    },
    focus: "#818cf8", // 与primary保持一致
    overlay: "#000000",
    divider: {
      DEFAULT: "#27272a", // 深色分割线
      foreground: "#a1a1aa",
    },
  },
};
