import {
  ChatCompletionMessage,
  AiConfig,
  streamAiResponse,
  getFrontendAiConfig,
  saveFrontendAiConfig,
  AVAILABLE_MODELS,
  DEFAULT_MODELS,
  SUPPORTED_PROVIDERS,
} from "./api"; // Updated path

import { getAiProviderConfig } from "@/services/db/ai"; // Updated path

// 聊天消息接口
export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

// 聊天错误接口
export interface ChatError {
  message: string;
  code?: string;
  details?: any;
}

// 创建聊天消息辅助函数
export const createChatMessage = (
  text: string,
  sender: "user" | "ai",
): ChatMessage => {
  return {
    id: crypto.randomUUID(),
    text,
    sender,
    timestamp: new Date(),
  };
};

// 获取AI响应流函数
export const getAiResponseStream = async (
  message: string,
  history: ChatMessage[],
  config: Partial<AiConfig>,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: ChatError) => void,
): Promise<void> => {
  if (!config.provider || !config.model) {
    onError({ message: "AI提供商或模型未配置" });
    return;
  }

  try {
    // 将ChatMessage[]转换为ChatCompletionMessage[]
    const apiMessages: ChatCompletionMessage[] = [];

    // 检查是否使用DeepSeek Reasoner模型
    const isDeepSeekReasoner =
      config.provider === "deepseek" &&
      (config.model === "deepseek-reasoner" ||
        config.model?.includes("reasoner"));

    // 添加系统提示词
    const systemMessageText =
      "你是一个有用的AI助手。回答问题时要清晰简洁，如果不知道答案，请诚实地说出来而不是编造信息。";
    apiMessages.push({ role: "system", content: systemMessageText });

    // 处理历史消息
    if (isDeepSeekReasoner) {
      // 对于DeepSeek Reasoner，我们需要确保第一条非系统消息是用户消息
      let foundFirstUserMessage = false;
      let processedMessages: ChatCompletionMessage[] = [];

      // 首先找到第一条用户消息
      for (const msg of history) {
        if (msg.sender === "user") {
          processedMessages.push({ role: "user", content: msg.text });
          foundFirstUserMessage = true;
        } else if (msg.sender === "ai" && foundFirstUserMessage) {
          // 只有在找到第一条用户消息后，才添加AI消息
          processedMessages.push({ role: "assistant", content: msg.text });
        }
      }

      // 将处理过的消息添加到API消息数组
      apiMessages.push(...processedMessages);
    } else {
      // 对于其他模型，直接添加所有历史消息
      for (const msg of history) {
        if (msg.sender === "user") {
          apiMessages.push({ role: "user", content: msg.text });
        } else if (msg.sender === "ai") {
          apiMessages.push({ role: "assistant", content: msg.text });
        }
      }
    }

    // 添加当前用户消息
    apiMessages.push({ role: "user", content: message });

    // 调用API进行流式响应
    await streamAiResponse(
      config.provider,
      config.model,
      apiMessages,
      config,
      onChunk,
      onComplete,
      (error: Error) => onError({ message: error.message }),
    );
  } catch (error) {
    console.error("获取AI响应流失败:", error);
    if (error instanceof Error) {
      onError({ message: error.message });
    } else {
      onError({ message: "获取AI响应时出现未知错误" });
    }
  }
};

// 聊天记录类型定义
export interface ChatHistory {
  id: string; // 聊天ID
  title: string; // 聊天标题
  messages: ChatCompletionMessage[]; // 聊天消息
  config?: Partial<AiConfig>; // 使用的AI配置
  createdAt: number; // 创建时间
  updatedAt: number; // 更新时间
}

// 聊天过程状态
export type ChatState = "idle" | "streaming" | "error";

// 获取默认系统提示词
export const getDefaultSystemPrompt = (): string => {
  return "你是一个有用的AI助手。回答问题时要清晰简洁，如果不知道答案，请诚实地说出来而不是编造信息。";
};

// 为聊天创建一个基本的系统消息
export const createSystemMessage = (
  content: string = getDefaultSystemPrompt(),
): ChatCompletionMessage => {
  return {
    role: "system",
    content,
  };
};

// 创建一个新的用户消息
export const createUserMessage = (content: string): ChatCompletionMessage => {
  return {
    role: "user",
    content,
  };
};

// 创建一个新的AI助手消息
export const createAssistantMessage = (
  content: string,
): ChatCompletionMessage => {
  return {
    role: "assistant",
    content,
  };
};

// 创建一个新的聊天记录
export const createNewChat = (
  title: string,
  systemPrompt: string = getDefaultSystemPrompt(),
): ChatHistory => {
  const timestamp = Date.now();
  return {
    id: `chat_${timestamp}`,
    title,
    messages: [createSystemMessage(systemPrompt)],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

// 示例：使用新的模块化提供商架构发送消息
export const sendMessage = async (
  chatHistory: ChatHistory,
  message: string,
  callbacks: {
    onStart: () => void;
    onChunk: (chunk: string) => void;
    onComplete: (fullResponse: string) => void;
    onError: (error: Error) => void;
  },
): Promise<ChatHistory> => {
  try {
    const { onStart, onChunk, onComplete, onError } = callbacks;

    // 添加用户消息到历史
    const updatedHistory = {
      ...chatHistory,
      messages: [...chatHistory.messages, createUserMessage(message)],
      updatedAt: Date.now(),
    };

    // 获取AI配置
    let config = chatHistory.config || getFrontendAiConfig();

    // 如果没有指定提供商或模型，使用默认值或第一个可用模型
    if (!config.provider || !config.model) {
      // 优先选择已支持的提供商
      const provider = SUPPORTED_PROVIDERS[0];

      // 找到该提供商的第一个模型
      const model =
        AVAILABLE_MODELS.find((m) => m.provider === provider)?.nativeModelId ||
        DEFAULT_MODELS.find((m) => m.provider === provider)?.nativeModelId;

      if (provider && model) {
        config = { ...config, provider, model };
        saveFrontendAiConfig({ provider, model }); // 保存为默认配置
      } else {
        throw new Error("无法找到可用的AI模型");
      }
    }

    onStart();

    // 创建空的助手回复占位
    let assistantResponse = "";
    const assistantMessage = createAssistantMessage(assistantResponse);
    updatedHistory.messages.push(assistantMessage);

    // 使用流式API获取响应
    await streamAiResponse(
      config.provider!,
      config.model!,
      updatedHistory.messages.slice(0, -1), // 不包含空的助手消息
      config,
      (chunk) => {
        assistantResponse += chunk;
        onChunk(chunk);
        // 更新助手消息内容
        assistantMessage.content = assistantResponse;
      },
      () => {
        onComplete(assistantResponse);
      },
      (error) => {
        onError(error);
      },
    );

    // 更新聊天历史
    const finalHistory = {
      ...updatedHistory,
      messages: [...updatedHistory.messages.slice(0, -1), assistantMessage],
      updatedAt: Date.now(),
    };

    return finalHistory;
  } catch (error) {
    console.error("发送消息失败:", error);
    if (error instanceof Error) {
      callbacks.onError(error);
    } else {
      callbacks.onError(new Error("发送消息时出现未知错误"));
    }
    return chatHistory;
  }
};

// 检查提供商是否已配置API密钥
export const isProviderConfigured = async (
  provider: string,
): Promise<boolean> => {
  try {
    const config = await getAiProviderConfig(provider);
    return !!config?.api_key;
  } catch (error) {
    console.error(`检查提供商 ${provider} 配置失败:`, error);
    return false;
  }
};
