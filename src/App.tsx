import "./App.css";
import AsyncRouter from "./routes/AsyncRouter";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { error } from "@tauri-apps/plugin-log";
import { initializePluginSystem } from "./utils/plugin";
import { ContextMenuProvider, MenuItem } from "./context/RightClickMenuContext";
import RightClickMenu from "./components/RightClickMenu";
import { useTheme } from "@heroui/use-theme";
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
