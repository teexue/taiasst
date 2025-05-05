// src/themes/orange.ts
// 橙色主题 - 暖阳橙色调
import { ThemeConfig } from "./base";

export const orangeTheme: ThemeConfig = {
  extend: "light", // 继承浅色主题的基本设置
  colors: {
    background: {
      DEFAULT: "#fff7f0", // 淡橙背景
      foreground: "#332a24",
    },
    foreground: {
      DEFAULT: "#11181C", // Updated for contrast
      50: "#fcf9f7",
      100: "#e5e7ea",
      200: "#c5c9ce",
      300: "#a5abb2",
      400: "#7d8695",
      500: "#5c6370",
      600: "#4a4a4a",
      700: "#332a24",
      800: "#2a221d",
      900: "#211a16",
    },
    primary: {
      DEFAULT: "#f97316", // 橙色主色调
      foreground: "#ffffff",
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316", // 主色
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },
    secondary: {
      DEFAULT: "#fdba74", // 辅助橙色
      foreground: "#ffffff",
      50: "#fef9f3",
      100: "#fdf3e7",
      200: "#fbe7cf",
      300: "#fddbb7",
      400: "#fcc89f",
      500: "#fdba74", // 辅助色
      600: "#ca955d",
      700: "#987046",
      800: "#654b2f",
      900: "#332518",
    },
    success: {
      DEFAULT: "#84cc16",
      foreground: "#ffffff",
      50: "#f3fae7",
      100: "#e7f5cf",
      200: "#cfeb9f",
      300: "#b7e16f",
      400: "#9fd73f",
      500: "#84cc16",
      600: "#6aa412",
      700: "#4f7b0d",
      800: "#355209",
      900: "#1a2904",
    },
    warning: {
      DEFAULT: "#fb923c",
      foreground: "#ffffff",
      50: "#fef5eb",
      100: "#fdebd7",
      200: "#fbd7af",
      300: "#f9c387",
      400: "#f7af5f",
      500: "#fb923c", // 黄橙警告
      600: "#c97530",
      700: "#975824",
      800: "#653a18",
      900: "#321d0c",
    },
    danger: {
      DEFAULT: "#dc2626",
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
      DEFAULT: "#f5ede6",
      foreground: "#332a24",
      50: "#fffaf5",
      100: "#fff7f0",
      200: "#f5ede6",
      300: "#ebe1d6",
      400: "#e1d5c6",
      500: "#d7c9b6",
      600: "#c3b196",
      700: "#9f8e76",
      800: "#7b6b56",
      900: "#574836",
    },
    content1: {
      DEFAULT: "#ffffff",
      foreground: "#332a24",
    },
    content2: {
      DEFAULT: "#fcf9f7",
      foreground: "#332a24",
    },
    content3: {
      DEFAULT: "#fff7f0",
      foreground: "#332a24",
    },
    content4: {
      DEFAULT: "#fff7ed",
      foreground: "#332a24",
    },
    default: {
      DEFAULT: "#fcf9f7",
      foreground: "#332a24",
      50: "#ffffff",
      100: "#fdfcfb",
      200: "#fcf9f7",
      300: "#f5f2ef",
      400: "#eeeae7",
      500: "#4a4a4a",
      600: "#d7d2cf",
      700: "#c7c2bf",
      800: "#b7b2af",
      900: "#a7a29f",
    },
    focus: {
      DEFAULT: "#f97316", // 对应主色
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },
  },
};
