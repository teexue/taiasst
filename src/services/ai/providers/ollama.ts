/**
 * Ollama服务实现
 */

import { BaseAIService } from "../base";
import {
  AIProviderConfig,
  AIRequestParams,
  AIResponseCallbacks,
  AIModel,
} from "../types";

export class OllamaService extends BaseAIService {
  constructor(config: AIProviderConfig) {
    super("ollama", "Ollama", config);
  }

  async chat(
    params: AIRequestParams,
    callbacks: AIResponseCallbacks,
  ): Promise<void> {
    await this.sendRequest(params, callbacks);
  }

  protected getApiEndpoint(): string {
    return "/api/chat";
  }

  protected buildRequestBody(params: AIRequestParams): any {
    return {
      model: params.model,
      messages: params.messages,
      options: {
        temperature: params.temperature || 0.7,
        num_predict: params.maxTokens || 2000,
      },
      stream: params.stream || false,
    };
  }

  protected parseStreamChunk(chunk: string): string | null {
    try {
      const parsed = JSON.parse(chunk);

      if (parsed.message?.content) {
        return parsed.message.content;
      }

      return null;
    } catch (error) {
      console.error("解析Ollama流式响应失败:", error);
      return null;
    }
  }

  protected parseNonStreamResponse(data: any): string {
    return data.message?.content || "";
  }

  protected requiresApiKey(): boolean {
    return false; // Ollama通常不需要API密钥
  }

  // 重写获取模型列表方法，从Ollama API获取
  async getModels(): Promise<AIModel[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      if (!response.ok) {
        return this.config.models || [];
      }

      const data = await response.json();
      const models: AIModel[] =
        data.models?.map((model: any) => ({
          id: model.name,
          name: model.name,
          provider: "ollama" as const,
          description: `${model.name} - ${this.formatSize(model.size)}`,
          maxTokens: 4096,
          supportStream: true,
        })) || [];

      return models;
    } catch (error) {
      console.error("获取Ollama模型列表失败:", error);
      return this.config.models || [];
    }
  }

  private formatSize(bytes: number): string {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  // 重写测试连接方法
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error("Ollama连接测试失败:", error);
      return false;
    }
  }
}
