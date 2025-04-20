/**
 * 文件路径管理
 *
 * 提供获取各种应用数据和配置目录路径的功能
 */
use std::path::PathBuf;
use tauri::Manager;

/**
 * 获取应用配置目录
 *
 * @param app Tauri应用句柄
 * @return 配置目录路径
 */
pub fn get_config_dir(app: tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map_err(|e| format!("无法获取应用配置目录: {}", e))
}

/**
 * 获取应用数据目录
 *
 * @param app Tauri应用句柄
 * @return 数据目录路径
 */
pub fn get_data_dir(app: tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| format!("无法获取应用数据目录: {}", e))
}

/**
 * 获取配置文件完整路径
 *
 * @param app Tauri应用句柄
 * @param file_name 配置文件名
 * @return 配置文件路径
 */
pub fn get_config_file_path(app: tauri::AppHandle, file_name: &str) -> Result<PathBuf, String> {
    let config_dir = get_config_dir(app)?;
    Ok(config_dir.join(file_name))
}
