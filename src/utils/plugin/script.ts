import { join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { error } from "@tauri-apps/plugin-log";
import {
  PLUGIN_GLOBAL_VAR,
  PLUGIN_INIT_DELAY,
  PLUGIN_SCRIPT_ID_PREFIX,
} from "./types";
import { getPluginBaseDir } from "./config";

// 获取插件脚本元素ID
export function getPluginScriptId(pluginId: string): string {
  return `${PLUGIN_SCRIPT_ID_PREFIX}${pluginId}`;
}

// 移除插件脚本标签
export function removePluginScript(pluginId: string): void {
  const scriptId = getPluginScriptId(pluginId);
  const scriptElem = document.getElementById(scriptId);
  if (scriptElem) {
    scriptElem.remove();
  }
}

// 清除插件全局变量
export function clearPluginGlobal(): void {
  (window as any)[PLUGIN_GLOBAL_VAR] = undefined;
}

// 初始化延迟
export function pluginInitDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, PLUGIN_INIT_DELAY));
}

/**
 * 获取插件脚本URL
 * @param pluginId 插件ID
 * @returns 插件脚本URL
 */
export async function getPluginScriptUrl(pluginId: string): Promise<string> {
  try {
    const pluginDir = await getPluginBaseDir();
    // 假设前端入口文件是 plugin.js
    const pluginFilePath = await join(pluginDir, pluginId, "plugin.js");
    // 检查文件是否存在可能更好，但 convertFileSrc 找不到会报错
    const scriptUrl = convertFileSrc(pluginFilePath);
    return scriptUrl;
  } catch (err) {
    error(`获取插件 ${pluginId} 脚本URL失败: ${String(err)}`);
    throw new Error(`无法获取插件 ${pluginId} 的前端脚本URL`);
  }
}

/**
 * 注入全局依赖到window对象，使插件可以访问React和HeroUI
 */
export async function injectGlobalDependencies(): Promise<void> {
  try {
    const React = await import("react");
    (window as any).React = React.default || React;

    // 导入HeroUI及其所有组件
    const HeroUI = await import("@heroui/react");

    // 确保HeroUI组件被正确地暴露，包括Card组件
    (window as any).HeroUI = HeroUI;

    // 为UMD插件单独暴露常用组件
    const {
      Card,
      Button,
      Spinner,
      Modal,
      Form,
      Input,
      Select,
      Table,
      Tabs,
      Alert,
    } = HeroUI;
    (window as any).Card = Card;
    (window as any).Button = Button;
    (window as any).Spinner = Spinner;
    (window as any).Modal = Modal;
    (window as any).Form = Form;
    (window as any).Input = Input;
    (window as any).Select = Select;
    (window as any).Table = Table;
    (window as any).Tabs = Tabs;
    (window as any).Alert = Alert;
  } catch (err) {
    error(`注入全局依赖失败: ${String(err)}`);
    // 这里可能需要抛出错误，因为插件可能依赖这些库
    throw err;
  }
}

/**
 * 加载插件脚本到页面
 * @param pluginId 插件ID
 * @returns 加载的脚本创建的全局变量
 */
export async function loadPluginScript(pluginId: string): Promise<any> {
  try {
    const scriptUrl = await getPluginScriptUrl(pluginId);

    return new Promise((resolve, reject) => {
      removePluginScript(pluginId); // 先移除旧脚本，防止重复加载
      clearPluginGlobal(); // 清除可能残留的旧插件全局变量

      const script = document.createElement("script");
      script.id = getPluginScriptId(pluginId);
      script.src = scriptUrl;
      script.type = "text/javascript";
      script.async = true;

      script.onload = async () => {
        await pluginInitDelay(); // 等待插件可能的异步初始化
        resolve((window as any)[PLUGIN_GLOBAL_VAR]);
      };
      script.onerror = (event: Event | string) => {
        error(`加载插件脚本 ${pluginId} 失败: ${String(event)}`);
        removePluginScript(pluginId); // 加载失败也移除脚本元素
        clearPluginGlobal();
        reject(new Error(`加载插件 ${pluginId} 的前端脚本失败`));
      };

      document.head.appendChild(script);
    });
  } catch (err) {
    error(`加载插件 ${pluginId} 脚本过程中出错: ${String(err)}`);
    throw err; // 重新抛出错误
  }
}
