import "./App.css";
import AsyncRouter from "./routes/AsyncRouter";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { error } from "@tauri-apps/plugin-log";
import { initializePluginSystem } from "./utils/plugin";
import { ContextMenuProvider, MenuItem } from "./context/RightClickMenuContext";
import RightClickMenu from "./components/RightClickMenu";
import { useTheme } from "@heroui/use-theme";
import {
  initializeDefaultConfigs,
  checkInitializationNeeded,
} from "./services/ai/initDefaultConfigs";
import { initSystemSettings } from "./services/db/system";

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

function App() {
  useTheme();

  useEffect(() => {
    // 初始化插件系统
    initializePluginSystem().catch((err) => {
      error(`初始化插件系统失败: ${String(err)}`);
    });

    // 初始化系统设置
    initSystemSettings().catch((err) => {
      error(`初始化系统设置失败: ${String(err)}`);
    });

    // 初始化AI配置预设数据
    const initAiConfigs = async () => {
      try {
        // 检查是否需要初始化
        const initStatus = await checkInitializationNeeded();

        if (
          initStatus.needsProviderInit ||
          initStatus.needsModelInit ||
          initStatus.needsPromptInit
        ) {
          console.log("正在初始化AI配置预设数据...");

          const result = await initializeDefaultConfigs({
            initProviders: initStatus.needsProviderInit,
            initModels: initStatus.needsModelInit,
            initPrompts: initStatus.needsPromptInit,
          });

          console.log("AI配置预设数据初始化完成:", result);
        } else {
          console.log("AI配置预设数据已存在，无需初始化");
        }
      } catch (err) {
        error(`初始化AI配置预设数据失败: ${String(err)}`);
      }
    };

    initAiConfigs();

    // 阻止全局默认拖拽行为
    const preventDefaultDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // 添加拖拽相关事件监听器
    document.addEventListener("dragenter", preventDefaultDrag);
    document.addEventListener("dragover", preventDefaultDrag);
    document.addEventListener("dragleave", preventDefaultDrag);
    document.addEventListener("drop", preventDefaultDrag);

    // 组件卸载时移除事件监听器
    return () => {
      document.removeEventListener("dragenter", preventDefaultDrag);
      document.removeEventListener("dragover", preventDefaultDrag);
      document.removeEventListener("dragleave", preventDefaultDrag);
      document.removeEventListener("drop", preventDefaultDrag);
    };
  }, []);

  return (
    <ContextMenuProvider defaultMenuItems={defaultMenuItems}>
      <AsyncRouter />
      <Toaster position="top-right" richColors />
      <RightClickMenu />
    </ContextMenuProvider>
  );
}

export default App;
