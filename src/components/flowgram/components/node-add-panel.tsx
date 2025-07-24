/**
 * FlowGram.ai 节点添加面板
 */

import React from "react";
import { Card, CardBody } from "@heroui/react";

const nodeTypes = [
  {
    type: "text-input",
    title: "文本输入",
    icon: "📝",
    description: "输入文本数据",
    color: "bg-purple-500",
  },
  {
    type: "ai-chat",
    title: "AI对话",
    icon: "🤖",
    description: "AI智能对话",
    color: "bg-blue-500",
  },
  {
    type: "code",
    title: "代码执行",
    icon: "💻",
    description: "执行自定义代码",
    color: "bg-gray-700",
  },
  {
    type: "condition",
    title: "条件判断",
    icon: "❓",
    description: "根据条件分支执行",
    color: "bg-orange-500",
  },
];

export const NodeAddPanel: React.FC = () => {
  const handleDragStart = (nodeType: any, e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: 实现拖拽逻辑
    console.log("开始拖拽节点:", nodeType);
  };

  return (
    <div className="flowgram-node-panel">
      <div className="flowgram-node-panel-header">
        <h3 className="text-sm font-medium text-gray-900">节点库</h3>
      </div>
      <div className="flowgram-node-panel-content">
        {nodeTypes.map((nodeType) => (
          <Card
            key={nodeType.type}
            className="flowgram-node-card cursor-grab hover:shadow-lg transition-all duration-200"
            onMouseDown={(e) => handleDragStart(nodeType, e)}
            draggable={false}
          >
            <CardBody className="p-0">
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 ${nodeType.color} flex items-center justify-center text-lg select-none rounded-l-lg`}
                >
                  <span className="text-white text-base">{nodeType.icon}</span>
                </div>
                <div className="flex-1 p-3 select-none">
                  <h4 className="font-medium text-sm text-gray-900">
                    {nodeType.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {nodeType.description}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
