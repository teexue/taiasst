/**
 * 工作流管理器
 */

import {
  WorkflowDefinition,
  WorkflowFilter,
  WorkflowSort,
  WorkflowListResponse,
  WorkflowExecution,
  WorkflowNode,
  WorkflowConnection,
  WorkflowExportData,
  WorkflowStats,
  NodeTemplate,
} from "./types";
import { getWorkflowDatabase } from "./database";
import { getWorkflowEngine } from "./engine";
import { ALL_NODE_TEMPLATES, getNodeTemplate } from "./nodeTemplates";
import { v4 as uuidv4 } from "uuid";

/**
 * 工作流管理器
 */
export class WorkflowManager {
  private static instance: WorkflowManager;
  private database = getWorkflowDatabase();
  private engine = getWorkflowEngine();

  private constructor() {}

  static getInstance(): WorkflowManager {
    if (!WorkflowManager.instance) {
      WorkflowManager.instance = new WorkflowManager();
    }
    return WorkflowManager.instance;
  }

  // 工作流管理
  async createWorkflow(
    name: string,
    description?: string,
    category: string = "general",
  ): Promise<WorkflowDefinition> {
    const workflow: Omit<WorkflowDefinition, "id" | "createdAt" | "updatedAt"> =
      {
        name,
        description,
        version: "1.0.0",
        status: "draft",
        nodes: [],
        connections: [],
        variables: {},
        settings: {
          timeout: 300000, // 5分钟
          retryCount: 3,
          parallelExecution: false,
          errorHandling: "stop",
          notifications: {
            onSuccess: false,
            onError: true,
          },
        },
        tags: [],
        category,
        isTemplate: false,
        createdBy: "user", // 这里应该从用户上下文获取
      };

    return await this.database.createWorkflow(workflow);
  }

  async updateWorkflow(
    id: string,
    updates: Partial<WorkflowDefinition>,
  ): Promise<void> {
    await this.database.updateWorkflow(id, updates);
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition | null> {
    return await this.database.getWorkflow(id);
  }

  async getWorkflows(
    filter?: WorkflowFilter,
    sort?: WorkflowSort,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<WorkflowListResponse> {
    return await this.database.getWorkflows(filter, sort, page, pageSize);
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.database.deleteWorkflow(id);
  }

  async duplicateWorkflow(
    id: string,
    newName?: string,
  ): Promise<WorkflowDefinition> {
    const original = await this.database.getWorkflow(id);
    if (!original) {
      throw new Error("工作流不存在");
    }

    const duplicate: Omit<
      WorkflowDefinition,
      "id" | "createdAt" | "updatedAt"
    > = {
      ...original,
      name: newName || `${original.name} (副本)`,
      status: "draft",
      isTemplate: false,
    };

    return await this.database.createWorkflow(duplicate);
  }

  // 节点管理
  async addNode(
    workflowId: string,
    templateId: string,
    position: { x: number; y: number },
  ): Promise<WorkflowNode> {
    const workflow = await this.database.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error("工作流不存在");
    }

    const template = getNodeTemplate(templateId);
    if (!template) {
      throw new Error(`节点模板不存在: ${templateId}`);
    }

    const node: WorkflowNode = {
      id: uuidv4(),
      type: template.type,
      subtype: template.subtype,
      label: template.name,
      description: template.description,
      position,
      config: { ...template.defaultConfig },
      ports: [...template.ports],
      status: "idle",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedNodes = [...workflow.nodes, node];
    await this.database.updateWorkflow(workflowId, { nodes: updatedNodes });

    return node;
  }

  async updateNode(
    workflowId: string,
    nodeId: string,
    updates: Partial<WorkflowNode>,
  ): Promise<void> {
    const workflow = await this.database.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error("工作流不存在");
    }

    const nodeIndex = workflow.nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex === -1) {
      throw new Error("节点不存在");
    }

    const updatedNodes = [...workflow.nodes];
    updatedNodes[nodeIndex] = {
      ...updatedNodes[nodeIndex],
      ...updates,
      updatedAt: Date.now(),
    };

    await this.database.updateWorkflow(workflowId, { nodes: updatedNodes });
  }

