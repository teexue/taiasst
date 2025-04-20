/**
 * 插件系统工具函数
 *
 * 提供插件路径获取、元数据读取等辅助功能
 */
use crate::file::paths::get_data_dir;
use crate::plugin::types::{
    PluginMetadata, PLUGIN_CONFIG_FILE_NAME, PLUGIN_DIR, PLUGIN_METADATA_FILE_NAME,
};
use std::fs;
use std::path::PathBuf;

/**
 * 获取插件基础目录
 *
 * @param app Tauri应用句柄
 * @return 插件基础目录路径
 */
#[tauri::command]
pub fn get_plugin_base_dir(app: tauri::AppHandle) -> Result<PathBuf, String> {
    let plugin_dir = get_data_dir(app)
        .map_err(|e| format!("获取数据目录失败: {}", e))?
        .join(PLUGIN_DIR);

    // 确保目录存在
    if !plugin_dir.exists() {
        fs::create_dir_all(&plugin_dir).map_err(|e| format!("创建插件目录失败: {}", e))?;
    }

    Ok(plugin_dir)
}

/**
 * 获取插件全局配置文件路径
 *
 * @param app Tauri应用句柄
 * @return 插件全局配置文件路径
 */
#[tauri::command]
pub fn get_plugin_global_config_path(app: tauri::AppHandle) -> Result<PathBuf, String> {
    let plugin_dir = get_plugin_base_dir(app)?;
    let config_file = plugin_dir.join(PLUGIN_CONFIG_FILE_NAME);
    Ok(config_file)
}

/**
 * 获取指定插件目录路径
 *
 * @param app Tauri应用句柄
 * @param plugin_id 插件ID
 * @return 插件目录路径
 */
#[tauri::command]
pub fn get_plugin_path(app: tauri::AppHandle, plugin_id: &str) -> Result<PathBuf, String> {
    let plugin_base_dir = get_plugin_base_dir(app)?;
    let plugin_dir = plugin_base_dir.join(plugin_id);

    // 确保插件目录存在
    if !plugin_dir.exists() {
        return Err(format!("插件目录不存在: {}", plugin_id));
    }

    Ok(plugin_dir)
}

/**
 * 获取指定插件的元数据
 *
 * @param app Tauri应用句柄
 * @param plugin_id 插件ID
 * @return 插件元数据
 */
#[tauri::command]
pub fn get_plugin_metadata(
    app: tauri::AppHandle,
    plugin_id: &str,
) -> Result<PluginMetadata, String> {
    let plugin_dir = get_plugin_path(app, plugin_id)?;
    let metadata_path = plugin_dir.join(PLUGIN_METADATA_FILE_NAME);

    if !metadata_path.exists() {
        return Err(format!("插件元数据文件不存在: {}", plugin_id));
    }

    let metadata =
        fs::read_to_string(&metadata_path).map_err(|e| format!("读取插件元数据文件失败: {}", e))?;

    let metadata: PluginMetadata =
        serde_json::from_str(&metadata).map_err(|e| format!("解析插件元数据失败: {}", e))?;

    Ok(metadata)
}
