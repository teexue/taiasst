// // hero.ts
import {
  lightTheme,
  darkTheme,
  purpleTheme,
  darkPurpleTheme,
  blueTheme,
  greenTheme,
  pinkTheme,
  orangeTheme,
  redTheme,
  darkBlueTheme,
  darkGreenTheme,
  baseLayout,
} from "./themes";

import { heroui } from "@heroui/react";

// 创建heroui配置
export default heroui({
  defaultTheme: "light", // 默认使用浅色主题
  defaultExtendTheme: "light", // 扩展默认主题
  layout: baseLayout,
  themes: {
    // 基础主题
    light: lightTheme, // 晨雾紫 (浅色基础主题)
    dark: darkTheme, // 暗夜紫 (深色基础主题)

    // 紫色主题（与基础主题相同）
    purple: purpleTheme, // 晨雾紫 (浅色)
    darkPurple: darkPurpleTheme, // 暗夜紫 (深色)

    // 浅色风格主题
    blue: blueTheme, // 海洋蓝 (浅色)
    green: greenTheme, // 青翠绿 (浅色)
    pink: pinkTheme, // 樱花粉 (浅色)
    orange: orangeTheme, // 暖阳橙 (浅色)
    red: redTheme, // 热情红 (浅色)

    // 深色风格主题
    darkBlue: darkBlueTheme, // 深邃蓝 (深色)
    darkGreen: darkGreenTheme, // 森林绿 (深色)
  },
});
