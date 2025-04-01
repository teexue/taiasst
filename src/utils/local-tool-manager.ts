import { invoke } from "@tauri-apps/api/core";
import { LocalTool, LocalToolConfig } from "@/types/local-tool";

class LocalToolManager {
  private static instance: LocalToolManager;
  private tools: LocalTool[] = [];

  private constructor() {
    // 初始化本地工具管理器
  }

  public static getInstance(): LocalToolManager {
    if (!LocalToolManager.instance) {
      LocalToolManager.instance = new LocalToolManager();
    }
    return LocalToolManager.instance;
  }

  public async loadTools(): Promise<void> {
    try {
      const config = await invoke<LocalToolConfig>("read_local_tools_config");
      this.tools = config.tools;
    } catch (error) {
      console.error("无法加载本地工具:", error);
      this.tools = [];
    }
  }

  public getTools(): LocalTool[] {
    return this.tools.filter((tool) => tool.enabled);
  }

  public getAllTools(): LocalTool[] {
    return [...this.tools];
  }

  // 生成唯一ID
  private generateId(): string {
    // 使用更加唯一的方式生成ID
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const secondRandomPart = Math.random().toString(36).substring(2, 15);
    return `tool_${timestamp}_${randomPart}_${secondRandomPart}`;
  }

  public async addTool(
    tool: Omit<LocalTool, "id" | "enabled">
  ): Promise<string> {
    const id = this.generateId();
    const newTool: LocalTool = {
      ...tool,
      id,
      enabled: true,
      type: "local",
    };

    this.tools.push(newTool);
    await this.saveConfig();
    return id;
  }

  public async removeTool(toolId: string): Promise<boolean> {
    const index = this.tools.findIndex((t) => t.id === toolId);
    if (index === -1) return false;

    this.tools.splice(index, 1);
    await this.saveConfig();
    return true;
  }

  public async updateTool(
    toolId: string,
    updates: Partial<Omit<LocalTool, "id">>
  ): Promise<boolean> {
    const tool = this.tools.find((t) => t.id === toolId);
    if (!tool) return false;

    Object.assign(tool, updates);
    await this.saveConfig();
    return true;
  }

  public async enableTool(toolId: string): Promise<void> {
    const tool = this.tools.find((t) => t.id === toolId);
    if (tool) {
      tool.enabled = true;
      await this.saveConfig();
    }
  }

  public async disableTool(toolId: string): Promise<void> {
    const tool = this.tools.find((t) => t.id === toolId);
    if (tool) {
      tool.enabled = false;
      await this.saveConfig();
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      await invoke("write_local_tools_config", {
        config: { tools: this.tools },
      });
    } catch (error) {
      console.error("无法保存本地工具配置:", error);
    }
  }
}

export const localToolManager = LocalToolManager.getInstance();