  async deleteNode(workflowId: string, nodeId: string): Promise<void> {
    const workflow = await this.database.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error("工作流不存在");
    }

    // 删除节点
    const updatedNodes = workflow.nodes.filter((n) => n.id !== nodeId);

    // 删除相关连接
    const updatedConnections = workflow.connections.filter(
      (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId,
    );

    await this.database.updateWorkflow(workflowId, {
      nodes: updatedNodes,
      connections: updatedConnections,
    });
  }

  // 连接管理
  async addConnection(
    workflowId: string,
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string,
  ): Promise<WorkflowConnection> {
    const workflow = await this.database.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error("工作流不存在");
    }

    // 验证节点和端口存在
    const sourceNode = workflow.nodes.find((n) => n.id === sourceNodeId);
    const targetNode = workflow.nodes.find((n) => n.id === targetNodeId);

    if (!sourceNode || !targetNode) {
      throw new Error("源节点或目标节点不存在");
    }

    const sourcePort = sourceNode.ports.find(
      (p) => p.id === sourcePortId && p.type === "output",
    );
    const targetPort = targetNode.ports.find(
      (p) => p.id === targetPortId && p.type === "input",
    );

    if (!sourcePort || !targetPort) {
      throw new Error("源端口或目标端口不存在");
    }

    // 检查是否已存在连接
    const existingConnection = workflow.connections.find(
      (c) => c.targetNodeId === targetNodeId && c.targetPortId === targetPortId,
    );

    if (existingConnection) {
      throw new Error("目标端口已有连接");
    }

    const connection: WorkflowConnection = {
      id: uuidv4(),
      sourceNodeId,
      sourcePortId,
      targetNodeId,
      targetPortId,
    };

    const updatedConnections = [...workflow.connections, connection];
    await this.database.updateWorkflow(workflowId, {
      connections: updatedConnections,
    });

