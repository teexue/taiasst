/**
 * 节点面板组件
 */

import React, { useState, useMemo } from "react";
import { Input, Accordion, AccordionItem } from "@heroui/react";
import { RiSearchLine, RiDragDropLine } from "react-icons/ri";
import { NodeTemplate } from "@/services/workflow/types";
import {
  ALL_NODE_TEMPLATES,
  getNodeCategories,
} from "@/services/workflow/nodeTemplates";

interface NodePaletteProps {
  onAddNode: (
    template: NodeTemplate,
    position: { x: number; y: number },
  ) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedTemplate, setDraggedTemplate] = useState<NodeTemplate | null>(
    null,
  );

  // 获取分类
  const categories = useMemo(() => getNodeCategories(), []);

  // 过滤节点模板
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) {
      return ALL_NODE_TEMPLATES;
    }

    const query = searchQuery.toLowerCase();
    return ALL_NODE_TEMPLATES.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  // 按分类分组
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, NodeTemplate[]> = {};

    categories.forEach((category) => {
      groups[category] = filteredTemplates.filter(
        (template) => template.category === category,
      );
    });

    return groups;
  }, [categories, filteredTemplates]);

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent, template: NodeTemplate) => {
    setDraggedTemplate(template);
    e.dataTransfer.setData("application/json", JSON.stringify(template));
    e.dataTransfer.effectAllowed = "copy";
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setDraggedTemplate(null);
  };

  // 处理双击添加节点
  const handleDoubleClick = (template: NodeTemplate) => {
    // 在画布中心添加节点
    onAddNode(template, { x: 200, y: 200 });
  };

  // 渲染节点项
  const renderNodeItem = (template: NodeTemplate) => {
    const isDragging = draggedTemplate?.id === template.id;

    return (
      <div
        key={template.id}
        className={`
          p-3 rounded-lg border border-divider/20 cursor-grab active:cursor-grabbing
          hover:border-primary/50 hover:bg-primary/5 transition-all duration-200
          ${isDragging ? "opacity-50 scale-95" : ""}
        `}
        draggable
        onDragStart={(e) => handleDragStart(e, template)}
        onDragEnd={handleDragEnd}
        onDoubleClick={() => handleDoubleClick(template)}
        title="拖拽到画布或双击添加"
      >
        <div className="flex items-start gap-2">
          <div className="p-1.5 rounded-md bg-primary/20 flex-shrink-0">
            <RiDragDropLine className="w-3 h-3 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground truncate">
              {template.name}
            </h4>
            <p className="text-xs text-foreground/60 line-clamp-2 mt-0.5">
              {template.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background/50">
      {/* 标题 */}
      <div className="p-4 border-b border-divider/20">
        <h3 className="text-lg font-semibold text-foreground mb-2">节点库</h3>
        <p className="text-xs text-foreground/60">拖拽节点到画布或双击添加</p>
      </div>

      {/* 搜索框 */}
      <div className="p-4 border-b border-divider/20">
        <Input
          placeholder="搜索节点..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={<RiSearchLine className="w-4 h-4 text-foreground/40" />}
          size="sm"
          variant="bordered"
          classNames={{
            input: "text-sm",
            inputWrapper: "h-9",
          }}
        />
      </div>

      {/* 节点列表 */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery.trim() ? (
          // 搜索结果
          <div className="p-4 space-y-2">
            <div className="text-sm text-foreground/60 mb-3">
              找到 {filteredTemplates.length} 个节点
            </div>
            {filteredTemplates.map(renderNodeItem)}
          </div>
        ) : (
          // 分类显示
          <Accordion
            variant="splitted"
            className="px-4 py-2"
            defaultExpandedKeys={categories}
          >
            {categories.map((category) => {
              const templates = groupedTemplates[category];
              if (templates.length === 0) return null;

              return (
                <AccordionItem
                  key={category}
                  title={
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-xs text-foreground/60">
                        {templates.length}
                      </span>
                    </div>
                  }
                  className="text-sm"
                >
                  <div className="space-y-2 pb-2">
                    {templates.map(renderNodeItem)}
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <RiSearchLine className="w-8 h-8 text-foreground/40 mb-2" />
            <p className="text-sm text-foreground/60">没有找到匹配的节点</p>
            <p className="text-xs text-foreground/40 mt-1">
              尝试使用不同的关键词
            </p>
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="p-4 border-t border-divider/20 bg-background/80">
        <div className="text-xs text-foreground/60 space-y-1">
          <div className="flex items-center gap-2">
            <RiDragDropLine className="w-3 h-3" />
            <span>拖拽节点到画布</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 flex items-center justify-center text-xs">
              ⌘
            </span>
            <span>双击快速添加</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodePalette;
