/**
 * FlowGram.ai 自定义对齐插件
 */

import React, { useEffect, useState } from "react";
import { useClientContext } from "@flowgram.ai/free-layout-editor";

interface SnapPluginProps {
  enabled?: boolean;
  threshold?: number;
  edgeColor?: string;
  alignColor?: string;
}

export const SnapPlugin: React.FC<SnapPluginProps> = ({
  enabled = true,
  threshold = 8,
  edgeColor = "#00B2B2",
  alignColor = "#00B2B2",
}) => {
  const { playground } = useClientContext();
  const [snapLines, setSnapLines] = useState<
    Array<{
      type: "vertical" | "horizontal";
      position: number;
      color: string;
    }>
  >([]);

  useEffect(() => {
    if (!playground || !enabled) return;

    let isSnapping = false;
    const activeSnapLines: any[] = [];

    const showSnapLine = (
      type: "vertical" | "horizontal",
      position: number,
      color: string,
    ) => {
      const line = {
        type,
        position,
        color,
        id: `snap-${type}-${position}`,
      };
      activeSnapLines.push(line);
      setSnapLines([...activeSnapLines]);
    };

    const hideSnapLines = () => {
      activeSnapLines.length = 0;
      setSnapLines([]);
    };

    const handleNodeDragStart = () => {
      isSnapping = true;
    };

    const handleNodeDrag = (event: any) => {
      if (!isSnapping) return;

      try {
        const draggedNode = event.node;
        const draggedPos = draggedNode.getPosition();
        const draggedSize = draggedNode.getSize();
        const allNodes =
          (playground as any).document?.nodeManager?.getAllNodes?.() || [];

        hideSnapLines();

        // 计算对齐线
        const snapPositions = {
          vertical: new Set<number>(),
          horizontal: new Set<number>(),
        };

        allNodes.forEach((node: any) => {
          if (node.id === draggedNode.id) return;

          const pos = node.getPosition();
          const size = node.getSize();

          // 垂直对齐线
          snapPositions.vertical.add(pos.x); // 左边缘
          snapPositions.vertical.add(pos.x + size.width); // 右边缘
          snapPositions.vertical.add(pos.x + size.width / 2); // 中心线

          // 水平对齐线
          snapPositions.horizontal.add(pos.y); // 上边缘
          snapPositions.horizontal.add(pos.y + size.height); // 下边缘
          snapPositions.horizontal.add(pos.y + size.height / 2); // 中心线
        });

        // 检查垂直对齐
        const draggedLeft = draggedPos.x;
        const draggedRight = draggedPos.x + draggedSize.width;
        const draggedCenterX = draggedPos.x + draggedSize.width / 2;

        [draggedLeft, draggedRight, draggedCenterX].forEach((x) => {
          snapPositions.vertical.forEach((snapX) => {
            if (Math.abs(x - snapX) <= threshold) {
              showSnapLine("vertical", snapX, alignColor);
            }
          });
        });

        // 检查水平对齐
        const draggedTop = draggedPos.y;
        const draggedBottom = draggedPos.y + draggedSize.height;
        const draggedCenterY = draggedPos.y + draggedSize.height / 2;

        [draggedTop, draggedBottom, draggedCenterY].forEach((y) => {
          snapPositions.horizontal.forEach((snapY) => {
            if (Math.abs(y - snapY) <= threshold) {
              showSnapLine("horizontal", snapY, alignColor);
            }
          });
        });

        // 检查画布边缘对齐
        const viewport = (playground as any).viewport?.getViewportRect?.() || {
          x: 0,
          y: 0,
          width: 800,
          height: 600,
        };

        // 左边缘
        if (Math.abs(draggedLeft - viewport.x) <= threshold) {
          showSnapLine("vertical", viewport.x, edgeColor);
        }
        // 右边缘
        if (
          Math.abs(draggedRight - (viewport.x + viewport.width)) <= threshold
        ) {
          showSnapLine("vertical", viewport.x + viewport.width, edgeColor);
        }
        // 上边缘
        if (Math.abs(draggedTop - viewport.y) <= threshold) {
          showSnapLine("horizontal", viewport.y, edgeColor);
        }
        // 下边缘
        if (
          Math.abs(draggedBottom - (viewport.y + viewport.height)) <= threshold
        ) {
          showSnapLine("horizontal", viewport.y + viewport.height, edgeColor);
        }
      } catch (error) {
        console.warn("对齐检测失败:", error);
      }
    };

    const handleNodeDragEnd = () => {
      isSnapping = false;
      hideSnapLines();
    };

    // 监听节点拖拽事件
    const disposables: any[] = [];

    try {
      if ((playground as any).document?.nodeManager) {
        disposables.push(
          (playground as any).document.nodeManager.onNodeDragStart?.(
            handleNodeDragStart,
          ),
          (playground as any).document.nodeManager.onNodeDrag?.(handleNodeDrag),
          (playground as any).document.nodeManager.onNodeDragEnd?.(
            handleNodeDragEnd,
          ),
        );
      }
    } catch (error) {
      console.warn("对齐插件监听器设置失败:", error);
    }

    return () => {
      hideSnapLines();
      disposables.forEach((disposable) => {
        try {
          disposable?.dispose();
        } catch (error) {
          console.warn("对齐插件监听器清理失败:", error);
        }
      });
    };
  }, [playground, enabled, threshold, edgeColor, alignColor]);

  if (!enabled || snapLines.length === 0) return null;

  return (
    <div className="flowgram-snap-lines pointer-events-none absolute inset-0 z-20">
      {snapLines.map((line, index) => (
        <div
          key={`${line.type}-${line.position}-${index}`}
          className="absolute"
          style={{
            backgroundColor: line.color,
            ...(line.type === "vertical"
              ? {
                  left: `${line.position}px`,
                  top: 0,
                  width: "1px",
                  height: "100%",
                }
              : {
                  left: 0,
                  top: `${line.position}px`,
                  width: "100%",
                  height: "1px",
                }),
          }}
        />
      ))}
    </div>
  );
};

// 对齐工具栏
export const SnapToolbar: React.FC<{
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
}> = ({ enabled, onToggle, threshold, onThresholdChange }) => {
  return (
    <div className="flowgram-snap-toolbar flex items-center gap-2 p-2 bg-white rounded-lg shadow-md border border-gray-200">
      <button
        onClick={() => onToggle(!enabled)}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          enabled
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        对齐
      </button>

      {enabled && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">阈值:</span>
          <input
            type="range"
            min="2"
            max="20"
            value={threshold}
            onChange={(e) => onThresholdChange(Number(e.target.value))}
            className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-6">{threshold}</span>
        </div>
      )}
    </div>
  );
};
