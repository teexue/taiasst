import { message, MessageDialogOptions } from "@tauri-apps/plugin-dialog";
import backend from "@/utils/backend";
import { error } from "@tauri-apps/plugin-log";
import { PluginConfig, PluginMetadata, Origin } from "@/types/plugin";
import * as pluginDb from "@/utils/db/plugin";

/**
 * 获取插件默认配置
 */
export async function getDefaultPluginConfig(): Promise<PluginConfig> {
  return {
    plugins: [],
    configs: {},
  };
}

/**
 * 获取插件目录
 * @returns 插件目录路径
 */
export async function getPluginBaseDir(): Promise<string> {
  return await backend.plugin.getPluginBaseDir();
}

/**
 * 获取特定插件的配置
 * @param pluginId 插件ID
 * @returns 插件配置对象，如果不存在则返回空对象
 */
export async function getPluginConfig(pluginId: string): Promise<any> {
  try {
    return await pluginDb.getPluginConfig(pluginId);
  } catch (err) {
    error(`获取插件 ${pluginId} 配置失败: ${String(err)}`);
    return {};
  }
}

/**
 * 设置特定插件的配置
 * @param pluginId 插件ID
 * @param pluginSpecificConfig 要保存的配置对象
 */
export async function setPluginConfig(
  pluginId: string,
  pluginSpecificConfig: any,
): Promise<boolean> {
  try {
    return await pluginDb.setPluginConfig(pluginId, pluginSpecificConfig);
  } catch (err) {
    error(`保存插件 ${pluginId} 配置失败: ${String(err)}`);
    return false;
  }
}

/**
 * 获取插件配置目录路径（保留函数，兼容旧代码）
 */
export async function getPluginConfigDir(): Promise<string> {
  // 使用数据库后不再需要配置目录，但保留函数以兼容旧代码
  const baseDir = await getPluginBaseDir();
  return baseDir;
}

/**
 * 获取插件配置文件路径（保留函数，兼容旧代码）
 */
export async function getPluginConfigPath(): Promise<string> {
  // 使用数据库后不再需要配置文件路径，但保留函数以兼容旧代码
  const baseDir = await getPluginBaseDir();
  return baseDir + "/config.json";
}

/**
 * 读取插件配置信息
 * @returns 插件配置文件内容
 */
export async function getPluginConfigFile(): Promise<PluginConfig> {
  try {
    return await pluginDb.getPluginConfigFile();
  } catch (err) {
    error(`读取插件配置文件过程出错: ${String(err)}`);
    return getDefaultPluginConfig();
  }
}

/**
 * 保存插件配置文件（不再实际写入文件，仅作为兼容层使用）
 * @param config 插件配置
 */
export async function savePluginConfigFile(
  config: PluginConfig,
): Promise<void> {
  try {
    // 将config中的插件保存到数据库
    for (const plugin of config.plugins) {
      await pluginDb.savePluginMetadata(plugin, plugin.origin || "local");
    }

    // 将config中的配置保存到数据库
    for (const [pluginId, pluginConfig] of Object.entries(config.configs)) {
      await pluginDb.setPluginConfig(pluginId, pluginConfig);
    }
  } catch (err) {
    const options: MessageDialogOptions = {
      title: "插件配置错误",
    };
    await message("保存插件配置文件失败: " + String(err), options);
    error(`保存插件配置文件失败: ${String(err)}`);
  }
}

/**
 * 将插件元数据添加到配置
 * @param metadata 插件元数据
 * @param origin 插件来源
 */
export async function addPluginToConfig(
  metadata: PluginMetadata,
  origin: Origin,
): Promise<void> {
  try {
    await pluginDb.addPluginToConfig(metadata, origin);
  } catch (err) {
    error(`添加插件 ${metadata.id} 到配置失败: ${String(err)}`);
  }
}

/**
 * 从配置中移除插件元数据
 * @param pluginId 插件ID
 */
export async function removePluginFromConfig(pluginId: string): Promise<void> {
  try {
    await pluginDb.removePluginFromConfig(pluginId);
  } catch (err) {
    error(`从配置中移除插件 ${pluginId} 失败: ${String(err)}`);
  }
}
