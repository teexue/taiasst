use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct LocalTool {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub path: String,
    pub r#type: String,
    pub category: String,
    pub tags: Vec<String>,
    pub version: String,
    pub author: String,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LocalToolConfig {
    pub tools: Vec<LocalTool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub theme: String,
    pub language: String,
    pub auto_start: bool,
    pub auto_check_update: bool,
    pub window_width: u32,
    pub window_height: u32,
}

const LOCAL_TOOLS_CONFIG_FILE_NAME: &str = "local-tools.json";
const LOCAL_APP_CONFIG_FILE_NAME: &str = "app.json";

pub fn get_config_dir(app: tauri::AppHandle) -> Result<PathBuf, String> {
    let config_dir = app.path().app_config_dir().unwrap();
    Ok(config_dir)
}

pub fn get_config_path(app: tauri::AppHandle, file_name: &str) -> Result<PathBuf, String> {
    let config_dir = get_config_dir(app).unwrap();
    let config_path = config_dir.join(file_name);
    Ok(config_path)
}

#[tauri::command]
pub fn read_local_app_config(app: tauri::AppHandle) -> Result<AppConfig, String> {
    let config_path = get_config_path(app, LOCAL_APP_CONFIG_FILE_NAME).unwrap();
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

    let content =
        fs::read_to_string(&config_path).map_err(|err| format!("无法读取配置文件: {}", err))?;
    serde_json::from_str(&content).map_err(|err| format!("解析配置文件失败: {}", err))
}

#[tauri::command]
pub fn write_local_app_config(app: tauri::AppHandle, config: AppConfig) -> Result<(), String> {
    let config_path = get_config_path(app, LOCAL_APP_CONFIG_FILE_NAME).unwrap();
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("创建配置目录失败: {}", err))?;
    }
    let content =
        serde_json::to_string_pretty(&config).map_err(|err| format!("序列化配置失败: {}", err))?;
    fs::write(&config_path, content).map_err(|err| format!("写入配置文件失败: {}", err))
}

#[tauri::command]
pub fn read_local_tools_config(app: tauri::AppHandle) -> Result<LocalToolConfig, String> {
    let config_path = get_config_path(app, LOCAL_TOOLS_CONFIG_FILE_NAME).unwrap();

    if !config_path.exists() {
        return Ok(LocalToolConfig { tools: vec![] });
    }

    let content =
        fs::read_to_string(&config_path).map_err(|err| format!("无法读取配置文件: {}", err))?;

    serde_json::from_str(&content).map_err(|err| format!("解析配置文件失败: {}", err))
}

#[tauri::command]
pub fn write_local_tools_config(
    app: tauri::AppHandle,
    config: LocalToolConfig,
) -> Result<(), String> {
    let config_path = get_config_path(app, LOCAL_TOOLS_CONFIG_FILE_NAME).unwrap();
    // 确保配置目录存在
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("创建配置目录失败: {}", err))?;
    }

    let content =
        serde_json::to_string_pretty(&config).map_err(|err| format!("序列化配置失败: {}", err))?;

    fs::write(&config_path, content).map_err(|err| format!("写入配置文件失败: {}", err))
}
