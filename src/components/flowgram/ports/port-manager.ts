/**
 * FlowGram.ai 端口管理器
 */

import { WorkflowNodePortsData } from "@flowgram.ai/free-layout-editor";

export class PortManager {
  /**
   * 获取节点的端口数据
   */
  static getNodePorts(node: any) {
    return node.getData(WorkflowNodePortsData);
  }

  /**
   * 获取节点的输入端口
   */
  static getInputPorts(node: any) {
    const ports = this.getNodePorts(node);
    return ports.inputPorts;
  }

  /**
   * 获取节点的输出端口
   */
  static getOutputPorts(node: any) {
    const ports = this.getNodePorts(node);
    return ports.outputPorts;
  }

  /**
   * 获取端口连接的线条
   */
  static getPortLines(port: any) {
    return port.availableLines;
  }

  /**
   * 检查端口是否已连接
   */
  static isPortConnected(port: any) {
    return this.getPortLines(port).length > 0;
  }

  /**
   * 检查端口是否可以添加更多连接
   */
  static canAddConnection(port: any, maxConnections = 1) {
    return this.getPortLines(port).length < maxConnections;
  }

  /**
   * 更新动态端口位置
   */
  static updateDynamicPorts(node: any) {
    const ports = this.getNodePorts(node);
    // 当动态端口修改了 DOM 结构或位置时，手动刷新端口位置
    // DOM 渲染有延迟，最好在 useEffect 或者 setTimeout 执行
    setTimeout(() => {
      ports.updateDynamicPorts();
    }, 0);
  }

  /**
   * 验证端口连接
   */
  static validateConnection(fromPort: any, toPort: any) {
    // 不能连接到同一个节点
    if (fromPort.node === toPort.node) {
      return {
        valid: false,
        reason: "不能连接到同一个节点",
      };
    }

    // 输入端口不能连接到输入端口
    if (fromPort.type === "input" && toPort.type === "input") {
      return {
        valid: false,
        reason: "输入端口不能连接到输入端口",
      };
    }

    // 输出端口不能连接到输出端口
    if (fromPort.type === "output" && toPort.type === "output") {
      return {
        valid: false,
        reason: "输出端口不能连接到输出端口",
      };
    }

    // 检查端口连接数限制
    if (!this.canAddConnection(fromPort)) {
      return {
        valid: false,
        reason: "源端口已达到最大连接数",
      };
    }

    if (!this.canAddConnection(toPort)) {
      return {
        valid: false,
        reason: "目标端口已达到最大连接数",
      };
    }

    return {
      valid: true,
      reason: "",
    };
  }

  /**
   * 获取端口的显示名称
   */
  static getPortDisplayName(port: any) {
    const portNames: Record<string, string> = {
      input: "输入",
      output: "输出",
      positive: "是",
      negative: "否",
      loop: "循环",
      done: "完成",
      success: "成功",
      failure: "失败",
      error: "错误",
    };

    return portNames[port.id] || port.id || port.type;
  }

  /**
   * 获取端口的颜色
   */
  static getPortColor(port: any) {
    const portColors: Record<string, string> = {
      input: "#6b7280",
      output: "#3b82f6",
      positive: "#10b981",
      negative: "#ef4444",
      loop: "#8b5cf6",
      done: "#059669",
      success: "#10b981",
      failure: "#ef4444",
      error: "#dc2626",
    };

    return portColors[port.id] || portColors[port.type] || "#6b7280";
  }
}
