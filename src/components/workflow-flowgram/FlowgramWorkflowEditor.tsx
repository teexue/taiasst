/**
 * FlowGram.ai 工作流编辑器
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  EditorRenderer,
  FreeLayoutEditorProvider,
  WorkflowJSON,
  WorkflowNodeRegistry,
  WorkflowDragService,
  useService,
} from "@flowgram.ai/free-layout-editor";
import { Button, Card, CardBody } from "@heroui/react";
import {
  RiPlayLine,
  RiSaveLine,
  RiZoomInLine,
  RiZoomOutLine,
  RiFullscreenLine,
  RiAddLine,
} from "react-icons/ri";
import { toast } from "sonner";
import "@flowgram.ai/free-layout-editor/index.css";
import "./flowgram-styles.css";

interface FlowgramWorkflowEditorProps {
  workflowId: string;
  className?: string;
}

// 节点注册表
const nodeRegistries: WorkflowNodeRegistry[] = [
  {
    type: "start",
    meta: {
      isStart: true,
      deleteDisable: true,
      copyDisable: true,
      defaultPorts: [{ type: "output" }],
    },
  },
  {
    type: "end",
    meta: {
      deleteDisable: true,
      copyDisable: true,
      defaultPorts: [{ type: "input" }],
    },
  },
  {
    type: "text-input",
    meta: {
      defaultPorts: [{ type: "output" }],
    },
  },
  {
    type: "text-process",
    meta: {
      defaultPorts: [{ type: "input" }, { type: "output" }],
    },
  },
  {
    type: "ai-chat",
    meta: {
      defaultPorts: [{ type: "input" }, { type: "output" }],
    },
  },
  {
    type: "condition",
    meta: {
      defaultPorts: [{ type: "input" }, { type: "output" }, { type: "output" }],
    },
  },
  // 添加更多节点类型
  {
    type: "Node1",
    meta: {
      defaultPorts: [{ type: "input" }, { type: "output" }],
    },
  },
  {
    type: "Node2",
    meta: {
      defaultPorts: [{ type: "input" }, { type: "output" }],
    },
  },
];

// 初始工作流数据
const initialWorkflowData: WorkflowJSON = {
  nodes: [
    {
      id: "start_1",
      type: "start",
      meta: {
        position: { x: 100, y: 200 },
      },
      data: {
        title: "开始",
        content: "工作流开始节点",
      },
    },
    {
      id: "end_1",
      type: "end",
      meta: {
        position: { x: 600, y: 200 },
      },
      data: {
        title: "结束",
        content: "工作流结束节点",
      },
    },
  ],
  edges: [],
};

// 节点面板组件
const NodePanel: React.FC = () => {
  const dragService = useService<WorkflowDragService>(WorkflowDragService);

  const nodeTypes = [
    {
      type: "text-input",
      title: "文本输入",
      icon: "📝",
      color: "bg-blue-500/20",
    },
    {
      type: "text-process",
      title: "文本处理",
      icon: "⚙️",
      color: "bg-purple-500/20",
    },
    { type: "ai-chat", title: "AI对话", icon: "🤖", color: "bg-green-500/20" },
    {
      type: "condition",
      title: "条件判断",
      icon: "🔀",
      color: "bg-orange-500/20",
    },
    { type: "Node1", title: "节点1", icon: "🔵", color: "bg-cyan-500/20" },
    { type: "Node2", title: "节点2", icon: "🟢", color: "bg-emerald-500/20" },
  ];

  return (
    <div className="flowgram-node-panel">
      <h3>
        <RiAddLine className="w-5 h-5" />
        节点库
      </h3>

      <div className="space-y-2">
        {nodeTypes.map((nodeType) => (
          <Card
            key={nodeType.type}
            className="flowgram-node-card"
            onMouseDown={(e) =>
              dragService.startDragCard(nodeType.type, e, {
                data: {
                  title: nodeType.title,
                  content: `新建${nodeType.title}节点`,
                },
              })
            }
          >
            <CardBody className="p-3">
              <div className="flex items-center gap-3">
                <div className={`node-icon ${nodeType.color}`}>
                  {nodeType.icon}
                </div>
                <div className="node-info">
                  <h4>{nodeType.title}</h4>
                  <p>拖拽到画布添加</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 工具栏组件
const Toolbar: React.FC<{
  onSave: () => void;
  onExecute: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
}> = ({ onSave, onExecute, onZoomIn, onZoomOut, onFitView }) => {
  return (
    <div className="flowgram-toolbar">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">工作流编辑器</h2>
      </div>

      <div className="button-group">
        {/* 缩放控制 */}
        <div className="zoom-controls">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onPress={onZoomOut}
            title="缩小"
          >
            <RiZoomOutLine />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onPress={onFitView}
            title="适应画布"
          >
            <RiFullscreenLine />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onPress={onZoomIn}
            title="放大"
          >
            <RiZoomInLine />
          </Button>
        </div>

        {/* 操作按钮 */}
        <Button
          variant="flat"
          startContent={<RiSaveLine />}
          onPress={onSave}
          size="sm"
        >
          保存
        </Button>
        <Button
          color="primary"
          startContent={<RiPlayLine />}
          onPress={onExecute}
          size="sm"
        >
          运行
        </Button>
      </div>
    </div>
  );
};

export const FlowgramWorkflowEditor: React.FC<FlowgramWorkflowEditorProps> = ({
  workflowId: _workflowId,
  className = "",
}) => {
  const [workflowData, setWorkflowData] =
    useState<WorkflowJSON>(initialWorkflowData);
  const [, setIsDirty] = useState(false);

  // 编辑器配置
  const editorProps = useMemo(
    () => ({
      nodeRegistries,
      initialData: workflowData,
      onChange: (data: WorkflowJSON) => {
        setWorkflowData(data);
        setIsDirty(true);
      },
    }),
    [workflowData],
  );

  // 保存工作流
  const handleSave = useCallback(() => {
    // TODO: 实现保存逻辑
    console.log("保存工作流:", workflowData);
    setIsDirty(false);
    toast.success("工作流已保存");
  }, [workflowData]);

  // 执行工作流
  const handleExecute = useCallback(() => {
    // TODO: 实现执行逻辑
    console.log("执行工作流:", workflowData);
    toast.success("工作流开始执行");
  }, [workflowData]);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    // TODO: 实现缩放逻辑
    console.log("放大");
  }, []);

  const handleZoomOut = useCallback(() => {
    // TODO: 实现缩放逻辑
    console.log("缩小");
  }, []);

  const handleFitView = useCallback(() => {
    // TODO: 实现适应视图逻辑
    console.log("适应视图");
  }, []);

  return (
    <div className={`flowgram-editor-container ${className}`}>
      {/* 工具栏 */}
      <Toolbar
        onSave={handleSave}
        onExecute={handleExecute}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
      />

      {/* 主要内容区域 */}
      <div className="flowgram-main-content">
        <FreeLayoutEditorProvider {...editorProps}>
          {/* 节点面板 */}
          <NodePanel />

          {/* 编辑器画布 */}
          <div className="flowgram-canvas">
            <EditorRenderer className="w-full h-full" />
          </div>
        </FreeLayoutEditorProvider>
      </div>
    </div>
  );
};

export default FlowgramWorkflowEditor;
