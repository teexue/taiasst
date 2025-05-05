import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Spinner } from "@heroui/react";
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
   * 错误处理回调（包括加载和渲染错误）
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

// --- 新增 Error Boundary 组件 ---
interface PluginRenderBoundaryProps {
  children: React.ReactNode;
  fallbackRender: (error: Error) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface PluginRenderBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PluginRenderBoundary extends React.Component<
  PluginRenderBoundaryProps,
  PluginRenderBoundaryState
> {
  constructor(props: PluginRenderBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): PluginRenderBoundaryState {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error("Plugin Render Error Boundary Caught:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  // 添加一个方法来重置错误状态，例如在插件ID改变时
  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 你可以自定义降级后的 UI 并渲染
      return this.props.fallbackRender(this.state.error);
    }

    return this.props.children;
  }
}
// --- Error Boundary 组件结束 ---

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
      error: string | null; // 只用于加载错误
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

    // Ref for the error boundary to reset it when pluginId changes
    const boundaryRef = React.useRef<PluginRenderBoundary>(null);

    // 错误处理函数 (现在只处理加载错误)
    const handleLoadError = useCallback(
      (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMsg,
          component: null,
        }));
        onError?.(errorMsg); // 触发外部错误回调
      },
      [onError],
    );

    // 插件加载逻辑
    useEffect(() => {
      let isMounted = true;
      // Reset error boundary when pluginId changes
      boundaryRef.current?.resetErrorBoundary();

      const loadPlugin = async () => {
        if (!pluginId) return;
        // 重置状态，只保留加载状态
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
            // 加载成功，清空加载错误，设置组件
            setState({ loading: false, error: null, component: Component });
            onLoad?.(Component);
          }
        } catch (err) {
          if (isMounted) {
            handleLoadError(err); // 处理加载错误
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
      // eslint-disable-next-line react-hooks/exhaustive-deps -- boundaryRef should not be dependency
    }, [pluginId, onLoad, handleLoadError, autoCleanup]); // 移除 boundaryRef.current 从依赖

    const { loading, error, component } = state;

    // 渲染错误内容的函数 (用于加载错误和渲染错误回退)
    const renderFallbackContent = (errorSource: string | Error) => {
      const errorMsg =
        errorSource instanceof Error ? errorSource.message : errorSource;
      const defaultFallback = (
        <div className="flex flex-col items-center justify-center h-full text-danger p-4 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-12 h-12 opacity-50 mb-2"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1-8h-2V7h2v2z"></path>
          </svg>
          <p className="font-medium">插件加载或渲染失败</p>
          <p className="text-xs opacity-80 mt-1">{errorMsg}</p>
        </div>
      );

      if (!errorContent) return defaultFallback;
      return typeof errorContent === "function"
        ? errorContent(errorMsg)
        : errorContent;
    };

    // 渲染加载中
    const renderLoading = loadingContent || (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );

    // 1. 处理加载状态
    if (loading) {
      return <>{renderLoading}</>;
    }

    // 2. 处理加载错误 (加载阶段失败)
    if (error) {
      return <>{renderFallbackContent(error)}</>;
    }

    // 3. 处理只加载不渲染的情况 或 组件未成功加载（理论上此时应有error）
    if (loadOnly || !component) {
      return null;
    }

    // 4. 成功加载，渲染插件组件，并用 Error Boundary 包裹
    let renderContent: React.ReactNode = null;
    try {
      // 这个 try/catch 仍然需要，用于捕获 children 函数本身可能抛出的错误
      if (typeof children === "function") {
        renderContent = children(component);
      } else if (children) {
        renderContent = children; // 如果 children 是固定节点，可能不需要 component
      } else {
        renderContent = React.createElement(component);
      }
    } catch (err) {
      // 如果 children 函数或 React.createElement 同步出错
      console.error("Error preparing plugin content:", pluginId, err);
      return (
        <>{renderFallbackContent(err instanceof Error ? err : String(err))}</>
      );
    }

    // 将渲染内容包裹在 Error Boundary 中
    return (
      <PluginRenderBoundary
        ref={boundaryRef} // Attach ref
        fallbackRender={(renderError) => renderFallbackContent(renderError)}
        onError={(renderError, info) => {
          // 可以在这里触发外部 onError 回调，传递渲染错误信息
          onError?.(renderError.message);
          console.error("Render error caught by boundary:", info);
        }}
      >
        {renderContent}
      </PluginRenderBoundary>
    );
  },
);

export default PluginLoader;
