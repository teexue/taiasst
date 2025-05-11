// src/themes/base.ts
// 定义通用布局配置

export const baseLayout = {};

// 更精确的颜色类型
export type ColorScale = Partial<{
  // 使用 Partial 允许只定义部分色阶
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  foreground: string; // contrast color
  DEFAULT: string;
}>;

export type BaseColors = Partial<{
  // 使用 Partial 允许只定义部分基础颜色
  background: string | ColorScale;
  foreground: string | ColorScale;
  divider: string | ColorScale;
  overlay: string | ColorScale;
  focus: string | ColorScale;
  content1: string | ColorScale;
  content2: string | ColorScale;
  content3: string | ColorScale;
  content4: string | ColorScale;
}>;

// 品牌色 + 基础色
export type ThemeColors = BaseColors &
  Partial<{
    // 使用 Partial 允许只定义部分品牌色
    default: string | ColorScale;
    primary: string | ColorScale;
    secondary: string | ColorScale;
    success: string | ColorScale;
    warning: string | ColorScale;
    danger: string | ColorScale;
  }>;

// 主题配置类型定义 - 使用改进后的类型
export type ThemeConfig = {
  extend?: "light" | "dark";
  layout?: Partial<typeof baseLayout> | {};
  colors?: ThemeColors; // 使用改进后的 ThemeColors，并设为可选
};
