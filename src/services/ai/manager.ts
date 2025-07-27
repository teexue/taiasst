/**
 * AI管理服务
 */

import {
  IAIService,
  AIProvider,
  AIProviderConfig,
  AIRequestParams,
  AIResponseCallbacks,
  AIMessage,
  ChatSession,
  AIServiceError,
} from "./types";
import { getAIServiceFactory } from "./factory";
import { getAIConfigStore, createNewChatSession } from "./config";

/**
 * AI管理服务
 */
export class AIManager {
  private static instance: AIManager;
  private configStore = getAIConfigStore();
  private serviceFactory = getAIServiceFactory();

  private constructor() {}

  static getInstance(): AIManager {
    if (!AIManager.instance) {
      AIManager.instance = new AIManager();
    }
    return AIManager.instance;
  }

  /**
   * 获取AI服务实例
   */
  async getAIService(provider?: AIProvider): Promise<IAIService> {
    const targetProvider = provider || (await this.getDefaultProvider());
    if (!targetProvider) {
      throw new AIServiceError(
        "未配置默认AI提供商，请前往系统设置 > AI助手 配置AI提供商",
        "openai",
      );
    }

    const config = await this.configStore.getProviderConfig(targetProvider);
    if (!config) {
      throw new AIServiceError(
        `AI提供商 ${targetProvider} 未配置，请前往系统设置 > AI助手 配置API密钥`,
        targetProvider,
      );
    }

    if (!config.enabled) {
      throw new AIServiceError(
        `AI提供商 ${targetProvider} 未启用，请前往系统设置 > AI助手 启用该提供商`,
        targetProvider,
      );
    }

    if (!config.apiKey && targetProvider !== "ollama") {
      throw new AIServiceError(
        `AI提供商 ${targetProvider} 缺少API密钥，请前往系统设置 > AI助手 配置API密钥`,
        targetProvider,
      );
    }

    return this.serviceFactory.createService(targetProvider, config);
  }

  /**
   * 发送聊天消息
   */
  async sendMessage(
    message: string,
    sessionId?: string,
    provider?: AIProvider,
    model?: string,
    callbacks?: AIResponseCallbacks,
  ): Promise<ChatSession> {
    const service = await this.getAIService(provider);

    // 获取或创建会话
    let session: ChatSession;
    if (sessionId) {
      session =
        (await this.configStore.getChatSession(sessionId)) ||
        createNewChatSession("新对话", service.provider, model || "");
    } else {
      // 如果没有指定模型，使用默认模型
      let targetModel = model;
      if (!targetModel) {
        targetModel =
          (await this.getDefaultModel(service.provider)) || undefined;
      }

      // 如果还是没有模型，使用提供商的第一个可用模型
      if (!targetModel) {
        const models = await service.getModels();
        targetModel = models.length > 0 ? models[0].id : "";
      }

      if (!targetModel) {
        throw new AIServiceError(
          `未找到可用的模型，请在系统设置中为 ${service.provider} 配置默认模型`,
          service.provider,
        );
      }

      session = createNewChatSession("新对话", service.provider, targetModel);
    }

    // 确保会话有有效的模型
    if (!session.model) {
      const defaultModel = await this.getDefaultModel(session.provider);
      if (defaultModel) {
        session.model = defaultModel;
      } else {
        const models = await service.getModels();
        if (models.length > 0) {
          session.model = models[0].id;
        } else {
          throw new AIServiceError(
            `未找到可用的模型，请在系统设置中为 ${session.provider} 配置默认模型`,
            session.provider,
          );
        }
      }
    }

    // 添加用户消息
    const userMessage: AIMessage = {
      role: "user",
      content: message,
    };
    session.messages.push(userMessage);

    // 准备AI请求
    const requestParams: AIRequestParams = {
      messages: session.messages,
      model: session.model,
      temperature: 0.7,
      maxTokens: 2000,
      stream: true,
    };

    let aiResponse = "";

    // 发送请求
    await service.chat(requestParams, {
      onStart: callbacks?.onStart,
      onChunk: (chunk) => {
        aiResponse += chunk;
        callbacks?.onChunk?.(chunk);
      },
      onComplete: async (fullResponse) => {
        // 添加AI响应消息
        const aiMessage: AIMessage = {
          role: "assistant",
          content: fullResponse || aiResponse,
        };
        session.messages.push(aiMessage);
        session.updatedAt = Date.now();

        // 自动生成标题（如果是新会话）
        if (session.messages.length === 2) {
          session.title = this.generateSessionTitle(message);
        }

        // 保存会话
        await this.configStore.saveChatSession(session);
        callbacks?.onComplete?.(fullResponse || aiResponse);
      },
      onError: callbacks?.onError,
    });

    return session;
  }

  /**
   * 获取所有提供商配置
   */
  async getAllProviderConfigs(): Promise<AIProviderConfig[]> {
    return await this.configStore.getAllProviderConfigs();
  }

  /**
   * 保存提供商配置
   */
  async saveProviderConfig(config: AIProviderConfig): Promise<void> {
    await this.configStore.setProviderConfig(config);
    // 清除缓存的服务实例
    this.serviceFactory.clearCache(config.provider);
  }

  /**
   * 测试提供商连接
   */
  async testProviderConnection(provider: AIProvider): Promise<boolean> {
    try {
      const service = await this.getAIService(provider);
      return await service.testConnection();
    } catch (error) {
      console.error(`测试 ${provider} 连接失败:`, error);
      return false;
    }
  }

  /**
   * 获取提供商的可用模型
   */
  async getProviderModels(provider: AIProvider): Promise<any[]> {
    try {
      const service = await this.getAIService(provider);
      return await service.getModels();
    } catch (error) {
      console.error(`获取 ${provider} 模型列表失败:`, error);
      return [];
    }
  }

  /**
   * 获取默认提供商
   */
  async getDefaultProvider(): Promise<AIProvider | null> {
    return await this.configStore.getDefaultProvider();
  }

  /**
   * 设置默认提供商
   */
  async setDefaultProvider(provider: AIProvider): Promise<void> {
    await this.configStore.setDefaultProvider(provider);
  }

  /**
   * 获取默认模型
   */
  async getDefaultModel(provider: AIProvider): Promise<string | null> {
    return await this.configStore.getDefaultModel(provider);
  }

  /**
   * 设置默认模型
   */
  async setDefaultModel(provider: AIProvider, model: string): Promise<void> {
    await this.configStore.setDefaultModel(provider, model);
  }

  /**
   * 获取所有聊天会话
   */
  async getAllChatSessions(): Promise<ChatSession[]> {
    return await this.configStore.getAllChatSessions();
  }

  /**
   * 获取聊天会话
   */
  async getChatSession(id: string): Promise<ChatSession | null> {
    return await this.configStore.getChatSession(id);
  }

  /**
   * 删除聊天会话
   */
  async deleteChatSession(id: string): Promise<void> {
    await this.configStore.deleteChatSession(id);
  }

  /**
   * 生成会话标题
   */
  private generateSessionTitle(firstMessage: string): string {
    // 简单的标题生成逻辑
    const title = firstMessage.slice(0, 20);
    return title.length < firstMessage.length ? title + "..." : title;
  }
}

/**
 * 获取AI管理器实例
 */
export function getAIManager(): AIManager {
  return AIManager.getInstance();
}
