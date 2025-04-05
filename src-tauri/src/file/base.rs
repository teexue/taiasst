use std::fs;
use std::path::Path;

#[tauri::command]
pub fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|err| format!("创建目录失败: {}", err))
}

#[tauri::command]
pub fn delete_file(path: String) -> Result<(), String> {
    if Path::new(&path).is_dir() {
        fs::remove_dir_all(&path).map_err(|err| format!("删除目录失败: {}", err))
    } else {
        fs::remove_file(&path).map_err(|err| format!("删除文件失败: {}", err))
    }
}

#[tauri::command]
pub fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(&old_path, &new_path).map_err(|err| format!("重命名失败: {}", err))
}

#[tauri::command]
pub fn copy_file(source: String, destination: String) -> Result<(), String> {
    fs::copy(&source, &destination).map_err(|err| format!("复制文件失败: {}", err))?;
    Ok(())
}