    return connection;
  }

  async deleteConnection(
    workflowId: string,
    connectionId: string,
  ): Promise<void> {
    const workflow = await this.database.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error("工作流不存在");
    }

    const updatedConnections = workflow.connections.filter(
      (c) => c.id !== connectionId,
    );
    await this.database.updateWorkflow(workflowId, {
      connections: updatedConnections,
    });
  }

  // 工作流执行
  async executeWorkflow(
    workflowId: string,
    input?: Record<string, any>,
    triggeredBy: "manual" | "schedule" | "api" | "event" = "manual",
  ): Promise<string> {
    return await this.engine.executeWorkflow(workflowId, input, triggeredBy);
  }

  async stopExecution(executionId: string): Promise<void> {
    await this.engine.stopExecution(executionId);
  }

  async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    return await this.database.getExecution(executionId);
  }

  async getExecutionHistory(
    workflowId: string,
    limit: number = 50,
  ): Promise<WorkflowExecution[]> {
    return await this.database.getExecutionsByWorkflow(workflowId, limit);
  }

  // 工作流状态管理
  async activateWorkflow(workflowId: string): Promise<void> {
    await this.database.updateWorkflow(workflowId, { status: "active" });
  }

  async deactivateWorkflow(workflowId: string): Promise<void> {
    await this.database.updateWorkflow(workflowId, { status: "paused" });
  }

  // 工作流导入导出
  async exportWorkflow(workflowId: string): Promise<WorkflowExportData> {
    const workflow = await this.database.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error("工作流不存在");
    }

    return {
      version: "1.0",
      workflow,
      metadata: {
        exportedAt: Date.now(),
        exportedBy: "user",
        application: "TaiASST",
        version: "1.0.0",
      },
    };
  }

  async importWorkflow(data: WorkflowExportData): Promise<WorkflowDefinition> {
    const { workflow } = data;

    // 生成新的ID
    const importedWorkflow: Omit<
      WorkflowDefinition,
      "id" | "createdAt" | "updatedAt"
    > = {
      ...workflow,
      name: `${workflow.name} (导入)`,
      status: "draft",
      nodes: workflow.nodes.map((node) => ({
        ...node,
        id: uuidv4(),
      })),
      connections: workflow.connections.map((conn) => ({
        ...conn,
        id: uuidv4(),
      })),
    };

    // 更新连接中的节点ID
    const nodeIdMap = new Map<string, string>();
    workflow.nodes.forEach((oldNode, index) => {
      nodeIdMap.set(oldNode.id, importedWorkflow.nodes[index].id);
    });

    importedWorkflow.connections = importedWorkflow.connections.map((conn) => ({
      ...conn,
      sourceNodeId: nodeIdMap.get(conn.sourceNodeId) || conn.sourceNodeId,
      targetNodeId: nodeIdMap.get(conn.targetNodeId) || conn.targetNodeId,
    }));

    return await this.database.createWorkflow(importedWorkflow);
  }

  // 节点模板管理
  getNodeTemplates(): NodeTemplate[] {
    return ALL_NODE_TEMPLATES;
  }

  getNodeTemplate(id: string): NodeTemplate | undefined {
    return getNodeTemplate(id);
  }

  // 工作流统计
  async getWorkflowStats(workflowId: string): Promise<WorkflowStats> {
    const executions = await this.database.getExecutionsByWorkflow(
      workflowId,
      1000,
    );

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(
      (e) => e.status === "completed",
    ).length;
    const failedExecutions = executions.filter(
      (e) => e.status === "failed",
    ).length;

    const completedExecutions = executions.filter((e) => e.duration);
    const averageDuration =
      completedExecutions.length > 0
        ? completedExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) /
          completedExecutions.length
        : 0;

    const lastExecution =
      executions.length > 0 ? executions[0].startTime : undefined;
    const successRate =
      totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageDuration,
      lastExecution,
      successRate,
    };
  }

  // 工作流验证
  async validateWorkflow(
    workflowId: string,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const workflow = await this.database.getWorkflow(workflowId);
    if (!workflow) {
      return { valid: false, errors: ["工作流不存在"] };
    }

    const errors: string[] = [];

    // 检查基本结构
    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push("工作流没有节点");
    }

    // 检查输入输出节点
    const inputNodes = workflow.nodes.filter((node) => node.type === "input");
    const outputNodes = workflow.nodes.filter((node) => node.type === "output");

    if (inputNodes.length === 0) {
      errors.push("工作流缺少输入节点");
    }

    if (outputNodes.length === 0) {
      errors.push("工作流缺少输出节点");
    }

    // 检查连接
    for (const connection of workflow.connections) {
      const sourceNode = workflow.nodes.find(
        (n) => n.id === connection.sourceNodeId,
      );
      const targetNode = workflow.nodes.find(
        (n) => n.id === connection.targetNodeId,
      );

      if (!sourceNode) {
        errors.push(`连接引用了不存在的源节点: ${connection.sourceNodeId}`);
      }

      if (!targetNode) {
        errors.push(`连接引用了不存在的目标节点: ${connection.targetNodeId}`);
      }
    }

    // 检查孤立节点
    const connectedNodes = new Set<string>();
    workflow.connections.forEach((conn) => {
      connectedNodes.add(conn.sourceNodeId);
      connectedNodes.add(conn.targetNodeId);
    });

    const isolatedNodes = workflow.nodes.filter(
      (node) =>
        node.type !== "input" &&
        node.type !== "output" &&
        !connectedNodes.has(node.id),
    );

    if (isolatedNodes.length > 0) {
      errors.push(
        `发现孤立节点: ${isolatedNodes.map((n) => n.label).join(", ")}`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * 获取工作流管理器实例
 */
export function getWorkflowManager(): WorkflowManager {
  return WorkflowManager.getInstance();
}
