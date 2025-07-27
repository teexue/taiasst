// src/themes/hero.ts
// 提供主题工具函数和分类

import { ThemeName, themes, themeNames } from "./index";

// 主题类别
export type ThemeCategory = "default" | "purple" | "colors" | "dark";

// 主题分组接口
interface ThemeGroup {
  category: ThemeCategory;
  title: string;
  themes: ThemeName[];
}

// 主题分组配置
export const themeGroups: ThemeGroup[] = [
  {
    category: "default",
    title: "默认主题",
    themes: ["light", "dark"],
  },
  {
    category: "colors",
    title: "浅色变体",
    themes: ["purple", "blue", "green", "pink", "orange", "red"],
  },
  {
    category: "dark",
    title: "深色变体",
    themes: ["darkPurple", "darkBlue", "darkGreen"],
  },
];

// 获取主题对象
export const getTheme = (name: ThemeName) => {
  return themes[name];
};

// 获取主题名称
export const getThemeName = (name: ThemeName) => {
  return themeNames[name];
};

// 判断是否为深色主题
export const isDarkTheme = (name: ThemeName) => {
  return ["dark", "darkPurple", "darkBlue", "darkGreen"].includes(name);
};

// 获取对应的深色/浅色主题
export const getOppositeTheme = (name: ThemeName): ThemeName => {
  // 默认主题对
  if (name === "light") return "dark";
  if (name === "dark") return "light";

  // 紫色主题对
  if (name === "purple") return "darkPurple";
  if (name === "darkPurple") return "purple";

  // 其他颜色主题转换
  if (name === "blue") return "darkBlue";
  if (name === "green") return "darkGreen";
  if (name === "darkBlue") return "blue";
  if (name === "darkGreen") return "green";

  // 没有对应深色版本的浅色主题，返回默认dark
  if (["pink", "orange", "red"].includes(name)) return "dark";

  // 默认回退
  return "light";
};
