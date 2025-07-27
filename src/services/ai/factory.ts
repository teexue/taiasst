/**
 * AI服务工厂
 */

import {
  IAIService,
  IAIServiceFactory,
  AIProvider,
  AIProviderConfig,
  AIServiceError,
} from "./types";

import { OpenAIService } from "./providers/openai";
import { ClaudeService } from "./providers/claude";
import { QianwenService } from "./providers/qianwen";
import { DeepSeekService } from "./providers/deepseek";
import { OllamaService } from "./providers/ollama";

/**
 * AI服务工厂实现
 */
export class AIServiceFactory implements IAIServiceFactory {
  private static instance: AIServiceFactory;
  private services: Map<AIProvider, IAIService> = new Map();

  private constructor() {}

  static getInstance(): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory();
    }
    return AIServiceFactory.instance;
  }

  createService(provider: AIProvider, config: AIProviderConfig): IAIService {
    // 检查是否已存在服务实例
    const existingService = this.services.get(provider);
    if (existingService) {
      return existingService;
    }

    let service: IAIService;

    switch (provider) {
      case "openai":
        service = new OpenAIService(config);
        break;
      case "claude":
        service = new ClaudeService(config);
        break;
      case "qianwen":
        service = new QianwenService(config);
        break;
      case "deepseek":
        service = new DeepSeekService(config);
        break;
      case "ollama":
        service = new OllamaService(config);
        break;
      default:
        throw new AIServiceError(`不支持的AI提供商: ${provider}`, provider);
    }

    // 缓存服务实例
    this.services.set(provider, service);
    return service;
  }

  getSupportedProviders(): AIProvider[] {
    return ["openai", "claude", "qianwen", "deepseek", "ollama"];
  }

  /**
   * 清除缓存的服务实例
   */
  clearCache(provider?: AIProvider): void {
    if (provider) {
      this.services.delete(provider);
    } else {
      this.services.clear();
    }
  }

  /**
   * 获取已缓存的服务实例
   */
  getCachedService(provider: AIProvider): IAIService | undefined {
    return this.services.get(provider);
  }
}

/**
 * 获取AI服务工厂单例
 */
export function getAIServiceFactory(): AIServiceFactory {
  return AIServiceFactory.getInstance();
}
