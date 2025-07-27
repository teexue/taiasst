interface PerformanceMetrics {
  startTime: number;
  firstScreenTime?: number;
  fullyLoadedTime?: number;
  criticalTasksTime?: number;
  delayedTasksTime?: number;
}

class StartupMetrics {
  private static instance: StartupMetrics;
  private metrics: PerformanceMetrics;

  constructor() {
    this.metrics = {
      startTime: performance.now(),
    };
  }

  static getInstance(): StartupMetrics {
    if (!StartupMetrics.instance) {
      StartupMetrics.instance = new StartupMetrics();
    }
    return StartupMetrics.instance;
  }

  /**
   * 标记首屏显示时间
   */
  markFirstScreen(): void {
    this.metrics.firstScreenTime = performance.now() - this.metrics.startTime;
    console.log(
      `🚀 首屏显示时间: ${this.metrics.firstScreenTime.toFixed(2)}ms`,
    );
  }

  /**
   * 标记关键任务完成时间
   */
  markCriticalTasksComplete(): void {
    this.metrics.criticalTasksTime = performance.now() - this.metrics.startTime;
    console.log(
      `⚡ 关键任务完成时间: ${this.metrics.criticalTasksTime.toFixed(2)}ms`,
    );
  }

  /**
   * 标记延迟任务完成时间
   */
  markDelayedTasksComplete(): void {
    this.metrics.delayedTasksTime = performance.now() - this.metrics.startTime;
    console.log(
      `🔧 延迟任务完成时间: ${this.metrics.delayedTasksTime.toFixed(2)}ms`,
    );
  }

  /**
   * 标记完全加载时间
   */
  markFullyLoaded(): void {
    this.metrics.fullyLoadedTime = performance.now() - this.metrics.startTime;
    console.log(
      `✅ 完整加载时间: ${this.metrics.fullyLoadedTime.toFixed(2)}ms`,
    );
    this.printSummary();
  }

  /**
   * 打印性能总结
   */
  private printSummary(): void {
    console.log("\n📊 启动性能总结:");
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    if (this.metrics.firstScreenTime) {
      console.log(`首屏显示: ${this.metrics.firstScreenTime.toFixed(2)}ms`);
    }

    if (this.metrics.criticalTasksTime) {
      console.log(`关键任务: ${this.metrics.criticalTasksTime.toFixed(2)}ms`);
    }

    if (this.metrics.delayedTasksTime) {
      console.log(`延迟任务: ${this.metrics.delayedTasksTime.toFixed(2)}ms`);
    }

    if (this.metrics.fullyLoadedTime) {
      console.log(`完整加载: ${this.metrics.fullyLoadedTime.toFixed(2)}ms`);
    }

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 重置指标
   */
  reset(): void {
    this.metrics = {
      startTime: performance.now(),
    };
  }
}

/**
 * 测量启动性能的便捷函数
 */
export function measureStartupPerformance() {
  const metrics = StartupMetrics.getInstance();

  return {
    markFirstScreen: () => metrics.markFirstScreen(),
    markCriticalTasksComplete: () => metrics.markCriticalTasksComplete(),
    markDelayedTasksComplete: () => metrics.markDelayedTasksComplete(),
    markFullyLoaded: () => metrics.markFullyLoaded(),
    getMetrics: () => metrics.getMetrics(),
    reset: () => metrics.reset(),
  };
}

export { StartupMetrics };
