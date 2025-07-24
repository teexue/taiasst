// src/themes/orange.ts
// 橙色主题 - 暖阳橙色调 (浅色风格)
import { ThemeConfig } from "./base";
import { baseTheme } from "./base";

export const orangeTheme: ThemeConfig = {
  extend: "light",
  layout: baseTheme.light.layout,
  colors: {
    default: {
      "50": "#fff8f0",
      "100": "#fff0e0",
      "200": "#ffe0c2",
      "300": "#ffd1a3",
      "400": "#ffb366",
      "500": "#ff9500",
      "600": "#cc7700",
      "700": "#995a00",
      "800": "#663c00",
      "900": "#331e00",
      foreground: "#000",
      DEFAULT: "#ff9500",
    },
    primary: {
      "50": "#fff8e6",
      "100": "#ffeccc",
      "200": "#ffdb99",
      "300": "#ffc966",
      "400": "#ffb833",
      "500": "#ff9f00", // 主色
      "600": "#cc7f00",
      "700": "#995f00",
      "800": "#664000",
      "900": "#332000",
      foreground: "#000",
      DEFAULT: "#ff9f00",
    },
    secondary: {
      "50": "#fff5e5",
      "100": "#ffebcc",
      "200": "#ffd699",
      "300": "#ffc266",
      "400": "#ffad33",
      "500": "#ff9900", // 辅助色
      "600": "#cc7a00",
      "700": "#995c00",
      "800": "#663d00",
      "900": "#331f00",
      foreground: "#000",
      DEFAULT: "#ff9900",
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
    background: "#fff9f0", // 浅橙背景
    foreground: "#8d4e00",
    content1: {
      DEFAULT: "#fff8e6",
      foreground: "#000",
    },
    content2: {
      DEFAULT: "#ffeccc",
      foreground: "#000",
    },
    content3: {
      DEFAULT: "#ffdb99",
      foreground: "#000",
    },
    content4: {
      DEFAULT: "#ffc966",
      foreground: "#000",
    },
    focus: "#ff9f00", // 对应主色
    overlay: "#000000",
    divider: {
      DEFAULT: "#ffeccc", // 浅橙边框
      foreground: "#4a4a4a",
    },
  },
};
