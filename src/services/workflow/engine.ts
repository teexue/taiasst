/**
 * 工作流执行引擎
 */

import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowNode,
  ExecutionStatus,
  WorkflowError,
  NodeExecutionError,
} from "./types";
import { getWorkflowDatabase } from "./database";
// import { getAIManager } from '@/services/ai/manager'; // TODO: 实现AI节点时使用
// 简单的事件发射器实现，替代Node.js的EventEmitter
class SimpleEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  off(event: string, listener: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

/**
 * 工作流执行引擎
 */
export class WorkflowEngine extends SimpleEventEmitter {
  private static instance: WorkflowEngine;
  private database = getWorkflowDatabase();
  // private aiManager = getAIManager(); // TODO: 实现AI节点时使用
  private runningExecutions = new Map<string, WorkflowExecution>();

  private constructor() {
    super();
  }

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  /**
   * 执行工作流
   */
  async executeWorkflow(
    workflowId: string,
    input?: Record<string, any>,
    triggeredBy: "manual" | "schedule" | "api" | "event" = "manual",
  ): Promise<string> {
    const workflow = await this.database.getWorkflow(workflowId);
    if (!workflow) {
      throw new WorkflowError("工作流不存在", "WORKFLOW_NOT_FOUND");
    }

    if (workflow.status !== "active") {
      throw new WorkflowError("工作流未激活", "WORKFLOW_NOT_ACTIVE");
    }

    // 创建执行记录
    const execution: Omit<WorkflowExecution, "id" | "nodeExecutions"> = {
      workflowId: workflow.id,
      workflowVersion: workflow.version,
      status: "pending",
      startTime: Date.now(),
      input,
      triggeredBy,
      logs: [],
    };

    const executionId = await this.database.createExecution(execution);

    // 开始异步执行
    this.runWorkflow(executionId, workflow, input || {}).catch((error) => {
      console.error("工作流执行失败:", error);
    });

    return executionId;
  }

  /**
   * 运行工作流
   */
  private async runWorkflow(
    executionId: string,
    workflow: WorkflowDefinition,
    input: Record<string, any>,
  ): Promise<void> {
    const execution = await this.database.getExecution(executionId);
    if (!execution) {
      throw new WorkflowError("执行记录不存在", "EXECUTION_NOT_FOUND");
    }

    this.runningExecutions.set(executionId, execution);

    try {
      // 更新执行状态为运行中
      await this.updateExecutionStatus(executionId, "running");
      this.emit("workflow_start", { executionId, workflowId: workflow.id });

      // 验证工作流
      this.validateWorkflow(workflow);

      // 构建执行图
      const executionGraph = this.buildExecutionGraph(workflow);

      // 初始化节点数据
      const nodeData = new Map<string, any>();

      // 设置输入数据
      this.setInputData(workflow, input, nodeData);

      // 执行节点
      await this.executeNodes(executionId, workflow, executionGraph, nodeData);

      // 收集输出数据
      const output = this.collectOutputData(workflow, nodeData);

      // 更新执行结果
      await this.database.updateExecution(executionId, {
        status: "completed",
        endTime: Date.now(),
        duration: Date.now() - execution.startTime,
        output,
      });

      this.emit("workflow_complete", {
        executionId,
        workflowId: workflow.id,
        output,
      });
    } catch (error) {
      console.error("工作流执行错误:", error);

      await this.database.updateExecution(executionId, {
        status: "failed",
        endTime: Date.now(),
        duration: Date.now() - execution.startTime,
        error: error instanceof Error ? error.message : String(error),
      });

      this.emit("workflow_error", {
        executionId,
        workflowId: workflow.id,
        error,
      });
    } finally {
      this.runningExecutions.delete(executionId);
    }
  }

  /**
   * 验证工作流
   */
  private validateWorkflow(workflow: WorkflowDefinition): void {
    if (!workflow.nodes || workflow.nodes.length === 0) {
      throw new WorkflowError("工作流没有节点", "WORKFLOW_EMPTY");
    }

    // 检查是否有输入节点
    const inputNodes = workflow.nodes.filter((node) => node.type === "input");
    if (inputNodes.length === 0) {
      throw new WorkflowError("工作流缺少输入节点", "MISSING_INPUT_NODE");
    }

    // 检查是否有输出节点
    const outputNodes = workflow.nodes.filter((node) => node.type === "output");
    if (outputNodes.length === 0) {
      throw new WorkflowError("工作流缺少输出节点", "MISSING_OUTPUT_NODE");
    }

    // 检查连接的有效性
    for (const connection of workflow.connections) {
      const sourceNode = workflow.nodes.find(
        (n) => n.id === connection.sourceNodeId,
      );
      const targetNode = workflow.nodes.find(
        (n) => n.id === connection.targetNodeId,
      );

      if (!sourceNode || !targetNode) {
        throw new WorkflowError("连接引用了不存在的节点", "INVALID_CONNECTION");
      }
    }
  }

  /**
   * 构建执行图
   */
  private buildExecutionGraph(
    workflow: WorkflowDefinition,
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    // 初始化所有节点
    for (const node of workflow.nodes) {
      graph.set(node.id, []);
    }

    // 构建依赖关系
    for (const connection of workflow.connections) {
      const dependencies = graph.get(connection.targetNodeId) || [];
      dependencies.push(connection.sourceNodeId);
      graph.set(connection.targetNodeId, dependencies);
    }

    return graph;
  }

  /**
   * 设置输入数据
   */
  private setInputData(
    workflow: WorkflowDefinition,
    input: Record<string, any>,
    nodeData: Map<string, any>,
  ): void {
    const inputNodes = workflow.nodes.filter((node) => node.type === "input");

    for (const node of inputNodes) {
      const nodeInput = input[node.id] || input[node.label] || null;
      nodeData.set(node.id, { output: nodeInput });
    }
  }

  /**
   * 执行节点
   */
  private async executeNodes(
    executionId: string,
    workflow: WorkflowDefinition,
    graph: Map<string, string[]>,
    nodeData: Map<string, any>,
  ): Promise<void> {
    const executed = new Set<string>();
    const executing = new Set<string>();

    const executeNode = async (nodeId: string): Promise<void> => {
      if (executed.has(nodeId) || executing.has(nodeId)) {
        return;
      }

      const node = workflow.nodes.find((n) => n.id === nodeId);
      if (!node) {
        throw new WorkflowError(`节点不存在: ${nodeId}`, "NODE_NOT_FOUND");
      }

      // 检查依赖是否已执行
      const dependencies = graph.get(nodeId) || [];
      for (const depId of dependencies) {
        if (!executed.has(depId)) {
          await executeNode(depId);
        }
      }

      executing.add(nodeId);

      try {
        this.emit("node_start", {
          executionId,
          nodeId,
          workflowId: workflow.id,
        });

        // 收集输入数据
        const nodeInput = this.collectNodeInput(workflow, node, nodeData);

        // 执行节点
        const nodeOutput = await this.executeNode(node, nodeInput);

        // 保存输出数据
        nodeData.set(nodeId, { input: nodeInput, output: nodeOutput });

        this.emit("node_complete", {
          executionId,
          nodeId,
          workflowId: workflow.id,
          output: nodeOutput,
        });
      } catch (error) {
        this.emit("node_error", {
          executionId,
          nodeId,
          workflowId: workflow.id,
          error,
        });
        throw new NodeExecutionError(
          `节点执行失败: ${error instanceof Error ? error.message : String(error)}`,
          nodeId,
          node.type,
        );
      } finally {
        executing.delete(nodeId);
        executed.add(nodeId);
      }
    };

    // 找到所有入口节点（没有依赖的节点）
    const entryNodes = workflow.nodes.filter((node) => {
      const dependencies = graph.get(node.id) || [];
      return dependencies.length === 0;
    });

    // 并行执行所有入口节点
    await Promise.all(entryNodes.map((node) => executeNode(node.id)));

    // 执行剩余节点
    for (const node of workflow.nodes) {
      await executeNode(node.id);
    }
  }

  /**
   * 收集节点输入数据
   */
  private collectNodeInput(
    workflow: WorkflowDefinition,
    node: WorkflowNode,
    nodeData: Map<string, any>,
  ): Record<string, any> {
    const input: Record<string, any> = {};

    // 找到连接到此节点的所有连接
    const incomingConnections = workflow.connections.filter(
      (conn) => conn.targetNodeId === node.id,
    );

    for (const connection of incomingConnections) {
      const sourceData = nodeData.get(connection.sourceNodeId);
      if (sourceData && sourceData.output !== undefined) {
        input[connection.targetPortId] = sourceData.output;
      }
    }

    return input;
  }

  /**
   * 执行单个节点
   */
  private async executeNode(
    node: WorkflowNode,
    input: Record<string, any>,
  ): Promise<any> {
    switch (node.type) {
      case "input":
        return this.executeInputNode(node, input);
      case "process":
        return this.executeProcessNode(node, input);
      case "ai":
        return this.executeAINode(node, input);
      case "tool":
        return this.executeToolNode(node, input);
      case "control":
        return this.executeControlNode(node, input);
      case "output":
        return this.executeOutputNode(node, input);
      default:
        throw new NodeExecutionError(
          `不支持的节点类型: ${node.type}`,
          node.id,
          node.type,
        );
    }
  }

  /**
   * 执行输入节点
   */
  private async executeInputNode(
    _node: WorkflowNode,
    input: Record<string, any>,
  ): Promise<any> {
    // 输入节点直接返回输入数据
    return input.output || null;
  }

  /**
   * 执行处理节点
   */
  private async executeProcessNode(
    node: WorkflowNode,
    input: Record<string, any>,
  ): Promise<any> {
    const { subtype, config } = node;
    const inputData = input.input;

    switch (subtype) {
      case "text_transform":
        return this.executeTextTransform(inputData, config);
      case "data_filter":
        return this.executeDataFilter(inputData, config);
      default:
        throw new NodeExecutionError(
          `不支持的处理节点子类型: ${subtype}`,
          node.id,
          node.type,
        );
    }
  }

  /**
   * 执行AI节点
   */
  private async executeAINode(
    node: WorkflowNode,
    input: Record<string, any>,
  ): Promise<any> {
    const { subtype, config } = node;

    switch (subtype) {
      case "text_generation":
        return this.executeAITextGeneration(input, config);
      case "text_analysis":
        return this.executeAITextAnalysis(input, config);
      default:
        throw new NodeExecutionError(
          `不支持的AI节点子类型: ${subtype}`,
          node.id,
          node.type,
        );
    }
  }

  /**
   * 执行工具节点
   */
  private async executeToolNode(
    node: WorkflowNode,
    input: Record<string, any>,
  ): Promise<any> {
    const { subtype, config } = node;

    switch (subtype) {
      case "http_request":
        return this.executeHttpRequest(input, config);
      case "email_send":
        return this.executeEmailSend(input, config);
      default:
        throw new NodeExecutionError(
          `不支持的工具节点子类型: ${subtype}`,
          node.id,
          node.type,
        );
    }
  }

  /**
   * 执行控制节点
   */
  private async executeControlNode(
    node: WorkflowNode,
    input: Record<string, any>,
  ): Promise<any> {
    const { subtype, config } = node;

    switch (subtype) {
      case "condition":
        return this.executeCondition(input, config);
      case "loop":
        return this.executeLoop(input, config);
      default:
        throw new NodeExecutionError(
          `不支持的控制节点子类型: ${subtype}`,
          node.id,
          node.type,
        );
    }
  }

  /**
   * 执行输出节点
   */
  private async executeOutputNode(
    _node: WorkflowNode,
    input: Record<string, any>,
  ): Promise<any> {
    // 输出节点直接返回输入数据
    return input.input;
  }

  // 具体的节点执行方法（简化实现）
  private async executeTextTransform(
    input: string,
    config: any,
  ): Promise<string> {
    if (!input || typeof input !== "string") {
      throw new Error("文本转换需要字符串输入");
    }

    switch (config.operation) {
      case "uppercase":
        return input.toUpperCase();
      case "lowercase":
        return input.toLowerCase();
      case "trim":
        return input.trim();
      case "replace":
        return input.replace(
          new RegExp(config.customPattern, "g"),
          config.replacement,
        );
      default:
        return input;
    }
  }

  private async executeDataFilter(input: any[], _config: any): Promise<any[]> {
    if (!Array.isArray(input)) {
      throw new Error("数据过滤需要数组输入");
    }

    // 简化的过滤逻辑
    return input.filter((_item) => {
      // 这里应该根据config.conditions进行复杂的过滤
      return true;
    });
  }

  private async executeAITextGeneration(
    input: Record<string, any>,
    config: any,
  ): Promise<string> {
    const prompt = input.prompt || config.prompt;

    if (!prompt) {
      throw new Error("AI文本生成需要提示词");
    }

    // 这里应该调用AI服务
    // 简化实现，返回模拟结果
    return `AI生成的文本基于提示词: ${prompt}`;
  }

  private async executeAITextAnalysis(
    input: Record<string, any>,
    _config: any,
  ): Promise<any> {
    const text = input.input;

    if (!text) {
      throw new Error("AI文本分析需要文本输入");
    }

    // 简化实现，返回模拟分析结果
    return {
      sentiment: "positive",
      confidence: 0.85,
      keywords: ["关键词1", "关键词2"],
    };
  }

  private async executeHttpRequest(
    input: Record<string, any>,
    config: any,
  ): Promise<any> {
    const url = input.url || config.url;
    const data = input.data;

    if (!url) {
      throw new Error("HTTP请求需要URL");
    }

    // 简化实现
    const response = await fetch(url, {
      method: config.method || "GET",
      headers: config.headers || {},
      body: data ? JSON.stringify(data) : undefined,
    });

    return await response.json();
  }

  private async executeEmailSend(
    _input: Record<string, any>,
    _config: any,
  ): Promise<any> {
    // 简化实现，返回模拟结果
    return {
      success: true,
      messageId: "mock-message-id",
      timestamp: Date.now(),
    };
  }

  private async executeCondition(
    input: Record<string, any>,
    config: any,
  ): Promise<any> {
    const value = input.input;
    const { operator, value: compareValue } = config;

    let result = false;
    switch (operator) {
      case "equals":
        result = value === compareValue;
        break;
      case "not_equals":
        result = value !== compareValue;
        break;
      case "greater":
        result = Number(value) > Number(compareValue);
        break;
      case "less":
        result = Number(value) < Number(compareValue);
        break;
      case "contains":
        result = String(value).includes(String(compareValue));
        break;
    }

    return { condition: result, value };
  }

  private async executeLoop(
    input: Record<string, any>,
    _config: any,
  ): Promise<any> {
    const data = input.input;

    if (!Array.isArray(data)) {
      throw new Error("循环节点需要数组输入");
    }

    // 简化实现，返回处理后的数组
    return data.map((item, index) => ({
      item,
      index,
    }));
  }

  /**
   * 收集输出数据
   */
  private collectOutputData(
    workflow: WorkflowDefinition,
    nodeData: Map<string, any>,
  ): Record<string, any> {
    const output: Record<string, any> = {};
    const outputNodes = workflow.nodes.filter((node) => node.type === "output");

    for (const node of outputNodes) {
      const data = nodeData.get(node.id);
      if (data && data.output !== undefined) {
        output[node.id] = data.output;
        output[node.label] = data.output;
      }
    }

    return output;
  }

  /**
   * 更新执行状态
   */
  private async updateExecutionStatus(
    executionId: string,
    status: ExecutionStatus,
  ): Promise<void> {
    await this.database.updateExecution(executionId, { status });
  }

  /**
   * 停止工作流执行
   */
  async stopExecution(executionId: string): Promise<void> {
    const execution = this.runningExecutions.get(executionId);
    if (execution) {
      await this.database.updateExecution(executionId, {
        status: "cancelled",
        endTime: Date.now(),
        duration: Date.now() - execution.startTime,
      });

      this.runningExecutions.delete(executionId);
      this.emit("workflow_cancelled", { executionId });
    }
  }

  /**
   * 获取运行中的执行
   */
  getRunningExecutions(): WorkflowExecution[] {
    return Array.from(this.runningExecutions.values());
  }
}

/**
 * 获取工作流引擎实例
 */
export function getWorkflowEngine(): WorkflowEngine {
  return WorkflowEngine.getInstance();
}
