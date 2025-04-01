use serde::{Deserialize, Serialize};
use tauri::Manager;
use std::fs;

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

#[tauri::command]
pub fn get_config_dir(app: tauri::AppHandle) -> Result<String, String> {
    let config_dir = app.path().app_config_dir().unwrap();
    Ok(config_dir.display().to_string())
}

#[tauri::command]
pub fn read_local_tools_config(app: tauri::AppHandle) -> Result<LocalToolConfig, String> {
    let config_path = app.path().app_config_dir().unwrap().join("local-tools.json");

    if !config_path.exists() {
        return Ok(LocalToolConfig { tools: vec![] });
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|err| format!("无法读取配置文件: {}", err))?;
    
    serde_json::from_str(&content)
        .map_err(|err| format!("解析配置文件失败: {}", err))
}

#[tauri::command]
pub fn write_local_tools_config(app: tauri::AppHandle, config: LocalToolConfig) -> Result<(), String> {
    let config_path = app.path().app_config_dir().unwrap().join("local-tools.json");
    // 确保配置目录存在
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|err| format!("创建配置目录失败: {}", err))?;
    }

    let content = serde_json::to_string_pretty(&config)
        .map_err(|err| format!("序列化配置失败: {}", err))?;
    
    fs::write(&config_path, content)
        .map_err(|err| format!("写入配置文件失败: {}", err))
} 