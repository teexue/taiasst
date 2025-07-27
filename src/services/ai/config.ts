/**
 * AI配置存储服务
 */

import { execute, select } from "@/services/db/index";
import { error, info } from "@tauri-apps/plugin-log";
import {
  AIConfigStore,
  AIProvider,
  AIProviderConfig,
  ChatSession,
  DEFAULT_AI_PROVIDERS,
} from "./types";
import { v4 as uuidv4 } from "uuid";

/**
 * AI配置存储实现
 */
export class AIConfigStoreImpl implements AIConfigStore {
  private static instance: AIConfigStoreImpl;

  private constructor() {}

  static getInstance(): AIConfigStoreImpl {
    if (!AIConfigStoreImpl.instance) {
      AIConfigStoreImpl.instance = new AIConfigStoreImpl();
    }
    return AIConfigStoreImpl.instance;
  }

  // 提供商配置管理
  async getProviderConfig(
    provider: AIProvider,
  ): Promise<AIProviderConfig | null> {
    try {
      const rows = await select<any>(
        "SELECT * FROM ai_provider_configs WHERE provider = ?",
        [provider],
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      const defaultConfig = DEFAULT_AI_PROVIDERS.find(
        (p) => p.provider === provider,
      );

      return {
        ...defaultConfig!,
        apiKey: row.api_key,
        baseUrl: row.base_url || defaultConfig?.baseUrl,
        enabled: Boolean(row.enabled),
      };
    } catch (err) {
      error(`获取AI提供商配置失败: ${String(err)}`);
      return null;
    }
  }

  async setProviderConfig(config: AIProviderConfig): Promise<void> {
    try {
      await execute(
        `INSERT OR REPLACE INTO ai_provider_configs 
         (provider, api_key, base_url, enabled, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          config.provider,
          config.apiKey || null,
          config.baseUrl || null,
          config.enabled ? 1 : 0,
          Date.now(),
        ],
      );

      info(`AI提供商配置已保存: ${config.provider}`);
    } catch (err) {
      error(`保存AI提供商配置失败: ${String(err)}`);
      throw err;
    }
  }

  async getAllProviderConfigs(): Promise<AIProviderConfig[]> {
    try {
      const rows = await select<any>("SELECT * FROM ai_provider_configs");
      const configs: AIProviderConfig[] = [];

      for (const defaultConfig of DEFAULT_AI_PROVIDERS) {
        const row = rows.find((r) => r.provider === defaultConfig.provider);

        configs.push({
          ...defaultConfig,
          apiKey: row?.api_key || undefined,
          baseUrl: row?.base_url || defaultConfig.baseUrl,
          enabled: row ? Boolean(row.enabled) : false,
        });
      }

      return configs;
    } catch (err) {
      error(`获取所有AI提供商配置失败: ${String(err)}`);
      return DEFAULT_AI_PROVIDERS.map((config) => ({
        ...config,
        enabled: false,
      }));
    }
  }

  // 默认设置管理
  async getDefaultProvider(): Promise<AIProvider | null> {
    try {
      const rows = await select<{ value: string }>(
        "SELECT value FROM ai_settings WHERE key = 'default_provider'",
      );
      return rows.length > 0 ? (rows[0].value as AIProvider) : null;
    } catch (err) {
      error(`获取默认AI提供商失败: ${String(err)}`);
      return null;
    }
  }

  async setDefaultProvider(provider: AIProvider): Promise<void> {
    try {
      await execute(
        "INSERT OR REPLACE INTO ai_settings (key, value, updated_at) VALUES (?, ?, ?)",
        ["default_provider", provider, Date.now()],
      );
    } catch (err) {
      error(`设置默认AI提供商失败: ${String(err)}`);
      throw err;
    }
  }

  async getDefaultModel(provider: AIProvider): Promise<string | null> {
    try {
      const rows = await select<{ value: string }>(
        "SELECT value FROM ai_settings WHERE key = ?",
        [`default_model_${provider}`],
      );
      return rows.length > 0 ? rows[0].value : null;
    } catch (err) {
      error(`获取默认模型失败: ${String(err)}`);
      return null;
    }
  }

  async setDefaultModel(provider: AIProvider, model: string): Promise<void> {
    try {
      await execute(
        "INSERT OR REPLACE INTO ai_settings (key, value, updated_at) VALUES (?, ?, ?)",
        [`default_model_${provider}`, model, Date.now()],
      );
    } catch (err) {
      error(`设置默认模型失败: ${String(err)}`);
      throw err;
    }
  }

  // 聊天会话管理
  async getChatSession(id: string): Promise<ChatSession | null> {
    try {
      const rows = await select<any>(
        "SELECT * FROM ai_chat_sessions WHERE id = ?",
        [id],
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        title: row.title,
        messages: JSON.parse(row.messages || "[]"),
        provider: row.provider,
        model: row.model,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (err) {
      error(`获取聊天会话失败: ${String(err)}`);
      return null;
    }
  }

  async saveChatSession(session: ChatSession): Promise<void> {
    try {
      await execute(
        `INSERT OR REPLACE INTO ai_chat_sessions 
         (id, title, messages, provider, model, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          session.id,
          session.title,
          JSON.stringify(session.messages),
          session.provider,
          session.model,
          session.createdAt,
          session.updatedAt,
        ],
      );
    } catch (err) {
      error(`保存聊天会话失败: ${String(err)}`);
      throw err;
    }
  }

  async getAllChatSessions(): Promise<ChatSession[]> {
    try {
      const rows = await select<any>(
        "SELECT * FROM ai_chat_sessions ORDER BY updated_at DESC",
      );

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        messages: JSON.parse(row.messages || "[]"),
        provider: row.provider,
        model: row.model,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      error(`获取所有聊天会话失败: ${String(err)}`);
      return [];
    }
  }

  async deleteChatSession(id: string): Promise<void> {
    try {
      await execute("DELETE FROM ai_chat_sessions WHERE id = ?", [id]);
    } catch (err) {
      error(`删除聊天会话失败: ${String(err)}`);
      throw err;
    }
  }
}

/**
 * 创建新的聊天会话
 */
export function createNewChatSession(
  title: string,
  provider: AIProvider,
  model: string,
): ChatSession {
  return {
    id: uuidv4(),
    title,
    messages: [],
    provider,
    model,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * 获取AI配置存储实例
 */
export function getAIConfigStore(): AIConfigStore {
  return AIConfigStoreImpl.getInstance();
}
