/**
 * FlowGram.ai 工作流编辑器主入口
 */

import React from "react";
import {
  EditorRenderer,
  FreeLayoutEditorProvider,
} from "@flowgram.ai/free-layout-editor";

// 导入样式
import "@flowgram.ai/free-layout-editor/index.css";
import "./styles/index.css";

// 导入组件
import { Tools } from "./components/tools";
import { NodeAddPanel } from "./components/node-add-panel";
import { BaseNode } from "./components/base-node";
import { NodePropertiesPanel } from "./components/node-properties-panel";

// 导入插件
import { Minimap } from "./plugins/minimap-plugin";
import { SnapPlugin } from "./plugins/snap-plugin";
import { GridPlugin } from "./plugins/grid-plugin";

// 导入配置
import { nodeRegistries } from "./nodes/node-registries";
import { initialData } from "./core/initial-data";
import { LineManager } from "./lines/line-manager";
import { PortManager } from "./ports/port-manager";
import { DataManager } from "./data/data-manager";

interface FlowgramEditorProps {
  data?: any;
  readonly?: boolean;
  onDataChange?: (data: any) => void;
  className?: string;
  showMinimap?: boolean;
  enableSnap?: boolean;
  enableGrid?: boolean;
  showPropertiesPanel?: boolean;
  workflowId?: string;
  autoSave?: boolean;
}

export const FlowgramEditor: React.FC<FlowgramEditorProps> = ({
  data = initialData,
  readonly = false,
  onDataChange,
  className = "",
  showMinimap = true,
  enableSnap = true,
  enableGrid = false,
  showPropertiesPanel = true,
  workflowId,
  autoSave = true,
}) => {
  const [autoSaveManager, setAutoSaveManager] = React.useState<any>(null);
  const [, setCurrentData] = React.useState(data);
  const [showGridState, setShowGridState] = React.useState(enableGrid);
  const [showMinimapState, setShowMinimapState] = React.useState(showMinimap);

  // 工具栏处理函数
  const handleSave = () => {
    if (workflowId && autoSaveManager) {
      autoSaveManager.forceSave();
    }
  };

  const handleExport = () => {
    if (workflowId) {
      const jsonData = DataManager.exportWorkflow(workflowId);
      if (jsonData) {
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `workflow_${workflowId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = e.target?.result as string;
            const data = JSON.parse(jsonData);
            setCurrentData(data);
            onDataChange?.(data);
          } catch (error) {
            alert("导入失败: JSON 格式错误");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleRun = () => {
    console.log("开始执行工作流");
    // TODO: 实现工作流执行逻辑
  };

  const handleStop = () => {
    console.log("停止执行工作流");
    // TODO: 实现工作流停止逻辑
  };

  const editorProps = {
    background: true,
    readonly,
    initialData: data,
    nodeRegistries,
    materials: {
      renderDefaultNode: BaseNode,
    },
    nodeEngine: {
      enable: true,
    },
    history: {
      enable: true,
      enableChangeNode: true,
    },
    lineColor: {
      hidden: "transparent",
      default: "#4d53e8",
      drawing: "#5DD6E3",
      hovered: "#37d0ff",
      selected: "#37d0ff",
      error: "#ef4444",
      flowing: "#ff6b35",
      success: "#10b981",
      warning: "#f59e0b",
    },
    canAddLine: (_ctx: any, fromPort: any, toPort: any) => {
      const validation = PortManager.validateConnection(fromPort, toPort);
      if (!validation.valid) {
        console.warn("连线验证失败:", validation.reason);
        return false;
      }
      return true;
    },
    onDragLineEnd: async (_ctx: any, params: any) => {
      const { toPort, mousePos, line, originLine } = params;

      if (originLine || !line) {
        return;
      }

      if (toPort) {
        return;
      }

      // 拖拽线条到空白区域，可以打开节点添加面板
      console.log("拖拽线条到空白区域，位置：", mousePos);
      // TODO: 实现节点添加面板服务
    },
    onContentChange: (changes: any) => {
      console.log("工作流内容变化：", changes);
      if (onDataChange) {
        onDataChange(changes);
      }
    },
    onInit: (ctx: any) => {
      console.log("FlowGram.ai 编辑器初始化完成", ctx);

      // 监听连线变化
      LineManager.onLinesChange(ctx, () => {
        console.log("连线发生变化");
      });

      // 设置自动保存
      if (autoSave && workflowId) {
        const manager = DataManager.createAutoSaveManager(
          workflowId,
          () => ctx.document.toJSON(),
          () => console.log("工作流已自动保存"),
        );
        setAutoSaveManager(manager);
      }
    },
    plugins: () => [],
  };

  // 清理自动保存管理器
  React.useEffect(() => {
    return () => {
      autoSaveManager?.destroy();
    };
  }, [autoSaveManager]);

  return (
    <FreeLayoutEditorProvider {...editorProps}>
      <div className={`flowgram-editor-container ${className}`}>
        <div className="flowgram-editor-layout">
          {!readonly && <NodeAddPanel />}
          <div className="relative flex-1">
            {showGridState && <GridPlugin enabled={showGridState} />}
            <EditorRenderer className="flowgram-editor-canvas" />
            {enableSnap && <SnapPlugin enabled={enableSnap} />}
          </div>
          {showPropertiesPanel && !readonly && (
            <NodePropertiesPanel className="w-80 border-l border-gray-200" />
          )}
        </div>
        {!readonly && (
          <Tools
            onSave={handleSave}
            onExport={handleExport}
            onImport={handleImport}
            onRun={handleRun}
            onStop={handleStop}
            showGrid={showGridState}
            onToggleGrid={() => setShowGridState(!showGridState)}
            showMinimap={showMinimapState}
            onToggleMinimap={() => setShowMinimapState(!showMinimapState)}
          />
        )}
        {showMinimapState && <Minimap />}
      </div>
    </FreeLayoutEditorProvider>
  );
};

export default FlowgramEditor;
