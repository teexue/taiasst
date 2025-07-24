/**
 * 通义千问服务实现
 */

import { BaseAIService } from "../base";
import {
  AIProviderConfig,
  AIRequestParams,
  AIResponseCallbacks,
} from "../types";

export class QianwenService extends BaseAIService {
  constructor(config: AIProviderConfig) {
    super("qianwen", "通义千问", config);
  }

  async chat(
    params: AIRequestParams,
    callbacks: AIResponseCallbacks,
  ): Promise<void> {
    await this.sendRequest(params, callbacks);
  }

  protected getApiEndpoint(): string {
    return "/services/aigc/text-generation/generation";
  }

  protected buildRequestBody(params: AIRequestParams): any {
    return {
      model: params.model,
      input: {
        messages: params.messages,
      },
      parameters: {
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 2000,
        incremental_output: params.stream || false,
      },
    };
  }

  protected parseStreamChunk(chunk: string): string | null {
    if (!chunk.startsWith("data:")) {
      return null;
    }

    const data = chunk.slice(5).trim();
    if (!data || data === "[DONE]") {
      return null;
    }

    try {
      const parsed = JSON.parse(data);
      const output = parsed.output;

      if (output?.choices?.[0]?.message?.content) {
        return output.choices[0].message.content;
      }

      return null;
    } catch (error) {
      console.error("解析千问流式响应失败:", error);
      return null;
    }
  }

  protected parseNonStreamResponse(data: any): string {
    return data.output?.choices?.[0]?.message?.content || "";
  }

  protected buildHeaders(): Record<string, string> {
    const headers = super.buildHeaders();

    // 千问API需要特殊的头部
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
      headers["X-DashScope-SSE"] = "enable";
    }

    return headers;
  }
}
