/**
 * 插件核心类型和方法
 *
 * 提供插件加载和卸载的核心实现
 */
use crate::plugin::types::{PluginMetadata, PLUGIN_CLEANUP_SUFFIX, PLUGIN_INIT_FUNCTION_NAME};
use libloading::{Library, Symbol};
use std::path::Path;

/// 插件初始化函数类型
type PluginInitFn = unsafe extern "C" fn() -> i32;
/// 插件清理函数类型
type PluginCleanupFn = unsafe extern "C" fn() -> i32;
/// 通用插件函数类型
type PluginFunction = unsafe extern "C" fn(args: *const i32, arg_count: i32) -> i32;

/**
 * 插件结构体
 *
 * 表示一个已加载的插件，包含元数据和库句柄
 */
pub struct Plugin {
    /// 插件元数据
    pub metadata: PluginMetadata,
    /// 插件库句柄
    pub library: Option<Library>,
}

impl Plugin {
    /**
     * 创建新的插件实例
     *
     * @param metadata 插件元数据
     * @return 插件实例
     */
    pub fn new(metadata: PluginMetadata) -> Self {
        Self {
            metadata,
            library: None,
        }
    }

    /**
     * 加载插件库
     *
     * @param lib_path 插件库文件路径
     * @return 加载结果
     */
    pub fn load(&mut self, lib_path: &Path) -> Result<(), String> {
        unsafe {
            // 加载动态库
            let library = Library::new(lib_path).map_err(|e| format!("无法加载插件库: {}", e))?;

            // 如果插件包含后端，调用初始化函数
            if self.metadata.has_backend {
                let init_fn: Symbol<PluginInitFn> = library
                    .get(PLUGIN_INIT_FUNCTION_NAME.as_bytes())
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

    /**
     * 卸载插件库
     *
     * @return 卸载结果
     */
    pub fn unload(&mut self) -> Result<(), String> {
        if let Some(library) = &self.library {
            // 如果插件包含后端，调用清理函数
            if self.metadata.has_backend {
                unsafe {
                    // 获取库前缀（解决linter错误）
                    let lib_name = match &self.metadata.backend_lib {
                        Some(name) => name.clone(),
                        None => "plugin".to_string(),
                    };

                    let cleanup_fn_name = format!("{}{}", lib_name, PLUGIN_CLEANUP_SUFFIX);

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

    /**
     * 调用插件函数
     *
     * 统一的函数调用接口，直接传递参数数组到插件
     *
     * @param function_name 函数名称
     * @param args 函数参数
     * @return 函数执行结果
     */
    pub fn call_function(&self, function_name: &str, args: &[i32]) -> Result<i32, String> {
        if let Some(library) = &self.library {
            if !self.metadata.has_backend {
                return Err("插件没有后端实现".to_string());
            }

            // 获取库前缀（解决linter错误）
            let lib_name = match &self.metadata.backend_lib {
                Some(name) => name.clone(),
                None => return Err("插件没有指定后端库名称".to_string()),
            };

            unsafe {
                // 构造函数名
                let fn_name = format!("{}_{}", lib_name, function_name);

                // 获取插件函数
                let func = library
                    .get::<PluginFunction>(fn_name.as_bytes())
                    .map_err(|e| format!("找不到插件函数: {} - {}", fn_name, e))?;

                // 调用函数
                if args.is_empty() {
                    Ok(func(std::ptr::null(), 0))
                } else {
                    Ok(func(args.as_ptr(), args.len() as i32))
                }
            }
        } else {
            Err("插件库未加载".to_string())
        }
    }
}

// 实现Drop特性，确保插件被正确卸载
impl Drop for Plugin {
    fn drop(&mut self) {
        let _ = self.unload();
    }
}
