/**
 * 工作流节点组件
 */

import React, { useState, useRef, useCallback } from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import {
  RiInputMethodLine,
  RiFileUploadLine,
  RiEditLine,
  RiFilterLine,
  RiRobot2Line,
  RiSearchEyeLine,
  RiGlobalLine,
  RiMailSendLine,
  RiGitBranchLine,
  RiRefreshLine,
  RiEyeLine,
  RiSaveLine,
  RiPlayCircleLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { WorkflowNode } from "@/services/workflow/types";

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  isSelected: boolean;
  onDrag: (nodeId: string, position: { x: number; y: number }) => void;
  onClick: (node: WorkflowNode) => void;
  onConnectionStart: (
    nodeId: string,
    portId: string,
    position: { x: number; y: number },
  ) => void;
  onConnectionEnd: (nodeId: string, portId: string) => void;
}

// 节点图标映射
const NODE_ICONS = {
  input_text: RiInputMethodLine,
  input_file: RiFileUploadLine,
  process_text_transform: RiEditLine,
  process_data_filter: RiFilterLine,
  ai_text_generation: RiRobot2Line,
  ai_text_analysis: RiSearchEyeLine,
  tool_http_request: RiGlobalLine,
  tool_email_send: RiMailSendLine,
  control_condition: RiGitBranchLine,
  control_loop: RiRefreshLine,
  output_display: RiEyeLine,
  output_file_save: RiSaveLine,
};

// 节点颜色映射
const NODE_COLORS = {
  input: "bg-blue-500/20 text-blue-600",
  process: "bg-purple-500/20 text-purple-600",
  ai: "bg-green-500/20 text-green-600",
  tool: "bg-orange-500/20 text-orange-600",
  control: "bg-red-500/20 text-red-600",
  output: "bg-gray-500/20 text-gray-600",
};

// 状态图标映射
const STATUS_ICONS = {
  idle: null,
  running: RiPlayCircleLine,
  success: RiCheckboxCircleLine,
  error: RiErrorWarningLine,
  waiting: RiPlayCircleLine,
};

