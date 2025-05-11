import backend from "@/services";
import { ConfigOptions, PluginMetadata } from "@/types/plugin";
import { getPluginConfigFile } from "./config";
import { error, warn } from "@tauri-apps/plugin-log";

/**
 * 加载插件 (注意：后端接口需要完整的 PluginMetadata)
 * @param metadata 插件元数据对象
 */
export async function loadPlugin(metadata: PluginMetadata): Promise<void> {
  try {
    await backend.plugin.loadPlugin(metadata);
  } catch (err) {
    // 检查是否是"已经加载"错误
    if (String(err).includes("已经加载")) {
      warn(`尝试加载已存在的插件: ${metadata.id}`);
      // 在这种情况下，我们可能不需要重新抛出错误，而是认为它已经是加载状态
    } else {
      error(`加载插件 ${metadata.id} 失败: ${String(err)}`);
      throw err; // 重新抛出其他类型的错误
    }
  }
}

/**
 * 卸载插件
 * @param pluginId 插件ID
 */
export async function unloadPlugin(pluginId: string): Promise<void> {
  await backend.plugin.unloadPlugin(pluginId);
}

/**
 * 获取已加载插件列表
 */
export async function getPluginList(): Promise<PluginMetadata[]> {
  return await backend.plugin.getLoadedPlugins();
}

/**
 * 从配置加载所有插件
 */
export async function loadAllPlugins(): Promise<PluginMetadata[]> {
  let loadedPlugins: PluginMetadata[] = [];
  try {
    const currentBackendLoadedPlugins = await getPluginList(); // 获取后端实际加载的列表
    const currentBackendLoadedIds = new Set(
      currentBackendLoadedPlugins.map((p: PluginMetadata) => p.id),
    );
    const config = await getPluginConfigFile();
    const pluginIds = new Set<string>();

    // 去重，并确保元数据完整性
    const uniquePluginsFromConfig = config.plugins.reduce<PluginMetadata[]>(
      (acc: PluginMetadata[], p: PluginMetadata) => {
        if (!p || !p.id) {
          warn(`配置文件中发现无效插件条目，已跳过: ${String(p)}`);
          return acc;
        }
        if (!pluginIds.has(p.id)) {
          pluginIds.add(p.id);
          acc.push({
            ...p,
            description: p.description ?? undefined,
            author: p.author ?? undefined,
          });
        } else {
          warn(`配置文件中发现重复插件ID: ${p.id}，保留第一个`);
        }
        return acc;
      },
      [],
    );

    for (const pluginMetadata of uniquePluginsFromConfig) {
      try {
        if (currentBackendLoadedIds.has(pluginMetadata.id)) {
          loadedPlugins.push(pluginMetadata);
        } else {
          await loadPlugin(pluginMetadata); // 使用重构后的 loadPlugin
          loadedPlugins.push(pluginMetadata);
        }
      } catch (err) {
        if (!String(err).includes("已经加载")) {
          error(
            `加载插件 ${pluginMetadata.id} 时发生未预期错误: ${String(err)}`,
          );
        }
      }
    }
    return loadedPlugins;
  } catch (err) {
    error(`加载所有插件过程中发生严重错误: ${String(err)}`);
    return loadedPlugins; // 即使出错也返回已成功加载的部分
  }
}

export async function unloadAllPlugins(): Promise<void> {
  const plugins = await getPluginList();
  for (const plugin of plugins) {
    await unloadPlugin(plugin.id);
  }
}

/**
 * 重启插件系统 - 卸载所有插件并重新加载
 */
export async function restartPluginSystem(): Promise<PluginMetadata[]> {
  try {
    await unloadAllPlugins();
    return await loadAllPlugins();
  } catch (err) {
    error(`重启插件系统失败: ${String(err)}`);
    return [];
  }
}

/**
 * 获取所有插件的配置
 */
export async function getAllPluginConfig(): Promise<PluginMetadata[]> {
  const plugins = await getPluginList();
  console.log(plugins);
  return plugins.filter((p: PluginMetadata) => p.config_options);
}

/**
 * 获取指定插件的配置
 * @param pluginId 插件ID
 * @returns 插件的配置
 */
export async function getPluginConfig(
  pluginId: string,
): Promise<PluginMetadata | undefined> {
  const plugins = await getPluginList();
  return plugins.find((p: PluginMetadata) => p.id === pluginId);
}

/**
 * 设置指定插件的配置
 * @param pluginId 插件ID
 * @param config 插件的配置
 */
export async function setPluginConfig(
  pluginId: string,
  config: ConfigOptions[],
): Promise<void> {
  const plugins = await getPluginList();
  const plugin = plugins.find((p: PluginMetadata) => p.id === pluginId);
  if (plugin) {
    plugin.config_options = config;
  }
}
