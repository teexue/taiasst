/**
 * 插件系统的前端API接口
 *
 * 提供给前端调用的各种插件系统功能
 */
use crate::plugin::manager::{get_plugin_manager, init_plugin_manager};
use crate::plugin::types::{PluginMetadata, PLUGIN_METADATA_FILE_NAME};
use std::fs::{self, File};
use std::io::{Read, Seek};
use std::path::Path;
use tauri::AppHandle;
use zip::ZipArchive;

/**
 * 初始化插件管理器
 *
 * @param app Tauri应用句柄
 * @return 初始化结果
 */
pub fn init_plugin_system(app: AppHandle) -> Result<(), String> {
    init_plugin_manager(app)
}

/**
 * 加载插件
 *
 * @param metadata 插件元数据
 * @return 加载结果
 */
#[tauri::command]
pub async fn load_plugin(metadata: PluginMetadata) -> Result<(), String> {
    let mut manager = get_plugin_manager()?;
    let manager = manager
        .as_mut()
        .ok_or_else(|| "插件管理器未初始化".to_string())?;
    manager.load_plugin(metadata)
}

/**
 * 卸载插件
 *
 * @param plugin_id 插件ID
 * @return 卸载结果
 */
#[tauri::command]
pub async fn unload_plugin(plugin_id: String) -> Result<(), String> {
    let mut manager = get_plugin_manager()?;
    let manager = manager
        .as_mut()
        .ok_or_else(|| "插件管理器未初始化".to_string())?;
    manager.unload_plugin(&plugin_id)
}

/**
 * 获取已加载的插件列表
 *
 * @return 插件元数据列表
 */
#[tauri::command]
pub async fn get_loaded_plugins() -> Result<Vec<PluginMetadata>, String> {
    let manager = get_plugin_manager()?;
    let manager = manager
        .as_ref()
        .ok_or_else(|| "插件管理器未初始化".to_string())?;
    Ok(manager.get_loaded_plugins())
}

/**
 * 调用插件函数
 *
 * @param plugin_id 插件ID
 * @param function_name 函数名称
 * @param args 函数参数
 * @return 函数执行结果
 */
#[tauri::command]
pub async fn call_plugin_function(
    plugin_id: String,
    function_name: String,
    args: Vec<i32>,
) -> Result<i32, String> {
    let manager = get_plugin_manager()?;
    let manager = manager
        .as_ref()
        .ok_or_else(|| "插件管理器未初始化".to_string())?;
    manager.call_plugin_function(&plugin_id, &function_name, &args)
}

/**
 * 从ZIP文件中查找并读取插件元数据
 *
 * @param archive ZIP归档
 * @return 解析的插件元数据
 */
fn find_and_read_metadata<R: Read + Seek>(
    archive: &mut ZipArchive<R>,
) -> Result<PluginMetadata, String> {
    // 寻找元数据文件
    let metadata_index = (0..archive.len())
        .find(|&i| {
            if let Ok(file) = archive.by_index(i) {
                let name = file.name();
                name.ends_with(PLUGIN_METADATA_FILE_NAME)
            } else {
                false
            }
        })
        .ok_or_else(|| "ZIP中未找到插件元数据文件".to_string())?;

    // 读取元数据文件
    let mut metadata_file = archive
        .by_index(metadata_index)
        .map_err(|e| format!("无法读取元数据文件: {}", e))?;

    let mut metadata_content = String::new();
    metadata_file
        .read_to_string(&mut metadata_content)
        .map_err(|e| format!("读取元数据内容失败: {}", e))?;

    // 解析元数据
    serde_json::from_str(&metadata_content).map_err(|e| format!("解析元数据JSON失败: {}", e))
}

/**
 * 从ZIP安装插件
 *
 * @param app Tauri应用句柄
 * @param zip_path ZIP文件路径
 * @return 安装结果，包含插件元数据
 */
#[tauri::command]
pub async fn install_plugin_from_zip(
    app: AppHandle,
    zip_path: String,
) -> Result<PluginMetadata, String> {
    // 打开ZIP文件
    let zip_path = Path::new(&zip_path);
    let file = File::open(zip_path).map_err(|e| format!("无法打开ZIP文件: {}", e))?;
    let mut archive = ZipArchive::new(file).map_err(|e| format!("无法读取ZIP归档: {}", e))?;

    // 读取元数据
    let metadata = find_and_read_metadata(&mut archive)?;
    // 准备插件目录
    let plugin_dir = crate::plugin::utils::get_plugin_base_dir(app.clone())?;
    // 如果目录已存在，先删除
    if plugin_dir.exists() {
        fs::remove_dir_all(&plugin_dir).map_err(|e| format!("无法删除现有插件目录: {}", e))?;
    }
    // 创建插件目录
    fs::create_dir_all(&plugin_dir).map_err(|e| format!("无法创建插件目录: {}", e))?;
    // 解压文件
    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| format!("无法读取ZIP条目: {}", e))?;
        let file_path = file.name();
        let outpath = plugin_dir.join(file_path);
        // 创建目录
        if file.is_dir() {
            fs::create_dir_all(&outpath).map_err(|e| format!("无法创建目录: {}", e))?;
            continue;
        }
        // 确保父目录存在
        if let Some(parent) = outpath.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent).map_err(|e| format!("无法创建父目录: {}", e))?;
            }
        }
        // 写入文件
        let mut outfile = File::create(&outpath).map_err(|e| format!("无法创建输出文件: {}", e))?;
        std::io::copy(&mut file, &mut outfile).map_err(|e| format!("无法写入文件内容: {}", e))?;
    }
    // 返回元数据
    Ok(metadata)
}

/**
 * 从插件目录删除插件
 */
#[tauri::command]
pub async fn uninstall_plugin(app: AppHandle, plugin_id: String) -> Result<(), String> {
    let _ = unload_plugin(plugin_id.clone()).await?;
    let plugin_dir = crate::plugin::utils::get_plugin_base_dir(app.clone())?.join(&plugin_id);
    fs::remove_dir_all(&plugin_dir).map_err(|e| format!("无法删除插件目录: {}", e))?;
    Ok(())
}

/**
 * 从ZIP获取插件元数据，不安装
 *
 * @param zip_path ZIP文件路径
 * @return 解析的插件元数据
 */
#[tauri::command]
pub async fn get_plugin_metadata_from_zip(zip_path: String) -> Result<PluginMetadata, String> {
    let zip_path = Path::new(&zip_path);
    let file = File::open(zip_path).map_err(|e| format!("无法打开ZIP文件: {}", e))?;

    let mut archive = ZipArchive::new(file).map_err(|e| format!("无法读取ZIP归档: {}", e))?;

    find_and_read_metadata(&mut archive)
}
