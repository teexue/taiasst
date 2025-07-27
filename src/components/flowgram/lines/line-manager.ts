/**
 * FlowGram.ai 连线管理器
 */

import { WorkflowNodeLinesData } from "@flowgram.ai/free-layout-editor";

export class LineManager {
  /**
   * 创建新的连线
   */
  static createLine(
    ctx: any,
    params: {
      from: string;
      to: string;
      fromPort?: string;
      toPort?: string;
    },
  ) {
    const { from, to, fromPort, toPort } = params;
    return ctx.document.linesManager.createLine({ from, to, fromPort, toPort });
  }

  /**
   * 删除连线
   */
  static deleteLine(line: any) {
    line.dispose();
  }

  /**
   * 获取所有连线
   */
  static getAllLines(ctx: any) {
    return ctx.document.linesManager.getAllLines();
  }

  /**
   * 获取节点的连线数据
   */
  static getNodeLines(node: any) {
    return node.getData(WorkflowNodeLinesData);
  }

  /**
   * 获取节点的输入连线
   */
  static getInputLines(node: any) {
    const linesData = this.getNodeLines(node);
    return linesData.inputLines;
  }

  /**
   * 获取节点的输出连线
   */
  static getOutputLines(node: any) {
    const linesData = this.getNodeLines(node);
    return linesData.outputLines;
  }

  /**
   * 获取节点的输入节点
   */
  static getInputNodes(node: any) {
    const linesData = this.getNodeLines(node);
    return linesData.inputNodes;
  }

  /**
   * 获取节点的输出节点
   */
  static getOutputNodes(node: any) {
    const linesData = this.getNodeLines(node);
    return linesData.outputNodes;
  }

  /**
   * 获取所有上游节点（递归）
   */
  static getAllInputNodes(node: any) {
    const linesData = this.getNodeLines(node);
    return linesData.allInputNodes;
  }

  /**
   * 获取所有下游节点（递归）
   */
  static getAllOutputNodes(node: any) {
    const linesData = this.getNodeLines(node);
    return linesData.allOutputNodes;
  }

  /**
   * 导出连线数据为JSON
   */
  static exportLinesToJSON(ctx: any) {
    return ctx.document.linesManager.toJSON();
  }

  /**
   * 监听连线变化
   */
  static onLinesChange(ctx: any, callback: () => void) {
    return ctx.document.linesManager.onAvailableLinesChange(callback);
  }

  /**
   * 监听节点连线变化
   */
  static onNodeLinesChange(node: any, callback: () => void) {
    const linesData = this.getNodeLines(node);
    return linesData.onDataChange(callback);
  }

  /**
   * 验证连线是否有效
   */
  static validateLine(_ctx: any, fromPort: any, toPort: any) {
    // 不能连接到同一个节点
    if (fromPort.node === toPort.node) {
      return {
        valid: false,
        reason: "不能连接到同一个节点",
      };
    }

    // 检查是否会形成循环
    if (this.wouldCreateCycle(fromPort.node, toPort.node)) {
      return {
        valid: false,
        reason: "连接会形成循环",
      };
    }

    // 检查端口类型
    if (fromPort.type === toPort.type) {
      return {
        valid: false,
        reason: "相同类型的端口不能连接",
      };
    }

    // 检查连接数限制
    if (fromPort.type === "output" && fromPort.availableLines.length >= 1) {
      return {
        valid: false,
        reason: "输出端口只能连接一条线",
      };
    }

    return {
      valid: true,
      reason: "",
    };
  }

  /**
   * 检查是否会形成循环
   */
  private static wouldCreateCycle(fromNode: any, toNode: any): boolean {
    // 简单的循环检测：检查 toNode 是否已经是 fromNode 的上游节点
    const allInputNodes = this.getAllInputNodes(fromNode);
    return allInputNodes.some((node: any) => node.id === toNode.id);
  }

  /**
   * 获取连线的样式配置
   */
  static getLineStyles() {
    return {
      hidden: "transparent",
      default: "#4d53e8",
      drawing: "#5DD6E3",
      hovered: "#37d0ff",
      selected: "#37d0ff",
      error: "#ef4444",
      flowing: "#ff6b35",
      success: "#10b981",
      warning: "#f59e0b",
    };
  }

  /**
   * 获取连线状态
   */
  static getLineState(line: any) {
    if (line.hasError) return "error";
    if (line.processing) return "flowing";
    if (line.selected) return "selected";
    if (line.hovered) return "hovered";
    return "default";
  }
}
