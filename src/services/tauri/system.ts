import { invoke } from "@tauri-apps/api/core";

/**
 * 系统基础信息接口
 */
export interface SystemInfo {
  /** 操作系统名称 */
  os_name: string;
  /** 操作系统版本 */
  os_version: string;
  /** 内核版本 */
  kernel_version: string;
  /** 主机名 */
  host_name: string;
  /** CPU架构 */
  cpu_arch: string;
  /** 系统运行时间（秒） */
  system_uptime: number;
  /** 用户名 */
  user_name: string;
  /** 系统名称（Windows/Linux/MacOS等） */
  system_name: string;
}

/**
 * CPU使用情况接口
 */
export interface CpuUsage {
  /** CPU使用率 */
  usage_percent: number;
  /** 每个核心的使用率 */
  cores_usage: number[];
  /** CPU名称 */
  name: string;
  /** CPU频率 */
  frequency: number;
  /** 核心数量 */
  cores_count: number;
}

/**
 * 内存使用情况接口
 */
export interface MemoryUsage {
  /** 总内存（字节） */
  total: number;
  /** 已使用内存（字节） */
  used: number;
  /** 空闲内存（字节） */
  free: number;
  /** 使用百分比 */
  usage_percent: number;
}

/**
 * 磁盘使用情况接口
 */
export interface DiskUsage {
  /** 磁盘名称 */
  name: string;
  /** 总容量（字节） */
  total: number;
  /** 已使用（字节） */
  used: number;
  /** 空闲（字节） */
  free: number;
  /** 使用百分比 */
  usage_percent: number;
  /** 挂载点 */
  mount_point: string;
  /** 文件系统 */
  file_system: string;
}

/**
 * GPU使用情况接口
 */
export interface GpuUsage {
  /** GPU名称 */
  name: string;
  /** GPU利用率 */
  utilization?: number;
  /** 总显存（字节） */
  memory_total?: number;
  /** 已使用显存（字节） */
  memory_used?: number;
  /** 温度（摄氏度） */
  temperature?: number;
}

/**
 * 系统使用情况接口
 */
export interface SystemUsage {
  /** CPU使用情况 */
  cpu: CpuUsage;
  /** 内存使用情况 */
  memory: MemoryUsage;
  /** 磁盘使用情况 */
  disks: DiskUsage[];
  /** GPU使用情况 */
  gpus: GpuUsage[];
}

/**
 * 获取系统基础信息
 * 对应 src-tauri/src/system/info.rs -> get_system_info
 * @returns 系统基础信息
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  return await invoke<SystemInfo>("get_system_info");
}

/**
 * 获取完整的系统使用情况 (CPU, 内存, 磁盘, GPU)
 * 对应 src-tauri/src/system/usage.rs -> get_system_metrics
 * @returns 完整的系统使用情况
 */
export async function getSystemMetrics(): Promise<SystemUsage> {
  return await invoke<SystemUsage>("get_system_metrics");
}

/**
 * 获取CPU使用情况
 * 对应 src-tauri/src/system/usage.rs -> get_cpu_metrics
 * @returns CPU使用情况
 */
export async function getCpuMetrics(): Promise<CpuUsage> {
  return await invoke<CpuUsage>("get_cpu_metrics");
}

/**
 * 获取内存使用情况
 * 对应 src-tauri/src/system/usage.rs -> get_memory_metrics
 * @returns 内存使用情况
 */
export async function getMemoryMetrics(): Promise<MemoryUsage> {
  return await invoke<MemoryUsage>("get_memory_metrics");
}

/**
 * 获取所有磁盘的使用情况
 * 对应 src-tauri/src/system/usage.rs -> get_disk_metrics
 * @returns 磁盘使用情况数组
 */
export async function getDiskMetrics(): Promise<DiskUsage[]> {
  return await invoke<DiskUsage[]>("get_disk_metrics");
}

/**
 * 获取所有GPU的使用情况
 * 对应 src-tauri/src/system/usage.rs -> get_gpu_metrics
 * @returns GPU使用情况数组
 */
export async function getGpuMetrics(): Promise<GpuUsage[]> {
  return await invoke<GpuUsage[]>("get_gpu_metrics");
}
