/**
 * FlowGram.ai 自定义箭头渲染器
 */

import React from "react";

interface ArrowRendererProps {
  id: string;
  pos: { x: number; y: number };
  reverseArrow: boolean;
  strokeWidth: number;
  vertical: boolean;
  hide: boolean;
  line?: any;
}

export const CustomArrowRenderer: React.FC<ArrowRendererProps> = ({
  id,
  pos,
  reverseArrow,
  strokeWidth,
  vertical,
  hide,
  line,
}) => {
  if (hide) return null;

  const size = 8;
  const rotation = reverseArrow ? (vertical ? 270 : 180) : vertical ? 90 : 0;

  // 根据线条状态选择不同的箭头样式
  let arrowPath: string;
  let fillColor: string;
  let strokeColor: string;

  if (line?.hasError) {
    // 错误状态：红色感叹号箭头
    arrowPath = `M0,0 L${-size},-${size / 2} L${-size},${size / 2} Z`;
    fillColor = "#ef4444";
    strokeColor = "#ef4444";
  } else if (line?.processing) {
    // 处理状态：蓝色流动箭头
    arrowPath = `M0,0 L${-size},-${size / 2} L${-size},${size / 2} Z`;
    fillColor = "#3b82f6";
    strokeColor = "#3b82f6";
  } else if (line?.selected) {
    // 选中状态：高亮箭头
    arrowPath = `M0,0 L${-size},-${size / 2} L${-size},${size / 2} Z`;
    fillColor = "#37d0ff";
    strokeColor = "#37d0ff";
  } else if (line?.hovered) {
    // 悬停状态：悬停颜色
    arrowPath = `M0,0 L${-size},-${size / 2} L${-size},${size / 2} Z`;
    fillColor = "#37d0ff";
    strokeColor = "#37d0ff";
  } else {
    // 默认状态：标准三角箭头
    arrowPath = `M0,0 L${-size},-${size / 2} L${-size},${size / 2} Z`;
    fillColor = "#4d53e8";
    strokeColor = "#4d53e8";
  }

  return (
    <g id={id} transform={`translate(${pos.x}, ${pos.y}) rotate(${rotation})`}>
      <path
        d={arrowPath}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </g>
  );
};

// 高级箭头渲染器，支持更多样式
export const AdvancedArrowRenderer: React.FC<ArrowRendererProps> = ({
  id,
  pos,
  reverseArrow,
  strokeWidth,
  vertical,
  hide,
  line,
}) => {
  if (hide) return null;

  const size = 10;
  const rotation = reverseArrow ? (vertical ? 270 : 180) : vertical ? 90 : 0;

  // 根据线条类型和状态选择箭头样式
  const getArrowStyle = () => {
    if (line?.hasError) {
      return {
        path: `M0,0 L${-size},-${size / 2} L${-size / 2},-${size / 4} L${-size / 2},${size / 4} L${-size},${size / 2} Z`,
        fill: "#ef4444",
        stroke: "#dc2626",
      };
    }

    if (line?.processing) {
      return {
        path: `M0,0 L${-size},-${size / 2} L${-size * 0.7},0 L${-size},${size / 2} Z`,
        fill: "#3b82f6",
        stroke: "#2563eb",
      };
    }

    if (line?.success) {
      return {
        path: `M0,0 L${-size},-${size / 2} L${-size},${size / 2} Z`,
        fill: "#10b981",
        stroke: "#059669",
      };
    }

    if (line?.warning) {
      return {
        path: `M0,0 L${-size},-${size / 2} L${-size},${size / 2} Z`,
        fill: "#f59e0b",
        stroke: "#d97706",
      };
    }

    if (line?.selected || line?.hovered) {
      return {
        path: `M0,0 L${-size},-${size / 2} L${-size},${size / 2} Z`,
        fill: "#37d0ff",
        stroke: "#0ea5e9",
      };
    }

    // 默认样式
    return {
      path: `M0,0 L${-size},-${size / 2} L${-size},${size / 2} Z`,
      fill: "#4d53e8",
      stroke: "#4338ca",
    };
  };

  const style = getArrowStyle();

  return (
    <g id={id} transform={`translate(${pos.x}, ${pos.y}) rotate(${rotation})`}>
      <path
        d={style.path}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={strokeWidth}
      />

      {/* 添加发光效果（可选） */}
      {(line?.processing || line?.selected) && (
        <path
          d={style.path}
          fill="none"
          stroke={style.fill}
          strokeWidth={strokeWidth + 2}
          opacity={0.3}
        />
      )}
    </g>
  );
};

// 简单箭头渲染器
export const SimpleArrowRenderer: React.FC<ArrowRendererProps> = ({
  id,
  pos,
  reverseArrow,
  strokeWidth,
  vertical,
  hide,
}) => {
  if (hide) return null;

  const size = 6;
  const rotation = reverseArrow ? (vertical ? 270 : 180) : vertical ? 90 : 0;

  return (
    <g id={id} transform={`translate(${pos.x}, ${pos.y}) rotate(${rotation})`}>
      <path
        d={`M0,0 L${-size},-${size / 2} L${-size},${size / 2} Z`}
        fill="currentColor"
        strokeWidth={strokeWidth}
        stroke="currentColor"
      />
    </g>
  );
};