const WorkflowNodeComponent: React.FC<WorkflowNodeComponentProps> = ({
  node,
  isSelected,
  onDrag,
  onClick,
  onConnectionStart,
  onConnectionEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 获取节点图标
  const getNodeIcon = useCallback(() => {
    const iconKey = `${node.type}_${node.subtype}` as keyof typeof NODE_ICONS;
    const IconComponent = NODE_ICONS[iconKey];
    return IconComponent || RiInputMethodLine;
  }, [node.type, node.subtype]);

  // 获取节点颜色
  const getNodeColor = useCallback(() => {
    return NODE_COLORS[node.type] || NODE_COLORS.output;
  }, [node.type]);

  // 获取状态图标
  const getStatusIcon = useCallback(() => {
    const IconComponent = STATUS_ICONS[node.status];
    return IconComponent;
  }, [node.status]);

  // 处理鼠标按下
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (e.button === 0) {
        // 左键
        const rect = nodeRef.current?.getBoundingClientRect();
        if (rect) {
          // 计算相对于节点的偏移
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;

          setDragOffset({ x: offsetX, y: offsetY });
          setIsDragging(true);
        }
        onClick(node);
      }
    },
    [onClick, node],
  );

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !nodeRef.current) return;

      e.preventDefault();

      // 取消之前的动画帧
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // 使用requestAnimationFrame优化性能
      animationFrameRef.current = requestAnimationFrame(() => {
        const canvas = nodeRef.current?.closest('[data-canvas="true"]');
        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const canvasElement = canvas as HTMLElement;
        const transform = canvasElement.style.transform;

        // 解析变换参数
        const scaleMatch = transform.match(/scale\(([^)]+)\)/);
        const translateMatch = transform.match(
          /translate\(([^,]+),\s*([^)]+)\)/,
        );

        const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
        const translateX = translateMatch
          ? parseFloat(translateMatch[1].replace("px", ""))
          : 0;
        const translateY = translateMatch
          ? parseFloat(translateMatch[2].replace("px", ""))
          : 0;

        // 计算新位置
        const newPosition = {
          x: Math.round(
            (e.clientX - canvasRect.left - translateX - dragOffset.x) / scale,
          ),
          y: Math.round(
            (e.clientY - canvasRect.top - translateY - dragOffset.y) / scale,
          ),
        };

        // 只在位置真正改变时更新
        if (
          newPosition.x !== node.position.x ||
          newPosition.y !== node.position.y
        ) {
          onDrag(node.id, newPosition);
        }
      });
    },
    [isDragging, dragOffset, onDrag, node.id, node.position],
  );

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // 清理动画帧
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // 绑定全局鼠标事件
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 组件卸载时清理动画帧
  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // 处理端口连接开始
  const handlePortMouseDown = useCallback(
    (e: React.MouseEvent, portId: string, portType: "input" | "output") => {
      e.stopPropagation();

      if (portType === "output") {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        onConnectionStart(node.id, portId, {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    },
    [onConnectionStart, node.id],
  );

  // 处理端口连接结束
  const handlePortMouseUp = useCallback(
    (e: React.MouseEvent, portId: string, portType: "input" | "output") => {
      e.stopPropagation();

      if (portType === "input") {
        onConnectionEnd(node.id, portId);
      }
    },
    [onConnectionEnd, node.id],
  );

  const IconComponent = getNodeIcon();
  const StatusIcon = getStatusIcon();
  const nodeColor = getNodeColor();

  return (
    <motion.div
      ref={nodeRef}
      data-node-id={node.id}
      className={`absolute select-none ${isDragging ? "z-50 cursor-grabbing" : "z-10 cursor-grab"}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: isDragging ? 1.05 : 1,
        opacity: 1,
        transition: { duration: isDragging ? 0.1 : 0.3 },
      }}
      whileHover={!isDragging ? { scale: 1.02 } : {}}
      onMouseDown={handleMouseDown}
      drag={false}
    >
      <Card
        className={`
          min-w-48 max-w-64 shadow-lg transition-all duration-200
          ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}
          ${isDragging ? "shadow-2xl" : ""}
        `}
      >
        <CardBody className="p-3">
          {/* 节点头部 */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${nodeColor}`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate">
                {node.label}
              </h4>
              <p className="text-xs text-foreground/60 truncate">
                {node.description}
              </p>
            </div>
            {StatusIcon && (
              <div className="flex-shrink-0">
                <StatusIcon
                  className={`w-4 h-4 ${
                    node.status === "running"
                      ? "text-primary animate-spin"
                      : node.status === "success"
                        ? "text-success"
                        : node.status === "error"
                          ? "text-danger"
                          : "text-warning"
                  }`}
                />
              </div>
            )}
          </div>

          {/* 输入端口 */}
          {node.ports.filter((port) => port.type === "input").length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-foreground/60 mb-1">输入</div>
              <div className="space-y-1">
                {node.ports
                  .filter((port) => port.type === "input")
                  .map((port) => (
                    <div key={port.id} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full bg-default-300 hover:bg-primary cursor-pointer transition-colors"
                        onMouseDown={(e) =>
                          handlePortMouseDown(e, port.id, "input")
                        }
                        onMouseUp={(e) =>
                          handlePortMouseUp(e, port.id, "input")
                        }
                      />
                      <span className="text-xs text-foreground/80 truncate">
                        {port.label}
                      </span>
                      {port.required && (
                        <span className="text-xs text-danger">*</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 输出端口 */}
          {node.ports.filter((port) => port.type === "output").length > 0 && (
            <div>
              <div className="text-xs text-foreground/60 mb-1">输出</div>
              <div className="space-y-1">
                {node.ports
                  .filter((port) => port.type === "output")
                  .map((port) => (
                    <div
                      key={port.id}
                      className="flex items-center justify-end gap-2"
                    >
                      <span className="text-xs text-foreground/80 truncate">
                        {port.label}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full bg-default-300 hover:bg-primary cursor-pointer transition-colors"
                        onMouseDown={(e) =>
                          handlePortMouseDown(e, port.id, "output")
                        }
                        onMouseUp={(e) =>
                          handlePortMouseUp(e, port.id, "output")
                        }
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 节点状态 */}
          {node.status !== "idle" && (
            <div className="mt-2 pt-2 border-t border-divider/20">
              <Chip
                size="sm"
                variant="flat"
                color={
                  node.status === "running"
                    ? "primary"
                    : node.status === "success"
                      ? "success"
                      : node.status === "error"
                        ? "danger"
                        : "warning"
                }
              >
                {node.status === "running"
                  ? "运行中"
                  : node.status === "success"
                    ? "成功"
                    : node.status === "error"
                      ? "错误"
                      : node.status === "waiting"
                        ? "等待"
                        : "空闲"}
              </Chip>
              {node.error && (
                <p
                  className="text-xs text-danger mt-1 truncate"
                  title={node.error}
                >
                  {node.error}
                </p>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default WorkflowNodeComponent;
