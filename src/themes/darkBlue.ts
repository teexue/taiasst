// src/themes/darkBlue.ts
// 深蓝主题 - 深邃海洋蓝色调
import { ThemeConfig } from "./base"; // 使用正确的类型

// 定义深蓝色阶 - 示例，请根据设计调整
const blue = {
  50: "#eef6ff",
  100: "#d3e5fe",
  200: "#a4cdfe",
  300: "#75b4fd",
  400: "#369afb",
  500: "#0284c7", // 主色
  600: "#0369a1",
  700: "#075985",
  800: "#0c4a6e",
  900: "#082f49",
  DEFAULT: "#0284c7", // 主色
  foreground: "#ffffff", // 主色按钮上的文字颜色
};

export const darkBlueTheme: ThemeConfig = {
  extend: "dark", // 继承深色主题的基本设置
  colors: {
    background: {
      DEFAULT: "#0a192f", // 深蓝背景
      foreground: "#ECEDEE", // 背景上的默认文字颜色 (确保对比度)
    },
    foreground: {
      DEFAULT: "#d1d5db", // Slightly darker default foreground (was #ECEDEE)
      // 可以根据需要定义前景色的其他色阶，或让其继承
      // 例如:
      50: "#ffffff",
      100: "#f8fafc",
      200: "#e2e8f0",
      300: "#d1dbe7",
      400: "#d0d0e0", // Updated foreground[400] for inactive tabs
      500: "#c0c0d0", // Updated foreground[500] for inactive tabs
      600: "#a0aec0",
      700: "#718096",
      800: "#4a5568",
      900: "#2d3748",
    },
    divider: {
      DEFAULT: "#1e293b", // 深蓝分割线 (需要确保与背景有对比度)
      foreground: "#ECEDEE", // 分割线上的文字颜色
    },
    focus: {
      DEFAULT: blue[400], // 焦点颜色使用较亮的蓝色
    },
    primary: blue,
    secondary: {
      50: "#f3f6fb",
      100: "#e5e7eb",
      200: "#d1d5db",
      300: "#9ca3af",
      400: "#6b7280",
      500: "#4b5563", // 次要颜色 - 深灰色
      600: "#374151",
      700: "#1f2937",
      800: "#111827",
      900: "#080a13",
      DEFAULT: "#374151",
      foreground: "#ECEDEE",
    },
    success: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e", // 成功颜色 - 绿色
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
      DEFAULT: "#22c55e",
      foreground: "#ffffff",
    },
    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b", // 警告颜色 - 琥珀色
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
      DEFAULT: "#f59e0b",
      foreground: "#ffffff", // 确保警告色背景上的文字可读
    },
    danger: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444", // 危险颜色 - 红色
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
      DEFAULT: "#ef4444",
      foreground: "#ffffff",
    },
    // Content Colors - 深色主题下通常使用不同层级的灰色或深色
    content1: {
      // 卡片、模态框等背景
      DEFAULT: "#1f2937", // 比背景稍浅
      foreground: "#ECEDEE",
    },
    content2: {
      DEFAULT: "#374151", // 比 content1 稍浅
      foreground: "#ECEDEE",
    },
    content3: {
      DEFAULT: "#4b5563",
      foreground: "#ECEDEE",
    },
    content4: {
      DEFAULT: "#6b7280",
      foreground: "#ECEDEE",
    },
    // Explicitly define 'default' scale if needed, otherwise it inherits from 'dark'
    // If inheriting, the change in dark.ts should apply. If explicit control needed:
    default: {
      DEFAULT: "#1f2937", // Example: Inherited default
      foreground: "#ECEDEE", // Example: Inherited foreground
      50: "#f8fafc",
      100: "#e2e8f0",
      200: "#cbd5e1",
      300: "#9ca3af",
      400: "#6b7280",
      500: "#9090a0", // Updated default-500 (using dark theme's foreground.100)
      600: "#374151",
      700: "#1f2937",
      800: "#111827",
      900: "#080a13",
    },
  },
  layout: {
    radius: {
      small: "6px",
      medium: "8px",
      large: "12px",
    },
    borderWidth: {
      small: "1px",
      medium: "1px", // 深色主题通常边框较细
      large: "2px",
    },
  },
};
