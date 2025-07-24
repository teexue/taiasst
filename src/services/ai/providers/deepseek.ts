/**
 * DeepSeek服务实现
 */

import { BaseAIService } from "../base";
import {
  AIProviderConfig,
  AIRequestParams,
  AIResponseCallbacks,
} from "../types";

export class DeepSeekService extends BaseAIService {
  constructor(config: AIProviderConfig) {
    super("deepseek", "DeepSeek", config);
  }

  async chat(
    params: AIRequestParams,
    callbacks: AIResponseCallbacks,
  ): Promise<void> {
    await this.sendRequest(params, callbacks);
  }

  protected getApiEndpoint(): string {
    return "/chat/completions";
  }

  protected buildRequestBody(params: AIRequestParams): any {
    return {
      model: params.model,
      messages: params.messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.maxTokens || 2000,
      stream: params.stream || false,
    };
  }

  protected parseStreamChunk(chunk: string): string | null {
    if (!chunk.startsWith("data: ")) {
      return null;
    }

    const data = chunk.slice(6).trim();
    if (data === "[DONE]") {
      return null;
    }

    try {
      const parsed = JSON.parse(data);
      const delta = parsed.choices?.[0]?.delta;
      return delta?.content || null;
    } catch (error) {
      console.error("解析DeepSeek流式响应失败:", error);
      return null;
    }
  }

  protected parseNonStreamResponse(data: any): string {
    return data.choices?.[0]?.message?.content || "";
  }
}
