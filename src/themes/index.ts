// src/themes/index.ts
// 导出所有主题

import { ThemeConfig } from "./base"; // 使用正确的类型 ThemeConfig
import { lightTheme } from "./light";
import { darkTheme } from "./dark";
import { blueTheme } from "./blue";
import { greenTheme } from "./green";
import { pinkTheme } from "./pink";
import { orangeTheme } from "./orange";
import { redTheme } from "./red";
import { darkBlueTheme } from "./darkBlue";
import { darkGreenTheme } from "./darkGreen";

// 主题类型定义
export type ThemeName =
  | "light" // 晨雾紫 (浅色)
  | "dark" // 暗夜紫 (深色)
  | "blue" // 海洋蓝 (浅色)
  | "green" // 青翠绿 (浅色)
  | "pink" // 樱花粉 (浅色)
  | "orange" // 暖阳橙 (浅色)
  | "red" // 热情红 (浅色)
  | "darkBlue" // 深邃蓝 (深色)
  | "darkGreen"; // 森林绿 (深色)

// 主题配置对象 - 修改为导出实际配置
export const themes: Record<ThemeName, ThemeConfig> = {
  // 添加类型注解
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme,
  green: greenTheme,
  pink: pinkTheme,
  orange: orangeTheme,
  red: redTheme,
  darkBlue: darkBlueTheme,
  darkGreen: darkGreenTheme,
};

// 主题显示名称
export const themeNames = {
  light: "晨雾紫 (浅色)",
  dark: "暗夜紫 (深色)",
  blue: "海洋蓝 (浅色)",
  green: "青翠绿 (浅色)",
  pink: "樱花粉 (浅色)",
  orange: "暖阳橙 (浅色)",
  red: "热情红 (浅色)",
  darkBlue: "深邃蓝 (深色)",
  darkGreen: "森林绿 (深色)",
} as const;

export * from "./base";
export * from "./light";
export * from "./dark";
export * from "./blue";
export * from "./green";
export * from "./pink";
export * from "./orange";
export * from "./red";
export * from "./darkBlue";
export * from "./darkGreen";
