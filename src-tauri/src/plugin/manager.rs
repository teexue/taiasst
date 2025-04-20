/**
 * 插件管理器实现
 *
 * 负责插件的加载、卸载和管理
 */
use crate::plugin::core::Plugin;
use crate::plugin::types::PluginMetadata;
use crate::plugin::utils::get_plugin_base_dir;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex, MutexGuard};
use tauri::AppHandle;

// 使用lazy_static管理全局插件管理器实例
lazy_static::lazy_static! {
    static ref PLUGIN_MANAGER: Arc<Mutex<Option<PluginManager>>> = Arc::new(Mutex::new(None));
}

/**
 * 插件管理器结构体
 *
 * 管理已加载的插件及其状态
 */
pub struct PluginManager {
    /// 已加载的插件映射，以插件ID为键
    plugins: HashMap<String, Plugin>,
    /// 插件目录路径
    plugin_dir: PathBuf,
}

impl PluginManager {
    /**
     * 创建新的插件管理器
     *
     * @param plugin_dir 插件目录路径
     * @return 插件管理器实例
     */
    pub fn new(plugin_dir: PathBuf) -> Self {
        Self {
            plugins: HashMap::new(),
            plugin_dir,
        }
    }

    /**
     * 初始化插件管理器
     *
     * @return 初始化结果
     */
    pub fn init(&mut self) -> Result<(), String> {
        // 确保插件目录存在
        if !self.plugin_dir.exists() {
            fs::create_dir_all(&self.plugin_dir).map_err(|e| format!("无法创建插件目录: {}", e))?;
        }

        Ok(())
    }

    /**
     * 加载插件
     *
     * @param metadata 插件元数据
     * @return 加载结果
     */
    pub fn load_plugin(&mut self, metadata: PluginMetadata) -> Result<(), String> {
        // 检查是否已加载
        if self.plugins.contains_key(&metadata.id) {
            return Err(format!("插件 {} 已经加载", metadata.id));
        }

        // 创建插件实例
        let mut plugin = Plugin::new(metadata.clone());

        // 如果插件有后端组件，加载库文件
        if metadata.has_backend {
            let lib_filename = metadata
                .backend_lib
                .as_ref()
                .ok_or_else(|| "插件声明有后端但未指定库文件".to_string())?;

            // 尝试两种可能的路径
            // 1. 插件专用目录: plugins/[id]/[lib文件]
            // 2. 公共目录: plugins/[lib文件]
            let plugin_dir_lib_path = self.plugin_dir.join(&metadata.id).join(lib_filename);
            let direct_lib_path = self.plugin_dir.join(lib_filename);

            // 确定库文件路径
            let lib_path = if plugin_dir_lib_path.exists() {
                plugin_dir_lib_path
            } else if direct_lib_path.exists() {
                direct_lib_path
            } else {
                return Err(format!(
                    "找不到插件库文件: {} 或 {}",
                    plugin_dir_lib_path.display(),
                    direct_lib_path.display()
                ));
            };

            // 加载库
            plugin.load(&lib_path)?;
        }

        // 添加到管理器
        self.plugins.insert(metadata.id.clone(), plugin);
        Ok(())
    }

    /**
     * 卸载插件
     *
     * @param plugin_id 插件ID
     * @return 卸载结果
     */
    pub fn unload_plugin(&mut self, plugin_id: &str) -> Result<(), String> {
        if let Some(mut plugin) = self.plugins.remove(plugin_id) {
            plugin.unload()?;
            Ok(())
        } else {
            Err(format!("插件 {} 未加载", plugin_id))
        }
    }

    /**
     * 获取所有已加载插件的元数据
     *
     * @return 插件元数据列表
     */
    pub fn get_loaded_plugins(&self) -> Vec<PluginMetadata> {
        self.plugins.values().map(|p| p.metadata.clone()).collect()
    }

    /**
     * 调用插件函数
     *
     * @param plugin_id 插件ID
     * @param function_name 函数名称
     * @param args 函数参数
     * @return 函数执行结果
     */
    pub fn call_plugin_function(
        &self,
        plugin_id: &str,
        function_name: &str,
        args: &[i32],
    ) -> Result<i32, String> {
        if let Some(plugin) = self.plugins.get(plugin_id) {
            plugin.call_function(function_name, args)
        } else {
            Err(format!("插件 {} 未加载", plugin_id))
        }
    }
}

/**
 * 初始化全局插件管理器
 *
 * @param app Tauri应用句柄
 * @return 初始化结果
 */
pub fn init_plugin_manager(app: AppHandle) -> Result<(), String> {
    let plugin_dir = get_plugin_base_dir(app)?;
    let mut manager = PluginManager::new(plugin_dir);

    // 初始化管理器
    manager.init()?;

    // 存储全局实例
    let mut global_manager = PLUGIN_MANAGER.lock().unwrap();
    *global_manager = Some(manager);

    Ok(())
}

/**
 * 获取全局插件管理器实例的锁
 *
 * @return 插件管理器实例锁
 */
pub fn get_plugin_manager() -> Result<MutexGuard<'static, Option<PluginManager>>, String> {
    PLUGIN_MANAGER
        .lock()
        .map_err(|e| format!("获取插件管理器锁失败: {}", e))
}
