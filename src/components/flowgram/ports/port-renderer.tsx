/**
 * FlowGram.ai 端口渲染器
 */

import React from "react";
import {
  WorkflowPortRender,
  useNodeRender,
} from "@flowgram.ai/free-layout-editor";

interface CustomPortRendererProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CustomPortRenderer: React.FC<CustomPortRendererProps> = ({
  className = "",
  style = {},
}) => {
  const { ports } = useNodeRender();

  return (
    <>
      {ports.map((port) => (
        <WorkflowPortRender
          key={port.id}
          entity={port}
          className={`flowgram-port ${className}`}
          style={style}
          // 自定义端口颜色
          primaryColor="#3b82f6" // 激活状态颜色（linked/hovered）
          secondaryColor="#9ca3af" // 默认状态颜色
          errorColor="#ef4444" // 错误状态颜色
          backgroundColor="#ffffff" // 背景颜色
        />
      ))}
    </>
  );
};

// 端口配置工具函数
export const createPortConfig = (type: "input" | "output", id?: string) => ({
  type,
  id: id || type,
});

// 常用端口配置
export const PORT_CONFIGS = {
  // 单输入端口
  INPUT_ONLY: [createPortConfig("input")],

  // 单输出端口
  OUTPUT_ONLY: [createPortConfig("output")],

  // 输入输出端口
  INPUT_OUTPUT: [createPortConfig("input"), createPortConfig("output")],

  // 条件判断端口（一个输入，两个输出）
  CONDITION: [
    createPortConfig("input"),
    createPortConfig("output", "positive"),
    createPortConfig("output", "negative"),
  ],

  // 循环端口（输入、循环体输出、完成输出）
  LOOP: [
    createPortConfig("input"),
    createPortConfig("output", "loop"),
    createPortConfig("output", "done"),
  ],
};
