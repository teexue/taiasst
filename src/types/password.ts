/**
 * 密码管理系统类型定义
 */

/**
 * 密码条目接口
 */
export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsed?: number;
}

/**
 * 密码分类
 */
export interface PasswordCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

/**
 * 密码强度等级
 */
export enum PasswordStrength {
  WEAK = "weak",
  FAIR = "fair",
  GOOD = "good",
  STRONG = "strong",
}

/**
 * 密码强度分析结果
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
  suggestions: string[];
}

/**
 * 密码生成选项
 */
export interface PasswordGenerateOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

/**
 * 密码搜索过滤器
 */
export interface PasswordFilter {
  query?: string;
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  sortBy?: "title" | "createdAt" | "updatedAt" | "lastUsed";
  sortOrder?: "asc" | "desc";
}

/**
 * 密码导入/导出格式
 */
export interface PasswordExportData {
  version: string;
  exportedAt: number;
  entries: PasswordEntry[];
  categories: PasswordCategory[];
}

/**
 * 密码安全报告
 */
export interface PasswordSecurityReport {
  totalPasswords: number;
  weakPasswords: number;
  reusedPasswords: number;
  oldPasswords: number;
  compromisedPasswords: number;
  securityScore: number;
  recommendations: string[];
}

/**
 * 默认密码分类
 */
export const DEFAULT_CATEGORIES: Omit<PasswordCategory, "count">[] = [
  {
    id: "social",
    name: "社交媒体",
    icon: "RiUserLine",
    color: "blue",
  },
  {
    id: "work",
    name: "工作",
    icon: "RiBriefcaseLine",
    color: "green",
  },
  {
    id: "finance",
    name: "金融",
    icon: "RiBankLine",
    color: "yellow",
  },
  {
    id: "shopping",
    name: "购物",
    icon: "RiShoppingCartLine",
    color: "orange",
  },
  {
    id: "entertainment",
    name: "娱乐",
    icon: "RiGamepadLine",
    color: "purple",
  },
  {
    id: "other",
    name: "其他",
    icon: "RiFolderLine",
    color: "gray",
  },
];

/**
 * 默认密码生成选项
 */
export const DEFAULT_GENERATE_OPTIONS: PasswordGenerateOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: true,
  excludeAmbiguous: false,
};
