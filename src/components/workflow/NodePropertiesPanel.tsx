/**
 * 节点属性面板组件
 */

import React, { useState, useEffect } from "react";
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Button,
  Divider,
  Chip,
} from "@heroui/react";
import {
  RiCloseLine,
  RiDeleteBinLine,
  RiSettings4Line,
  RiInformationLine,
} from "react-icons/ri";
import { WorkflowNode } from "@/services/workflow/types";
import { getNodeTemplate } from "@/services/workflow/nodeTemplates";

interface NodePropertiesPanelProps {
  node: WorkflowNode;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  node,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [localConfig, setLocalConfig] = useState(node.config);
  const [localLabel, setLocalLabel] = useState(node.label);
  const [localDescription, setLocalDescription] = useState(
    node.description || "",
  );

  const template = getNodeTemplate(`${node.type}_${node.subtype}`);

  // 同步外部变化
  useEffect(() => {
    setLocalConfig(node.config);
    setLocalLabel(node.label);
    setLocalDescription(node.description || "");
  }, [node]);

  // 更新配置
  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onUpdate({ config: newConfig });
  };

  // 更新标签
  const handleLabelChange = (value: string) => {
    setLocalLabel(value);
    onUpdate({ label: value });
  };

  // 更新描述
  const handleDescriptionChange = (value: string) => {
    setLocalDescription(value);
    onUpdate({ description: value });
  };

  // 渲染配置字段
  const renderConfigField = (key: string, schema: any) => {
    const value = localConfig[key];

    switch (schema.type) {
      case "string":
        if (schema.enum) {
          return (
            <Select
              label={schema.title || key}
              selectedKeys={value ? [value] : []}
              onSelectionChange={(keys) => {
                const selectedValue = Array.from(keys)[0] as string;
                handleConfigChange(key, selectedValue);
              }}
              size="sm"
              variant="bordered"
            >
              {schema.enum.map((option: string) => (
                <SelectItem key={option}>{option}</SelectItem>
              ))}
            </Select>
          );
        } else {
          return (
            <Input
              label={schema.title || key}
              value={value || ""}
              onValueChange={(val) => handleConfigChange(key, val)}
              size="sm"
              variant="bordered"
              description={schema.description}
            />
          );
        }

      case "number":
        return (
          <Input
            label={schema.title || key}
            type="number"
            value={value?.toString() || ""}
            onValueChange={(val) =>
              handleConfigChange(key, val ? Number(val) : 0)
            }
            size="sm"
            variant="bordered"
            description={schema.description}
            min={schema.minimum}
            max={schema.maximum}
          />
        );

      case "boolean":
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{schema.title || key}</p>
              {schema.description && (
                <p className="text-xs text-foreground/60">
                  {schema.description}
                </p>
              )}
            </div>
            <Switch
              isSelected={Boolean(value)}
              onValueChange={(checked) => handleConfigChange(key, checked)}
              size="sm"
            />
          </div>
        );

      case "array":
        return (
          <Textarea
            label={schema.title || key}
            value={Array.isArray(value) ? value.join("\n") : ""}
            onValueChange={(val) => {
              const arrayValue = val.split("\n").filter((item) => item.trim());
              handleConfigChange(key, arrayValue);
            }}
            size="sm"
            variant="bordered"
            description={`${schema.description || ""} (每行一个项目)`}
            minRows={3}
          />
        );

      case "object":
        return (
          <Textarea
            label={schema.title || key}
            value={
              typeof value === "object" ? JSON.stringify(value, null, 2) : "{}"
            }
            onValueChange={(val) => {
              try {
                const objectValue = JSON.parse(val);
                handleConfigChange(key, objectValue);
              } catch (e) {
                // 忽略无效的JSON
              }
            }}
            size="sm"
            variant="bordered"
            description={`${schema.description || ""} (JSON格式)`}
            minRows={4}
          />
        );

      default:
        return (
          <Input
            label={schema.title || key}
            value={value?.toString() || ""}
            onValueChange={(val) => handleConfigChange(key, val)}
            size="sm"
            variant="bordered"
            description={schema.description}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-background/50">
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-4 border-b border-divider/20">
        <div className="flex items-center gap-2">
          <RiSettings4Line className="w-4 h-4 text-foreground/60" />
          <h3 className="text-lg font-semibold">节点属性</h3>
        </div>
        <Button isIconOnly size="sm" variant="light" onPress={onClose}>
          <RiCloseLine />
        </Button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 基本信息 */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <RiInformationLine className="w-4 h-4" />
            基本信息
          </h4>

          <div className="space-y-3">
            <Input
              label="节点名称"
              value={localLabel}
              onValueChange={handleLabelChange}
              size="sm"
              variant="bordered"
            />

            <Textarea
              label="节点描述"
              value={localDescription}
              onValueChange={handleDescriptionChange}
              size="sm"
              variant="bordered"
              minRows={2}
              maxRows={4}
            />

            <div className="flex items-center gap-2">
              <Chip size="sm" variant="flat" color="primary">
                {node.type}
              </Chip>
              <Chip size="sm" variant="flat" color="secondary">
                {node.subtype}
              </Chip>
            </div>
          </div>
        </div>

        <Divider />

        {/* 端口信息 */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">
            端口信息
          </h4>

          <div className="space-y-2">
            {node.ports.map((port) => (
              <div
                key={port.id}
                className="flex items-center justify-between p-2 rounded-lg bg-default-50"
              >
                <div>
                  <p className="text-sm font-medium">{port.label}</p>
                  <p className="text-xs text-foreground/60">
                    {port.type} • {port.dataType}
                  </p>
                </div>
                {port.required && (
                  <Chip size="sm" variant="flat" color="warning">
                    必需
                  </Chip>
                )}
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* 配置参数 */}
        {template?.configSchema && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              配置参数
            </h4>

            <div className="space-y-4">
              {Object.entries(template.configSchema.properties || {}).map(
                ([key, schema]) => (
                  <div key={key}>{renderConfigField(key, schema)}</div>
                ),
              )}
            </div>
          </div>
        )}

        {/* 节点状态 */}
        {node.status !== "idle" && (
          <>
            <Divider />
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                运行状态
              </h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/60">状态</span>
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
                </div>

                {node.error && (
                  <div className="p-2 rounded-lg bg-danger/10 border border-danger/20">
                    <p className="text-sm text-danger">{node.error}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="p-4 border-t border-divider/20 bg-background/80">
        <Button
          color="danger"
          variant="flat"
          startContent={<RiDeleteBinLine />}
          onPress={onDelete}
          className="w-full"
          size="sm"
        >
          删除节点
        </Button>
      </div>
    </div>
  );
};

export default NodePropertiesPanel;
