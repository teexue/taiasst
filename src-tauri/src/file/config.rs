use crate::file::paths::get_config_file_path;
use crate::file::types::{AppConfig, APP_CONFIG_FILE_NAME};
/**
 * 配置文件管理
 *
 * 提供应用配置文件的读写操作
 */
use std::fs;

/**
 * 读取应用配置
 *
 * 如果配置文件不存在，则返回默认配置
 *
 * @param app Tauri应用句柄
 * @return 应用配置
 */
#[tauri::command]
pub fn read_app_config(app: tauri::AppHandle) -> Result<AppConfig, String> {
    // 获取配置文件路径
    let config_path = get_config_file_path(app, APP_CONFIG_FILE_NAME)?;

    // 配置文件不存在，返回默认配置
    if !config_path.exists() {
        return Ok(AppConfig {
            theme: "light".to_string(),
            language: "zh-CN".to_string(),
            auto_start: false,
            auto_check_update: true,
            window_width: 1024,
            window_height: 768,
        });
    }

    // 读取并解析配置文件
    let content =
        fs::read_to_string(&config_path).map_err(|err| format!("无法读取配置文件: {}", err))?;

    serde_json::from_str(&content).map_err(|err| format!("解析配置文件失败: {}", err))
}

/**
 * 写入应用配置
 *
 * @param app Tauri应用句柄
 * @param config 要写入的配置
 * @return 操作结果
 */
#[tauri::command]
pub fn write_app_config(app: tauri::AppHandle, config: AppConfig) -> Result<(), String> {
    // 获取配置文件路径
    let config_path = get_config_file_path(app, APP_CONFIG_FILE_NAME)?;

    // 确保配置目录存在
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("创建配置目录失败: {}", err))?;
    }

    // 序列化并写入配置
    let content =
        serde_json::to_string_pretty(&config).map_err(|err| format!("序列化配置失败: {}", err))?;

    fs::write(&config_path, content).map_err(|err| format!("写入配置文件失败: {}", err))
}
