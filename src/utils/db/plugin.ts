import {
  PluginMetadata,
  Origin,
  ConfigOptions,
  MenuOptions,
  PluginDependency,
  PluginType,
  PluginConfig,
} from "@/types/plugin";
import { execute, select } from "@/utils/db";
import { error } from "@tauri-apps/plugin-log";

/**
 * 获取当前时间戳
 * @returns 当前Unix时间戳（秒）
 */
function now(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * 将插件元数据保存到数据库
 * @param metadata 插件元数据
 * @param origin 插件来源
 */
export async function savePluginMetadata(
  metadata: PluginMetadata,
  origin: Origin
): Promise<void> {
  const timestamp = now();
  const pluginTypeStr = metadata.plugin_type
    ? String(metadata.plugin_type).toLowerCase()
    : null;

  try {
    // 检查插件是否已存在
    const existingPlugin = await select<{ plugin_id: string }>(
      "SELECT plugin_id FROM plugin_metadata WHERE plugin_id = ?",
      [metadata.id]
    );

    // 使用事务处理
    await execute("BEGIN TRANSACTION");

    if (existingPlugin.length > 0) {
      // 更新插件元数据
      await execute(
        `UPDATE plugin_metadata SET 
        name = ?, 
        version = ?, 
        origin = ?, 
        plugin_type = ?, 
        description = ?, 
        author = ?, 
        has_backend = ?, 
        backend_lib = ?, 
        updated_at = ? 
        WHERE plugin_id = ?`,
        [
          metadata.name,
          metadata.version,
          origin,
          pluginTypeStr,
          metadata.description,
          metadata.author,
          metadata.has_backend ? 1 : 0,
          metadata.backend_lib,
          timestamp,
          metadata.id,
        ]
      );

      // 清除旧数据
      await execute("DELETE FROM plugin_dependency WHERE plugin_id = ?", [
        metadata.id,
      ]);
      await execute("DELETE FROM plugin_menu_options WHERE plugin_id = ?", [
        metadata.id,
      ]);
      await execute("DELETE FROM plugin_config_options WHERE plugin_id = ?", [
        metadata.id,
      ]);
    } else {
      // 插入新的插件元数据
      await execute(
        `INSERT INTO plugin_metadata 
        (plugin_id, name, version, origin, plugin_type, description, author, has_backend, backend_lib, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          metadata.id,
          metadata.name,
          metadata.version,
          origin,
          pluginTypeStr,
          metadata.description,
          metadata.author,
          metadata.has_backend ? 1 : 0,
          metadata.backend_lib,
          timestamp,
          timestamp,
        ]
      );
    }

    // 插入依赖
    if (metadata.dependencies) {
      for (const dep of metadata.dependencies) {
        await execute(
          `INSERT INTO plugin_dependency (plugin_id, dependency_id, dependency_version, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?)`,
          [metadata.id, dep.id, dep.version, timestamp, timestamp]
        );
      }
    }

    // 插入菜单选项
    if (metadata.menu_options) {
      await execute(
        `INSERT INTO plugin_menu_options 
        (plugin_id, show_in_menu, menu_icon, menu_title, menu_order, menu_group, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          metadata.id,
          metadata.menu_options.show_in_menu ? 1 : 0,
          metadata.menu_options.menu_icon,
          metadata.menu_options.menu_title,
          metadata.menu_options.menu_order,
          metadata.menu_options.menu_group,
          timestamp,
          timestamp,
        ]
      );
    }

    // 插入配置选项
    if (metadata.config_options) {
      for (const option of metadata.config_options) {
        const optionsJson = option.options
          ? JSON.stringify(option.options)
          : null;

        await execute(
          `INSERT INTO plugin_config_options 
          (plugin_id, name, description, default_value, options, required, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            metadata.id,
            option.name,
            option.description,
            option.default_value,
            optionsJson,
            option.required ? 1 : 0,
            timestamp,
            timestamp,
          ]
        );
      }
    }

    // 提交事务
    await execute("COMMIT");
  } catch (err) {
    // 回滚事务
    await execute("ROLLBACK");
    error(`保存插件元数据失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 从数据库获取插件列表
 * @returns 插件元数据列表
 */
export async function getPluginList(): Promise<PluginMetadata[]> {
  try {
    // 查询所有插件元数据
    const metadataRows = await select<{
      plugin_id: string;
      name: string;
      version: string;
      origin: string;
      plugin_type: string;
      description: string;
      author: string;
      has_backend: number;
      backend_lib: string;
    }>("SELECT * FROM plugin_metadata");

    const results: PluginMetadata[] = [];

    for (const row of metadataRows) {
      // 获取插件依赖
      const dependencies = await getPluginDependencies(row.plugin_id);

      // 获取菜单选项
      const menuOptions = await getPluginMenuOptions(row.plugin_id);

      // 获取配置选项
      const configOptions = await getPluginConfigOptions(row.plugin_id);

      // 转换插件类型
      let pluginType: PluginType | undefined = undefined;
      if (row.plugin_type) {
        const lowerType = row.plugin_type.toLowerCase();
        if (
          lowerType === "tool" ||
          lowerType === "system" ||
          lowerType === "ai"
        ) {
          pluginType = lowerType as PluginType;
        }
      }

      // 构建插件元数据
      const metadata: PluginMetadata = {
        id: row.plugin_id,
        name: row.name,
        version: row.version,
        origin: row.origin as Origin,
        plugin_type: pluginType,
        description: row.description,
        author: row.author,
        has_backend: row.has_backend === 1,
        backend_lib: row.backend_lib,
        dependencies: dependencies.length > 0 ? dependencies : undefined,
        menu_options: menuOptions || undefined,
        config_options: configOptions.length > 0 ? configOptions : undefined,
      };

      results.push(metadata);
    }

    return results;
  } catch (err) {
    error(`获取插件列表失败: ${String(err)}`);
    return [];
  }
}

/**
 * 获取单个插件元数据
 * @param pluginId 插件ID
 * @returns 插件元数据，如果不存在则返回null
 */
export async function getPlugin(
  pluginId: string
): Promise<PluginMetadata | null> {
  try {
    // 查询插件元数据
    const metadataRows = await select<{
      plugin_id: string;
      name: string;
      version: string;
      origin: string;
      plugin_type: string;
      description: string;
      author: string;
      has_backend: number;
      backend_lib: string;
    }>("SELECT * FROM plugin_metadata WHERE plugin_id = ?", [pluginId]);

    if (metadataRows.length === 0) {
      return null;
    }

    const row = metadataRows[0];

    // 获取插件依赖
    const dependencies = await getPluginDependencies(row.plugin_id);

    // 获取菜单选项
    const menuOptions = await getPluginMenuOptions(row.plugin_id);

    // 获取配置选项
    const configOptions = await getPluginConfigOptions(row.plugin_id);

    // 转换插件类型
    let pluginType: PluginType | undefined = undefined;
    if (row.plugin_type) {
      const lowerType = row.plugin_type.toLowerCase();
      if (
        lowerType === "tool" ||
        lowerType === "system" ||
        lowerType === "ai"
      ) {
        pluginType = lowerType as PluginType;
      }
    }

    // 构建插件元数据
    const metadata: PluginMetadata = {
      id: row.plugin_id,
      name: row.name,
      version: row.version,
      origin: row.origin as Origin,
      plugin_type: pluginType,
      description: row.description,
      author: row.author,
      has_backend: row.has_backend === 1,
      backend_lib: row.backend_lib,
      dependencies: dependencies.length > 0 ? dependencies : undefined,
      menu_options: menuOptions || undefined,
      config_options: configOptions.length > 0 ? configOptions : undefined,
    };

    return metadata;
  } catch (err) {
    error(`获取插件失败: ${String(err)}`);
    return null;
  }
}

/**
 * 获取插件依赖列表
 * @param pluginId 插件ID
 * @returns 插件依赖列表
 */
async function getPluginDependencies(
  pluginId: string
): Promise<PluginDependency[]> {
  try {
    const rows = await select<{
      dependency_id: string;
      dependency_version: string;
    }>(
      "SELECT dependency_id, dependency_version FROM plugin_dependency WHERE plugin_id = ?",
      [pluginId]
    );

    return rows.map((row) => ({
      id: row.dependency_id,
      version: row.dependency_version,
    }));
  } catch (err) {
    error(`获取插件依赖失败: ${String(err)}`);
    return [];
  }
}

/**
 * 获取插件菜单选项
 * @param pluginId 插件ID
 * @returns 插件菜单选项，如果不存在则返回null
 */
async function getPluginMenuOptions(
  pluginId: string
): Promise<MenuOptions | null> {
  try {
    const rows = await select<{
      show_in_menu: number;
      menu_icon: string;
      menu_title: string;
      menu_order: number;
      menu_group: string;
    }>(
      "SELECT show_in_menu, menu_icon, menu_title, menu_order, menu_group FROM plugin_menu_options WHERE plugin_id = ?",
      [pluginId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      show_in_menu: row.show_in_menu === 1,
      menu_icon: row.menu_icon,
      menu_title: row.menu_title,
      menu_order: row.menu_order,
      menu_group: row.menu_group,
    };
  } catch (err) {
    error(`获取插件菜单选项失败: ${String(err)}`);
    return null;
  }
}

/**
 * 获取插件配置选项
 * @param pluginId 插件ID
 * @returns 插件配置选项列表
 */
async function getPluginConfigOptions(
  pluginId: string
): Promise<ConfigOptions[]> {
  try {
    const rows = await select<{
      name: string;
      description: string;
      default_value: string;
      options: string;
      required: number;
    }>(
      "SELECT name, description, default_value, options, required FROM plugin_config_options WHERE plugin_id = ?",
      [pluginId]
    );

    return rows.map((row) => {
      let options: string[] | undefined = undefined;
      if (row.options) {
        try {
          options = JSON.parse(row.options);
        } catch (e) {
          // 忽略解析错误
        }
      }

      return {
        name: row.name,
        description: row.description,
        default_value: row.default_value,
        options,
        required: row.required === 1,
      };
    });
  } catch (err) {
    error(`获取插件配置选项失败: ${String(err)}`);
    return [];
  }
}

/**
 * 删除插件
 * @param pluginId 插件ID
 * @returns 是否删除成功
 */
export async function deletePlugin(pluginId: string): Promise<boolean> {
  try {
    // 插件元数据表有外键约束，删除插件元数据会级联删除其他相关数据
    const result = await execute(
      "DELETE FROM plugin_metadata WHERE plugin_id = ?",
      [pluginId]
    );
    return result.rowsAffected > 0;
  } catch (err) {
    error(`删除插件失败: ${String(err)}`);
    return false;
  }
}

/**
 * 获取插件配置
 * @param pluginId 插件ID
 * @returns 插件配置对象，如果不存在则返回空对象
 */
export async function getPluginConfig(pluginId: string): Promise<any> {
  try {
    const rows = await select<{ config_data: string }>(
      "SELECT config_data FROM plugin_config_data WHERE plugin_id = ?",
      [pluginId]
    );

    if (rows.length === 0) {
      return {};
    }

    return JSON.parse(rows[0].config_data);
  } catch (err) {
    error(`获取插件配置失败: ${String(err)}`);
    return {};
  }
}

/**
 * 设置插件配置
 * @param pluginId 插件ID
 * @param config 插件配置对象
 * @returns 是否设置成功
 */
export async function setPluginConfig(
  pluginId: string,
  config: any
): Promise<boolean> {
  const timestamp = now();
  const configJson = JSON.stringify(config);

  try {
    // 检查插件是否存在
    const pluginExists = await select<{ plugin_id: string }>(
      "SELECT plugin_id FROM plugin_metadata WHERE plugin_id = ?",
      [pluginId]
    );

    if (pluginExists.length === 0) {
      error(`插件 ${pluginId} 不存在，无法设置配置`);
      return false;
    }

    // 检查配置是否已存在
    const configExists = await select<{ id: number }>(
      "SELECT id FROM plugin_config_data WHERE plugin_id = ?",
      [pluginId]
    );

    if (configExists.length > 0) {
      // 更新现有配置
      await execute(
        "UPDATE plugin_config_data SET config_data = ?, updated_at = ? WHERE plugin_id = ?",
        [configJson, timestamp, pluginId]
      );
    } else {
      // 插入新配置
      await execute(
        "INSERT INTO plugin_config_data (plugin_id, config_data, created_at, updated_at) VALUES (?, ?, ?, ?)",
        [pluginId, configJson, timestamp, timestamp]
      );
    }

    return true;
  } catch (err) {
    error(`设置插件配置失败: ${String(err)}`);
    return false;
  }
}

/**
 * 删除插件配置
 * @param pluginId 插件ID
 * @returns 是否删除成功
 */
export async function deletePluginConfig(pluginId: string): Promise<boolean> {
  try {
    const result = await execute(
      "DELETE FROM plugin_config_data WHERE plugin_id = ?",
      [pluginId]
    );
    return result.rowsAffected > 0;
  } catch (err) {
    error(`删除插件配置失败: ${String(err)}`);
    return false;
  }
}

/**
 * 获取所有插件配置
 * @returns 包含所有插件配置的对象，键为插件ID
 */
export async function getAllPluginConfigs(): Promise<Record<string, any>> {
  try {
    const rows = await select<{ plugin_id: string; config_data: string }>(
      "SELECT plugin_id, config_data FROM plugin_config_data"
    );

    const result: Record<string, any> = {};
    for (const row of rows) {
      try {
        result[row.plugin_id] = JSON.parse(row.config_data);
      } catch (e) {
        error(`解析插件 ${row.plugin_id} 的配置失败: ${String(e)}`);
        result[row.plugin_id] = {};
      }
    }

    return result;
  } catch (err) {
    error(`获取所有插件配置失败: ${String(err)}`);
    return {};
  }
}

/**
 * 将所有插件元数据和配置整合为原config.json格式
 * @returns 符合原config.json格式的对象
 */
export async function getPluginConfigFile(): Promise<PluginConfig> {
  try {
    const plugins = await getPluginList();
    const configs = await getAllPluginConfigs();

    return {
      plugins,
      configs,
    };
  } catch (err) {
    error(`获取插件配置文件失败: ${String(err)}`);
    return {
      plugins: [],
      configs: {},
    };
  }
}

/**
 * 将插件元数据添加到数据库
 * @param metadata 插件元数据
 * @param origin 插件来源
 */
export async function addPluginToConfig(
  metadata: PluginMetadata,
  origin: Origin
): Promise<void> {
  await savePluginMetadata(metadata, origin);
}

/**
 * 从数据库中移除插件元数据
 * @param pluginId 插件ID
 */
export async function removePluginFromConfig(pluginId: string): Promise<void> {
  await deletePlugin(pluginId);
}
