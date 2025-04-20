use serde::{Deserialize, Serialize};
use sysinfo::{Disks, System};

#[cfg(target_os = "windows")]
use nvml_wrapper::Nvml;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CpuUsage {
    pub usage_percent: f32,
    pub cores_usage: Vec<f32>,
    pub name: String,
    pub frequency: u64,
    pub cores_count: usize,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct MemoryUsage {
    pub total: u64,         // 总内存（字节）
    pub used: u64,          // 已使用内存（字节）
    pub free: u64,          // 空闲内存（字节）
    pub usage_percent: f32, // 使用百分比
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiskUsage {
    pub name: String,
    pub total: u64,         // 总容量（字节）
    pub used: u64,          // 已使用（字节）
    pub free: u64,          // 空闲（字节）
    pub usage_percent: f32, // 使用百分比
    pub mount_point: String,
    pub file_system: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GpuUsage {
    pub name: String,
    pub utilization: Option<f32>,  // GPU利用率
    pub memory_total: Option<u64>, // 总显存（字节）
    pub memory_used: Option<u64>,  // 已使用显存（字节）
    pub temperature: Option<u32>,  // 温度（摄氏度）
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SystemUsage {
    pub cpu: CpuUsage,
    pub memory: MemoryUsage,
    pub disks: Vec<DiskUsage>,
    pub gpus: Vec<GpuUsage>,
}

/// 初始化系统监控
///
/// 返回一个System实例，用于后续的系统监控
pub fn init_system_monitor() -> System {
    let mut sys = System::new_all();
    // 刷新初始数据
    sys.refresh_all();
    sys
}

/// 获取CPU使用情况
pub fn get_cpu_usage(sys: &mut System) -> CpuUsage {
    // 刷新CPU信息
    sys.refresh_cpu_usage();

    // 等待一小段时间，使CPU使用率计算更准确
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    sys.refresh_cpu_usage();

    // 计算全局CPU使用率 - 使用所有CPU的平均值
    let cpus = sys.cpus();
    let global_usage = if !cpus.is_empty() {
        cpus.iter().map(|cpu| cpu.cpu_usage()).sum::<f32>() / cpus.len() as f32
    } else {
        0.0
    };

    // 获取每个核心的使用率
    let cores_usage = cpus.iter().map(|cpu| cpu.cpu_usage()).collect();

    // 获取CPU名称 - 使用第一个CPU的名称
    let name = if !cpus.is_empty() {
        cpus[0].brand().to_string()
    } else {
        "Unknown".to_string()
    };

    // 尝试获取CPU频率 - 使用第一个CPU的频率
    let frequency = if !cpus.is_empty() {
        cpus[0].frequency()
    } else {
        0
    };

    CpuUsage {
        usage_percent: global_usage,
        cores_usage,
        name,
        frequency,
        cores_count: cpus.len(),
    }
}

/// 获取内存使用情况
pub fn get_memory_usage(sys: &mut System) -> MemoryUsage {
    // 刷新内存信息
    sys.refresh_memory();

    let total = sys.total_memory();
    let used = sys.used_memory();
    let free = sys.free_memory();
    let usage_percent = if total > 0 {
        (used as f32 / total as f32) * 100.0
    } else {
        0.0
    };

    MemoryUsage {
        total,
        used,
        free,
        usage_percent,
    }
}

/// 获取磁盘使用情况
pub fn get_disk_usage(_sys: &mut System) -> Vec<DiskUsage> {
    // 直接创建一个新的Disks实例并刷新
    let disks = Disks::new_with_refreshed_list();

    disks
        .iter()
        .map(|disk| {
            let total = disk.total_space();
            let used = total.saturating_sub(disk.available_space());
            let free = disk.available_space();
            let usage_percent = if total > 0 {
                (used as f32 / total as f32) * 100.0
            } else {
                0.0
            };

            DiskUsage {
                name: disk.name().to_string_lossy().to_string(),
                total,
                used,
                free,
                usage_percent,
                mount_point: disk.mount_point().to_string_lossy().to_string(),
                file_system: disk.file_system().to_string_lossy().to_string(),
            }
        })
        .collect()
}

/// 获取GPU使用情况
///
/// 仅支持NVIDIA GPU，其他GPU可能返回有限信息或空列表
pub fn get_gpu_usage() -> Vec<GpuUsage> {
    let mut result = Vec::new();

    #[cfg(target_os = "windows")]
    {
        // 尝试使用NVML获取NVIDIA GPU信息
        if let Ok(nvml) = Nvml::init() {
            if let Ok(device_count) = nvml.device_count() {
                for i in 0..device_count {
                    if let Ok(device) = nvml.device_by_index(i) {
                        let mut gpu = GpuUsage {
                            name: device
                                .name()
                                .unwrap_or_else(|_| format!("GPU {}", i))
                                .to_string(),
                            utilization: None,
                            memory_total: None,
                            memory_used: None,
                            temperature: None,
                        };

                        // 尝试获取GPU利用率
                        if let Ok(utilization) = device.utilization_rates() {
                            gpu.utilization = Some(utilization.gpu as f32);
                        }

                        // 尝试获取内存信息
                        if let Ok(memory) = device.memory_info() {
                            gpu.memory_total = Some(memory.total);
                            gpu.memory_used = Some(memory.used);
                        }

                        // 获取温度
                        let temp = device.temperature(
                            nvml_wrapper::enum_wrappers::device::TemperatureSensor::Gpu,
                        );
                        gpu.temperature = Some(temp.unwrap());

                        result.push(gpu);
                    }
                }
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // 非Windows系统下，获取有限的GPU信息
        // 这里可以添加其他平台的GPU检测方法
    }

    result
}

/// 获取完整的系统使用情况
pub fn get_system_usage(sys: &mut System) -> SystemUsage {
    SystemUsage {
        cpu: get_cpu_usage(sys),
        memory: get_memory_usage(sys),
        disks: get_disk_usage(sys),
        gpus: get_gpu_usage(),
    }
}

/// Tauri命令：获取系统使用情况
///
/// 这个函数可以直接从前端调用
#[tauri::command]
pub async fn get_system_metrics() -> Result<SystemUsage, String> {
    // 使用spawn_blocking将CPU密集型操作放到独立线程
    tokio::task::spawn_blocking(move || {
        let mut sys = init_system_monitor();
        get_system_usage(&mut sys)
    })
    .await
    .map_err(|e| e.to_string())
}

/// Tauri命令：获取CPU使用情况
#[tauri::command]
pub async fn get_cpu_metrics() -> Result<CpuUsage, String> {
    tokio::task::spawn_blocking(move || {
        let mut sys = init_system_monitor();
        get_cpu_usage(&mut sys)
    })
    .await
    .map_err(|e| e.to_string())
}

/// Tauri命令：获取内存使用情况
#[tauri::command]
pub async fn get_memory_metrics() -> Result<MemoryUsage, String> {
    tokio::task::spawn_blocking(move || {
        let mut sys = init_system_monitor();
        get_memory_usage(&mut sys)
    })
    .await
    .map_err(|e| e.to_string())
}

/// Tauri命令：获取磁盘使用情况
#[tauri::command]
pub async fn get_disk_metrics() -> Result<Vec<DiskUsage>, String> {
    tokio::task::spawn_blocking(move || {
        let mut sys = init_system_monitor();
        get_disk_usage(&mut sys)
    })
    .await
    .map_err(|e| e.to_string())
}

/// Tauri命令：获取GPU使用情况
#[tauri::command]
pub async fn get_gpu_metrics() -> Result<Vec<GpuUsage>, String> {
    tokio::task::spawn_blocking(move || get_gpu_usage())
        .await
        .map_err(|e| e.to_string())
}
