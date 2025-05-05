// src/themes/darkGreen.ts
// 深绿主题 - 森林绿色调
import { ThemeConfig } from "./base";

export const darkGreenTheme: ThemeConfig = {
  extend: "dark", // 继承深色主题的基本设置
  colors: {
    background: {
      DEFAULT: "#061a14", // 深绿背景
      foreground: "#ECEDEE", // 背景上的默认文字颜色
    },
    foreground: {
      DEFAULT: "#d1d5db", // Slightly darker default foreground (was #ECEDEE)
      50: "#ffffff",
      100: "#f0f5f3",
      200: "#e0ebe8",
      300: "#d1e7de",
      400: "#d0d0e0", // Updated foreground[400] for inactive tabs (was #d8ede4)
      500: "#c0c0d0", // Updated foreground[500] for inactive tabs (was #e2f0eb)
      600: "#a2b0ab",
      700: "#889993",
      800: "#6e817a",
      900: "#546a62",
    },
    primary: {
      DEFAULT: "#059669", // 绿松石主色调
      foreground: "#ffffff",
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
    secondary: {
      DEFAULT: "#34d399", // 辅助绿色
      foreground: "#ffffff",
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
    success: {
      DEFAULT: "#22c55e", // 草绿色
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
      DEFAULT: "#eab308", // 金色
      foreground: "#ffffff",
      50: "#fefce8",
      100: "#fef9c3",
      200: "#fef08a",
      300: "#fde047",
      400: "#facc15",
      500: "#eab308",
      600: "#ca8a04",
      700: "#a16207",
      800: "#854d0e",
      900: "#713f12",
    },
    danger: {
      DEFAULT: "#f43f5e", // 玫瑰红
      foreground: "#ffffff",
      50: "#fff1f2",
      100: "#ffe4e6",
      200: "#fecdd3",
      300: "#fda4af",
      400: "#fb7185",
      500: "#f43f5e",
      600: "#e11d48",
      700: "#be123c",
      800: "#9f1239",
      900: "#881337",
    },
    divider: {
      DEFAULT: "#143a2b", // 深绿分割线
      foreground: "#ECEDEE",
      50: "#f0faf5",
      100: "#d5eae2",
      200: "#abd5c2",
      300: "#81c0a3",
      400: "#57ac83",
      500: "#356058",
      600: "#274a42",
      700: "#1c352f",
      800: "#143a2b",
      900: "#0a1d17",
    },
    content1: {
      DEFAULT: "#1c352f",
      foreground: "#e2f0eb",
    },
    content2: {
      DEFAULT: "#1c352f",
      foreground: "#e2f0eb",
    },
    content3: {
      DEFAULT: "#274a42",
      foreground: "#e2f0eb",
    },
    content4: {
      DEFAULT: "#356058",
      foreground: "#e2f0eb",
    },
    default: {
      DEFAULT: "#1c352f",
      foreground: "#e2f0eb",
      50: "#f0faf5",
      100: "#d5eae2",
      200: "#abd5c2",
      300: "#81c0a3",
      400: "#57ac83",
      500: "#9090a0",
      600: "#274a42",
      700: "#1c352f",
      800: "#0f2922",
      900: "#061a14",
    },
    focus: {
      DEFAULT: "#059669", // 对应主色
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
  },
};
