import { PluginMetadata } from "@/types/plugin";

// 插件系统常量
export const PLUGIN_DIR = "plugins";
// 插件配置文件名
export const PLUGIN_CONFIG_FILE = "config.json";
// 插件脚本ID前缀
export const PLUGIN_SCRIPT_ID_PREFIX = "plugin-script-";
// 插件全局变量名
export const PLUGIN_GLOBAL_VAR = "TaiAsstPlugin";
// 插件初始化延迟时间(ms)
export const PLUGIN_INIT_DELAY = 100;

// 插件配置类型
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
