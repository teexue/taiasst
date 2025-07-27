/**
 * FlowGram.ai 网格插件
 */

import React, { useEffect, useRef } from "react";
import { useClientContext } from "@flowgram.ai/free-layout-editor";

interface GridPluginProps {
  enabled?: boolean;
  size?: number;
  color?: string;
  opacity?: number;
  snap?: boolean;
}

export const GridPlugin: React.FC<GridPluginProps> = ({
  enabled = true,
  size = 20,
  color = "#e5e7eb",
  opacity = 0.5,
  snap = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playground } = useClientContext();

  useEffect(() => {
    if (!playground || !enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateGrid = () => {
      try {
        const viewport = (playground as any).viewport?.getViewportRect?.() || {
          x: 0,
          y: 0,
          width: 800,
          height: 600,
        };
        const zoom = (playground as any).viewport?.getZoom?.() || 1;

        // 设置画布尺寸
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 计算网格参数
        const gridSize = size * zoom;
        const offsetX = (-viewport.x * zoom) % gridSize;
        const offsetY = (-viewport.y * zoom) % gridSize;

        // 设置网格样式
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = 1;

        // 绘制垂直线
        for (let x = offsetX; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // 绘制水平线
        for (let y = offsetY; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      } catch (error) {
        console.warn("网格更新失败:", error);
      }
    };

    // 初始绘制
    updateGrid();

    // 监听视口变化
    const disposables: any[] = [];

    try {
      if ((playground as any).viewport) {
        disposables.push(
          (playground as any).viewport.onViewportChange?.(updateGrid),
        );
      }
    } catch (error) {
      console.warn("网格插件监听器设置失败:", error);
    }

    return () => {
      disposables.forEach((disposable) => {
        try {
          disposable?.dispose();
        } catch (error) {
          console.warn("网格插件监听器清理失败:", error);
        }
      });
    };
  }, [playground, enabled, size, color, opacity]);

  useEffect(() => {
    if (!playground || !snap) return;

    const handleNodeDrag = (event: any) => {
      try {
        const node = event.node;
        const pos = node.getPosition();

        // 对齐到网格
        const snappedX = Math.round(pos.x / size) * size;
        const snappedY = Math.round(pos.y / size) * size;

        if (pos.x !== snappedX || pos.y !== snappedY) {
          node.setPosition({ x: snappedX, y: snappedY });
        }
      } catch (error) {
        console.warn("网格对齐失败:", error);
      }
    };

    const disposables: any[] = [];

    try {
      if ((playground as any).document?.nodeManager) {
        disposables.push(
          (playground as any).document.nodeManager.onNodeDrag?.(handleNodeDrag),
        );
      }
    } catch (error) {
      console.warn("网格对齐监听器设置失败:", error);
    }

    return () => {
      disposables.forEach((disposable) => {
        try {
          disposable?.dispose();
        } catch (error) {
          console.warn("网格对齐监听器清理失败:", error);
        }
      });
    };
  }, [playground, snap, size]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="flowgram-grid absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

// 网格工具栏
export const GridToolbar: React.FC<{
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  size: number;
  onSizeChange: (size: number) => void;
  snap: boolean;
  onSnapToggle: (snap: boolean) => void;
}> = ({ enabled, onToggle, size, onSizeChange, snap, onSnapToggle }) => {
  return (
    <div className="flowgram-grid-toolbar flex items-center gap-2 p-2 bg-white rounded-lg shadow-md border border-gray-200">
      <button
        onClick={() => onToggle(!enabled)}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          enabled
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        网格
      </button>

      {enabled && (
        <>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">大小:</span>
            <select
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="text-xs border border-gray-300 rounded px-1 py-0.5"
            >
              <option value={10}>10px</option>
              <option value={20}>20px</option>
              <option value={25}>25px</option>
              <option value={50}>50px</option>
            </select>
          </div>

          <button
            onClick={() => onSnapToggle(!snap)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              snap
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            对齐
          </button>
        </>
      )}
    </div>
  );
};
