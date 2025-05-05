// hero.ts
import { heroui } from "@heroui/react";
import {
  lightTheme,
  darkTheme,
  blueTheme,
  greenTheme,
  pinkTheme,
  orangeTheme,
  redTheme,
  darkBlueTheme,
  darkGreenTheme,
  baseLayout,
} from "./themes";

// HeroUI配置
export default heroui({
  prefix: "taiasst", // 自定义前缀
  defaultTheme: "light", // 默认主题
  layout: baseLayout,
  themes: {
    light: lightTheme,
    dark: darkTheme,
    blue: blueTheme,
    green: greenTheme,
    pink: pinkTheme,
    orange: orangeTheme,
    red: redTheme,
    darkBlue: darkBlueTheme,
    darkGreen: darkGreenTheme,
  },
});
