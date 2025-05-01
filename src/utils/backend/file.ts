import { invoke } from "@tauri-apps/api/core";

/**
 * 文件信息接口
 * 对应 src-tauri/src/file/base.rs -> FileInfo
 */
export interface FileInfo {
  /** 文件名 */
  name: string;
  /** 是否为目录 */
  isDir: boolean;
  /** 文件大小（字节） */
  size: number;
  /** 最后修改时间（ISO 8601格式） */
  modifiedTime: string;
  /** 创建时间（ISO 8601格式） */
  createdTime: string;
  /** 文件完整路径 */
  path: string;
}

/**
 * 通用应用配置接口
 * 对应 src-tauri/src/file/config.rs
 */
export interface AppConfig {
  /** 应用设置 */
  settings: Record<string, any>;
  /** 工具设置 */
  tools?: Record<string, any>;
  /** 主题设置 */
  theme?: Record<string, any>;
  /** 布局设置 */
  layout?: Record<string, any>;
  /** 其他设置 */
  [key: string]: any;
}

/**
 * 工具配置接口
 * 对应 src-tauri/src/file/config.rs
 */
export interface ToolsConfig {
  /** 工具列表 */
  tools: Array<Record<string, any>>;
  /** 其他设置 */
  [key: string]: any;
}

/**
 * 创建目录
 * 对应 src-tauri/src/file/base.rs -> create_directory
 * @param path 目录路径
 * @throws 如果创建失败，则抛出错误信息字符串
 */
export async function createDirectory(path: string): Promise<void> {
  await invoke<void>("create_directory", { path });
}

/**
 * 删除文件或目录 (递归删除目录)
 * 对应 src-tauri/src/file/base.rs -> delete_file
 * @param path 文件或目录路径
 * @throws 如果删除失败，则抛出错误信息字符串
 */
export async function deleteFile(path: string): Promise<void> {
  await invoke<void>("delete_file", { path });
}

/**
 * 重命名文件或目录
 * 对应 src-tauri/src/file/base.rs -> rename_file
 * @param oldPath 原路径
 * @param newPath 新路径
 * @throws 如果重命名失败，则抛出错误信息字符串
 */
export async function renameFile(
  oldPath: string,
  newPath: string,
): Promise<void> {
  await invoke<void>("rename_file", { oldPath, newPath });
}

/**
 * 复制文件
 * 对应 src-tauri/src/file/base.rs -> copy_file
 * @param source 源文件路径
 * @param destination 目标文件路径
 * @throws 如果复制失败，则抛出错误信息字符串
 */
export async function copyFile(
  source: string,
  destination: string,
): Promise<void> {
  await invoke<void>("copy_file", { source, destination });
}

/**
 * 检查文件是否存在
 * 对应 src-tauri/src/file/base.rs -> file_exists
 * @param path 文件路径
 * @returns 文件是否存在
 */
export async function fileExists(path: string): Promise<boolean> {
  return await invoke<boolean>("file_exists", { path });
}

/**
 * 获取文件信息
 * 对应 src-tauri/src/file/base.rs -> get_file_info
 * @param path 文件路径
 * @returns 文件信息对象
 * @throws 如果文件不存在或获取信息失败，则抛出错误信息字符串
 */
export async function getFileInfo(path: string): Promise<FileInfo> {
  return await invoke<FileInfo>("get_file_info", { path });
}

/**
 * 读取应用配置
 * 对应 src-tauri/src/file/config.rs -> read_app_config
 * @param configType 配置类型
 * @returns 应用配置对象
 * @throws 如果读取或解析失败，则抛出错误信息字符串
 */
export async function readAppConfig(configType: string): Promise<AppConfig> {
  return await invoke<AppConfig>("read_app_config", { configType });
}

/**
 * 写入应用配置
 * 对应 src-tauri/src/file/config.rs -> write_app_config
 * @param configType 配置类型
 * @param config 应用配置对象
 * @throws 如果创建目录、序列化或写入失败，则抛出错误信息字符串
 */
export async function writeAppConfig(
  configType: string,
  config: AppConfig,
): Promise<void> {
  await invoke<void>("write_app_config", { configType, config });
}

/**
 * 读取本地应用配置
 * 对应 src-tauri/src/file/config.rs -> read_local_app_config
 * @returns 应用配置对象
 * @throws 如果读取或解析失败，则抛出错误信息字符串
 */
export async function readLocalAppConfig(): Promise<AppConfig> {
  return await invoke<AppConfig>("read_local_app_config");
}

/**
 * 写入本地应用配置
 * 对应 src-tauri/src/file/config.rs -> write_local_app_config
 * @param config 应用配置对象
 * @throws 如果创建目录、序列化或写入失败，则抛出错误信息字符串
 */
export async function writeLocalAppConfig(config: AppConfig): Promise<void> {
  await invoke<void>("write_local_app_config", { config });
}

/**
 * 读取本地工具配置
 * 对应 src-tauri/src/file/config.rs -> read_local_tools_config
 * @returns 工具配置对象
 * @throws 如果读取或解析失败，则抛出错误信息字符串
 */
export async function readLocalToolsConfig(): Promise<ToolsConfig> {
  return await invoke<ToolsConfig>("read_local_tools_config");
}

/**
 * 写入本地工具配置
 * 对应 src-tauri/src/file/config.rs -> write_local_tools_config
 * @param config 工具配置对象
 * @throws 如果创建目录、序列化或写入失败，则抛出错误信息字符串
 */
export async function writeLocalToolsConfig(
  config: ToolsConfig,
): Promise<void> {
  await invoke<void>("write_local_tools_config", { config });
}
