/**
 * 工作流连接线组件
 */

import React, { useState } from "react";
import { WorkflowConnection } from "@/services/workflow/types";

interface WorkflowConnectionComponentProps {
  connection: WorkflowConnection;
  sourcePath: string;
  onClick: () => void;
}

const WorkflowConnectionComponent: React.FC<
  WorkflowConnectionComponentProps
> = ({ connection, sourcePath, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <g>
      {/* 连接线背景（用于点击检测） */}
      <path
        d={sourcePath}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        className="cursor-pointer"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* 实际连接线 */}
      <path
        d={sourcePath}
        stroke={isHovered ? "rgb(var(--danger))" : "rgb(var(--foreground))"}
        strokeWidth={isHovered ? "3" : "2"}
        fill="none"
        className="transition-all duration-200 pointer-events-none"
        opacity={isHovered ? 0.8 : 0.6}
      />

      {/* 连接线箭头 */}
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={isHovered ? "rgb(var(--danger))" : "rgb(var(--foreground))"}
            opacity={isHovered ? 0.8 : 0.6}
          />
        </marker>
      </defs>

      <path
        d={sourcePath}
        stroke={isHovered ? "rgb(var(--danger))" : "rgb(var(--foreground))"}
        strokeWidth={isHovered ? "3" : "2"}
        fill="none"
        markerEnd={`url(#arrowhead-${connection.id})`}
        className="transition-all duration-200 pointer-events-none"
        opacity={isHovered ? 0.8 : 0.6}
      />

      {/* 连接标签（如果有） */}
      {connection.label && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          className="text-xs fill-foreground/60 pointer-events-none"
          dy="0.3em"
        >
          {connection.label}
        </text>
      )}
    </g>
  );
};

export default WorkflowConnectionComponent;
