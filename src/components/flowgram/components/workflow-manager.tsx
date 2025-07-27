/**
 * FlowGram.ai 工作流管理界面
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { DataManager } from "../data/data-manager";
import { FlowWorkflowData } from "../core/types";

interface WorkflowManagerProps {
  onSelectWorkflow: (id: string, data: FlowWorkflowData) => void;
  onCreateWorkflow: () => void;
  className?: string;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  onSelectWorkflow,
  onCreateWorkflow: _onCreateWorkflow,
  className = "",
}) => {
  const [workflows, setWorkflows] = useState<Record<string, FlowWorkflowData>>(
    {},
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();

  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [importData, setImportData] = useState("");

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = () => {
    const allWorkflows = DataManager.getAllWorkflows();
    setWorkflows(allWorkflows);
  };

  const handleCreateWorkflow = () => {
    if (!newWorkflowName.trim()) return;

    const id = DataManager.generateWorkflowId();
    const newWorkflow: FlowWorkflowData = {
      nodes: [
        {
          id: "start_default",
          type: "start",
          meta: { position: { x: 100, y: 200 } },
          data: { title: "开始", content: "工作流开始节点" },
        },
      ],
      edges: [],
    };

    DataManager.saveWorkflow(id, newWorkflow);
    setNewWorkflowName("");
    onCreateClose();
    loadWorkflows();
    onSelectWorkflow(id, newWorkflow);
  };

  const handleImportWorkflow = () => {
    try {
      const data = JSON.parse(importData) as FlowWorkflowData;
      const validation = DataManager.validateWorkflow(data);

      if (!validation.valid) {
        alert("工作流数据无效:\n" + validation.errors.join("\n"));
        return;
      }

      const id = DataManager.generateWorkflowId();
      DataManager.saveWorkflow(id, data);
      setImportData("");
      onImportClose();
      loadWorkflows();
      onSelectWorkflow(id, data);
    } catch (error) {
      alert("导入失败: JSON 格式错误");
    }
  };

  const handleDeleteWorkflow = (id: string) => {
    if (confirm("确定要删除这个工作流吗？")) {
      DataManager.deleteWorkflow(id);
      loadWorkflows();
      if (selectedWorkflow === id) {
        setSelectedWorkflow(null);
      }
    }
  };

  const handleDuplicateWorkflow = (id: string) => {
    const newId = DataManager.generateWorkflowId();
    if (DataManager.duplicateWorkflow(id, newId)) {
      loadWorkflows();
    }
  };

  const handleExportWorkflow = (id: string) => {
    const jsonData = DataManager.exportWorkflow(id);
    if (jsonData) {
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workflow_${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const filteredWorkflows = Object.entries(workflows).filter(
    ([id, workflow]) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        id.toLowerCase().includes(searchLower) ||
        workflow.nodes.some(
          (node) =>
            node.data.title?.toLowerCase().includes(searchLower) ||
            node.data.content?.toLowerCase().includes(searchLower),
        )
      );
    },
  );

  const getWorkflowPreview = (workflow: FlowWorkflowData) => {
    const stats = DataManager.getWorkflowStats(workflow);
    return {
      nodeCount: stats.totalNodes,
      edgeCount: stats.totalEdges,
      hasStart: stats.hasStartNode,
      hasEnd: stats.hasEndNode,
      isValid: stats.isValid,
    };
  };

  return (
    <div className={`flowgram-workflow-manager ${className}`}>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-bold">工作流管理</h2>
            <div className="flex gap-2">
              <Button size="sm" color="primary" onClick={onCreateOpen}>
                新建
              </Button>
              <Button size="sm" variant="bordered" onClick={onImportOpen}>
                导入
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="pt-2">
          <Input
            placeholder="搜索工作流..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
            size="sm"
          />

          <div className="space-y-3 overflow-y-auto">
            {filteredWorkflows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>暂无工作流</p>
                <Button
                  size="sm"
                  variant="light"
                  onClick={onCreateOpen}
                  className="mt-2"
                >
                  创建第一个工作流
                </Button>
              </div>
            ) : (
              filteredWorkflows.map(([id, workflow]) => {
                const preview = getWorkflowPreview(workflow);
                return (
                  <Card
                    key={id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedWorkflow === id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => {
                      setSelectedWorkflow(id);
                      onSelectWorkflow(id, workflow);
                    }}
                  >
                    <CardBody className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1">
                            工作流 {id.split("_")[1]}
                          </h3>
                          <div className="flex gap-2 mb-2">
                            <Chip size="sm" variant="flat" color="default">
                              {preview.nodeCount} 节点
                            </Chip>
                            <Chip size="sm" variant="flat" color="default">
                              {preview.edgeCount} 连线
                            </Chip>
                            {preview.isValid ? (
                              <Chip size="sm" variant="flat" color="success">
                                有效
                              </Chip>
                            ) : (
                              <Chip size="sm" variant="flat" color="danger">
                                无效
                              </Chip>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {workflow.nodes.length > 0 &&
                              workflow.nodes[0].data.title}
                          </p>
                        </div>

                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onClick={(e) => e.stopPropagation()}
                            >
                              ⋮
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              key="duplicate"
                              onClick={() => handleDuplicateWorkflow(id)}
                            >
                              复制
                            </DropdownItem>
                            <DropdownItem
                              key="export"
                              onClick={() => handleExportWorkflow(id)}
                            >
                              导出
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              color="danger"
                              onClick={() => handleDeleteWorkflow(id)}
                            >
                              删除
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </CardBody>
                  </Card>
                );
              })
            )}
          </div>
        </CardBody>
      </Card>

      {/* 创建工作流模态框 */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalContent>
          <ModalHeader>创建新工作流</ModalHeader>
          <ModalBody>
            <Input
              label="工作流名称"
              placeholder="输入工作流名称"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onCreateClose}>
              取消
            </Button>
            <Button
              color="primary"
              onClick={handleCreateWorkflow}
              isDisabled={!newWorkflowName.trim()}
            >
              创建
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 导入工作流模态框 */}
      <Modal isOpen={isImportOpen} onClose={onImportClose} size="2xl">
        <ModalContent>
          <ModalHeader>导入工作流</ModalHeader>
          <ModalBody>
            <textarea
              className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
              placeholder="粘贴工作流 JSON 数据..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onImportClose}>
              取消
            </Button>
            <Button
              color="primary"
              onClick={handleImportWorkflow}
              isDisabled={!importData.trim()}
            >
              导入
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
