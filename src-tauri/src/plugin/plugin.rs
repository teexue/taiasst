use std::collections::HashMap;
use std::ffi::CString;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::io::{self, Read};
use libloading::{Library, Symbol};
use serde::{Deserialize, Serialize};
use zip::ZipArchive;
use crate::file::config::get_config_dir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PluginMetadata {
    pub id: String,
    pub name: String,
    pub version: String,
    pub path: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub backend_entry: String,
}

// 插件函数类型定义
type PluginInitFn = unsafe extern "C" fn() -> i32;
type PluginCleanupFn = unsafe extern "C" fn() -> i32;

const PLUGIN_DIR: &str = "plugins";

pub struct Plugin {
    pub metadata: PluginMetadata,
    pub library: Option<Library>,
}

impl Plugin {
    pub fn new(metadata: PluginMetadata) -> Self {
        Self {
            metadata,
            library: None,
        }
    }

    pub fn load(&mut self, lib_path: &Path) -> Result<(), String> {
        unsafe {
            let library = Library::new(lib_path)
                .map_err(|e| format!("无法加载插件库: {}", e))?;

            // 调用初始化函数
            if !self.metadata.backend_entry.is_empty() {
                let init_fn_name = format!("{}_init", self.metadata.backend_entry);
                let init_fn: Symbol<PluginInitFn> = library
                    .get(init_fn_name.as_bytes())
                    .map_err(|e| format!("找不到插件初始化函数: {}", e))?;
                
                let result = init_fn();
                if result != 0 {
                    return Err(format!("插件初始化失败: 错误码 {}", result));
                }
            }

            self.library = Some(library);
            Ok(())
        }
    }

    pub fn unload(&mut self) -> Result<(), String> {
        if let Some(library) = &self.library {
            // 调用清理函数
            if !self.metadata.backend_entry.is_empty() {
                unsafe {
                    let cleanup_fn_name = format!("{}_cleanup", self.metadata.backend_entry);
                    let result = library
                        .get::<PluginCleanupFn>(cleanup_fn_name.as_bytes())
                        .map(|cleanup_fn| cleanup_fn())
                        .unwrap_or(0);
                    
                    if result != 0 {
                        return Err(format!("插件清理失败: 错误码 {}", result));
                    }
                }
            }
            
            // 释放库
            self.library = None;
        }
        
        Ok(())
    }
}

impl Drop for Plugin {
    fn drop(&mut self) {
        let _ = self.unload();
    }
}

pub struct PluginManager {
    plugins: HashMap<String, Plugin>,
    plugin_dir: PathBuf,
}

impl PluginManager {
    pub fn new(plugin_dir: PathBuf) -> Self {
        Self {
            plugins: HashMap::new(),
            plugin_dir,
        }
    }

    pub fn init(&mut self) -> Result<(), String> {
        // 确保插件目录存在
        if !self.plugin_dir.exists() {
            fs::create_dir_all(&self.plugin_dir)
                .map_err(|e| format!("无法创建插件目录: {}", e))?;
        }
        
        Ok(())
    }

    pub fn load_plugin(&mut self, metadata: PluginMetadata) -> Result<(), String> {
        // 检查是否已加载
        if self.plugins.contains_key(&metadata.id) {
            return Err(format!("插件 {} 已经加载", metadata.id));
        }

        // 创建插件实例
        let mut plugin = Plugin::new(metadata.clone());
        
        // 构建库文件路径
        if !metadata.backend_entry.is_empty() {
            // 尝试两种可能的路径
            // 1. 直接在plugins目录下 (原路径)
            // 2. plugins/[id]/[lib文件] (新的插件目录结构)
            
            let lib_filename = if cfg!(target_os = "windows") {
                format!("{}.dll", metadata.path)
            } else if cfg!(target_os = "macos") {
                format!("lib{}.dylib", metadata.path)
            } else {
                format!("lib{}.so", metadata.path)
            };
            
            let direct_lib_path = self.plugin_dir.join(&lib_filename);
            let plugin_dir_lib_path = self.plugin_dir.join(&metadata.id).join(&lib_filename);
            
            // 首先尝试在插件专用目录中查找
            let lib_path = if plugin_dir_lib_path.exists() {
                plugin_dir_lib_path
            } else if direct_lib_path.exists() {
                direct_lib_path
            } else {
                return Err(format!("找不到插件库文件: {} 或 {}", 
                    plugin_dir_lib_path.display(), direct_lib_path.display()));
            };

            // 加载库
            plugin.load(&lib_path)?;
        }
        
        // 添加到管理器
        self.plugins.insert(metadata.id.clone(), plugin);
        
        Ok(())
    }

