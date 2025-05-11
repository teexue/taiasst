import { getLocalStorage, setLocalStorage } from "@/store/local";
import {
  getAiProviderConfig,
  getAllAiProviders,
  getAllEnabledModels,
} from "@/services/db/ai"; // 导入数据库配置函数
import {
  createProviderClient,
  streamChatCompletion as providerStreamChatCompletion,
  SUPPORTED_PROVIDERS as PROVIDER_MODULE_SUPPORTED,
  getProviderDisplayName,
} from "./providers/index";

// 更通用的AI配置接口
export interface AiConfig {
  provider: string; // 'openai' 等
  model: string; // 模型ID, e.g., 'gpt-3.5-turbo' (不含provider前缀)
  apiKey?: string | null; // API Key，优先从DB获取
  apiBaseUrl?: string | null; // Base URL，优先从DB获取
  temperature: number;
  maxTokens: number;
}

// 支持的AI服务商及其模型定义
export interface ModelDefinition {
  id: string; // 全局唯一ID, e.g., 'openai/gpt-3.5-turbo'
  name: string; // 用户友好名称
  provider: string; // 'openai'
  providerName: string; // 'OpenAI'
  nativeModelId: string; // 传递给SDK的模型ID, e.g., 'gpt-3.5-turbo'
  // 新增字段，标识是否已配置（前端可检查）
  configured?: boolean;
}

// 预设定义的模型列表 - 作为默认值或在未配置数据库时使用
export const DEFAULT_MODELS: ModelDefinition[] = [
  {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    providerName: "OpenAI",
    nativeModelId: "gpt-3.5-turbo",
  },
  {
    id: "openai/gpt-4",
    name: "GPT-4",
    provider: "openai",
    providerName: "OpenAI",
    nativeModelId: "gpt-4",
  },
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    providerName: "OpenAI",
    nativeModelId: "gpt-4-turbo",
  },
  {
    id: "openai/gpt-4-vision-preview",
    name: "GPT-4 Vision",
    provider: "openai",
    providerName: "OpenAI",
    nativeModelId: "gpt-4-vision-preview",
  },
  // 添加DeepSeek模型
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek Chat",
    provider: "deepseek",
    providerName: "DeepSeek AI",
    nativeModelId: "deepseek-chat",
  },
  {
    id: "deepseek/deepseek-coder",
    name: "DeepSeek Coder",
    provider: "deepseek",
    providerName: "DeepSeek AI",
    nativeModelId: "deepseek-coder",
  },
  // 添加Anthropic模型
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "anthropic",
    providerName: "Anthropic",
    nativeModelId: "claude-3-opus-20240229",
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "anthropic",
    providerName: "Anthropic",
    nativeModelId: "claude-3-sonnet-20240229",
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    providerName: "Anthropic",
    nativeModelId: "claude-3-haiku-20240307",
  },
];

// 从提供商模块导出支持的提供商列表
export const SUPPORTED_PROVIDERS = PROVIDER_MODULE_SUPPORTED;

// 仍需兼容现有的前端API（常量名保持一致，但内容动态获取）
export let AVAILABLE_MODELS: ModelDefinition[] = [...DEFAULT_MODELS];

// 默认AI配置 - provider 和 model 将由用户选择或从持久化配置加载
const DEFAULT_AI_CONFIG: Omit<
  AiConfig,
  "provider" | "model" | "apiKey" | "apiBaseUrl"
> = {
  temperature: 0.7,
  maxTokens: 2000, // 增加默认最大token
};

// 本地存储键名（主要用于前端 UI 状态，核心配置在后端）
const AI_CONFIG_KEY_FRONTEND = "taiasst_ai_config_frontend";

// 保存前端相关的AI配置（例如上次选择的模型，UI偏好等）
export const saveFrontendAiConfig = (config: Partial<AiConfig>): void => {
  const currentConfig = getFrontendAiConfig();
  const newConfig = { ...currentConfig, ...config };
  setLocalStorage(AI_CONFIG_KEY_FRONTEND, JSON.stringify(newConfig));
};

// 获取前端相关的AI配置
export const getFrontendAiConfig = (): Partial<AiConfig> => {
  const savedConfig = getLocalStorage(AI_CONFIG_KEY_FRONTEND);
  if (!savedConfig) {
    return {
      temperature: DEFAULT_AI_CONFIG.temperature,
      maxTokens: DEFAULT_AI_CONFIG.maxTokens,
    };
  }
  try {
    return JSON.parse(savedConfig);
  } catch (e) {
    console.error("解析前端AI配置出错:", e);
    return {
      temperature: DEFAULT_AI_CONFIG.temperature,
      maxTokens: DEFAULT_AI_CONFIG.maxTokens,
    };
  }
};

/**
 * 从数据库加载所有已启用的模型，并与默认模型列表合并
 * 每个已配置的模型会被标记为 configured: true
 */
