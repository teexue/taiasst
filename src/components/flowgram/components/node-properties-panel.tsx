/**
 * FlowGram.ai 节点属性面板
 */

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Divider } from "@heroui/react";
import { useClientContext } from "@flowgram.ai/free-layout-editor";
import {
  AIChatNodeForm,
  ConditionNodeForm,
  CodeNodeForm,
  TextInputNodeForm,
  HttpRequestNodeForm,
} from "../forms/node-forms";

interface NodePropertiesPanelProps {
  className?: string;
}

export const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  className = "",
}) => {
  const { playground } = useClientContext();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodeData, setNodeData] = useState<any>(null);

  useEffect(() => {
    if (!playground) return;

    const handleSelectionChange = () => {
      try {
        const selection =
          (playground as any).selection?.getSelectedNodes?.() || [];
        if (selection.length === 1) {
          const node = selection[0];
          setSelectedNode(node);
          setNodeData(node.data || {});
        } else {
          setSelectedNode(null);
          setNodeData(null);
        }
      } catch (error) {
        console.warn("获取选中节点失败:", error);
      }
    };

    // 监听选择变化
    const disposable = (playground as any).selection?.onSelectionChange?.(
      handleSelectionChange,
    );

    return () => {
      disposable?.dispose();
    };
  }, [playground]);

  const handleDataChange = (newData: any) => {
    setNodeData(newData);

    // 更新节点数据
    if (selectedNode) {
      try {
        selectedNode.updateData(newData);
      } catch (error) {
        console.error("更新节点数据失败:", error);
      }
    }
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      try {
        selectedNode.dispose();
        setSelectedNode(null);
        setNodeData(null);
      } catch (error) {
        console.error("删除节点失败:", error);
      }
    }
  };

  const handleDuplicateNode = () => {
    if (selectedNode && playground) {
      try {
        const position = selectedNode.getPosition();
        const newPosition = {
          x: position.x + 50,
          y: position.y + 50,
        };

        // 创建新节点
        (playground as any).document?.nodeManager?.createNode?.({
          type: selectedNode.type,
          position: newPosition,
          data: { ...nodeData },
        });
      } catch (error) {
        console.error("复制节点失败:", error);
      }
    }
  };

  const renderNodeForm = () => {
    if (!selectedNode || !nodeData) return null;

    const nodeType = selectedNode.type;

    switch (nodeType) {
      case "ai-chat":
        return <AIChatNodeForm data={nodeData} onChange={handleDataChange} />;
      case "condition":
        return (
          <ConditionNodeForm data={nodeData} onChange={handleDataChange} />
        );
      case "code":
        return <CodeNodeForm data={nodeData} onChange={handleDataChange} />;
      case "text-input":
        return (
          <TextInputNodeForm data={nodeData} onChange={handleDataChange} />
        );
      case "http-request":
        return (
          <HttpRequestNodeForm data={nodeData} onChange={handleDataChange} />
        );
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <p>暂不支持此节点类型的配置</p>
            <p className="text-sm mt-2">节点类型: {nodeType}</p>
          </div>
        );
    }
  };

  const getNodeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      start: "开始节点",
      end: "结束节点",
      "ai-chat": "AI对话节点",
      "text-input": "文本输入节点",
      condition: "条件判断节点",
      code: "代码执行节点",
      "http-request": "HTTP请求节点",
      email: "邮件发送节点",
      delay: "延时节点",
      loop: "循环节点",
    };
    return labels[type] || type;
  };

  if (!selectedNode) {
    return (
      <div className={`flowgram-properties-panel ${className}`}>
        <Card className="h-full">
          <CardBody className="flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">未选择节点</h3>
              <p className="text-sm">选择一个节点来查看和编辑其属性</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className={`flowgram-properties-panel ${className}`}>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-lg font-semibold">节点属性</h3>
              <p className="text-sm text-gray-500">
                {getNodeTypeLabel(selectedNode.type)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="light"
                onClick={handleDuplicateNode}
                title="复制节点"
              >
                📋
              </Button>
              <Button
                size="sm"
                variant="light"
                color="danger"
                onClick={handleDeleteNode}
                title="删除节点"
              >
                🗑️
              </Button>
            </div>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="overflow-y-auto">{renderNodeForm()}</CardBody>
      </Card>
    </div>
  );
};

// 属性面板切换按钮
export const PropertiesPanelToggle: React.FC<{
  isVisible: boolean;
  onToggle: () => void;
}> = ({ isVisible, onToggle }) => {
  return (
    <Button
      onClick={onToggle}
      variant="light"
      size="sm"
      className="fixed top-4 right-4 z-20"
      title={isVisible ? "隐藏属性面板" : "显示属性面板"}
    >
      {isVisible ? "👁️‍🗨️" : "⚙️"}
    </Button>
  );
};
