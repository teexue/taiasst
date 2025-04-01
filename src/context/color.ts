// 基于DESIGN.md定义的颜色系统
// 导出颜色常量供应用程序使用
import { lightTheme, darkTheme } from './theme';

// 颜色对象类型定义
export interface ColorTokens {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  
  accent: string;
  accentLight: string;
  accentDark: string;
  
  success: string;
  warning: string;
  error: string;
  info: string;
  
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textLight: string;
  
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgSidebar: string;
  bgSidebarActive: string;
  bgHeader: string;
  bgCard: string;
  
  border: string;
  borderLight: string;
}

// 浅色主题颜色 - 从theme.ts中提取
export const lightColors: ColorTokens = {
  // 品牌色
  primary: lightTheme.token.colorPrimary,
  primaryDark: '#8A7FCA',
  primaryLight: '#B8B3E9',
  
  // 辅助色
  accent: '#B8B3E9',
  accentLight: '#D4D1F2',
  accentDark: lightTheme.token.colorPrimary,
  
  // 功能色
  success: lightTheme.token.colorSuccess,
  warning: lightTheme.token.colorWarning,
  error: lightTheme.token.colorError,
  info: lightTheme.token.colorInfo,
  
  // 文字颜色
  textPrimary: lightTheme.components.Typography?.colorText || '#4A4A4A',
  textSecondary: lightTheme.components.Typography?.colorTextSecondary || '#6E6E6E',
  textMuted: '#8E8E8E',
  textLight: '#F5F7FA',
  
  // 背景颜色
  bgPrimary: '#F8F9FC',
  bgSecondary: lightTheme.components.Layout?.bodyBg || '#F5F7FA',
  bgTertiary: '#F3F4FF',
  bgSidebar: lightTheme.components.Menu?.itemBg || '#D4D1F2',
  bgSidebarActive: lightTheme.components.Menu?.itemSelectedBg || '#9A8EDA',
  bgHeader: lightTheme.components.Layout?.headerBg || '#FFFFFF',
  bgCard: lightTheme.components.Card?.colorBgContainer || '#FFFFFF',
  
  // 边框颜色
  border: lightTheme.components.Button?.defaultBorderColor || '#E0E0E5',
  borderLight: '#F0F0F5',
};

// 深色主题颜色 - 从theme.ts中提取
export const darkColors: ColorTokens = {
  // 品牌色 - 更柔和的紫色调
  primary: darkTheme.token.colorPrimary,
  primaryDark: '#9A8EDA',
  primaryLight: '#BDB4F0',
  
  // 辅助色
  accent: '#BDB4F0',
  accentLight: '#CAC2F7',
  accentDark: darkTheme.token.colorPrimary,
  
  // 功能色
  success: darkTheme.token.colorSuccess,
  warning: darkTheme.token.colorWarning,
  error: darkTheme.token.colorError,
  info: darkTheme.token.colorInfo,
  
  // 文字颜色 - 提高可读性
  textPrimary: darkTheme.components.Typography?.colorText || '#F0F0F0',
  textSecondary: darkTheme.components.Typography?.colorTextSecondary || '#C0C0D0',
  textMuted: '#9090A0',
  textLight: '#FFFFFF',
  
  // 背景颜色 - 更有质感的深色系
  bgPrimary: darkTheme.components.Layout?.bodyBg || '#1F1D2C',
  bgSecondary: '#252336',
  bgTertiary: '#2A2840',
  bgSidebar: darkTheme.components.Layout?.siderBg || '#1A1825',
  bgSidebarActive: darkTheme.components.Menu?.itemSelectedBg || '#2E2A45',
  bgHeader: darkTheme.components.Layout?.headerBg || '#252336',
  bgCard: darkTheme.components.Card?.colorBgContainer || '#252336',
  
  // 边框和阴影
  border: darkTheme.components.Button?.defaultBorderColor || '#3A3654',
  borderLight: '#443C66',
};

// 颜色映射，用于CSS变量生成
export const colorMap = {
  'color-primary': 'primary',
  'color-primary-dark': 'primaryDark',
  'color-primary-light': 'primaryLight',
  
  'color-accent': 'accent',
  'color-accent-light': 'accentLight',
  'color-accent-dark': 'accentDark',
  
  'color-success': 'success',
  'color-warning': 'warning',
  'color-error': 'error',
  'color-info': 'info',
  
  'color-text-primary': 'textPrimary',
  'color-text-secondary': 'textSecondary',
  'color-text-muted': 'textMuted',
  'color-text-light': 'textLight',
  
  'color-bg-primary': 'bgPrimary',
  'color-bg-secondary': 'bgSecondary',
  'color-bg-tertiary': 'bgTertiary',
  'color-bg-sidebar': 'bgSidebar',
  'color-bg-sidebar-active': 'bgSidebarActive',
  'color-bg-header': 'bgHeader',
  'color-bg-card': 'bgCard',
  
  'color-border': 'border',
  'color-border-light': 'borderLight',
};

// 辅助函数：根据当前主题获取颜色
export function getThemeColors(isDarkMode: boolean): ColorTokens {
  return isDarkMode ? darkColors : lightColors;
}

// 获取CSS变量对象，用于在js/ts中应用样式
export function getCssVariables(isDarkMode: boolean): Record<string, string> {
  const colors = getThemeColors(isDarkMode);
  const cssVars: Record<string, string> = {};
  
  Object.entries(colorMap).forEach(([cssVar, colorKey]) => {
    cssVars[`--${cssVar}`] = colors[colorKey as keyof ColorTokens];
  });
  
  return cssVars;
}

// 默认导出所有颜色常量和辅助函数
export default {
  light: lightColors,
  dark: darkColors,
  getThemeColors,
  getCssVariables,
  colorMap,
};
