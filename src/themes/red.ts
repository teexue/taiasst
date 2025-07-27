// src/themes/red.ts
// 红色主题 - 热情红色调 (浅色风格)
import { ThemeConfig } from "./base";
import { baseTheme } from "./base";
export const redTheme: ThemeConfig = {
  extend: "light",
  layout: baseTheme.light.layout,
  colors: {
    default: {
      "50": "#fef5f5",
      "100": "#fde6e6",
      "200": "#fbd0d0",
      "300": "#f9b5b5",
      "400": "#f58080",
      "500": "#f04444",
      "600": "#d63939",
      "700": "#a42c2c",
      "800": "#731f1f",
      "900": "#421111",
      foreground: "#000",
      DEFAULT: "#f04444",
    },
    primary: {
      "50": "#fef2f2",
      "100": "#fee2e2",
      "200": "#fecaca",
      "300": "#fca5a5",
      "400": "#f87171",
      "500": "#ef4444", // 主色
      "600": "#dc2626",
      "700": "#b91c1c",
      "800": "#991b1b",
      "900": "#7f1d1d",
      foreground: "#fff",
      DEFAULT: "#ef4444",
    },
    secondary: {
      "50": "#fff1f1",
      "100": "#ffe1e1",
      "200": "#ffc2c2",
      "300": "#ffa3a3",
      "400": "#ff8585",
      "500": "#ff6666", // 辅助色
      "600": "#e55c5c",
      "700": "#cc5252",
      "800": "#993d3d",
      "900": "#662929",
      foreground: "#000",
      DEFAULT: "#ff6666",
    },
    success: {
      "50": "#e3f8ef",
      "100": "#bbedd8",
      "200": "#93e3c1",
      "300": "#6bd9ab",
      "400": "#43ce94",
      "500": "#1bc47d",
      "600": "#16a267",
      "700": "#127f51",
      "800": "#0d5d3b",
      "900": "#083b26",
      foreground: "#000",
      DEFAULT: "#1bc47d",
    },
    warning: {
      "50": "#fff5df",
      "100": "#ffe8b3",
      "200": "#ffda86",
      "300": "#ffcc59",
      "400": "#ffbf2d",
      "500": "#ffb100",
      "600": "#d29200",
      "700": "#a67300",
      "800": "#795400",
      "900": "#4d3500",
      foreground: "#000",
      DEFAULT: "#ffb100",
    },
    danger: {
      "50": "#ffe9e9",
      "100": "#ffcaca",
      "200": "#ffabab",
      "300": "#ff8d8d",
      "400": "#ff6e6e",
      "500": "#ff4f4f",
      "600": "#d24141",
      "700": "#a63333",
      "800": "#792626",
      "900": "#4d1818",
      foreground: "#000",
      DEFAULT: "#ff4f4f",
    },
    background: "#fff5f5", // 浅红背景
    foreground: "#9a2c2c",
    content1: {
      DEFAULT: "#fef2f2",
      foreground: "#000",
    },
    content2: {
      DEFAULT: "#fee2e2",
      foreground: "#000",
    },
    content3: {
      DEFAULT: "#fecaca",
      foreground: "#000",
    },
    content4: {
      DEFAULT: "#fca5a5",
      foreground: "#000",
    },
    focus: "#ef4444", // 对应主色
    overlay: "#000000",
    divider: {
      DEFAULT: "#fee2e2", // 浅红边框
      foreground: "#4a4a4a",
    },
  },
};
