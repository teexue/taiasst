import { ChatCompletionMessage } from "../api";
import OriginalOpenAI from "openai"; // Renamed to avoid conflict if any

// OpenAI specific types and functions (formerly from openai.ts)
export type OpenAIClient = OriginalOpenAI;

export const createOpenAIClient = (
  apiKey: string,
  baseURL?: string,
): OpenAIClient => {
  return new OriginalOpenAI({
    apiKey,
    baseURL: baseURL || undefined,
    dangerouslyAllowBrowser: true,
  });
};

export const streamOpenAIChatCompletion = async (
  client: OpenAIClient,
  modelId: string,
  messages: ChatCompletionMessage[],
  options: {
    temperature?: number;
    max_tokens?: number;
  },
  callbacks: StreamCallbacks,
): Promise<void> => {
  try {
    const { onChunk, onComplete } = callbacks;
    const streamParams: OriginalOpenAI.Chat.ChatCompletionCreateParamsStreaming =
      {
        model: modelId,
        messages: messages as any, // OpenAI SDK might need specific type
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        stream: true,
      };
    const stream = await client.chat.completions.create(streamParams);
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }
    onComplete();
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    if (error instanceof Error) {
      callbacks.onError(error);
    } else {
      callbacks.onError(new Error("Unknown error calling OpenAI API"));
    }
  }
};

export const validateOpenAIConfiguration = async (
  client: OpenAIClient,
): Promise<boolean> => {
  try {
    await client.models.list();
    return true;
  } catch (error) {
    console.error("Failed to validate OpenAI configuration:", error);
    return false;
  }
};

// DeepSeek specific types and functions (formerly from deepseek.ts)
export type DeepSeekClient = OriginalOpenAI; // DeepSeek uses OpenAI compatible client

interface DeepSeekResponseChunk {
  choices: {
    delta: {
      content?: string;
      reasoning_content?: string;
    };
  }[];
}

export const createDeepSeekClient = (
  apiKey: string,
  baseURL?: string,
): DeepSeekClient => {
  return new OriginalOpenAI({
    apiKey,
    baseURL: baseURL || "https://api.deepseek.com/v1",
    dangerouslyAllowBrowser: true,
  });
};

export const streamDeepSeekChatCompletion = async (
  client: DeepSeekClient,
  modelId: string,
  messages: ChatCompletionMessage[],
  options: {
    temperature?: number;
    max_tokens?: number;
  },
  callbacks: StreamCallbacks,
): Promise<void> => {
  try {
    const { onChunk, onComplete } = callbacks;
    const isReasonerModel = modelId.includes("reasoner");

    if (isReasonerModel) {
      const requestBody = {
        model: modelId,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        stream: true,
      };
      const response = await fetch(`${client.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${client.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `DeepSeek API request failed: ${response.status} ${errorText}`,
        );
      }
      if (!response.body) {
        throw new Error("DeepSeek API returned empty response body");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let reasoningContent = "";
      let finalContent = "";
      let isFirstChunk = true;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.trim() === "" || line.trim() === "data: [DONE]") continue;
          if (line.startsWith("data: ")) {
            try {
              const json = JSON.parse(
                line.substring(6),
              ) as DeepSeekResponseChunk;
              const reasoningChunk = json.choices[0]?.delta?.reasoning_content;
              if (reasoningChunk) {
                if (isFirstChunk && reasoningChunk.trim()) {
                  onChunk("🤔 **思考过程**：\n\n");
                  isFirstChunk = false;
                }
                reasoningContent += reasoningChunk;
                onChunk(reasoningChunk);
              }
              const contentChunk = json.choices[0]?.delta?.content;
              if (contentChunk) {
                if (finalContent === "" && reasoningContent !== "") {
                  onChunk("\n\n✅ **最终答案**：\n\n");
                }
                finalContent += contentChunk;
                onChunk(contentChunk);
              }
            } catch (e) {
              console.warn("Failed to parse DeepSeek JSON response:", e);
            }
          }
        }
      }
      onComplete();
      return;
    }

    const streamParams: OriginalOpenAI.Chat.ChatCompletionCreateParamsStreaming =
      {
        model: modelId,
        messages: messages as any, // OpenAI SDK might need specific type
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        stream: true,
      };
    const stream = await client.chat.completions.create(streamParams);
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }
    onComplete();
  } catch (error) {
    console.error("DeepSeek API call failed:", error);
    if (error instanceof Error) {
      callbacks.onError(error);
    } else {
      callbacks.onError(new Error("Unknown error calling DeepSeek API"));
    }
  }
};

export const validateDeepSeekConfiguration = async (
  client: DeepSeekClient,
): Promise<boolean> => {
  try {
    await client.models.list();
    return true;
  } catch (error) {
    console.error("Failed to validate DeepSeek configuration:", error);
    return false;
  }
};

// Common provider types and functions
export type ProviderType = "openai" | "deepseek";

export type AiProviderClient =
  | { type: "openai"; client: OpenAIClient }
  | { type: "deepseek"; client: DeepSeekClient };

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export const SUPPORTED_PROVIDERS: ProviderType[] = ["openai", "deepseek"];

export const createProviderClient = async (
  provider: string,
  apiKey: string,
  baseURL?: string,
): Promise<AiProviderClient> => {
  switch (provider) {
    case "openai":
      return {
        type: "openai",
        client: createOpenAIClient(apiKey, baseURL),
      };
    case "deepseek":
      return {
        type: "deepseek",
        client: createDeepSeekClient(apiKey, baseURL),
      };
    default:
      throw new Error(`Provider "${provider}" is not supported yet.`);
  }
};

export const streamChatCompletion = async (
  clientWrapper: AiProviderClient,
  modelId: string,
  messages: ChatCompletionMessage[],
  options: {
    temperature?: number;
    max_tokens?: number;
  },
  callbacks: StreamCallbacks,
): Promise<void> => {
  switch (clientWrapper.type) {
    case "openai":
      return streamOpenAIChatCompletion(
        // Use the inlined function
        clientWrapper.client,
        modelId,
        messages,
        options,
        callbacks,
      );
    case "deepseek":
      return streamDeepSeekChatCompletion(
        // Use the inlined function
        clientWrapper.client,
        modelId,
        messages,
        options,
        callbacks,
      );
  }
};

export const validateConfiguration = async (
  clientWrapper: AiProviderClient,
): Promise<boolean> => {
  switch (clientWrapper.type) {
    case "openai":
      return validateOpenAIConfiguration(clientWrapper.client); // Use the inlined function
    case "deepseek":
      return validateDeepSeekConfiguration(clientWrapper.client); // Use the inlined function
    default:
      return false;
  }
};

export const getProviderDisplayName = (provider: string): string => {
  switch (provider) {
    case "openai":
      return "OpenAI";
    case "deepseek":
      return "DeepSeek AI";
    case "anthropic":
      return "Anthropic";
    case "moonshot":
      return "Moonshot AI";
    case "baidu":
      return "文心一言";
    case "zhipu":
      return "智谱 AI";
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
};
