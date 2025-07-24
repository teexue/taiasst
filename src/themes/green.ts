// src/themes/green.ts
// 绿色主题 - 青翠绿色调 (浅色风格)
import { ThemeConfig } from "./base";
import { baseTheme } from "./base";

export const greenTheme: ThemeConfig = {
  extend: "light",
  layout: baseTheme.light.layout,
  colors: {
    default: {
      "50": "#f0faf5",
      "100": "#e0f5eb",
      "200": "#c2ebd7",
      "300": "#99e0c2",
      "400": "#66d0a3",
      "500": "#2dbd7d",
      "600": "#239964",
      "700": "#1b734b",
      "800": "#124d32",
      "900": "#092619",
      foreground: "#000",
      DEFAULT: "#2dbd7d",
    },
    primary: {
      "50": "#e8fcf1",
      "100": "#d0f7e5",
      "200": "#a1eeca",
      "300": "#73e6af",
      "400": "#44dd95",
      "500": "#17c964", // 主色
      "600": "#13a452",
      "700": "#0e7d3e",
      "800": "#0a572b",
      "900": "#052e17",
      foreground: "#fff",
      DEFAULT: "#17c964",
    },
    secondary: {
      "50": "#e0f5eb",
      "100": "#c1ebd8",
      "200": "#a2e1c5",
      "300": "#83d7b2",
      "400": "#64cd9f",
      "500": "#45c38c", // 辅助色
      "600": "#389c70",
      "700": "#2a7554",
      "800": "#1c4e38",
      "900": "#0e271c",
      foreground: "#000",
      DEFAULT: "#45c38c",
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
    background: "#f0f9f5", // 浅绿背景
    foreground: "#1f5142",
    content1: {
      DEFAULT: "#e8fcf1",
      foreground: "#000",
    },
    content2: {
      DEFAULT: "#d0f7e5",
      foreground: "#000",
    },
    content3: {
      DEFAULT: "#a1eeca",
      foreground: "#000",
    },
    content4: {
      DEFAULT: "#73e6af",
      foreground: "#000",
    },
    focus: "#17c964", // 对应主色
    overlay: "#000000",
    divider: {
      DEFAULT: "#d0f7e5", // 浅绿边框
      foreground: "#4a4a4a",
    },
  },
};
