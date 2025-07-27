import AsyncRouter from "./routes/AsyncRouter";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { ContextMenuProvider, MenuItem } from "./context/RightClickMenuContext";
import RightClickMenu from "./components/RightClickMenu";
import { useTheme } from "@heroui/use-theme";

// 认证系统
import { AuthProvider } from "./context/AuthContext";
import { AuthGuard } from "./components/auth/AuthGuard";
import { AppWithActivityMonitor } from "./components/auth/AppWithActivityMonitor";

// 新的启动系统
import { StartupProvider, useStartup } from "./context/StartupContext";
import { StartupScreen } from "./components/startup/StartupScreen";
import { StartupManager } from "./services/startup/StartupManager";

// 移除安全系统相关导入
import {
  getAllStartupTasks,
  initDragPrevention,
  removeDragPrevention,
} from "./services/startup/tasks";
import { measureStartupPerformance } from "./utils/performance/startup-metrics";
import { invoke } from "@tauri-apps/api/core";
import "./utils/debug/startup-cache"; // 引入调试工具

// 默认全局右键菜单项
const defaultMenuItems: MenuItem[] = [
  {
    key: "refresh",
    label: "刷新",
    onClick: () => window.location.reload(),
  },
  {
    key: "back",
    label: "返回",
    onClick: () => window.history.back(),
  },
];

function AppContent() {
  // 添加安全的invoke调用
  useEffect(() => {
    let invokeAborted = false;

    const showWindow = async () => {
      try {
        if (!invokeAborted) {
          await invoke("show_window_command");
        }
      } catch (error) {
        if (!invokeAborted) {
          console.warn("显示窗体失败:", error);
        }
      }
    };

    showWindow();

    return () => {
      invokeAborted = true;
    };
  }, []);

  useTheme();
  const { state, updateProgress, markComplete, addError } = useStartup();

  useEffect(() => {
    let startupManagerRef: StartupManager | null = null;
    let isComponentMounted = true;

    const runStartup = async () => {
      if (!isComponentMounted) return;

      const performanceTracker = measureStartupPerformance();

      try {
        console.log("🚀 开始应用初始化...");

        // 等待一个极短的时间确保StartupScreen已经渲染
        await new Promise((resolve) => setTimeout(resolve, 50));

        if (!isComponentMounted) return;

        // 创建任务管理器，所有任务在启动屏幕期间完成
        const startupManager = new StartupManager(updateProgress);
        startupManagerRef = startupManager;

        // 添加所有启动任务
        getAllStartupTasks().forEach((task) => startupManager.addTask(task));

        // 执行所有任务
        await startupManager.runTasks();

        if (!isComponentMounted) return;

        performanceTracker.markCriticalTasksComplete();

        // 初始化拖拽防护
        initDragPrevention();

        // 短暂延迟让用户看到100%完成状态
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!isComponentMounted) return;

        // 标记完成，切换到主界面
        markComplete();
        performanceTracker.markFirstScreen();
        performanceTracker.markDelayedTasksComplete();
        performanceTracker.markFullyLoaded();

        console.log("✅ 应用初始化完成");
      } catch (error) {
        if (isComponentMounted) {
          console.error("应用初始化失败:", error);
          addError(`应用初始化失败: ${String(error)}`);

          // 即使失败也显示主界面，让用户能使用基本功能
          setTimeout(() => {
            if (isComponentMounted) {
              markComplete();
              performanceTracker.markFirstScreen();
            }
          }, 1000);
        }
      }
    };

    runStartup();

    // 清理函数
    return () => {
      isComponentMounted = false;

      // 取消正在运行的启动任务
      if (startupManagerRef) {
        startupManagerRef.cancel();
      }

      removeDragPrevention();
      console.log("🧹 应用组件清理完成");
    };
  }, [updateProgress, markComplete, addError]);

  // 显示启动屏幕直到所有任务完成
  if (!state.isInitialized) {
    return (
      <StartupScreen
        progress={state.progress}
        currentTask={state.currentTask}
        isComplete={false}
      />
    );
  }

  return (
    <AuthProvider>
      <AuthGuard>
        <AppWithActivityMonitor>
          <ContextMenuProvider defaultMenuItems={defaultMenuItems}>
            <AsyncRouter />
            <Toaster position="bottom-right" richColors />
            <RightClickMenu />
          </ContextMenuProvider>
        </AppWithActivityMonitor>
      </AuthGuard>
    </AuthProvider>
  );
}

function App() {
  return (
    <StartupProvider>
      <AppContent />
    </StartupProvider>
  );
}

export default App;
