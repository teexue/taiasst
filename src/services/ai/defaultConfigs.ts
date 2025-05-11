import { AiModelConfig, AiPromptTemplate } from "../db/ai";
import { ModelDefinition } from "../ai/api";

// 预设AI提供商配置（无敏感信息）
export interface PresetProviderConfig {
  provider: string; // 提供商ID
  providerName: string; // 展示名称
  description?: string; // 提供商描述
  defaultBaseUrl?: string; // 默认API基础URL（可选）
  docUrl?: string; // 文档URL
  supported?: boolean; // 是否已实现支持
}

// 预设AI提供商列表
export const DEFAULT_PROVIDERS: PresetProviderConfig[] = [
  {
    provider: "openai",
    providerName: "OpenAI",
    description: "OpenAI提供的GPT系列大语言模型",
    defaultBaseUrl: "https://api.openai.com/v1",
    docUrl: "https://platform.openai.com/docs/api-reference",
    supported: true,
  },
  {
    provider: "anthropic",
    providerName: "Anthropic",
    description: "Anthropic提供的Claude系列大语言模型",
    defaultBaseUrl: "https://api.anthropic.com",
    docUrl:
      "https://docs.anthropic.com/claude/reference/getting-started-with-the-api",
    supported: false, // 尚未实现
  },
  {
    provider: "deepseek",
    providerName: "DeepSeek AI",
    description: "DeepSeek研发的大语言模型",
    defaultBaseUrl: "https://api.deepseek.com/v1",
    docUrl: "https://platform.deepseek.com",
    supported: true, // 已实现支持
  },
  {
    provider: "moonshot",
    providerName: "Moonshot AI",
    description: "Moonshot AI研发的Kimi系列大语言模型 (即将支持)",
    defaultBaseUrl: "https://api.moonshot.cn/v1",
    docUrl: "https://platform.moonshot.cn/docs",
    supported: false, // 尚未实现
  },
  {
    provider: "baidu",
    providerName: "文心一言",
    description: "百度研发的文心一言大语言模型 (即将支持)",
    defaultBaseUrl:
      "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop",
    docUrl: "https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html",
    supported: false, // 尚未实现
  },
  {
    provider: "zhipu",
    providerName: "智谱 AI",
    description: "智谱AI研发的GLM系列大语言模型 (即将支持)",
    defaultBaseUrl: "https://open.bigmodel.cn/api/paas/v3",
    docUrl: "https://open.bigmodel.cn/dev/api",
    supported: false, // 尚未实现
  },
];

// 支持的提供商列表
export const SUPPORTED_PROVIDERS = DEFAULT_PROVIDERS.filter(
  (p) => p.supported,
).map((p) => p.provider);

// 预设模型配置
export const DEFAULT_MODELS_CONFIG: AiModelConfig[] = [
  // OpenAI模型
  {
    provider: "openai",
    model_id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "适用于大多数任务的平衡模型，具有较好的性能与价格比",
    enabled: true,
  },
  {
    provider: "openai",
    model_id: "gpt-4",
    name: "GPT-4",
    description: "比GPT-3.5更强大的模型，适合复杂任务",
    enabled: true,
  },
  {
    provider: "openai",
    model_id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "GPT-4的改进版本，具有更好的性能和更快的响应速度",
    enabled: true,
  },
  {
    provider: "openai",
    model_id: "gpt-4-vision-preview",
    name: "GPT-4 Vision",
    description: "支持图像理解的GPT-4版本",
    enabled: true,
  },

  // Anthropic模型
  {
    provider: "anthropic",
    model_id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    description: "Claude 3系列中最强大的模型，适合复杂和创意任务",
    enabled: true,
  },
  {
    provider: "anthropic",
    model_id: "claude-3-sonnet-20240229",
    name: "Claude 3 Sonnet",
    description: "Claude 3系列中平衡性能和速度的中端模型",
    enabled: true,
  },
  {
    provider: "anthropic",
    model_id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    description: "Claude 3系列中最快速的模型，适合简单任务和实时应用",
    enabled: true,
  },

  // DeepSeek模型
  {
    provider: "deepseek",
    model_id: "deepseek-chat",
    name: "DeepSeek Chat",
    description: "DeepSeek研发的通用对话大模型",
    enabled: true,
  },
  {
    provider: "deepseek",
    model_id: "deepseek-reasoner",
    name: "DeepSeek R1",
    description: "专注于代码生成和理解的大模型",
    enabled: true,
  },

  // 文心一言模型
  {
    provider: "baidu",
    model_id: "ernie-bot-4",
    name: "文心一言4.0",
    description: "百度最新一代预训练语言模型",
    enabled: true,
  },
  {
    provider: "baidu",
    model_id: "ernie-bot",
    name: "文心一言",
    description: "百度基础大语言模型",
    enabled: true,
  },

  // 智谱AI模型
  {
    provider: "zhipu",
    model_id: "glm-4",
    name: "GLM-4",
    description: "智谱AI最强大的大语言模型",
    enabled: true,
  },
  {
    provider: "zhipu",
    model_id: "glm-3-turbo",
    name: "GLM-3-Turbo",
    description: "智谱AI性能均衡的大语言模型",
    enabled: true,
  },

  // Moonshot模型
  {
    provider: "moonshot",
    model_id: "moonshot-v1-8k",
    name: "Kimi-v1-8k",
    description: "Moonshot AI的基础大语言模型",
    enabled: true,
  },
  {
    provider: "moonshot",
    model_id: "moonshot-v1-32k",
    name: "Kimi-v1-32k",
    description: "支持32k上下文的Kimi大语言模型",
    enabled: true,
  },
  {
    provider: "moonshot",
    model_id: "moonshot-v1-128k",
    name: "Kimi-v1-128k",
    description: "支持128k超长上下文的Kimi大语言模型",
    enabled: true,
  },
];