    pub fn unload_plugin(&mut self, plugin_id: &str) -> Result<(), String> {
        if let Some(mut plugin) = self.plugins.remove(plugin_id) {
            plugin.unload()?;
            Ok(())
        } else {
            Err(format!("插件 {} 未加载", plugin_id))
        }
    }

    pub fn get_loaded_plugins(&self) -> Vec<PluginMetadata> {
        self.plugins.values().map(|p| p.metadata.clone()).collect()
    }

    pub fn call_plugin_function(&self, plugin_id: &str, function_name: &str, args: &[i32]) -> Result<i32, String> {
        if let Some(plugin) = self.plugins.get(plugin_id) {
            if let Some(library) = &plugin.library {
                unsafe {
                    let full_fn_name = format!("{}_{}", plugin.metadata.backend_entry, function_name);
                    let fn_name_c = CString::new(full_fn_name).unwrap();
                    
                    // 根据参数数量选择不同的函数签名
                    match args.len() {
                        0 => {
                            type FnType = unsafe extern "C" fn() -> i32;
                            let func: Symbol<FnType> = library
                                .get(fn_name_c.as_bytes())
                                .map_err(|e| format!("找不到插件函数: {}", e))?;
                            Ok(func())
                        },
                        1 => {
                            type FnType = unsafe extern "C" fn(i32) -> i32;
                            let func: Symbol<FnType> = library
                                .get(fn_name_c.as_bytes())
                                .map_err(|e| format!("找不到插件函数: {}", e))?;
                            Ok(func(args[0]))
                        },
                        2 => {
                            type FnType = unsafe extern "C" fn(i32, i32) -> i32;
                            let func: Symbol<FnType> = library
                                .get(fn_name_c.as_bytes())
                                .map_err(|e| format!("找不到插件函数: {}", e))?;
                            Ok(func(args[0], args[1]))
                        },
                        3 => {
                            type FnType = unsafe extern "C" fn(i32, i32, i32) -> i32;
                            let func: Symbol<FnType> = library
                                .get(fn_name_c.as_bytes())
                                .map_err(|e| format!("找不到插件函数: {}", e))?;
                            Ok(func(args[0], args[1], args[2]))
                        },
                        _ => Err("不支持的参数数量".to_string()),
                    }
                }
            } else {
                Err(format!("插件 {} 没有后端库", plugin_id))
            }
        } else {
            Err(format!("插件 {} 未加载", plugin_id))
        }
    }
}

// 全局插件管理器实例
lazy_static::lazy_static! {
    static ref PLUGIN_MANAGER: Arc<Mutex<Option<PluginManager>>> = Arc::new(Mutex::new(None));
}

// 初始化插件管理器
pub fn init_plugin_manager(app: tauri::AppHandle) -> Result<(), String> {
    let plugin_dir = get_config_dir(app).unwrap().join(PLUGIN_DIR);
    
    let mut manager = PluginManager::new(plugin_dir);
    manager.init()?;
    
    let mut global_manager = PLUGIN_MANAGER.lock().unwrap();
    *global_manager = Some(manager);
    
    Ok(())
}

// 获取插件目录路径
#[tauri::command]
pub async fn get_plugin_dir(app: tauri::AppHandle) -> Result<String, String> {
    let plugin_dir = get_config_dir(app).unwrap().join(PLUGIN_DIR);
    Ok(plugin_dir.to_string_lossy().to_string())
}

// 加载插件
#[tauri::command]
pub async fn load_plugin(metadata: PluginMetadata) -> Result<(), String> {
    let mut manager_lock = PLUGIN_MANAGER.lock().unwrap();
    if let Some(manager) = &mut *manager_lock {
        manager.load_plugin(metadata)
    } else {
        Err("插件管理器未初始化".to_string())
    }
}

// 卸载插件
#[tauri::command]
pub async fn unload_plugin(plugin_id: String) -> Result<(), String> {
    let mut manager_lock = PLUGIN_MANAGER.lock().unwrap();
    if let Some(manager) = &mut *manager_lock {
        manager.unload_plugin(&plugin_id)
    } else {
        Err("插件管理器未初始化".to_string())
    }
}

// 获取已加载的插件列表
#[tauri::command]
pub async fn get_loaded_plugins() -> Result<Vec<PluginMetadata>, String> {
    let manager_lock = PLUGIN_MANAGER.lock().unwrap();
    if let Some(manager) = &*manager_lock {
        Ok(manager.get_loaded_plugins())
    } else {
        Err("插件管理器未初始化".to_string())
    }
}

