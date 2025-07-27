/**
 * FlowGram.ai 自定义小地图插件
 */

import React, { useRef, useEffect, useState } from "react";
import { useClientContext } from "@flowgram.ai/free-layout-editor";

interface MinimapProps {
  width?: number;
  height?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

export const Minimap: React.FC<MinimapProps> = ({
  width = 180,
  height = 100,
  position = "bottom-right",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { playground } = useClientContext() as any;

  useEffect(() => {
    if (!canvasRef.current || !playground) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;

    const updateMinimap = () => {
      // 清空画布
      ctx.clearRect(0, 0, width, height);

      // 绘制背景
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, width, height);

      // 绘制边框
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, height);

      try {
        // 获取画布信息
        const viewport = (playground as any).viewport;
        const nodes =
          (playground as any).document?.nodeManager?.getAllNodes?.() || [];

        if (!viewport || nodes.length === 0) return;

        // 计算缩放比例
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

        nodes.forEach((node: any) => {
          const pos = node.getPosition?.() || { x: 0, y: 0 };
          const size = node.getSize?.() || { width: 100, height: 50 };
          minX = Math.min(minX, pos.x);
          minY = Math.min(minY, pos.y);
          maxX = Math.max(maxX, pos.x + size.width);
          maxY = Math.max(maxY, pos.y + size.height);
        });

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const scaleX = (width - 20) / contentWidth;
        const scaleY = (height - 20) / contentHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        // 绘制节点
        ctx.save();
        ctx.translate(10, 10);
        ctx.scale(scale, scale);
        ctx.translate(-minX, -minY);

        nodes.forEach((node: any) => {
          const pos = node.getPosition?.() || { x: 0, y: 0 };
          const size = node.getSize?.() || { width: 100, height: 50 };

          // 绘制节点矩形
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 1 / scale;
          ctx.fillRect(pos.x, pos.y, size.width, size.height);
          ctx.strokeRect(pos.x, pos.y, size.width, size.height);
        });

        // 绘制视口区域
        const viewportRect = viewport.getViewportRect();
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2 / scale;
        ctx.strokeRect(
          viewportRect.x,
          viewportRect.y,
          viewportRect.width,
          viewportRect.height,
        );

        ctx.restore();
      } catch (error) {
        console.warn("小地图更新失败:", error);
      }
    };

    // 初始绘制
    updateMinimap();

    // 监听变化
    const disposables: any[] = [];

    try {
      // 监听视口变化
      if ((playground as any).viewport) {
        disposables.push(
          (playground as any).viewport.onViewportChange?.(updateMinimap),
        );
      }

      // 监听节点变化
      if ((playground as any).document?.nodeManager) {
        disposables.push(
          (playground as any).document.nodeManager.onNodeChange?.(
            updateMinimap,
          ),
        );
      }
    } catch (error) {
      console.warn("小地图监听器设置失败:", error);
    }

    return () => {
      disposables.forEach((disposable) => {
        try {
          disposable.dispose();
        } catch (error) {
          console.warn("小地图监听器清理失败:", error);
        }
      });
    };
  }, [playground, width, height]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !playground) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    try {
      // 计算点击位置对应的画布坐标
      const nodes = playground.document.nodeManager.getAllNodes();
      if (nodes.length === 0) return;

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      nodes.forEach((node: any) => {
        const pos = node.getPosition();
        const size = node.getSize();
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + size.width);
        maxY = Math.max(maxY, pos.y + size.height);
      });

      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      const scaleX = (width - 20) / contentWidth;
      const scaleY = (height - 20) / contentHeight;
      const scale = Math.min(scaleX, scaleY, 1);

      const canvasX = (x - 10) / scale + minX;
      const canvasY = (y - 10) / scale + minY;

      // 移动视口到点击位置
      playground.viewport.centerTo({ x: canvasX, y: canvasY });
    } catch (error) {
      console.warn("小地图点击处理失败:", error);
    }
  };

  const positionClasses = {
    "top-left": "top-6 left-6",
    "top-right": "top-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-right": "bottom-6 right-6",
  };

  if (!isVisible) return null;

  return (
    <div
      className={`flowgram-minimap fixed ${positionClasses[position]} z-10 ${className}`}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">小地图</span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="cursor-pointer rounded border border-gray-100"
          onClick={handleCanvasClick}
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      </div>
    </div>
  );
};

// 小地图切换按钮
export const MinimapToggle: React.FC<{ onToggle: () => void }> = ({
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
      title="显示/隐藏小地图"
    >
      <svg
        className="w-4 h-4 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    </button>
  );
};
