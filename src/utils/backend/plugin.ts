import { invoke } from "@tauri-apps/api/core";
import { PluginMetadata } from "@/types/plugin";

/**
 * 初始化插件系统
 * 对应 src-tauri/src/plugin/api.rs -> init_plugin_system
 * @returns 初始化结果
 * @throws 如果初始化失败，则抛出错误信息字符串
 */
export async function initPluginSystem(): Promise<void> {
  // 注意：此命令需要 AppHandle，invoke 会自动注入
  await invoke<void>("init_plugin_system");
}

/**
 * 获取插件基础目录的路径
 * 对应 src-tauri/src/plugin/utils.rs -> get_plugin_base_dir
 * @returns 插件目录路径字符串
 * @throws 如果获取失败，则抛出错误信息字符串
 */
export async function getPluginBaseDir(): Promise<string> {
  // 注意：此命令需要 AppHandle，invoke 会自动注入
  return await invoke<string>("get_plugin_base_dir");
}

/**
 * 获取插件全局配置文件路径
 * 对应 src-tauri/src/plugin/utils.rs -> get_plugin_global_config_path
 * @returns 配置文件路径字符串
 * @throws 如果获取失败，则抛出错误信息字符串
 */
export async function getPluginGlobalConfigPath(): Promise<string> {
  // 注意：此命令需要 AppHandle，invoke 会自动注入
  return await invoke<string>("get_plugin_global_config_path");
}

/**
 * 获取特定插件的目录路径
 * 对应 src-tauri/src/plugin/utils.rs -> get_plugin_path
 * @param pluginId 插件ID
 * @returns 插件目录路径字符串
 * @throws 如果获取失败或插件不存在，则抛出错误信息字符串
 */
export async function getPluginPath(pluginId: string): Promise<string> {
  return await invoke<string>("get_plugin_path", { pluginId });
}

/**
 * 获取特定插件的元数据
 * 对应 src-tauri/src/plugin/utils.rs -> get_plugin_metadata
 * @param pluginId 插件ID
 * @returns 插件元数据对象
 * @throws 如果获取失败或插件不存在，则抛出错误信息字符串
 */
export async function getPluginMetadata(
  pluginId: string
): Promise<PluginMetadata> {
  return await invoke<PluginMetadata>("get_plugin_metadata", { pluginId });
}

/**
 * 加载指定的插件
 * 对应 src-tauri/src/plugin/api.rs -> load_plugin
 * @param metadata 插件元数据对象
 * @throws 如果插件已加载或加载失败，则抛出错误信息字符串
 */
export async function loadPlugin(metadata: PluginMetadata): Promise<void> {
  await invoke<void>("load_plugin", { metadata });
}

/**
 * 卸载指定的插件
 * 对应 src-tauri/src/plugin/api.rs -> unload_plugin
 * @param pluginId 要卸载的插件ID
 * @throws 如果插件未加载或卸载失败，则抛出错误信息字符串
 */
export async function unloadPlugin(pluginId: string): Promise<void> {
  await invoke<void>("unload_plugin", { pluginId });
}

/**
 * 获取当前已加载的所有插件的元数据列表
 * 对应 src-tauri/src/plugin/api.rs -> get_loaded_plugins
 * @returns 插件元数据数组
 * @throws 如果获取失败，则抛出错误信息字符串
 */
export async function getLoadedPlugins(): Promise<PluginMetadata[]> {
  return await invoke<PluginMetadata[]>("get_loaded_plugins");
}

/**
 * 调用已加载插件的后端函数
 * 对应 src-tauri/src/plugin/api.rs -> call_plugin_function
 * @param pluginId 目标插件的ID
 * @param functionName 要调用的函数名 (不含插件入口前缀)
 * @param args 传递给函数的参数数组 (i32类型的数组)
 * @returns 函数的返回值 (i32)
 * @throws 如果插件未加载、函数未找到或插件无后端库，则抛出错误信息字符串
 */
export async function callPluginFunction(
  pluginId: string,
  functionName: string,
  args: number[] // Vec<i32>
): Promise<number> {
  return await invoke<number>("call_plugin_function", {
    pluginId,
    functionName,
    args,
  });
}

/**
 * 从ZIP文件中读取插件元数据，不执行安装
 * 对应 src-tauri/src/plugin/api.rs -> get_plugin_metadata_from_zip
 * @param zipPath ZIP文件的路径
 * @returns 插件元数据对象
 * @throws 如果文件不存在、不是ZIP文件、缺少metadata.json或解析失败，则抛出错误信息字符串
 */
export async function getPluginMetadataFromZip(
  zipPath: string
): Promise<PluginMetadata> {
  return await invoke<PluginMetadata>("get_plugin_metadata_from_zip", {
    zipPath,
  });
}

/**
 * 从ZIP压缩包安装插件
 * 对应 src-tauri/src/plugin/api.rs -> install_plugin_from_zip
 * @param zipPath ZIP文件的路径
 * @returns 安装成功的插件元数据
 * @throws 如果解压失败、找不到metadata.json、解析失败或插件已存在，则抛出错误信息字符串
 */
export async function installPluginFromZip(
  zipPath: string
): Promise<PluginMetadata> {
  // 注意：此命令需要 AppHandle，invoke 会自动注入
  return await invoke<PluginMetadata>("install_plugin_from_zip", { zipPath });
}

/**
 * 从插件目录删除插件
 * 对应 src-tauri/src/plugin/api.rs -> uninstall_plugin
 * @param pluginId 要删除的插件ID
 * @throws 如果插件未加载或删除失败，则抛出错误信息字符串
 */
export async function uninstallPlugin(pluginId: string): Promise<void> {
  await invoke<void>("uninstall_plugin", { pluginId });
}
