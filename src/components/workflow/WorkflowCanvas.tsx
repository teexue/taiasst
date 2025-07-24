/**
 * 工作流画布组件
 */

import React, { forwardRef, useRef, useState, useCallback } from "react";
import {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowConnection,
} from "@/services/workflow/types";
import WorkflowNodeComponent from "./WorkflowNodeComponent";
import WorkflowConnectionComponent from "./WorkflowConnectionComponent";

interface WorkflowCanvasProps {
  workflow: WorkflowDefinition;
  selectedNode: WorkflowNode | null;
  zoom: number;
  onNodeSelect: (node: WorkflowNode | null) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onConnectionAdd: (
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string,
  ) => void;
  onConnectionDelete: (connectionId: string) => void;
  onNodeAdd: (templateId: string, position: { x: number; y: number }) => void;
}

const WorkflowCanvas = forwardRef<HTMLDivElement, WorkflowCanvasProps>(
  (
    {
      workflow,
      selectedNode,
      zoom,
      onNodeSelect,
      onNodeUpdate,
      onNodeDelete: _onNodeDelete,
      onConnectionAdd,
      onConnectionDelete,
      onNodeAdd,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStart, setConnectionStart] = useState<{
      nodeId: string;
      portId: string;
      position: { x: number; y: number };
    } | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // 处理画布拖拽
    const handleCanvasMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (e.target === canvasRef.current) {
          setIsDragging(true);
          setDragOffset({
            x: e.clientX - canvasOffset.x,
            y: e.clientY - canvasOffset.y,
          });
          onNodeSelect(null);
        }
      },
      [canvasOffset, onNodeSelect],
    );

    const handleCanvasMouseMove = useCallback(
      (e: React.MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });

        if (isDragging) {
          setCanvasOffset({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          });
        }
      },
      [isDragging, dragOffset],
    );

    const handleCanvasMouseUp = useCallback(() => {
      setIsDragging(false);
      if (isConnecting) {
        setIsConnecting(false);
        setConnectionStart(null);
      }
    }, [isConnecting]);

    // 处理拖拽放置
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();

        try {
          const templateData = e.dataTransfer.getData("application/json");
          if (!templateData) return;

          const template = JSON.parse(templateData);

          // 计算放置位置（考虑缩放和偏移）
          const canvasRect = canvasRef.current?.getBoundingClientRect();
          if (!canvasRect) return;

          const x = (e.clientX - canvasRect.left - canvasOffset.x) / zoom;
          const y = (e.clientY - canvasRect.top - canvasOffset.y) / zoom;

          // 添加节点
          onNodeAdd(template.id, { x, y });
        } catch (error) {
          console.error("处理拖拽放置失败:", error);
        }
      },
      [canvasOffset, zoom, onNodeAdd],
    );

    // 处理节点拖拽
    const handleNodeDrag = useCallback(
      (nodeId: string, newPosition: { x: number; y: number }) => {
        onNodeUpdate(nodeId, { position: newPosition });
      },
      [onNodeUpdate],
    );

    // 处理节点选择
    const handleNodeClick = useCallback(
      (node: WorkflowNode) => {
        onNodeSelect(node);
      },
      [onNodeSelect],
    );

    // 处理连接开始
    const handleConnectionStart = useCallback(
      (nodeId: string, portId: string, position: { x: number; y: number }) => {
        setIsConnecting(true);
        setConnectionStart({ nodeId, portId, position });
      },
      [],
    );

    // 处理连接结束
    const handleConnectionEnd = useCallback(
      (targetNodeId: string, targetPortId: string) => {
        if (connectionStart && connectionStart.nodeId !== targetNodeId) {
          onConnectionAdd(
            connectionStart.nodeId,
            connectionStart.portId,
            targetNodeId,
            targetPortId,
          );
        }
        setIsConnecting(false);
        setConnectionStart(null);
      },
      [connectionStart, onConnectionAdd],
    );

    // 处理连接删除
    const handleConnectionClick = useCallback(
      (connection: WorkflowConnection) => {
        onConnectionDelete(connection.id);
      },
      [onConnectionDelete],
    );

    // 计算连接路径
    const getConnectionPath = useCallback(
      (
        sourcePos: { x: number; y: number },
        targetPos: { x: number; y: number },
      ) => {
        const dx = targetPos.x - sourcePos.x;
        // const dy = targetPos.y - sourcePos.y; // TODO: 用于计算连接线路径
        const controlPointOffset = Math.abs(dx) * 0.5;

        return `M ${sourcePos.x} ${sourcePos.y} 
            C ${sourcePos.x + controlPointOffset} ${sourcePos.y}, 
              ${targetPos.x - controlPointOffset} ${targetPos.y}, 
              ${targetPos.x} ${targetPos.y}`;
      },
      [],
    );

    // 获取节点端口位置
    const getNodePortPosition = useCallback(
      (node: WorkflowNode, _portId: string, portType: "input" | "output") => {
        const nodeElement = document.querySelector(
          `[data-node-id="${node.id}"]`,
        );
        if (!nodeElement) return { x: 0, y: 0 };

        const nodeRect = nodeElement.getBoundingClientRect();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return { x: 0, y: 0 };

        const relativeX =
          (nodeRect.left - canvasRect.left - canvasOffset.x) / zoom;
        const relativeY =
          (nodeRect.top - canvasRect.top - canvasOffset.y) / zoom;

        // 简化的端口位置计算
        const portOffset = portType === "output" ? nodeRect.width : 0;

        return {
          x: relativeX + portOffset,
          y: relativeY + nodeRect.height / 2,
        };
      },
      [canvasOffset, zoom],
    );

    // 渲染连接线
    const renderConnections = useCallback(() => {
      return workflow.connections.map((connection) => {
        const sourceNode = workflow.nodes.find(
          (n) => n.id === connection.sourceNodeId,
        );
        const targetNode = workflow.nodes.find(
          (n) => n.id === connection.targetNodeId,
        );

        if (!sourceNode || !targetNode) return null;

        const sourcePos = getNodePortPosition(
          sourceNode,
          connection.sourcePortId,
          "output",
        );
        const targetPos = getNodePortPosition(
          targetNode,
          connection.targetPortId,
          "input",
        );

        return (
          <WorkflowConnectionComponent
            key={connection.id}
            connection={connection}
            sourcePath={getConnectionPath(sourcePos, targetPos)}
            onClick={() => handleConnectionClick(connection)}
          />
        );
      });
    }, [
      workflow.connections,
      workflow.nodes,
      getNodePortPosition,
      getConnectionPath,
      handleConnectionClick,
    ]);

    // 渲染临时连接线
    const renderTemporaryConnection = useCallback(() => {
      if (!isConnecting || !connectionStart) return null;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return null;

      const targetPos = {
        x: (mousePosition.x - canvasRect.left - canvasOffset.x) / zoom,
        y: (mousePosition.y - canvasRect.top - canvasOffset.y) / zoom,
      };

      const path = getConnectionPath(connectionStart.position, targetPos);

      return (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1000 }}
        >
          <path
            d={path}
            stroke="rgb(var(--primary))"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        </svg>
      );
    }, [
      isConnecting,
      connectionStart,
      mousePosition,
      canvasOffset,
      zoom,
      getConnectionPath,
    ]);

    return (
      <div
        ref={ref}
        className="relative w-full h-full overflow-hidden bg-default-50 cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
            linear-gradient(rgba(var(--foreground), 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--foreground), 0.1) 1px, transparent 1px)
          `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
          }}
        />

        {/* 画布内容 */}
        <div
          ref={canvasRef}
          data-canvas="true"
          className="absolute inset-0"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* 连接线层 */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {renderConnections()}
          </svg>

          {/* 节点层 */}
          <div className="relative" style={{ zIndex: 2 }}>
            {workflow.nodes.map((node) => (
              <WorkflowNodeComponent
                key={node.id}
                node={node}
                isSelected={selectedNode?.id === node.id}
                onDrag={handleNodeDrag}
                onClick={handleNodeClick}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />
            ))}
          </div>

          {/* 临时连接线 */}
          {renderTemporaryConnection()}
        </div>

        {/* 画布信息 */}
        <div className="absolute bottom-4 left-4 text-xs text-foreground/60 bg-background/80 backdrop-blur-sm rounded px-2 py-1">
          节点: {workflow.nodes.length} | 连接: {workflow.connections.length} |
          缩放: {Math.round(zoom * 100)}%
        </div>

        {/* 操作提示 */}
        {isConnecting && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-sm text-primary bg-primary/10 backdrop-blur-sm rounded px-3 py-2">
            拖拽到目标端口以创建连接，点击空白处取消
          </div>
        )}
      </div>
    );
  },
);

WorkflowCanvas.displayName = "WorkflowCanvas";

export default WorkflowCanvas;
