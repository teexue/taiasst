import { StartupTask } from "./StartupManager";
import { initializePluginSystem } from "@/utils/plugin";
import { initSystemSettings } from "@/services/db/system";
import { error } from "@tauri-apps/plugin-log";
import { initDatabase, checkDatabaseConnection } from "@/services/db";

// 缓存状态，避免重复查询
interface CacheState {
  lastInitCheck: number;
  checkInterval: number; // 检查间隔（毫秒）
  isInitialized: {
    database: boolean;
    settings: boolean;
    plugins: boolean;
  };
}

// 缓存状态，5分钟内不重复检查初始化状态
const cache: CacheState = {
  lastInitCheck: 0,
  checkInterval: 5 * 60 * 1000, // 5分钟
  isInitialized: {
    database: false,
    settings: false,
    plugins: false,
  },
};

/**
 * 检查缓存是否有效
 */
const isCacheValid = (): boolean => {
  const now = Date.now();
  return now - cache.lastInitCheck < cache.checkInterval;
};

/**
 * 更新缓存时间戳
 */
const updateCacheTimestamp = (): void => {
  cache.lastInitCheck = Date.now();
};

/**
 * 基础主题初始化（轻量）
 */
const initThemeSystem = async (): Promise<void> => {
  // 这个在useTheme()中已经处理了，这里只是确保完成
  return Promise.resolve();
};

/**
 * 基础UI状态检查（不涉及数据库）
 */
const initBasicUIState = async (): Promise<void> => {
  try {
    // 检查本地存储是否可用
    localStorage.setItem("_startup_test", "ok");
    localStorage.removeItem("_startup_test");

    // 检查主题系统
    const theme = localStorage.getItem("theme") || "light";
    console.log(`当前主题: ${theme}`);

    console.log("基础UI状态检查完成");
  } catch (err) {
    console.warn("基础UI状态检查失败:", err);
    // 不阻止启动
  }
};

/**
 * 数据库初始化（轻量检查+延迟初始化）
 */
const initDatabaseSmart = async (): Promise<void> => {
  try {
    // 如果缓存有效且数据库已初始化，只做轻量连接检查
    if (isCacheValid() && cache.isInitialized.database) {
      const isConnected = await checkDatabaseConnection();
      if (isConnected) {
        console.log("数据库连接有效，跳过重复初始化");
        return;
      }
    }

    console.log("开始数据库初始化...");
    await initDatabase();
    cache.isInitialized.database = true;
    updateCacheTimestamp();
    console.log("数据库初始化完成");
  } catch (err) {
    error(`数据库初始化失败: ${String(err)}`);
    cache.isInitialized.database = false;
    // 不阻止应用启动，但记录错误
  }
};

/**
 * 系统设置智能初始化（检查缓存状态）
 */
const initSettingsSmart = async (): Promise<void> => {
  try {
    // 如果缓存有效且设置已初始化，跳过
    if (isCacheValid() && cache.isInitialized.settings) {
      console.log("系统设置已初始化，跳过重复初始化");
      return;
    }

    await initSystemSettings(1);
    cache.isInitialized.settings = true;
    console.log("系统设置初始化完成");
  } catch (err) {
    console.warn("系统设置初始化失败:", err);
    cache.isInitialized.settings = false;
    // 不阻止启动
  }
};

/**
 * 插件系统智能初始化（检查缓存状态）
 */
const initPluginSystemSmart = async (): Promise<void> => {
  try {
    // 如果缓存有效且插件系统已初始化，跳过
    if (isCacheValid() && cache.isInitialized.plugins) {
      console.log("插件系统已初始化，跳过重复初始化");
      return;
    }

    await initializePluginSystem();
    cache.isInitialized.plugins = true;
  } catch (err) {
    error(`插件系统初始化失败: ${String(err)}`);
    cache.isInitialized.plugins = false;
    // 不阻止应用启动，但记录错误
  }
};

/**
 * 获取所有启动任务（优化后，智能跳过已完成的任务）
 * 按优先级和依赖关系排序：基础UI -> 数据库 -> 设置 -> 插件 -> AI配置
 */
export const getAllStartupTasks = (): StartupTask[] => [
  // 基础任务（最快，优先级最高）
  {
    name: "初始化主题系统",
    critical: true,
    weight: 1,
    execute: initThemeSystem,
  },
  {
    name: "检查基础UI状态",
    critical: true,
    weight: 1,
    execute: initBasicUIState,
  },
  // 数据库相关（中等优先级，添加智能检查）
  {
    name: "智能初始化数据库连接",
    critical: true,
    weight: 2,
    execute: initDatabaseSmart,
  },
  // 系统设置（依赖数据库，添加智能检查）
  {
    name: "智能初始化系统设置",
    critical: false,
    weight: 1,
    execute: initSettingsSmart,
  },
  // 插件系统（重型任务，添加智能检查）
  {
    name: "智能初始化插件系统",
    critical: false,
    weight: 1,
    execute: initPluginSystemSmart,
  },
];

/**
 * 强制清除启动缓存（用于开发调试或强制重新初始化）
 */
export const clearStartupCache = (): void => {
  cache.lastInitCheck = 0;
  cache.isInitialized = {
    database: false,
    settings: false,
    plugins: false,
  };
  console.log("启动缓存已清除");
};

/**
 * 获取当前缓存状态（用于调试）
 */
export const getStartupCacheStatus = (): CacheState => {
  return { ...cache };
};

/**
 * 阻止拖拽行为的初始化
 */
export const initDragPrevention = (): void => {
  const preventDefaultDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 添加拖拽相关事件监听器
  document.addEventListener("dragenter", preventDefaultDrag);
  document.addEventListener("dragover", preventDefaultDrag);
  document.addEventListener("dragleave", preventDefaultDrag);
  document.addEventListener("drop", preventDefaultDrag);
};

/**
 * 移除拖拽事件监听器
 */
export const removeDragPrevention = (): void => {
  const preventDefaultDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  document.removeEventListener("dragenter", preventDefaultDrag);
  document.removeEventListener("dragover", preventDefaultDrag);
  document.removeEventListener("dragleave", preventDefaultDrag);
  document.removeEventListener("drop", preventDefaultDrag);
};
