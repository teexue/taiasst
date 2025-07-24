/**
 * AI服务基类
 */

import {
  IAIService,
  AIProvider,
  AIProviderConfig,
  AIModel,
  AIRequestParams,
  AIResponseCallbacks,
  AIServiceError,
} from "./types";

/**
 * AI服务基类
 */
export abstract class BaseAIService implements IAIService {
  protected config: AIProviderConfig;

  constructor(
    public readonly provider: AIProvider,
    public readonly name: string,
    config: AIProviderConfig,
  ) {
    this.config = config;
  }

  /**
   * 验证配置
   */
  async validateConfig(config: AIProviderConfig): Promise<boolean> {
    try {
      // 基础验证
      if (!config.apiKey && this.requiresApiKey()) {
        return false;
      }

      if (!config.baseUrl) {
        return false;
      }

      // 测试连接
      return await this.testConnection();
    } catch (error) {
      console.error(`${this.provider} 配置验证失败:`, error);
      return false;
    }
  }

  /**
   * 获取模型列表
   */
  async getModels(): Promise<AIModel[]> {
    return this.config.models || [];
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const testParams: AIRequestParams = {
        messages: [{ role: "user", content: "Hello" }],
        model: this.config.models[0]?.id || "",
        maxTokens: 10,
        temperature: 0.1,
        stream: false,
      };

      let success = false;
      await this.chat(testParams, {
        onComplete: () => {
          success = true;
        },
        onError: () => {
          success = false;
        },
      });

      return success;
    } catch (error) {
      console.error(`${this.provider} 连接测试失败:`, error);
      return false;
    }
  }

  /**
   * 发送聊天请求 - 抽象方法，由子类实现
   */
  abstract chat(
    params: AIRequestParams,
    callbacks: AIResponseCallbacks,
  ): Promise<void>;

  /**
   * 是否需要API密钥
   */
  protected requiresApiKey(): boolean {
    return this.provider !== "ollama";
  }

  /**
   * 构建请求头
   */
  protected buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.apiKey) {
      switch (this.provider) {
        case "openai":
        case "deepseek":
          headers["Authorization"] = `Bearer ${this.config.apiKey}`;
          break;
        case "claude":
          headers["x-api-key"] = this.config.apiKey;
          headers["anthropic-version"] = "2023-06-01";
          break;
        case "qianwen":
          headers["Authorization"] = `Bearer ${this.config.apiKey}`;
          headers["X-DashScope-SSE"] = "enable";
          break;
      }
    }

    return headers;
  }

  /**
   * 处理流式响应
   */
  protected async handleStreamResponse(
    response: Response,
    callbacks: AIResponseCallbacks,
  ): Promise<void> {
    if (!response.body) {
      throw new AIServiceError("响应体为空", this.provider);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    callbacks.onStart?.();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          const content = this.parseStreamChunk(line);
          if (content) {
            fullResponse += content;
            callbacks.onChunk?.(content);
          }
        }
      }

      callbacks.onComplete?.(fullResponse);
    } catch (error) {
      callbacks.onError?.(error as Error);
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 解析流式响应块 - 抽象方法，由子类实现
   */
  protected abstract parseStreamChunk(chunk: string): string | null;

  /**
   * 构建请求体 - 抽象方法，由子类实现
   */
  protected abstract buildRequestBody(params: AIRequestParams): any;

  /**
   * 获取API端点
   */
  protected abstract getApiEndpoint(): string;

  /**
   * 处理错误响应
   */
  protected handleErrorResponse(response: Response): AIServiceError {
    return new AIServiceError(
      `API请求失败: ${response.status} ${response.statusText}`,
      this.provider,
      response.status.toString(),
    );
  }

  /**
   * 发送HTTP请求
   */
  protected async sendRequest(
    params: AIRequestParams,
    callbacks: AIResponseCallbacks,
  ): Promise<void> {
    const url = `${this.config.baseUrl}${this.getApiEndpoint()}`;
    const headers = this.buildHeaders();
    const body = this.buildRequestBody(params);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw this.handleErrorResponse(response);
      }

      if (params.stream) {
        await this.handleStreamResponse(response, callbacks);
      } else {
        const data = await response.json();
        const content = this.parseNonStreamResponse(data);
        callbacks.onStart?.();
        callbacks.onComplete?.(content);
      }
    } catch (error) {
      callbacks.onError?.(error as Error);
    }
  }

  /**
   * 解析非流式响应 - 抽象方法，由子类实现
   */
  protected abstract parseNonStreamResponse(data: any): string;
}
