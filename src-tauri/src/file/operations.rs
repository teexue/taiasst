/**
 * 文件基本操作
 *
 * 提供创建、删除、重命名、复制等基本文件操作功能
 */
use std::fs;
use std::path::Path;

/**
 * 创建目录
 *
 * 可创建多级目录，如果目录已存在则不报错
 *
 * @param path 目录路径
 * @return 操作结果
 */
#[tauri::command]
pub fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|err| format!("创建目录失败: {}", err))
}

/**
 * 删除文件或目录
 *
 * 如果是目录则递归删除，如果是文件则直接删除
 *
 * @param path 文件或目录路径
 * @return 操作结果
 */
#[tauri::command]
pub fn delete_file(path: String) -> Result<(), String> {
    let path_obj = Path::new(&path);

    if path_obj.is_dir() {
        fs::remove_dir_all(&path).map_err(|err| format!("删除目录失败: {}", err))
    } else {
        fs::remove_file(&path).map_err(|err| format!("删除文件失败: {}", err))
    }
}

/**
 * 重命名文件或目录
 *
 * @param old_path 原路径
 * @param new_path 新路径
 * @return 操作结果
 */
#[tauri::command]
pub fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(&old_path, &new_path).map_err(|err| format!("重命名失败: {}", err))
}

/**
 * 复制文件
 *
 * @param source 源文件路径
 * @param destination 目标文件路径
 * @return 操作结果
 */
#[tauri::command]
pub fn copy_file(source: String, destination: String) -> Result<(), String> {
    fs::copy(&source, &destination).map_err(|err| format!("复制文件失败: {}", err))?;
    Ok(())
}

/**
 * 判断文件或目录是否存在
 *
 * @param path 路径
 * @return 是否存在
 */
#[tauri::command]
pub fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

/**
 * 获取文件或目录信息
 *
 * @param path 路径
 * @return 文件信息
 */
#[tauri::command]
pub fn get_file_info(path: String) -> Result<FileInfo, String> {
    let path_obj = Path::new(&path);

    if !path_obj.exists() {
        return Err(format!("文件不存在: {}", path));
    }

    let metadata = fs::metadata(&path).map_err(|err| format!("获取文件信息失败: {}", err))?;

    Ok(FileInfo {
        is_dir: metadata.is_dir(),
        is_file: metadata.is_file(),
        size: metadata.len(),
        readonly: metadata.permissions().readonly(),
        last_modified: metadata
            .modified()
            .map(|time| {
                time.duration_since(std::time::UNIX_EPOCH)
                    .map(|d| d.as_secs())
                    .unwrap_or(0)
            })
            .unwrap_or(0),
    })
}

/**
 * 文件信息结构
 */
#[derive(serde::Serialize)]
pub struct FileInfo {
    /// 是否是目录
    pub is_dir: bool,
    /// 是否是文件
    pub is_file: bool,
    /// 文件大小（字节）
    pub size: u64,
    /// 是否只读
    pub readonly: bool,
    /// 最后修改时间（Unix时间戳）
    pub last_modified: u64,
}
