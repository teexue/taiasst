export interface StartupTask {
  name: string;
  critical: boolean; // 是否为关键任务，关键任务失败会阻止启动
  weight: number; // 任务权重，用于计算进度
  execute: () => Promise<void>;
  // 新增：取消操作的方法
  cancel?: () => void;
}

export class StartupManager {
  private tasks: StartupTask[] = [];
  private onProgress?: (progress: number, taskName: string) => void;
  private totalWeight = 0;
  private completedWeight = 0;
  private isRunning = false;
  private isCancelled = false; // 新增：取消标志

  constructor(onProgress?: (progress: number, taskName: string) => void) {
    this.onProgress = onProgress;
  }

  /**
   * 添加启动任务
   */
  addTask(task: StartupTask) {
    this.tasks.push(task);
    this.totalWeight += task.weight;
  }

  /**
   * 取消所有正在运行的任务
   */
  cancel() {
    this.isCancelled = true;
    this.tasks.forEach((task) => {
      if (task.cancel) {
        try {
          task.cancel();
        } catch (error) {
          console.warn(`取消任务 ${task.name} 失败:`, error);
        }
      }
    });
  }

  /**
   * 运行所有启动任务
   */
  async runTasks(): Promise<void> {
    if (this.isRunning) {
      console.warn("启动任务已在运行中");
      return;
    }

    this.isRunning = true;
    this.isCancelled = false;
    this.completedWeight = 0;

    console.log(`开始执行 ${this.tasks.length} 个启动任务`);

    try {
      // 先执行关键任务
      const criticalTasks = this.tasks.filter((task) => task.critical);
      const nonCriticalTasks = this.tasks.filter((task) => !task.critical);

      // 执行关键任务
      for (const task of criticalTasks) {
        if (this.isCancelled) {
          console.log("启动任务被取消");
          return;
        }
        await this.executeTask(task);
      }

      // 执行非关键任务
      for (const task of nonCriticalTasks) {
        if (this.isCancelled) {
          console.log("启动任务被取消");
          return;
        }
        await this.executeTask(task);
      }

      console.log("所有启动任务完成");
    } catch (error) {
      console.error("启动任务执行失败:", error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  private async executeTask(task: StartupTask): Promise<void> {
    if (this.isCancelled) {
      return;
    }

    console.log(`执行任务: ${task.name}`);

    try {
      // 使用Promise.race来实现超时控制
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`任务 ${task.name} 超时`));
        }, 30000); // 30秒超时

        // 如果任务被取消，清除超时
        if (this.isCancelled) {
          clearTimeout(timeout);
          reject(new Error(`任务 ${task.name} 被取消`));
        }
      });

      await Promise.race([task.execute(), timeoutPromise]);

      this.completedWeight += task.weight;
      const progress = Math.round(
        (this.completedWeight / this.totalWeight) * 100,
      );

      if (this.onProgress && !this.isCancelled) {
        this.onProgress(progress, task.name);
      }

      console.log(`任务完成: ${task.name} (${progress}%)`);
    } catch (error) {
      if (!this.isCancelled) {
        console.error(`任务失败: ${task.name}`, error);

        if (task.critical) {
          throw error;
        } else {
          // 非关键任务失败时继续执行
          console.warn(`非关键任务 ${task.name} 失败，继续执行后续任务`);
          this.completedWeight += task.weight;
          const progress = Math.round(
            (this.completedWeight / this.totalWeight) * 100,
          );
          if (this.onProgress) {
            this.onProgress(progress, `${task.name} (失败但继续)`);
          }
        }
      }
    }
  }

  /**
   * 获取任务列表
   */
  getTasks(): StartupTask[] {
    return [...this.tasks];
  }

  /**
   * 清空任务列表
   */
  clearTasks(): void {
    this.tasks = [];
    this.totalWeight = 0;
    this.completedWeight = 0;
  }
}
