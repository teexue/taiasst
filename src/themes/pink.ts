// src/themes/pink.ts
// 粉色主题 - 樱花粉色调
import { ThemeConfig } from "./base";

export const pinkTheme: ThemeConfig = {
  extend: "light", // 继承浅色主题的基本设置
  colors: {
    background: {
      DEFAULT: "#fff5f8", // 更柔和的淡粉背景
      foreground: "#33242e",
    },
    foreground: {
      DEFAULT: "#11181C", // Updated for contrast
      50: "#fcf7fa",
      100: "#e5e7ea",
      200: "#c5c9ce",
      300: "#a5abb2",
      400: "#7d8695",
      500: "#5c6370",
      600: "#4a4a4a",
      700: "#33242e",
      800: "#2a1d25",
      900: "#21161c",
    },
    primary: {
      DEFAULT: "#f5b1c1", // 更柔和的樱花粉主色调
      foreground: "#ffffff",
      50: "#fef5f7",
      100: "#fdeaef",
      200: "#fad5df",
      300: "#f8c0cf",
      400: "#f5b1c1", // 主色
      500: "#eda2b4", // 之前的位置
      600: "#d689a0",
      700: "#b06a7d",
      800: "#8b505f",
      900: "#66323f",
    },
    secondary: {
      DEFAULT: "#f8cad7", // 更柔和的辅助粉色
      foreground: "#4f2935",
      50: "#fef8fa",
      100: "#fdf1f5",
      200: "#fbe3eb",
      300: "#f9d6e1",
      400: "#f8cad7", // 辅助色
      500: "#f0bfcd",
      600: "#d6a7b9",
      700: "#b08594",
      800: "#8a6370",
      900: "#4f2935",
    },
    success: {
      DEFAULT: "#16a34a",
      foreground: "#ffffff",
      50: "#e7f7ec",
      100: "#d0f0d9",
      200: "#a1e1b3",
      300: "#72d18d",
      400: "#43c267",
      500: "#16a34a",
      600: "#13843c",
      700: "#0e632d",
      800: "#09421e",
      900: "#04210f",
    },
    warning: {
      DEFAULT: "#f59e0b", // 改为标准橙色警告色
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
      DEFAULT: "#e11d48",
      foreground: "#ffffff",
      50: "#fbe9ed",
      100: "#f7d3db",
      200: "#efa7b7",
      300: "#e77b93",
      400: "#df4f6f",
      500: "#e11d48",
      600: "#b4173a",
      700: "#87122c",
      800: "#5a0c1d",
      900: "#2d060f",
    },
    divider: {
      DEFAULT: "#f7e6ef",
      foreground: "#33242e",
      50: "#fff7fc",
      100: "#fff0f9",
      200: "#f7e6ef",
      300: "#efd8e5",
      400: "#e7cadb",
      500: "#dfbcd1",
      600: "#d79cba",
      700: "#af7c96",
      800: "#875c71",
      900: "#5f3c4d",
    },
    content1: {
      DEFAULT: "#ffffff",
      foreground: "#33242e",
    },
    content2: {
      DEFAULT: "#fcf7fa",
      foreground: "#33242e",
    },
    content3: {
      DEFAULT: "#fff5f8", // 调整为与背景一致
      foreground: "#33242e",
    },
    content4: {
      DEFAULT: "#fef5f7", // 调整为与主色调的50值一致
      foreground: "#33242e",
    },
    default: {
      DEFAULT: "#fcf7fa",
      foreground: "#33242e",
      50: "#ffffff",
      100: "#fdfbfc",
      200: "#fcf7fa",
      300: "#f8eff5",
      400: "#f4e7f0",
      500: "#4a4a4a", // 保持不变，这是文字颜色
      600: "#e0cfdb",
      700: "#d0bfcb",
      800: "#c0afbb",
      900: "#b09fab",
    },
    focus: {
      DEFAULT: "#f5b1c1", // 对应调整后的主色
      50: "#fef5f7",
      100: "#fdeaef",
      200: "#fad5df",
      300: "#f8c0cf",
      400: "#f5b1c1",
      500: "#eda2b4",
      600: "#d689a0",
      700: "#b06a7d",
      800: "#8b505f",
      900: "#66323f",
    },
  },
};
