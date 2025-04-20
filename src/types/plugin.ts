/**
 * 插件系统类型定义
 */

// 插件系统常量
export const PLUGIN_DIR = "plugins";
export const PLUGIN_CONFIG_FILE = "config.json";
export const PLUGIN_SCRIPT_ID_PREFIX = "plugin-script-";
export const PLUGIN_GLOBAL_VAR = "TaiAsstPlugin";
export const PLUGIN_INIT_DELAY = 100;

/**
 * 插件类型枚举
 */
export type PluginType =
  | "tool" // 工具
  | "system" // 系统
  | "ai"; // AI

/**
 * 插件来源枚举
 */
export type Origin =
  | "local" // 本地
  | "network" // 网络
  | "official" // 官方
  | "github"; // GitHub

/**
 * 插件类型中文映射
 */
export const PluginTypeExtra: Record<
  PluginType,
  { name: string; color: string }
> = {
  tool: { name: "工具", color: "blue" },
  system: { name: "系统", color: "green" },
  ai: { name: "AI", color: "red" },
};

/**
 * 插件来源中文映射
 */
export const OriginExtra: Record<Origin, { name: string; color: string }> = {
  local: {
    color: "blue",
    name: "本地",
  },
  network: {
    color: "green",
    name: "网络",
  },
  official: {
    color: "purple",
    name: "官方",
  },
  github: {
    color: "red",
    name: "社区",
  },
};

/**
 * 插件依赖定义
 */
export interface PluginDependency {
  /** 依赖插件ID */
  id: string;
  /** 依赖插件版本 */
  version: string;
}

/**
 * 插件菜单选项
 */
export interface MenuOptions {
  /** 是否在菜单显示 */
  show_in_menu: boolean;
  /** 菜单图标 */
  menu_icon?: string;
  /** 菜单显示名称 */
  menu_title?: string;
  /** 菜单排序 */
  menu_order?: number;
  /** 菜单分组 */
  menu_group?: string;
}

/**
 * 插件配置选项
 */
export interface ConfigOptions {
  /** 配置名称 */
  name: string;
  /** 配置描述 */
  description?: string;
  /** 配置默认值 */
  default_value?: string;
  /** 配置选项 */
  options?: string[];
  /** 配置是否必填 */
  required: boolean;
}

/**
 * 插件元数据
 * 与Rust后端的PluginMetadata结构体对应
 */
export interface PluginMetadata {
  /** 插件ID */
  id: string;
  /** 插件名称 */
  name: string;
  /** 插件版本 */
  version: string;
  /** 插件类型 */
  plugin_type?: PluginType;
  /** 插件来源 */
  origin?: Origin;
  /** 插件描述 */
  description?: string;
  /** 插件作者 */
  author?: string;
  /** 插件是否包含后端 */
  has_backend: boolean;
  /** 后端库文件 */
  backend_lib?: string;
  /** 插件依赖 */
  dependencies?: PluginDependency[];
  /** 插件菜单选项 */
  menu_options?: MenuOptions;
  /** 插件配置选项 */
  config_options?: ConfigOptions[];
}

/**
 * 插件配置类型
 */
export interface PluginConfig {
  plugins: PluginMetadata[];
  configs: Record<string, any>;
}

// 定义进度回调的 Stage 类型
export type InstallProgressStage =
  | "start"
  | "installing"
  | "complete"
  | "error"
  | "already_installed";

// 下载进度阶段类型定义，包含 InstallProgressStage 的所有状态
export type DownloadProgressStage =
  | "downloading"
  | "downloaded"
  | InstallProgressStage;

// 插件目录请求结果
export interface GetPluginDirResult {
  path: string;
}

// 插件加载参数
export interface LoadPluginParams {
  metadata: PluginMetadata | any;
}

// 插件卸载参数
export interface UnloadPluginParams {
  pluginId: string;
}

// 插件安装参数
export interface InstallPluginParams {
  zipPath: string;
}
