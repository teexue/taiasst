/**
 * 工作流可视化编辑器组件
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button, Tooltip } from "@heroui/react";
import {
  RiPlayLine,
  RiStopLine,
  RiSaveLine,
  RiZoomInLine,
  RiZoomOutLine,
  RiFullscreenLine,
} from "react-icons/ri";
import { motion } from "framer-motion";
import {
  WorkflowDefinition,
  WorkflowNode,
  NodeTemplate,
} from "@/services/workflow/types";
import { getWorkflowManager } from "@/services/workflow/manager";
import WorkflowCanvas from "./WorkflowCanvas";
import NodePalette from "./NodePalette";
import NodePropertiesPanel from "./NodePropertiesPanel";
import { toast } from "sonner";

interface WorkflowEditorProps {
  workflowId: string;
  onSave?: (workflow: WorkflowDefinition) => void;
  onExecute?: (workflowId: string) => void;
  className?: string;
}

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  workflowId,
  onSave,
  onExecute,
  className = "",
}) => {
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isDirty, setIsDirty] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const workflowManager = getWorkflowManager();

  // 加载工作流
  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const loadedWorkflow = await workflowManager.getWorkflow(workflowId);
        if (loadedWorkflow) {
          setWorkflow(loadedWorkflow);
        } else {
          toast.error("工作流不存在");
        }
      } catch (error) {
        console.error("加载工作流失败:", error);
        toast.error("加载工作流失败");
      }
    };

    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId]);

  // 保存工作流
  const handleSave = useCallback(async () => {
    if (!workflow) return;

    try {
      await workflowManager.updateWorkflow(workflow.id, workflow);
      setIsDirty(false);
      toast.success("工作流已保存");
      onSave?.(workflow);
    } catch (error) {
      console.error("保存工作流失败:", error);
      toast.error("保存工作流失败");
    }
  }, [workflow, onSave]);

  // 执行工作流
  const handleExecute = useCallback(async () => {
    if (!workflow) return;

    try {
      setIsExecuting(true);
      await workflowManager.executeWorkflow(workflow.id);
      toast.success("工作流开始执行");
      onExecute?.(workflow.id);
    } catch (error) {
      console.error("执行工作流失败:", error);
      toast.error("执行工作流失败");
    } finally {
      setIsExecuting(false);
    }
  }, [workflow, onExecute]);

  // 停止执行
  const handleStop = useCallback(async () => {
    // 这里需要实现停止逻辑
    setIsExecuting(false);
    toast.info("工作流已停止");
  }, []);

  // 添加节点（通过模板ID）
  const handleAddNodeById = useCallback(
    async (templateId: string, position: { x: number; y: number }) => {
      if (!workflow) return;

      try {
        const newNode = await workflowManager.addNode(
          workflow.id,
          templateId,
          position,
        );
        setWorkflow((prev) =>
          prev
            ? {
                ...prev,
                nodes: [...prev.nodes, newNode],
              }
            : null,
        );
        setIsDirty(true);
        toast.success(`已添加节点`);
      } catch (error) {
        console.error("添加节点失败:", error);
        toast.error(
          `添加节点失败: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    [workflow],
  );

  // 添加节点（通过模板对象）
  const handleAddNode = useCallback(
    async (template: NodeTemplate, position: { x: number; y: number }) => {
      await handleAddNodeById(template.id, position);
    },
    [handleAddNodeById],
  );

  // 更新节点
  const handleUpdateNode = useCallback(
    async (nodeId: string, updates: Partial<WorkflowNode>) => {
      if (!workflow) return;

      try {
        await workflowManager.updateNode(workflow.id, nodeId, updates);
        setWorkflow((prev) =>
          prev
            ? {
                ...prev,
                nodes: prev.nodes.map((node) =>
                  node.id === nodeId ? { ...node, ...updates } : node,
                ),
              }
            : null,
        );
        setIsDirty(true);
      } catch (error) {
        console.error("更新节点失败:", error);
        toast.error("更新节点失败");
      }
    },
    [workflow],
  );

  // 删除节点
  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      if (!workflow) return;

      try {
        await workflowManager.deleteNode(workflow.id, nodeId);
        setWorkflow((prev) =>
          prev
            ? {
                ...prev,
                nodes: prev.nodes.filter((node) => node.id !== nodeId),
                connections: prev.connections.filter(
                  (conn) =>
                    conn.sourceNodeId !== nodeId &&
                    conn.targetNodeId !== nodeId,
                ),
              }
            : null,
        );
        setSelectedNode(null);
        setIsDirty(true);
        toast.success("节点已删除");
      } catch (error) {
        console.error("删除节点失败:", error);
        toast.error("删除节点失败");
      }
    },
    [workflow],
  );

  // 添加连接
  const handleAddConnection = useCallback(
    async (
      sourceNodeId: string,
      sourcePortId: string,
      targetNodeId: string,
      targetPortId: string,
    ) => {
      if (!workflow) return;

      try {
        const newConnection = await workflowManager.addConnection(
          workflow.id,
          sourceNodeId,
          sourcePortId,
          targetNodeId,
          targetPortId,
        );
        setWorkflow((prev) =>
          prev
            ? {
                ...prev,
                connections: [...prev.connections, newConnection],
              }
            : null,
        );
        setIsDirty(true);
        toast.success("连接已创建");
      } catch (error) {
        console.error("创建连接失败:", error);
        toast.error("创建连接失败");
      }
    },
    [workflow],
  );

  // 删除连接
  const handleDeleteConnection = useCallback(
    async (connectionId: string) => {
      if (!workflow) return;

      try {
        await workflowManager.deleteConnection(workflow.id, connectionId);
        setWorkflow((prev) =>
          prev
            ? {
                ...prev,
                connections: prev.connections.filter(
                  (conn) => conn.id !== connectionId,
                ),
              }
            : null,
        );
        setIsDirty(true);
        toast.success("连接已删除");
      } catch (error) {
        console.error("删除连接失败:", error);
        toast.error("删除连接失败");
      }
    },
    [workflow],
  );

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, 0.3));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleSave();
            break;
          case "r":
            e.preventDefault();
            handleExecute();
            break;
          case "=":
          case "+":
            e.preventDefault();
            handleZoomIn();
            break;
          case "-":
            e.preventDefault();
            handleZoomOut();
            break;
          case "0":
            e.preventDefault();
            handleZoomReset();
            break;
        }
      }

      if (e.key === "Delete" && selectedNode) {
        handleDeleteNode(selectedNode.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleSave,
    handleExecute,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    selectedNode,
    handleDeleteNode,
  ]);

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/60">加载工作流中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-divider/20 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            {workflow.name}
          </h2>
          {isDirty && <span className="text-xs text-warning">未保存</span>}
        </div>

        <div className="flex items-center gap-2">
          {/* 缩放控制 */}
          <div className="flex items-center gap-1 mr-4">
            <Tooltip content="放大 (Ctrl/Cmd + +)">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={handleZoomIn}
              >
                <RiZoomInLine />
              </Button>
            </Tooltip>
            <span className="text-sm text-foreground/60 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Tooltip content="缩小 (Ctrl/Cmd + -)">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={handleZoomOut}
              >
                <RiZoomOutLine />
              </Button>
            </Tooltip>
            <Tooltip content="重置缩放 (Ctrl/Cmd + 0)">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={handleZoomReset}
              >
                <RiFullscreenLine />
              </Button>
            </Tooltip>
          </div>

          {/* 操作按钮 */}
          <Tooltip content="保存 (Ctrl/Cmd + S)">
            <Button
              size="sm"
              variant="flat"
              startContent={<RiSaveLine />}
              onPress={handleSave}
              isDisabled={!isDirty}
            >
              保存
            </Button>
          </Tooltip>

          {isExecuting ? (
            <Tooltip content="停止执行">
              <Button
                size="sm"
                color="danger"
                variant="flat"
                startContent={<RiStopLine />}
                onPress={handleStop}
              >
                停止
              </Button>
            </Tooltip>
          ) : (
            <Tooltip content="运行工作流 (Ctrl/Cmd + R)">
              <Button
                size="sm"
                color="primary"
                startContent={<RiPlayLine />}
                onPress={handleExecute}
              >
                运行
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 节点面板 */}
        <div className="w-64 border-r border-divider/20 bg-background/50">
          <NodePalette onAddNode={handleAddNode} />
        </div>

        {/* 画布区域 */}
        <div className="flex-1 relative overflow-hidden">
          <WorkflowCanvas
            ref={canvasRef}
            workflow={workflow}
            selectedNode={selectedNode}
            zoom={zoom}
            onNodeSelect={setSelectedNode}
            onNodeUpdate={handleUpdateNode}
            onNodeDelete={handleDeleteNode}
            onConnectionAdd={handleAddConnection}
            onConnectionDelete={handleDeleteConnection}
            onNodeAdd={handleAddNodeById}
          />
        </div>

        {/* 属性面板 */}
        {selectedNode && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="w-80 border-l border-divider/20 bg-background/50"
          >
            <NodePropertiesPanel
              node={selectedNode}
              onUpdate={(updates) => handleUpdateNode(selectedNode.id, updates)}
              onDelete={() => handleDeleteNode(selectedNode.id)}
              onClose={() => setSelectedNode(null)}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkflowEditor;
