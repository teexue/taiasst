import { useState, useEffect, useCallback } from "react";
import backend, { SystemInfo, SystemUsage } from "@/utils/backend";
import { error } from "@tauri-apps/plugin-log";

/**
 * 定时获取系统信息的自定义 Hook
 * @param intervalMs 刷新间隔（毫秒），默认为 5000
 * @returns 包含系统信息、加载状态、错误和刷新函数的状态对象
 */
export const useSystemMonitor = (intervalMs = 5000) => {
  const [systemUsage, setSystemUsage] = useState<SystemUsage | null>(null);
  const [basicInfo, setBasicInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  const fetchData = useCallback(
    async (isInitialLoad = false) => {
      if (!isInitialLoad) {
        // 非首次加载时，可以只显示小 loading 状态，或不显示
        // setLoading(true); // 根据需要取消注释
      } else {
        setLoading(true);
      }
      setErr(null);

      try {
        // 并行获取数据
        const [usageData, infoData] = await Promise.all([
          backend.system.getSystemMetrics(),
          backend.system.getSystemInfo(),
        ]);

        setSystemUsage(usageData);
        setBasicInfo(infoData);
        setLastUpdateTime(new Date().toLocaleTimeString());
      } catch (err: any) {
        error(`获取系统信息失败: ${String(err)}`);
        const errorMessage =
          typeof err === "string"
            ? err
            : err?.message || "获取系统信息时发生未知错误";
        setErr(errorMessage);
      } finally {
        // 确保即使出错也要停止 loading
        if (isInitialLoad || loading) {
          setLoading(false);
        }
      }
    },
    [loading]
  ); // 添加 loading 依赖，避免在 loading 期间重复触发

  // 初始加载
  useEffect(() => {
    fetchData(true);
  }, []); // 仅在挂载时执行一次初始加载

  // 定时刷新
  useEffect(() => {
    if (intervalMs > 0) {
      const interval = setInterval(() => fetchData(false), intervalMs);
      return () => clearInterval(interval);
    }
  }, [intervalMs, fetchData]); // 当 interval 或 fetchData 变化时重新设置定时器

  const refresh = () => fetchData(true); // 提供手动刷新的方法，触发加载状态

  return {
    systemUsage,
    basicInfo,
    loading,
    lastUpdateTime,
    err,
    refresh, // 返回手动刷新函数
  };
};
