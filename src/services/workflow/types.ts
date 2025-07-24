/**
 * 工作流系统类型定义
 */

// 节点类型
export type NodeType =
  | "input" // 输入节点
  | "process" // 处理节点
  | "output" // 输出节点
  | "control" // 控制节点
  | "ai" // AI处理节点
  | "tool"; // 工具调用节点

// 节点状态
export type NodeStatus = "idle" | "running" | "success" | "error" | "waiting";

// 工作流状态
export type WorkflowStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "error";

// 执行状态
export type ExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

// 节点位置
export interface NodePosition {
  x: number;
  y: number;
}

// 节点连接点
export interface NodePort {
  id: string;
  type: "input" | "output";
  dataType: string;
  label: string;
  required?: boolean;
}

// 节点配置
export interface NodeConfig {
  [key: string]: any;
}

// 工作流节点
export interface WorkflowNode {
  id: string;
  type: NodeType;
  subtype: string;
  label: string;
  description?: string;
  position: NodePosition;
  config: NodeConfig;
  ports: NodePort[];
  status: NodeStatus;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

// 节点连接
export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  label?: string;
}

// 工作流定义
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: Record<string, any>;
  settings: WorkflowSettings;
  tags: string[];
  category: string;
  isTemplate: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

// 工作流设置
export interface WorkflowSettings {
  timeout: number;
  retryCount: number;
  parallelExecution: boolean;
  errorHandling: "stop" | "continue" | "retry";
  notifications: {
    onSuccess: boolean;
    onError: boolean;
    email?: string;
  };
  schedule?: {
    enabled: boolean;
    cron: string;
    timezone: string;
  };
}

// 工作流执行记录
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: string;
  status: ExecutionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  nodeExecutions: NodeExecution[];
  triggeredBy: "manual" | "schedule" | "api" | "event";
  logs: ExecutionLog[];
}

// 节点执行记录
export interface NodeExecution {
  nodeId: string;
  status: ExecutionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  retryCount: number;
}

// 执行日志
export interface ExecutionLog {
  id: string;
  timestamp: number;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  nodeId?: string;
  data?: any;
}

// 节点模板
export interface NodeTemplate {
  id: string;
  type: NodeType;
  subtype: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  defaultConfig: NodeConfig;
  ports: NodePort[];
  configSchema: any; // JSON Schema for configuration
  examples?: any[];
  documentation?: string;
}

// 工作流模板
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
  thumbnail?: string;
  definition: Omit<
    WorkflowDefinition,
    "id" | "createdAt" | "updatedAt" | "createdBy"
  >;
  usage: {
    downloads: number;
    rating: number;
    reviews: number;
  };
  author: {
    name: string;
    avatar?: string;
  };
  version: string;
  createdAt: number;
  updatedAt: number;
}

// 工作流分类
export interface WorkflowCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentId?: string;
  order: number;
}

// 工作流变量
export interface WorkflowVariable {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  value: any;
  description?: string;
  required: boolean;
  defaultValue?: any;
}

// 工作流事件
export interface WorkflowEvent {
  type:
    | "node_start"
    | "node_complete"
    | "node_error"
    | "workflow_start"
    | "workflow_complete"
    | "workflow_error";
  timestamp: number;
  workflowId: string;
  executionId: string;
  nodeId?: string;
  data?: any;
}

// 工作流统计
export interface WorkflowStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  lastExecution?: number;
  successRate: number;
}

// 工作流导入/导出格式
export interface WorkflowExportData {
  version: string;
  workflow: WorkflowDefinition;
  dependencies?: string[];
  metadata: {
    exportedAt: number;
    exportedBy: string;
    application: string;
    version: string;
  };
}

// 工作流搜索过滤器
export interface WorkflowFilter {
  status?: WorkflowStatus[];
  category?: string[];
  tags?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
  author?: string;
  isTemplate?: boolean;
}

// 工作流排序选项
export type WorkflowSortBy =
  | "name"
  | "createdAt"
  | "updatedAt"
  | "executions"
  | "rating";
export type SortOrder = "asc" | "desc";

export interface WorkflowSort {
  by: WorkflowSortBy;
  order: SortOrder;
}

// API响应类型
export interface WorkflowListResponse {
  workflows: WorkflowDefinition[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface WorkflowExecutionResponse {
  execution: WorkflowExecution;
  realTimeUpdates?: boolean;
}

// 错误类型
export class WorkflowError extends Error {
  constructor(
    message: string,
    public code: string,
    public nodeId?: string,
    public details?: any,
  ) {
    super(message);
    this.name = "WorkflowError";
  }
}

export class NodeExecutionError extends WorkflowError {
  constructor(
    message: string,
    nodeId: string,
    public nodeType: string,
    details?: any,
  ) {
    super(message, "NODE_EXECUTION_ERROR", nodeId, details);
    this.name = "NodeExecutionError";
  }
}

export class WorkflowValidationError extends WorkflowError {
  constructor(
    message: string,
    public validationErrors: string[],
    details?: any,
  ) {
    super(message, "WORKFLOW_VALIDATION_ERROR", undefined, details);
    this.name = "WorkflowValidationError";
  }
}
