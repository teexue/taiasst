/**
 * FlowGram.ai 核心类型定义
 */

import { WorkflowJSON } from "@flowgram.ai/free-layout-editor";

// 节点数据接口
export interface NodeData {
  title: string;
  content?: string;
  description?: string;
  config?: Record<string, any>;
}

// 节点元数据接口
export interface NodeMeta {
  position: { x: number; y: number };
  size?: { width: number; height: number };
  collapsed?: boolean;
}

// 完整的节点接口
export interface FlowNode {
  id: string;
  type: string;
  meta: NodeMeta;
  data: NodeData;
  blocks?: FlowNode[];
  edges?: FlowEdge[];
}

// 连线接口
export interface FlowEdge {
  sourceNodeID: string;
  targetNodeID: string;
  sourcePortID?: string;
  targetPortID?: string;
}

// 工作流数据接口
export interface FlowWorkflowData extends WorkflowJSON {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// 节点类型配置
export interface NodeTypeConfig {
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: "input" | "process" | "output" | "control" | "ai";
}

// 端口配置
export interface PortConfig {
  type: "input" | "output";
  id?: string;
  label?: string;
  required?: boolean;
  multiple?: boolean;
}

// 编辑器配置
export interface EditorConfig {
  readonly?: boolean;
  background?: boolean;
  minimap?: boolean;
  snap?: boolean;
  container?: boolean;
  history?: boolean;
}

// 插件选项
export interface PluginOptions {
  minimap?: {
    enabled: boolean;
    width?: number;
    height?: number;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };
  snap?: {
    enabled: boolean;
    threshold?: number;
    edgeColor?: string;
    alignColor?: string;
  };
  container?: {
    enabled: boolean;
    defaultSize?: { width: number; height: number };
    defaultPadding?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
}
