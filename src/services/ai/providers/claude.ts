/**
 * Claude服务实现
 */

import { BaseAIService } from "../base";
import {
  AIProviderConfig,
  AIRequestParams,
  AIResponseCallbacks,
  AIMessage,
} from "../types";

export class ClaudeService extends BaseAIService {
  constructor(config: AIProviderConfig) {
    super("claude", "Anthropic Claude", config);
  }

  async chat(
    params: AIRequestParams,
    callbacks: AIResponseCallbacks,
  ): Promise<void> {
    await this.sendRequest(params, callbacks);
  }

  protected getApiEndpoint(): string {
    return "/messages";
  }

  protected buildRequestBody(params: AIRequestParams): any {
    // Claude API需要特殊的消息格式
    const { system, messages } = this.formatMessages(params.messages);

    const body: any = {
      model: params.model,
      messages,
      max_tokens: params.maxTokens || 2000,
      temperature: params.temperature || 0.7,
    };

    if (system) {
      body.system = system;
    }

    if (params.stream) {
      body.stream = true;
    }

    return body;
  }

  private formatMessages(messages: AIMessage[]): {
    system?: string;
    messages: any[];
  } {
    let system: string | undefined;
    const formattedMessages: any[] = [];

    for (const message of messages) {
      if (message.role === "system") {
        system = message.content;
      } else {
        formattedMessages.push({
          role: message.role,
          content: message.content,
        });
      }
    }

    return { system, messages: formattedMessages };
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

      if (parsed.type === "content_block_delta") {
        return parsed.delta?.text || null;
      }

      return null;
    } catch (error) {
      console.error("解析Claude流式响应失败:", error);
      return null;
    }
  }

  protected parseNonStreamResponse(data: any): string {
    return data.content?.[0]?.text || "";
  }
}