// 预设提示词模板
export const DEFAULT_PROMPT_TEMPLATES: AiPromptTemplate[] = [
  // 通用提示词
  {
    title: "详细解释概念",
    content:
      "请详细解释以下概念，包括其定义、历史、应用和重要性：\n\n{{概念名称}}",
    category: "通用",
    is_favorite: false,
  },
  {
    title: "比较分析",
    content:
      "请对以下几个选项进行详细的比较分析，包括各自的优缺点、适用场景和主要区别：\n\n{{选项列表}}",
    category: "通用",
    is_favorite: false,
  },
  {
    title: "提供建议",
    content:
      "我需要关于以下问题的建议和推荐：\n\n{{问题描述}}\n\n请考虑不同的解决方案，并解释每种方案的优缺点。",
    category: "通用",
    is_favorite: false,
  },

  // 写作提示词
  {
    title: "润色文章",
    content:
      "请帮我润色以下文章，提高其表达质量、逻辑连贯性和整体可读性，但保持原始含义不变：\n\n{{文章内容}}",
    category: "写作",
    is_favorite: false,
  },
  {
    title: "生成大纲",
    content:
      "请为以下主题生成一个详细的文章大纲，包括引言、主要部分和结论：\n\n主题：{{主题}}\n目标读者：{{目标读者}}\n预期长度：{{预期长度}}",
    category: "写作",
    is_favorite: false,
  },
  {
    title: "改写文本",
    content:
      "请将以下文本改写为{{风格}}风格，保持原意但使用不同的表达方式：\n\n{{原文本}}",
    category: "写作",
    is_favorite: false,
  },

  // 编程提示词
  {
    title: "代码实现",
    content:
      "请使用{{编程语言}}实现以下功能：\n\n{{功能描述}}\n\n要求：\n1. 代码要简洁高效\n2. 包含适当的注释\n3. 处理可能的异常情况",
    category: "编程",
    is_favorite: false,
  },
  {
    title: "优化代码",
    content:
      "请优化以下{{编程语言}}代码，提高其性能、可读性和维护性：\n\n```{{编程语言}}\n{{代码}}\n```",
    category: "编程",
    is_favorite: true,
  },
  {
    title: "代码解释",
    content:
      "请详细解释以下代码的功能和工作原理：\n\n```{{编程语言}}\n{{代码}}\n```",
    category: "编程",
    is_favorite: false,
  },
  {
    title: "生成单元测试",
    content:
      "请为以下{{编程语言}}代码生成完整的单元测试：\n\n```{{编程语言}}\n{{代码}}\n```\n\n要求测试覆盖主要功能和边界情况。",
    category: "编程",
    is_favorite: true,
  },

  // 翻译提示词
  {
    title: "中英互译",
    content:
      "请将以下{{源语言}}文本翻译成{{目标语言}}，保持原文的风格和意思：\n\n{{文本}}",
    category: "翻译",
    is_favorite: false,
  },
  {
    title: "专业领域翻译",
    content:
      "请将以下{{专业领域}}相关的{{源语言}}文本翻译成{{目标语言}}，确保专业术语的准确性：\n\n{{文本}}",
    category: "翻译",
    is_favorite: false,
  },

  // 学习教育提示词
  {
    title: "知识讲解",
    content:
      "请以{{难度级别}}的水平讲解以下{{学科}}概念，使其易于理解：\n\n{{概念}}",
    category: "教育",
    is_favorite: false,
  },
  {
    title: "生成测验题",
    content:
      "请根据以下主题生成{{数量}}道{{难度级别}}的{{题型}}测验题，并提供答案：\n\n主题：{{主题}}",
    category: "教育",
    is_favorite: false,
  },
];

// 从预设中导入供应商和模型配置的辅助函数
export const getProvidersWithModels = (): {
  providers: PresetProviderConfig[];
  modelsByProvider: Record<string, AiModelConfig[]>;
} => {
  // 按提供商对模型进行分组
  const modelsByProvider: Record<string, AiModelConfig[]> = {};

  for (const model of DEFAULT_MODELS_CONFIG) {
    if (!modelsByProvider[model.provider]) {
      modelsByProvider[model.provider] = [];
    }
    modelsByProvider[model.provider].push(model);
  }

  return {
    providers: DEFAULT_PROVIDERS,
    modelsByProvider,
  };
};

// 根据提供商获取其默认模型配置
export const getDefaultModelsForProvider = (
  provider: string,
): AiModelConfig[] => {
  return DEFAULT_MODELS_CONFIG.filter((model) => model.provider === provider);
};

// 获取所有预设提示词模板，可按分类筛选
export const getDefaultPromptTemplates = (
  category?: string,
): AiPromptTemplate[] => {
  if (!category) {
    return DEFAULT_PROMPT_TEMPLATES;
  }
  return DEFAULT_PROMPT_TEMPLATES.filter(
    (template) => template.category === category,
  );
};

// 将现有的ModelDefinition转换为AiModelConfig
export const convertModelDefinitionsToConfigs = (
  models: ModelDefinition[],
): AiModelConfig[] => {
  return models.map((model) => ({
    provider: model.provider,
    model_id: model.nativeModelId,
    name: model.name,
    description: `${model.name} - ${model.providerName}默认模型`,
    enabled: true,
  }));
};
