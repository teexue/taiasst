// src/themes/pink.ts
// 粉色主题 - 2024年珊瑚粉色调 (温暖现代风格)
import { ThemeConfig } from "./base";
import { baseTheme } from "./base";

export const pinkTheme: ThemeConfig = {
  extend: "light",
  layout: baseTheme.light.layout,
  colors: {
    default: {
      "50": "#fdf2f8",
      "100": "#fce7f3",
      "200": "#fbcfe8",
      "300": "#f9a8d4",
      "400": "#f472b6",
      "500": "#ec4899",
      "600": "#db2777",
      "700": "#be185d",
      "800": "#9d174d",
      "900": "#831843",
      foreground: "#831843",
      DEFAULT: "#ec4899",
    },
    primary: {
      "50": "#fdf2f8",
      "100": "#fce7f3",
      "200": "#fbcfe8",
      "300": "#f9a8d4",
      "400": "#f472b6",
      "500": "#ec4899", // 现代珊瑚粉 - 2024年温暖色调
      "600": "#db2777",
      "700": "#be185d",
      "800": "#9d174d",
      "900": "#831843",
      foreground: "#ffffff",
      DEFAULT: "#ec4899",
    },
    secondary: {
      "50": "#fef7f2",
      "100": "#fef0e6",
      "200": "#feddd9",
      "300": "#fdc4bd",
      "400": "#fb9d8c",
      "500": "#f87171", // 温和桃色
      "600": "#f56565",
      "700": "#e53e3e",
      "800": "#c53030",
      "900": "#9c2020",
      foreground: "#ffffff",
      DEFAULT: "#f87171",
    },
    success: {
      "50": "#f0fdf4",
      "100": "#dcfce7",
      "200": "#bbf7d0",
      "300": "#86efac",
      "400": "#4ade80",
      "500": "#22c55e", // 薄荷绿平衡
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
      "500": "#f59e0b", // 金色琥珀
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
      "500": "#ef4444", // 温和红色
      "600": "#dc2626",
      "700": "#b91c1c",
      "800": "#991b1b",
      "900": "#7f1d1d",
      foreground: "#ffffff",
      DEFAULT: "#ef4444",
    },
    background: "#fef9f8", // 极浅粉色背景
    foreground: "#4a1a23", // 深玫瑰褐色文字
    content1: {
      DEFAULT: "#ffffff",
      foreground: "#4a1a23",
    },
    content2: {
      DEFAULT: "#fdf2f8", // 极浅粉雾
      foreground: "#5d2034",
    },
    content3: {
      DEFAULT: "#fce7f3", // 浅粉雾
      foreground: "#702645",
    },
    content4: {
      DEFAULT: "#fbcfe8", // 粉色雾霭
      foreground: "#832c56",
    },
    focus: "#ec4899", // 与primary保持一致
    overlay: "#000000",
    divider: {
      DEFAULT: "#fce7f3", // 粉色分割线
      foreground: "#9d174d",
    },
  },
};
