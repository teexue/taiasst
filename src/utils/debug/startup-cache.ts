import {
  clearStartupCache,
  getStartupCacheStatus,
} from "@/services/startup/tasks";

/**
 * 启动缓存调试工具
 * 提供查看、清除和管理启动缓存的功能
 */
export class StartupCacheDebugger {
  /**
   * 获取所有缓存状态的详细信息
   */
  static getCacheStatus() {
    const startupCache = getStartupCacheStatus();

    const now = Date.now();

    return {
      startup: {
        ...startupCache,
        isValid: now - startupCache.lastInitCheck < startupCache.checkInterval,
        timeUntilExpiry: Math.max(
          0,
          startupCache.checkInterval - (now - startupCache.lastInitCheck),
        ),
        lastInitCheckFormatted: startupCache.lastInitCheck
          ? new Date(startupCache.lastInitCheck).toLocaleString()
          : "从未检查",
      },
    };
  }

  /**
   * 清除所有启动相关的缓存
   */
  static clearAllCaches() {
    clearStartupCache();
    console.log("所有启动缓存已清除");
  }

  /**
   * 仅清除启动任务缓存
   */
  static clearStartupTaskCache() {
    clearStartupCache();
    console.log("启动任务缓存已清除");
  }

  /**
   * 打印缓存状态报告
   */
  static printCacheReport() {
    const status = this.getCacheStatus();

    console.group("🚀 启动缓存状态报告");

    console.group("📋 启动任务缓存");
    console.log("✅ 缓存有效:", status.startup.isValid);
    console.log("⏰ 上次检查:", status.startup.lastInitCheckFormatted);
    console.log(
      "⏳ 距离过期:",
      Math.round(status.startup.timeUntilExpiry / 1000),
      "秒",
    );
    console.log("🔧 初始化状态:", status.startup.isInitialized);
    console.groupEnd();

    // 初始化检查缓存信息已包含在启动缓存中

    console.groupEnd();
  }

  /**
   * 监控缓存状态变化（定时打印报告）
   */
  static startCacheMonitoring(intervalMs: number = 30000) {
    console.log("开始监控启动缓存状态...");

    const monitor = setInterval(() => {
      this.printCacheReport();
    }, intervalMs);

    // 返回清理函数
    return () => {
      clearInterval(monitor);
      console.log("停止监控启动缓存状态");
    };
  }
}

// 将调试工具挂载到全局对象，方便在控制台中使用
if (typeof window !== "undefined") {
  (window as any).StartupCacheDebugger = StartupCacheDebugger;

  // 在开发环境下自动打印一次缓存状态
  if (import.meta.env.DEV) {
    setTimeout(() => {
      console.log(
        "🛠️ 启动缓存调试工具已就绪，使用 window.StartupCacheDebugger 访问",
      );
      StartupCacheDebugger.printCacheReport();
    }, 1000);
  }
}

export default StartupCacheDebugger;
