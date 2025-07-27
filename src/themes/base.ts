// src/themes/base.ts
// 定义通用布局配置

export const baseLayout = {
  dividerWeight: "1px", // h-divider the default height applied to the divider component
  disabledOpacity: 0.5, // this value is applied as opacity-[value] when the component is disabled
  fontSize: {
    tiny: "0.75rem", // text-tiny
    small: "0.875rem", // text-small
    medium: "1rem", // text-medium
    large: "1.125rem", // text-large
  },
  lineHeight: {
    tiny: "1rem", // text-tiny
    small: "1.25rem", // text-small
    medium: "1.5rem", // text-medium
    large: "1.75rem", // text-large
  },
  radius: {
    small: "8px", // rounded-small
    medium: "12px", // rounded-medium
    large: "14px", // rounded-large
  },
  borderWidth: {
    small: "1px", // border-small
    medium: "2px", // border-medium (default)
    large: "3px", // border-large
  },
};

export const baseTheme = {
  light: {
    layout: {
      hoverOpacity: 0.8, //  this value is applied as opacity-[value] when the component is hovered
      boxShadow: {
        // shadow-small
        small:
          "0px 0px 5px 0px rgb(0 0 0 / 0.02), 0px 2px 10px 0px rgb(0 0 0 / 0.06), 0px 0px 1px 0px rgb(0 0 0 / 0.3)",
        // shadow-medium
        medium:
          "0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)",
        // shadow-large
        large:
          "0px 0px 30px 0px rgb(0 0 0 / 0.04), 0px 30px 60px 0px rgb(0 0 0 / 0.12), 0px 0px 1px 0px rgb(0 0 0 / 0.3)",
      },
    },
  },
  dark: {
    layout: {
      hoverOpacity: 0.9, //  this value is applied as opacity-[value] when the component is hovered
      boxShadow: {
        // shadow-small
        small:
          "0px 0px 5px 0px rgb(0 0 0 / 0.05), 0px 2px 10px 0px rgb(0 0 0 / 0.2), inset 0px 0px 1px 0px rgb(255 255 255 / 0.15)",
        // shadow-medium
        medium:
          "0px 0px 15px 0px rgb(0 0 0 / 0.06), 0px 2px 30px 0px rgb(0 0 0 / 0.22), inset 0px 0px 1px 0px rgb(255 255 255 / 0.15)",
        // shadow-large
        large:
          "0px 0px 30px 0px rgb(0 0 0 / 0.07), 0px 30px 60px 0px rgb(0 0 0 / 0.26), inset 0px 0px 1px 0px rgb(255 255 255 / 0.15)",
      },
    },
  },
};

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

export type ThemeLayout = Partial<{
  hoverOpacity: number;
  boxShadow: {
    small: string;
    medium: string;
    large: string;
  };
}>;

// 主题配置类型定义 - 使用改进后的类型
export type ThemeConfig = {
  extend?: "light" | "dark";
  layout?: ThemeLayout;
  colors?: ThemeColors; // 使用改进后的 ThemeColors，并设为可选
};
