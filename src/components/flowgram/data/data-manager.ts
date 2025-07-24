/**
 * FlowGram.ai 数据管理器
 */

import { FlowWorkflowData } from "../core/types";

export class DataManager {
  private static readonly STORAGE_KEY = "flowgram_workflows";
  private static readonly AUTO_SAVE_INTERVAL = 5000; // 5秒自动保存

  /**
   * 保存工作流数据到本地存储
   */
  static saveWorkflow(id: string, data: FlowWorkflowData): void {
    try {
      const workflows = this.getAllWorkflows();
      workflows[id] = {
        ...data,
        // updatedAt: new Date().toISOString() // TODO: 添加到类型定义中
      } as any;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows));
      console.log(`工作流 ${id} 已保存`);
    } catch (error) {
      console.error("保存工作流失败:", error);
    }
  }

  /**
   * 从本地存储加载工作流数据
   */
  static loadWorkflow(id: string): FlowWorkflowData | null {
    try {
      const workflows = this.getAllWorkflows();
      return workflows[id] || null;
    } catch (error) {
      console.error("加载工作流失败:", error);
      return null;
    }
  }

  /**
   * 获取所有工作流
   */
  static getAllWorkflows(): Record<string, FlowWorkflowData> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("获取工作流列表失败:", error);
      return {};
    }
  }

  /**
   * 删除工作流
   */
  static deleteWorkflow(id: string): void {
    try {
      const workflows = this.getAllWorkflows();
      delete workflows[id];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows));
      console.log(`工作流 ${id} 已删除`);
    } catch (error) {
      console.error("删除工作流失败:", error);
    }
  }

  /**
   * 导出工作流为JSON
   */
  static exportWorkflow(id: string): string | null {
    try {
      const workflow = this.loadWorkflow(id);
      if (!workflow) return null;

      return JSON.stringify(workflow, null, 2);
    } catch (error) {
      console.error("导出工作流失败:", error);
      return null;
    }
  }

  /**
   * 从JSON导入工作流
   */
  static importWorkflow(id: string, jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as FlowWorkflowData;
      this.saveWorkflow(id, data);
      return true;
    } catch (error) {
      console.error("导入工作流失败:", error);
      return false;
    }
  }

  /**
   * 复制工作流
   */
  static duplicateWorkflow(sourceId: string, targetId: string): boolean {
    try {
      const sourceData = this.loadWorkflow(sourceId);
      if (!sourceData) return false;

      // 生成新的节点ID
      const nodeIdMap: Record<string, string> = {};
      const newNodes = sourceData.nodes.map((node) => {
        const newId = this.generateNodeId();
        nodeIdMap[node.id] = newId;
        return { ...node, id: newId };
      });

      // 更新连线中的节点ID
      const newEdges = sourceData.edges.map((edge) => ({
        ...edge,
        sourceNodeID: nodeIdMap[edge.sourceNodeID] || edge.sourceNodeID,
        targetNodeID: nodeIdMap[edge.targetNodeID] || edge.targetNodeID,
      }));

      const newData: FlowWorkflowData = {
        ...sourceData,
        nodes: newNodes,
        edges: newEdges,
      };

      this.saveWorkflow(targetId, newData);
      return true;
    } catch (error) {
      console.error("复制工作流失败:", error);
      return false;
    }
  }

  /**
   * 生成唯一的节点ID
   */
  static generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成唯一的工作流ID
   */
  static generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 验证工作流数据
   */
  static validateWorkflow(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      errors.push("工作流数据不能为空");
      return { valid: false, errors };
    }

    if (!Array.isArray(data.nodes)) {
      errors.push("节点数据必须是数组");
    } else {
      // 验证节点
      data.nodes.forEach((node: any, index: number) => {
        if (!node.id) {
          errors.push(`节点 ${index} 缺少ID`);
        }
        if (!node.type) {
          errors.push(`节点 ${index} 缺少类型`);
        }
        if (!node.meta || typeof node.meta.position !== "object") {
          errors.push(`节点 ${index} 缺少位置信息`);
        }
      });
    }

    if (!Array.isArray(data.edges)) {
      errors.push("连线数据必须是数组");
    } else {
      // 验证连线
      data.edges.forEach((edge: any, index: number) => {
        if (!edge.sourceNodeID) {
          errors.push(`连线 ${index} 缺少源节点ID`);
        }
        if (!edge.targetNodeID) {
          errors.push(`连线 ${index} 缺少目标节点ID`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * 自动保存管理器
   */
  static createAutoSaveManager(
    workflowId: string,
    getData: () => FlowWorkflowData,
    onSave?: () => void,
  ) {
    let saveTimer: NodeJS.Timeout | null = null;
    let hasChanges = false;

    const save = () => {
      if (hasChanges) {
        try {
          const data = getData();
          this.saveWorkflow(workflowId, data);
          hasChanges = false;
          onSave?.();
        } catch (error) {
          console.error("自动保存失败:", error);
        }
      }
    };

    const scheduleAutoSave = () => {
      hasChanges = true;
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
      saveTimer = setTimeout(save, this.AUTO_SAVE_INTERVAL);
    };

    const forceSave = () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
      save();
    };

    const destroy = () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
      forceSave(); // 销毁前强制保存
    };

    return {
      scheduleAutoSave,
      forceSave,
      destroy,
    };
  }

  /**
   * 获取工作流统计信息
   */
  static getWorkflowStats(data: FlowWorkflowData) {
    const nodeTypes: Record<string, number> = {};

    data.nodes.forEach((node) => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    });

    return {
      totalNodes: data.nodes.length,
      totalEdges: data.edges.length,
      nodeTypes,
      hasStartNode: data.nodes.some((node) => node.type === "start"),
      hasEndNode: data.nodes.some((node) => node.type === "end"),
      isValid: this.validateWorkflow(data).valid,
    };
  }

  /**
   * 清理本地存储
   */
  static clearAllWorkflows(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log("所有工作流数据已清除");
    } catch (error) {
      console.error("清除工作流数据失败:", error);
    }
  }
}
