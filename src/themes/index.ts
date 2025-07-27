// src/themes/index.ts
// 导出所有主题 - 2024年现代配色版

import { ThemeConfig } from "./base"; // 使用正确的类型 ThemeConfig
import { lightTheme } from "./light";
import { darkTheme } from "./dark";
import { purpleTheme } from "./purple";
import { darkPurpleTheme } from "./darkPurple";
import { blueTheme } from "./blue";
import { greenTheme } from "./green";
import { pinkTheme } from "./pink";
import { orangeTheme } from "./orange";
import { redTheme } from "./red";
import { darkBlueTheme } from "./darkBlue";
import { darkGreenTheme } from "./darkGreen";

// 主题类型定义
export type ThemeName =
  | "light" // 现代极简 (浅色)
  | "dark" // 深邃黑曜 (深色)
  | "purple" // 薰衣草紫 (浅色) - 2024年流行
  | "blue" // 天空蓝 (浅色) - 现代配色
  | "green" // 青翠绿 (浅色)
  | "pink" // 珊瑚粉 (浅色) - 2024年温暖色调
  | "orange" // 暖阳橙 (浅色)
  | "red" // 热情红 (浅色)
  | "darkPurple" // 暗夜紫 (深色)
  | "darkBlue" // 深邃蓝 (深色)
  | "darkGreen"; // 森林绿 (深色)

// 主题配置对象
export const themes: Record<ThemeName, ThemeConfig> = {
  // 默认主题 - 2024年现代设计
  light: lightTheme,
  dark: darkTheme,

  // 特色主题 - 紫色系列 (2024年流行色)
  purple: purpleTheme,

  // 浅色主题变体 - 现代配色
  blue: blueTheme,
  green: greenTheme,
  pink: pinkTheme,
  orange: orangeTheme,
  red: redTheme,

  // 深色主题变体
  darkPurple: darkPurpleTheme,
  darkBlue: darkBlueTheme,
  darkGreen: darkGreenTheme,
};

// 主题显示名称 - 2024年更新版
export const themeNames = {
  // 默认主题 - 现代极简设计
  light: "现代极简 (浅色)",
  dark: "深邃黑曜 (深色)",

  // 特色主题 - 2024年流行配色
  purple: "薰衣草紫 (浅色)", // 2024年流行色
  blue: "天空蓝 (浅色)", // 现代配色
  green: "青翠绿 (浅色)",
  pink: "珊瑚粉 (浅色)", // 2024年温暖色调
  orange: "暖阳橙 (浅色)",
  red: "热情红 (浅色)",

  // 深色主题变体
  darkPurple: "暗夜紫 (深色)",
  darkBlue: "深邃蓝 (深色)",
  darkGreen: "森林绿 (深色)",
} as const;

// 主题分类
export const themeCategories = {
  light: ["light", "purple", "blue", "green", "pink", "orange", "red"],
  dark: ["dark", "darkPurple", "darkBlue", "darkGreen"],
} as const;

// 导出基础文件
export * from "./base";

// 导出主题文件 - 2024年现代配色版
export * from "./light";
export * from "./dark";
export * from "./purple";
export * from "./darkPurple";
export * from "./blue";
export * from "./green";
export * from "./pink";
export * from "./orange";
export * from "./red";
export * from "./darkBlue";
export * from "./darkGreen";

// 导出工具函数和分类
export * from "./hero";
