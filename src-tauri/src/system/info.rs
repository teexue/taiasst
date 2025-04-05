use serde::{Deserialize, Serialize};
use std::env;
use sysinfo::System;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SystemInfo {
    pub os_name: String,
    pub os_version: String,
    pub kernel_version: String,
    pub host_name: String,
    pub cpu_arch: String,
    pub system_uptime: u64,
    pub user_name: String,
    pub system_name: String,
}

/// 获取系统基础信息
#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    // 使用spawn_blocking将阻塞操作放到独立线程中执行
    tokio::task::spawn_blocking(move || {
        // 获取操作系统名称和版本
        let os_name = System::name().unwrap_or_else(|| "未知".to_string());
        let os_version = System::os_version().unwrap_or_else(|| "未知".to_string());
        let kernel_version = System::kernel_version().unwrap_or_else(|| "未知".to_string());
        let host_name = System::host_name().unwrap_or_else(|| "未知".to_string());

        // 获取CPU架构
        let cpu_arch = env::consts::ARCH.to_string();

        // 获取系统运行时间（秒）
        let system_uptime = sysinfo::System::uptime();

        // 获取当前用户名
        let user_name = env::var("USERNAME")
            .or_else(|_| env::var("USER"))
            .unwrap_or_else(|_| "未知".to_string());

        // 系统名称（Windows/Linux/MacOS等）
        let system_name = if cfg!(target_os = "windows") {
            "Windows".to_string()
        } else if cfg!(target_os = "linux") {
            "Linux".to_string()
        } else if cfg!(target_os = "macos") {
            "macOS".to_string()
        } else if cfg!(target_os = "ios") {
            "iOS".to_string()
        } else if cfg!(target_os = "android") {
            "Android".to_string()
        } else {
            "未知".to_string()
        };

        SystemInfo {
            os_name,
            os_version,
            kernel_version,
            host_name,
            cpu_arch,
            system_uptime,
            user_name,
            system_name,
        }
    })
    .await
    .map_err(|e| e.to_string())
}
