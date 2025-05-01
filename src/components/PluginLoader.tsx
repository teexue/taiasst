import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Spin } from "antd";
import {
  loadPluginScript,
  PLUGIN_GLOBAL_VAR,
  removePluginScript,
  clearPluginGlobal,
  pluginInitDelay,
} from "../utils/plugin";

import { PluginMetadata } from "@/types/plugin";

/**
 * 插件加载器属性
 */
interface PluginLoaderProps {
  /**
   * 插件ID或元数据对象
   */
  plugin: string | PluginMetadata;
  /**
   * 加载中显示内容
   */
  loadingContent?: React.ReactNode;
  /**
   * 错误时显示内容，如果不提供则仅触发onError
   */
  errorContent?: React.ReactNode | ((error: string) => React.ReactNode);
  /**
   * 子元素 - 只有在插件加载成功后渲染
   * 可以是React节点或渲染函数
   */
  children?:
    | React.ReactNode
    | ((component: React.ComponentType) => React.ReactNode);
  /**
   * 加载成功回调
   */
  onLoad?: (component: React.ComponentType) => void;
  /**
   * 错误处理回调
   */
  onError?: (error: string) => void;
  /**
   * 是否只加载插件但不渲染
   */
  loadOnly?: boolean;
  /**
   * 加载后是否自动清理（默认否，通常由父组件控制生命周期）
   */
  autoCleanup?: boolean;
}

/**
 * 通用插件加载器组件
 *
 * 用于在应用任何位置加载和使用插件
 */
const PluginLoader = React.memo(
  ({
    plugin,
    loadingContent,
    errorContent,
    children,
    onLoad,
    onError,
    loadOnly = false,
    autoCleanup = false,
  }: PluginLoaderProps) => {
    const [state, setState] = useState<{
      loading: boolean;
      error: string | null;
      component: React.ComponentType | null;
    }>({
      loading: true,
      error: null,
      component: null,
    });
    // 提取插件ID
    const pluginId = useMemo(
      () => (typeof plugin === "string" ? plugin : plugin.id),
      [plugin],
    );
    // 错误处理函数
    const handleError = useCallback(
      (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setState((prev) => ({ ...prev, loading: false, error: errorMsg }));
        onError?.(errorMsg);
      },
      [onError],
    );
    // 插件加载逻辑
    useEffect(() => {
      let isMounted = true;
      const loadPlugin = async () => {
        if (!pluginId) return;
        setState({ loading: true, error: null, component: null });
        try {
          clearPluginGlobal();
          removePluginScript(pluginId);
          await loadPluginScript(pluginId);
          await pluginInitDelay();
          if (!window[PLUGIN_GLOBAL_VAR]) {
            throw new Error("插件未正确定义TaiAsstPlugin全局变量");
          }
          // 获取组件，支持多种导出方式
          const Component =
            typeof window[PLUGIN_GLOBAL_VAR] === "function"
              ? window[PLUGIN_GLOBAL_VAR]
              : typeof window[PLUGIN_GLOBAL_VAR]?.default === "function"
                ? window[PLUGIN_GLOBAL_VAR].default
                : null;
          if (!Component) {
            throw new Error("插件未提供有效的React组件");
          }
          if (isMounted) {
            setState({ loading: false, error: null, component: Component });
            onLoad?.(Component);
          }
        } catch (err) {
          if (isMounted) {
            handleError(err);
          }
        }
      };
      loadPlugin();
      return () => {
        isMounted = false;
        if (autoCleanup) {
          clearPluginGlobal();
          removePluginScript(pluginId);
        }
      };
    }, [pluginId, onLoad, handleError, autoCleanup]);

    const { loading, error, component } = state;
    // 渲染错误内容
    const renderError = (errorMsg: string) =>
      !errorContent
        ? null
        : typeof errorContent === "function"
          ? errorContent(errorMsg)
          : errorContent;
    // 确定要渲染的内容
    let content: React.ReactNode = null;
    // 根据状态决定渲染内容
    if (loading) {
      content = loadingContent || (
        <div className="flex justify-center items-center h-full">
          <Spin />
        </div>
      );
    } else if (error) {
      content = renderError(error);
    } else if (!loadOnly && component) {
      try {
        // 根据children类型决定渲染方式
        if (typeof children === "function") {
          content = children(component);
        } else if (children) {
          content = children;
        } else {
          // 直接渲染插件组件
          content = React.createElement(component);
        }
      } catch (err) {
        handleError(err);
        content = renderError(err instanceof Error ? err.message : String(err));
      }
    }
    // 统一返回
    return content ? <>{content}</> : null;
  },
);

export default PluginLoader;
