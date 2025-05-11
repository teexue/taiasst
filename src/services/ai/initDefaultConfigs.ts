import {
  getAllAiProviders,
  getModelsByProvider,
  getAllPromptTemplates,
  saveAiProviderConfig,
  saveModelConfig,
  savePromptTemplate,
} from "../db/ai";
import {
  DEFAULT_PROVIDERS,
  getDefaultModelsForProvider,
  DEFAULT_PROMPT_TEMPLATES,
} from "./defaultConfigs";
import {
  SUPPORTED_PROVIDERS as PROVIDER_MODULE_SUPPORTED,
  ProviderType,
} from "@/services/ai/providers";

// 使用提供商模块中定义的支持提供商列表
export const SUPPORTED_PROVIDERS = PROVIDER_MODULE_SUPPORTED;

// 辅助函数：检查字符串是否为有效的ProviderType
const isValidProviderType = (provider: string): provider is ProviderType => {
  return SUPPORTED_PROVIDERS.includes(provider as ProviderType);
};

// 初始化状态跟踪
let isInitialized = false;

// 检查并初始化默认配置
export const initializeDefaultConfigs = async (
  options: {
    initProviders?: boolean; // 是否初始化默认提供商
    initModels?: boolean; // 是否初始化默认模型
    initPrompts?: boolean; // 是否初始化默认提示词
  } = {
    initProviders: true,
    initModels: true,
    initPrompts: true,
  },
): Promise<{
  providersAdded: string[];
  modelsAdded: number;
  promptsAdded: number;
}> => {
  // 如果已经初始化过，直接返回
  if (isInitialized) {
    return { providersAdded: [], modelsAdded: 0, promptsAdded: 0 };
  }

  const result = {
    providersAdded: [] as string[],
    modelsAdded: 0,
    promptsAdded: 0,
  };

  try {
    // 1. 检查并初始化默认提供商
    if (options.initProviders) {
      const existingProviders = await getAllAiProviders();
      const existingProviderSet = new Set(existingProviders);

      // 检查并添加未配置的提供商 (只添加已支持的)
      for (const provider of DEFAULT_PROVIDERS) {
        // 只添加已支持的提供商
        if (
          isValidProviderType(provider.provider) &&
          !existingProviderSet.has(provider.provider)
        ) {
          await saveAiProviderConfig(provider.provider, {
            api_key: null,
            base_url: provider.defaultBaseUrl || null,
          });
          result.providersAdded.push(provider.provider);
        }
      }
    }

    // 2. 检查并初始化默认模型
    if (options.initModels) {
      // 获取所有已配置提供商
      const providers = options.initProviders
        ? await getAllAiProviders() // 重新获取，可能包含刚添加的提供商
        : await getAllAiProviders();

      // 过滤出受支持的提供商
      const supportedProviders = providers.filter((p) =>
        isValidProviderType(p),
      );

      // 为每个提供商导入默认模型 (只为支持的提供商导入模型)
      for (const provider of supportedProviders) {
        const existingModels = await getModelsByProvider(provider);
        const existingModelIds = new Set(existingModels.map((m) => m.model_id));

        // 获取默认模型并过滤掉已存在的
        const defaultModels = getDefaultModelsForProvider(provider);

        // 导入新模型
        for (const model of defaultModels) {
          if (!existingModelIds.has(model.model_id)) {
            await saveModelConfig({
              provider: model.provider,
              model_id: model.model_id,
              name: model.name,
              description: model.description,
              enabled: true,
            });
            result.modelsAdded++;
          }
        }
      }
    }

    // 3. 检查并初始化默认提示词
    if (options.initPrompts) {
      const existingTemplates = await getAllPromptTemplates();
      const existingTitles = new Set(existingTemplates.map((t) => t.title));

      // 导入新提示词
      for (const template of DEFAULT_PROMPT_TEMPLATES) {
        if (!existingTitles.has(template.title)) {
          await savePromptTemplate(template);
          result.promptsAdded++;
        }
      }
    }

    // 标记为已初始化
    isInitialized = true;
    return result;
  } catch (error) {
    console.error("初始化默认配置失败:", error);
    throw error;
  }
};

// 仅检查是否需要初始化，不执行实际初始化
export const checkInitializationNeeded = async (): Promise<{
  needsProviderInit: boolean;
  needsModelInit: boolean;
  needsPromptInit: boolean;
}> => {
  try {
    // 检查提供商 - 只考虑支持的提供商
    const existingProviders = await getAllAiProviders();
    const supportedExistingProviders = existingProviders.filter((p) =>
      isValidProviderType(p),
    );
    const needsProviderInit = supportedExistingProviders.length === 0;

    // 检查模型 - 如果至少有一个支持的提供商没有模型，则需要初始化
    let needsModelInit = false;
    if (supportedExistingProviders.length > 0) {
      for (const provider of supportedExistingProviders) {
        const models = await getModelsByProvider(provider);
        if (models.length === 0) {
          needsModelInit = true;
          break;
        }
      }
    }

    // 检查提示词
    const existingTemplates = await getAllPromptTemplates();
    const needsPromptInit = existingTemplates.length === 0;

    return {
      needsProviderInit,
      needsModelInit,
      needsPromptInit,
    };
  } catch (error) {
    console.error("检查初始化状态失败:", error);
    // 出错时建议执行初始化
    return {
      needsProviderInit: true,
      needsModelInit: true,
      needsPromptInit: true,
    };
  }
};
