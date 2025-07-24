/**
 * AI服务类型定义
 */

// AI消息类型
export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// AI提供商类型
export type AIProvider =
  | "openai"
  | "claude"
  | "qianwen"
  | "ollama"
  | "deepseek";

// AI模型配置
export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description?: string;
  maxTokens?: number;
  supportStream?: boolean;
}

// AI提供商配置
export interface AIProviderConfig {
  provider: AIProvider;
  name: string;
  description: string;
  apiKey?: string;
  baseUrl?: string;
  models: AIModel[];
  enabled: boolean;
  icon: string;
  color: string;
}

// AI请求参数
export interface AIRequestParams {
  messages: AIMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// AI响应回调
export interface AIResponseCallbacks {
  onStart?: () => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

// AI服务接口
export interface IAIService {
  readonly provider: AIProvider;
  readonly name: string;

  // 检查配置是否有效
  validateConfig(config: AIProviderConfig): Promise<boolean>;

  // 获取可用模型列表
  getModels(): Promise<AIModel[]>;

  // 发送聊天请求
  chat(params: AIRequestParams, callbacks: AIResponseCallbacks): Promise<void>;

  // 测试连接
  testConnection(): Promise<boolean>;
}

// AI服务工厂接口
export interface IAIServiceFactory {
  createService(provider: AIProvider, config: AIProviderConfig): IAIService;
  getSupportedProviders(): AIProvider[];
}

// 聊天会话
export interface ChatSession {
  id: string;
  title: string;
  messages: AIMessage[];
  provider: AIProvider;
  model: string;
  createdAt: number;
  updatedAt: number;
}

// AI配置存储接口
export interface AIConfigStore {
  // 提供商配置
  getProviderConfig(provider: AIProvider): Promise<AIProviderConfig | null>;
  setProviderConfig(config: AIProviderConfig): Promise<void>;
  getAllProviderConfigs(): Promise<AIProviderConfig[]>;

  // 默认设置
  getDefaultProvider(): Promise<AIProvider | null>;
  setDefaultProvider(provider: AIProvider): Promise<void>;
  getDefaultModel(provider: AIProvider): Promise<string | null>;
  setDefaultModel(provider: AIProvider, model: string): Promise<void>;

  // 聊天会话
  getChatSession(id: string): Promise<ChatSession | null>;
  saveChatSession(session: ChatSession): Promise<void>;
  getAllChatSessions(): Promise<ChatSession[]>;
  deleteChatSession(id: string): Promise<void>;
}

// 默认AI提供商配置
export const DEFAULT_AI_PROVIDERS: Omit<
  AIProviderConfig,
  "apiKey" | "enabled"
>[] = [
  {
    provider: "openai",
    name: "OpenAI",
    description: "OpenAI GPT系列模型",
    baseUrl: "https://api.openai.com/v1",
    icon: "RiOpenaiLine",
    color: "green",
    models: [
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        description: "快速、经济的对话模型",
        maxTokens: 4096,
        supportStream: true,
      },
      {
        id: "gpt-4",
        name: "GPT-4",
        provider: "openai",
        description: "更强大的推理能力",
        maxTokens: 8192,
        supportStream: true,
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        provider: "openai",
        description: "最新的GPT-4模型",
        maxTokens: 128000,
        supportStream: true,
      },
    ],
  },
  {
    provider: "claude",
    name: "Anthropic Claude",
    description: "Anthropic Claude系列模型",
    baseUrl: "https://api.anthropic.com",
    icon: "RiRobot2Line",
    color: "orange",
    models: [
      {
        id: "claude-3-haiku-20240307",
        name: "Claude 3 Haiku",
        provider: "claude",
        description: "快速、轻量的模型",
        maxTokens: 200000,
        supportStream: true,
      },
      {
        id: "claude-3-sonnet-20240229",
        name: "Claude 3 Sonnet",
        provider: "claude",
        description: "平衡性能和速度",
        maxTokens: 200000,
        supportStream: true,
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        provider: "claude",
        description: "最强大的推理能力",
        maxTokens: 200000,
        supportStream: true,
      },
    ],
  },
  {
    provider: "qianwen",
    name: "通义千问",
    description: "阿里云通义千问大模型",
    baseUrl: "https://dashscope.aliyuncs.com/api/v1",
    icon: "RiAlipayLine",
    color: "blue",
    models: [
      {
        id: "qwen-turbo",
        name: "通义千问-Turbo",
        provider: "qianwen",
        description: "快速响应模型",
        maxTokens: 8192,
        supportStream: true,
      },
      {
        id: "qwen-plus",
        name: "通义千问-Plus",
        provider: "qianwen",
        description: "增强版模型",
        maxTokens: 32768,
        supportStream: true,
      },
      {
        id: "qwen-max",
        name: "通义千问-Max",
        provider: "qianwen",
        description: "最强性能模型",
        maxTokens: 32768,
        supportStream: true,
      },
    ],
  },
  {
    provider: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek大模型",
    baseUrl: "https://api.deepseek.com/v1",
    icon: "RiEyeLine",
    color: "purple",
    models: [
      {
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        provider: "deepseek",
        description: "对话模型",
        maxTokens: 32768,
        supportStream: true,
      },
      {
        id: "deepseek-coder",
        name: "DeepSeek Coder",
        provider: "deepseek",
        description: "代码生成模型",
        maxTokens: 32768,
        supportStream: true,
      },
    ],
  },
  {
    provider: "ollama",
    name: "Ollama",
    description: "本地部署的开源模型",
    baseUrl: "http://localhost:11434",
    icon: "RiComputerLine",
    color: "gray",
    models: [
      {
        id: "llama2",
        name: "Llama 2",
        provider: "ollama",
        description: "Meta开源模型",
        maxTokens: 4096,
        supportStream: true,
      },
      {
        id: "codellama",
        name: "Code Llama",
        provider: "ollama",
        description: "代码生成模型",
        maxTokens: 4096,
        supportStream: true,
      },
      {
        id: "mistral",
        name: "Mistral",
        provider: "ollama",
        description: "高效的开源模型",
        maxTokens: 8192,
        supportStream: true,
      },
    ],
  },
];

// 错误类型
export class AIServiceError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}
