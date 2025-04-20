/**
 * 插件系统类型和常量定义
 */
use serde::{Deserialize, Serialize};

/// 插件目录名称
pub const PLUGIN_DIR: &str = "plugins";
/// 插件元数据文件名
pub const PLUGIN_METADATA_FILE_NAME: &str = "metadata.json";
/// 插件配置文件名
pub const PLUGIN_CONFIG_FILE_NAME: &str = "config.json";
/// 插件初始化函数名称
pub const PLUGIN_INIT_FUNCTION_NAME: &str = "plugin_init";
/// 插件清理函数名称后缀
pub const PLUGIN_CLEANUP_SUFFIX: &str = "_cleanup";

/**
 * 插件类型枚举
 */
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum PluginType {
    /// 工具插件
    #[serde(rename = "tool")]
    Tool,
    /// 系统插件
    #[serde(rename = "system")]
    System,
    /// AI插件
    #[serde(rename = "ai")]
    Ai,
}

/**
 * 插件依赖定义
 */
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PluginDependency {
    /// 依赖插件ID
    pub id: String,
    /// 依赖插件版本
    pub version: String,
}

/**
 * 插件菜单选项
 */
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MenuOptions {
    /// 是否在菜单显示
    pub show_in_menu: bool,
    /// 菜单图标
    pub menu_icon: Option<String>,
    /// 菜单显示名称
    pub menu_title: Option<String>,
    /// 菜单排序
    pub menu_order: Option<i32>,
    /// 菜单分组
    pub menu_group: Option<String>,
}

/**
 * 插件配置选项
 */
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConfigOptions {
    /// 配置名称
    pub name: String,
    /// 配置描述
    pub description: Option<String>,
    /// 配置默认值
    pub default_value: Option<String>,
    /// 配置选项
    pub options: Option<Vec<String>>,
    /// 配置是否必填
    pub required: bool,
}

/**
 * 插件元数据
 */
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PluginMetadata {
    /// 插件ID
    pub id: String,
    /// 插件名称
    pub name: String,
    /// 插件版本
    pub version: String,
    /// 插件来源
    pub origin: Option<String>,
    /// 插件类型
    pub plugin_type: Option<PluginType>,
    /// 插件描述
    pub description: Option<String>,
    /// 插件作者
    pub author: Option<String>,
    /// 插件是否包含后端
    pub has_backend: bool,
    /// 后端库文件
    pub backend_lib: Option<String>,
    /// 插件依赖
    pub dependencies: Option<Vec<PluginDependency>>,
    /// 插件菜单选项
    pub menu_options: Option<MenuOptions>,
    /// 插件配置选项
    pub config_options: Option<Vec<ConfigOptions>>,
}