export const loadConfiguredModels = async (): Promise<ModelDefinition[]> => {
  try {
    // 获取数据库中所有已启用的模型
    const dbModels = await getAllEnabledModels();

    if (dbModels.length === 0) {
      // 数据库中没有配置任何模型，返回默认列表但不标记为已配置
      return [...DEFAULT_MODELS];
    }

    // 获取已配置的提供商列表
    const configuredProviders = await getAllAiProviders();
    const configuredProviderSet = new Set(configuredProviders);

    // 转换数据库模型为ModelDefinition格式
    const configuredModels: ModelDefinition[] = dbModels.map((model: any) => ({
      id: `${model.provider}/${model.model_id}`,
      name: model.name,
      provider: model.provider,
      providerName: getProviderDisplayName(model.provider),
      nativeModelId: model.model_id,
      configured: true,
    }));

    // 合并默认模型列表（只保留未配置的提供商的模型）
    const defaultModelsFiltered = DEFAULT_MODELS.filter(
      (model) => !configuredProviderSet.has(model.provider),
    );

    // 返回已配置模型加上未配置提供商的默认模型
    const result = [...configuredModels, ...defaultModelsFiltered];

    // 更新全局常量以保持兼容性
    AVAILABLE_MODELS = result;

    return result;
  } catch (error) {
    console.error("加载已配置模型失败:", error);
    return [...DEFAULT_MODELS];
  }
};

// 后端配置相关函数 (通过Tauri指令调用)
export const getBackendAiConfig = async (): Promise<Partial<AiConfig>> => {
  try {
    // TODO: 实现Tauri指令 'get_ai_config_from_backend'
    // const config = await invoke<Partial<AiConfig>>('get_ai_config_from_backend');
    // return config;
    console.warn("'getBackendAiConfig' 未完全实现，将返回前端默认值");
    return getFrontendAiConfig(); // 临时返回前端配置
  } catch (error) {
    console.error("从后端获取AI配置失败:", error);
    return getFrontendAiConfig(); // 出错时返回前端配置作为回退
  }
};

export const saveBackendAiConfig = async (
  config: Partial<AiConfig>,
): Promise<void> => {
  try {
    // TODO: 实现Tauri指令 'save_ai_config_to_backend'
    // await invoke('save_ai_config_to_backend', { config });
    console.warn("'saveBackendAiConfig' 未完全实现，配置将仅保存到前端");
    saveFrontendAiConfig(config); // 临时保存到前端
  } catch (error) {
    console.error("保存AI配置到后端失败:", error);
    // 即使后端保存失败，也尝试保存到前端作为一种容错
    saveFrontendAiConfig(config);
  }
};

// 检查API密钥是否已配置 (这个逻辑可能需要调整，取决于后端如何处理密钥)
export const isApiKeyEffectivelyConfigured = async (): Promise<boolean> => {
  // TODO: 后端应提供一个指令检查特定provider的密钥是否有效配置
  // e.g., await invoke<boolean>('check_api_key_status', { provider })
  console.warn(
    "'isApiKeyEffectivelyConfigured' 未完全实现，依赖前端暂存的apiKey",
  );
  const config = getFrontendAiConfig();
  return !!config.apiKey; // 简化：暂时依赖前端存储的API Key
};

// 聊天消息类型定义 (与之前保持一致，但可用于与后端交互)
export interface ChatCompletionMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// 流式AI响应调用 (使用提供商模块实现)
export const streamAiResponse = async (
  provider: string, // 提供商ID，例如 'openai'
  modelId: string, // 模型ID，例如 'gpt-3.5-turbo'
  messages: ChatCompletionMessage[],
  currentConfig: Partial<AiConfig>, // 传入包含temp, tokens的UI配置
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
): Promise<void> => {
  let providerConfig = await getAiProviderConfig(provider);

  if (!providerConfig) {
    console.warn(`未找到 ${provider} 的配置，尝试使用前端临时配置`);
    const frontendConfig = getFrontendAiConfig();
    if (frontendConfig.provider === provider && frontendConfig.apiKey) {
      // 假设 AiProviderConfig 应该包含 provider, api_key, base_url, enabled
      providerConfig = {
        provider: frontendConfig.provider,
        api_key: frontendConfig.apiKey,
        base_url: frontendConfig.apiBaseUrl || null,
        enabled: true,
      } as any; // 暂时用 as any 避免更复杂的类型问题，后续细化
    } else {
      onError(
        new Error(
          `AI provider "${provider}" not configured or API key missing.`,
        ),
      );
      return;
    }
  }

  // 如果providerConfig存在，但apiKey是null/undefined，也尝试从前端获取
  if (providerConfig && !providerConfig.api_key) {
    const frontendConfig = getFrontendAiConfig();
    if (frontendConfig.provider === provider && frontendConfig.apiKey) {
      providerConfig.api_key = frontendConfig.apiKey;
      providerConfig.base_url =
        frontendConfig.apiBaseUrl || providerConfig.base_url || null;
    }
  }

  // 再次检查 API key，并且 providerConfig 不为 null
  if (!providerConfig || !providerConfig.api_key) {
    onError(
      new Error(
        `API key for "${provider}" is still missing or providerConfig is null.`,
      ),
    );
    return;
  }

  const client = await createProviderClient(
    provider,
    providerConfig.api_key,
    providerConfig.base_url || undefined,
  );

  if (!client) {
    onError(
      new Error(`Failed to create AI client for provider "${provider}".`),
    );
    return;
  }

  try {
    await providerStreamChatCompletion(
      client,
      modelId, // 注意：这里应该是nativeModelId
      messages,
      {
        temperature: currentConfig.temperature || DEFAULT_AI_CONFIG.temperature,
        max_tokens: currentConfig.maxTokens || DEFAULT_AI_CONFIG.maxTokens,
      },
      { onChunk, onComplete, onError }, // Pass callbacks as an object
    );
  } catch (error) {
    console.error(`Error streaming AI response from ${provider}:`, error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
};