// 调用插件函数
#[tauri::command]
pub async fn call_plugin_function(plugin_id: String, function_name: String, args: Vec<i32>) -> Result<i32, String> {
    let manager_lock = PLUGIN_MANAGER.lock().unwrap();
    if let Some(manager) = &*manager_lock {
        manager.call_plugin_function(&plugin_id, &function_name, &args)
    } else {
        Err("插件管理器未初始化".to_string())
    }
}

// 从ZIP文件安装插件
#[tauri::command]
pub async fn install_plugin_from_zip(app: tauri::AppHandle, zip_path: String) -> Result<PluginMetadata, String> {
    // 获取插件目录
    let plugin_dir = get_config_dir(app).unwrap();
    
    // 确保插件目录存在
    if !plugin_dir.exists() {
        fs::create_dir_all(&plugin_dir)
            .map_err(|e| format!("无法创建插件目录: {}", e))?;
    }
    let zip_path = plugin_dir.join(zip_path);
    println!("插件文件: {}", zip_path.to_string_lossy());
    // 打开ZIP文件
    let file = fs::File::open(&zip_path)
        .map_err(|e| format!("无法打开ZIP文件: {}", e))?;
    
    // 创建ZIP存档
    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("无法读取ZIP存档: {}", e))?;
    
    // 查找并读取metadata.json文件
    let mut metadata_json = String::new();
    let mut metadata_found = false;
    
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| format!("无法访问ZIP文件内容: {}", e))?;
        
        let name = String::from(file.name()); // 创建字符串副本以避免借用冲突
        if name.ends_with("metadata.json") {
            file.read_to_string(&mut metadata_json)
                .map_err(|e| format!("无法读取元数据文件: {}", e))?;
            metadata_found = true;
            break;
        }
    }
    
    if !metadata_found {
        return Err("ZIP包中未找到metadata.json".to_string());
    }
    
    // 解析元数据
    let metadata: PluginMetadata = serde_json::from_str(&metadata_json)
        .map_err(|e| format!("元数据解析失败: {}", e))?;
    
    // 创建插件专用目录
    let plugin_specific_dir = plugin_dir.join("plugins").join(&metadata.id);
    if !plugin_specific_dir.exists() {
        fs::create_dir_all(&plugin_specific_dir)
            .map_err(|e| format!("无法创建插件专用目录: {}", e))?;
    }
    
    // 解压文件
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| format!("无法访问ZIP文件内容: {}", e))?;
        
        let name = String::from(file.name()); // 创建字符串副本以避免借用冲突
        let target_path = if name.starts_with(&format!("{}/", metadata.id)) {
            // 新格式: 插件ID/文件路径
            let relative_path = name.trim_start_matches(&format!("{}/", metadata.id));
            plugin_specific_dir.join(normalize_path(relative_path))
        } else {
            // 旧格式: 直接是文件路径
            plugin_specific_dir.join(normalize_path(&name))
        };
        
        if name.ends_with('/') {
            // 创建目录
            fs::create_dir_all(&target_path)
                .map_err(|e| format!("无法创建目录: {}", e))?;
        } else {
            // 确保父目录存在
            if let Some(parent) = target_path.parent() {
                if !parent.exists() {
                    fs::create_dir_all(parent)
                        .map_err(|e| format!("无法创建父目录: {}", e))?;
                }
            }
            
            // 提取文件
            let mut outfile = fs::File::create(&target_path)
                .map_err(|e| format!("无法创建文件: {}", e))?;
            
            io::copy(&mut file, &mut outfile)
                .map_err(|e| format!("无法写入文件: {}", e))?;

            println!("解压文件: {} -> {}", name, target_path.display());
        }
    }

    // 删除临时目录和ZIP文件
    fs::remove_file(&zip_path).unwrap_or_default();
    fs::remove_dir_all(&zip_path.parent().unwrap()).unwrap_or_default();
    
    println!("解压文件完成，准备加载插件");
    
    // 加载插件
    let mut manager_lock = PLUGIN_MANAGER.lock().unwrap();
    if let Some(manager) = &mut *manager_lock {
        manager.load_plugin(metadata.clone())?;
        
        Ok(metadata)
    } else {
        Err("插件管理器未初始化".to_string())
    }
}

// 规范化路径，确保在不同操作系统上都能正确处理
fn normalize_path(path: &str) -> String {
    let mut result = String::new();
    for c in path.chars() {
        if c == '\\' || c == '/' {
            result.push(std::path::MAIN_SEPARATOR);
        } else {
            result.push(c);
        }
    }
    result
} 
