/**
 * 文件操作的类型和常量定义
 */
use serde::{Deserialize, Serialize};

/// 应用配置文件名称
pub const APP_CONFIG_FILE_NAME: &str = "app.json";

/**
 * 应用配置结构
 */
#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    /// 主题
    pub theme: String,
    /// 语言
    pub language: String,
    /// 是否自动启动
    pub auto_start: bool,
    /// 是否自动检查更新
    pub auto_check_update: bool,
    /// 窗口宽度
    pub window_width: u32,
    /// 窗口高度
    pub window_height: u32,
}
