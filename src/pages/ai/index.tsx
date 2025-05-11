import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Textarea,
  Button,
  Avatar,
  ScrollShadow,
  Tooltip,
  Select,
  SelectItem,
  SelectSection,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Switch,
} from "@heroui/react";
import {
  RiSendPlane2Fill,
  RiRobot2Line,
  RiUserLine,
  RiSparklingLine,
  RiDeleteBinLine,
  RiSettings3Line,
  RiMistLine,
  RiHistoryLine,
  RiSaveLine,
  RiFolderAddLine,
  RiMessageLine,
} from "@remixicon/react";
import Markdown from "react-markdown"; // For rendering AI responses
import remarkGfm from "remark-gfm"; // GitHub Flavored Markdown
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"; // Code highlighting
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"; // Code style
import { useNavigate } from "react-router"; // 导入用于导航的hook

// 导入AI聊天服务
import {
  getAiResponseStream,
  createChatMessage,
  ChatMessage,
  ChatError,
} from "@/services/ai/chat";
import {
  AiConfig,
  ModelDefinition,
  loadConfiguredModels, // 新增: 加载已配置的模型
  getFrontendAiConfig, // 用于加载上次选择等UI偏好
  saveFrontendAiConfig, // 用于保存上次选择等UI偏好
  getBackendAiConfig, // 用于加载温度等核心配置
} from "@/services/ai/api";
import {
  ChatHistory,
  saveChatHistory,
  getAllChatHistories,
  getChatHistory,
  deleteChatHistory,
  generateChatSummary,
} from "@/services/db/chatHistory";

// 为UI显示聊天历史预览
interface ChatHistoryPreview {
  id: string;
  title: string;
  summary?: string;
  provider?: string;
  model?: string;
  updatedAt: number;
}

// 消息项组件，避免整个列表重新渲染
const MessageItem = React.memo(
  ({
    message,
    isStreaming,
    isCurrentStreamingMessage,
  }: {
    message: ChatMessage;
    isStreaming: boolean;
    isCurrentStreamingMessage: boolean;
  }) => {
    // Custom Code component for react-markdown with types
    const CodeBlock: React.FC<{
      node?: any;
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    }> = ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="relative my-2">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            className="rounded-md !bg-[#1e1e1e] overflow-auto scrollbar-thin scrollbar-thumb-default-300 scrollbar-track-transparent"
            {...props}
          >
            {String(children)}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    };

    // 确保消息文本一定是字符串
    const displayText = message.text || "";

    // 将流式光标直接附加到displayText
    let fullDisplayText = displayText;
    if (
      message.sender === "ai" &&
      isStreaming &&
      isCurrentStreamingMessage &&
      displayText !== "正在思考..."
    ) {
      fullDisplayText += "▌"; // 直接追加光标字符
    }

    return (
      <div
        className={`flex items-end gap-2 mb-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
      >
        {message.sender === "ai" && (
          <Avatar
            icon={<RiRobot2Line size={20} />}
            size="sm"
            radius="full"
            className={`mb-1 bg-gradient-to-br from-secondary to-primary text-white ${
              isStreaming && isCurrentStreamingMessage ? "animate-pulse" : ""
            }`}
          />
        )}
        <div
          className={`max-w-[75%] p-2.5 rounded-xl shadow-sm prose prose-sm dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1 ${
            message.sender === "user"
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-content1 dark:bg-content2 text-foreground rounded-bl-none glass-light dark:glass-dark border border-divider/10"
          }`}
        >
          {/* Render Markdown for AI messages */}
          {message.sender === "ai" ? (
            <div className="message-content">
              {" "}
              {/* 添加一个容器便于调试 */}
              {displayText === "正在思考..." && isCurrentStreamingMessage ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: CodeBlock,
                  }}
                >
                  {fullDisplayText}
                </Markdown>
              )}
            </div>
          ) : (
            <span className="whitespace-pre-wrap break-words">
              {displayText}
            </span>
          )}
        </div>
        {message.sender === "user" && (
          <Avatar
            icon={<RiUserLine size={18} />}
            size="sm"
            radius="full"
            className="mb-1 bg-default-200 dark:bg-default-300 text-default-600"
          />
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 只有当消息文本变化或者流状态变化时才更新
    return (
      prevProps.message.text === nextProps.message.text &&
      prevProps.isStreaming === nextProps.isStreaming &&
      prevProps.isCurrentStreamingMessage ===
        nextProps.isCurrentStreamingMessage
    );
  },
);

MessageItem.displayName = "MessageItem";

function AiApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    // Initial welcome message
    {
      id: "welcome",
      text: "你好！我是 TaiASST，你的 AI 助手。有什么可以帮你的吗？",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );

  // AI 配置状态
  const [currentAiConfig, setCurrentAiConfig] = useState<Partial<AiConfig>>({});
  const [availableModels, setAvailableModels] = useState<ModelDefinition[]>([]); // 初始为空数组
  const [isInitializing, setIsInitializing] = useState(true); // 添加初始化状态

  // 聊天历史管理
  const [chatHistories, setChatHistories] = useState<ChatHistoryPreview[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoadingHistories, setIsLoadingHistories] = useState(false);
  const {
    isOpen: isSaveModalOpen,
    onOpen: onOpenSaveModal,
    onClose: onCloseSaveModal,
  } = useDisclosure();
  const [chatTitle, setChatTitle] = useState("");

  // 自动保存设置 - 直接从localStorage读取初始值
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(() => {
    // 从localStorage读取初始值
    const savedValue = localStorage.getItem("autoSaveChat");
    return savedValue === "true"; // 如果找不到或者值为'false'，则返回false
  });
  const [autoSaveThreshold] = useState<number>(3); // 触发自动保存的消息数阈值

  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 加载AI配置 (包括上次选择的模型、温度等)
  useEffect(() => {
    const loadConfig = async () => {
      setIsInitializing(true);
      try {
        // 1. 加载已配置的模型列表 (从数据库)
        const configuredModels = await loadConfiguredModels();
        setAvailableModels(configuredModels);

        // 2. 获取前端UI配置 (从localStorage)
        const frontendConfig = getFrontendAiConfig();

        // 不再在这里设置autoSaveEnabled，因为它已经在useState中初始化

        // 3. 获取后端核心配置 (目前从前端兼容，未来从Tauri后端获取)
        const backendConfig = await getBackendAiConfig();

        // 4. 合并配置
        const combinedConfig: Partial<AiConfig> = {
          ...backendConfig, // 后端配置优先 (如 temperature, maxTokens)
          ...frontendConfig, // 前端选择优先 (如 provider, model)
        };

        // 5. 如果没有保存的模型信息或选择的模型已不可用，设置一个默认值
        const hasValidModel =
          combinedConfig.provider &&
          combinedConfig.model &&
          configuredModels.some(
            (m) =>
              m.provider === combinedConfig.provider &&
              m.nativeModelId === combinedConfig.model,
          );

        if (!hasValidModel) {
          // 优先选择已配置的模型
          const configuredModel = configuredModels.find(
            (m) => m.configured === true,
          );
          if (configuredModel) {
            combinedConfig.provider = configuredModel.provider;
            combinedConfig.model = configuredModel.nativeModelId;
          } else if (configuredModels.length > 0) {
            // 如果没有已配置的模型，使用列表中第一个
            combinedConfig.provider = configuredModels[0].provider;
            combinedConfig.model = configuredModels[0].nativeModelId;
          }
          // 如果没有任何可用模型，保持为undefined
        }

        setCurrentAiConfig(combinedConfig);
      } catch (error) {
        console.error("加载AI配置失败:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadConfig();

    // 加载聊天历史列表
    loadChatHistories();
  }, []); // 只在组件挂载时加载一次

  // 保存自动保存设置到localStorage - 只在用户手动修改设置时保存
  useEffect(() => {
    localStorage.setItem("autoSaveChat", autoSaveEnabled.toString());
    // 注意：此效果只在用户通过界面上的开关按钮更改autoSaveEnabled的值时触发
    // 由于useState初始化时从localStorage直接读取了值，所以组件挂载时不会触发多余的写入
  }, [autoSaveEnabled]);

  // 加载聊天历史列表
  const loadChatHistories = async () => {
    try {
      setIsLoadingHistories(true);
      const histories = await getAllChatHistories();

      // 转换为预览格式
      const previews: ChatHistoryPreview[] = histories.map((history) => ({
        id: history.id,
        title: history.title,
        summary: history.summary,
        provider: history.provider,
        model: history.model,
        updatedAt: history.updatedAt,
      }));

      setChatHistories(previews);
    } catch (error) {
      console.error("加载聊天历史失败:", error);
    } finally {
      setIsLoadingHistories(false);
    }
  };

  // 自动保存当前对话
  const autoSaveChat = useCallback(async () => {
    try {
      // 至少要有一条用户消息和一条AI回复
      const hasUserMessage = messages.some((msg) => msg.sender === "user");
      const hasAiMessage = messages.some(
        (msg) => msg.sender === "ai" && msg.text !== "正在思考...",
      );

      if (!hasUserMessage || !hasAiMessage) {
        return;
      }

      // 转换为API消息格式
      const apiMessages = messages.map((msg) => ({
        role: msg.sender === "ai" ? ("assistant" as const) : ("user" as const),
        content: msg.text,
      }));

      // 生成ID（如果是新聊天）或使用现有ID
      const chatId = currentChatId || `chat_${Date.now()}`;

      // 根据当前日期时间和第一条用户消息生成默认标题
      const dateStr = new Date().toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const userMessages = messages.filter((msg) => msg.sender === "user");
      let defaultTitle = `对话 ${dateStr}`;

      if (userMessages.length > 0) {
        const firstMsgPreview =
          userMessages[0].text.length > 15
            ? userMessages[0].text.substring(0, 12) + "..."
            : userMessages[0].text;
        defaultTitle = `${firstMsgPreview} - ${dateStr}`;
      }

      // 使用当前配置的模型
      const history: ChatHistory = {
        id: chatId,
        title: defaultTitle,
        provider: currentAiConfig.provider,
        model: currentAiConfig.model,
        messages: apiMessages,
        summary: generateChatSummary(apiMessages),
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      };

      // 保存到数据库
      await saveChatHistory(history);

      // 更新当前聊天ID和历史列表
      setCurrentChatId(chatId);
      await loadChatHistories();
    } catch (error) {
      console.error("自动保存聊天历史失败:", error);
    }
  }, [messages, currentChatId, currentAiConfig]);

  // 监听消息变化，触发自动保存
  useEffect(() => {
    // 仅当启用自动保存且未设置currentChatId(新对话)且有足够的消息时执行
    const userMessages = messages.filter((msg) => msg.sender === "user");
    const aiMessages = messages.filter(
      (msg) => msg.sender === "ai" && msg.text !== "正在思考...",
    );

    if (
      autoSaveEnabled &&
      !currentChatId &&
      userMessages.length >= 1 &&
      aiMessages.length >= Math.min(2, autoSaveThreshold) &&
      !isStreaming // 确保不在流式响应中
    ) {
      // 自动保存对话
      autoSaveChat();
    }
  }, [
    messages,
    isStreaming,
    autoSaveEnabled,
    autoSaveThreshold,
    currentChatId,
    autoSaveChat,
  ]);

  // 加载特定的聊天历史
  const loadChatHistory = async (chatId: string) => {
    try {
      setIsLoading(true);
      const history = await getChatHistory(chatId);
      if (!history) {
        console.error(`未找到聊天历史: ${chatId}`);
        return;
      }

      // 转换消息格式
      const chatMessages: ChatMessage[] = history.messages.map((msg) => {
        return {
          id: crypto.randomUUID(), // 为每条消息生成新ID
          text: msg.content,
          sender: msg.role === "assistant" ? "ai" : "user",
          timestamp: new Date(history.createdAt * 1000),
        };
      });

      // 设置当前聊天记录
      setMessages(chatMessages);
      setCurrentChatId(chatId);

      // 如果有提供商和模型信息，更新当前AI配置
      if (history.provider && history.model) {
        setCurrentAiConfig((prev) => ({
          ...prev,
          provider: history.provider,
          model: history.model,
        }));
      }
    } catch (error) {
      console.error("加载聊天历史失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新的聊天
  const createNewChat = () => {
    setMessages([
      {
        id: "welcome",
        text: "你好！我是 TaiASST，你的 AI 助手。有什么可以帮你的吗？",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
    setCurrentChatId(null);
  };

  // 保存当前聊天记录
  const saveCurrentChat = async () => {
    try {
      // 至少要有一条用户消息和一条AI回复
      const hasUserMessage = messages.some((msg) => msg.sender === "user");
      const hasAiMessage = messages.some((msg) => msg.sender === "ai");

      if (!hasUserMessage || !hasAiMessage) {
        console.warn("聊天记录至少需要包含一条用户消息和一条AI回复");
        return;
      }

      // 转换为API消息格式
      const apiMessages = messages.map((msg) => ({
        role: msg.sender === "ai" ? ("assistant" as const) : ("user" as const),
        content: msg.text,
      }));

      // 生成ID（如果是新聊天）或使用现有ID
      const chatId = currentChatId || `chat_${Date.now()}`;

      // 根据第一条用户消息生成默认标题
      const userMessages = messages.filter((msg) => msg.sender === "user");
      const defaultTitle =
        userMessages.length > 0
          ? userMessages[0].text.length > 20
            ? userMessages[0].text.substring(0, 17) + "..."
            : userMessages[0].text
          : "新对话";

      // 使用当前配置的模型
      const history: ChatHistory = {
        id: chatId,
        title: chatTitle || defaultTitle,
        provider: currentAiConfig.provider,
        model: currentAiConfig.model,
        messages: apiMessages,
        summary: generateChatSummary(apiMessages),
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      };

      // 保存到数据库
      await saveChatHistory(history);

      // 更新当前聊天ID和历史列表
      setCurrentChatId(chatId);
      await loadChatHistories();

      // 关闭保存对话框
      onCloseSaveModal();
      setChatTitle("");
    } catch (error) {
      console.error("保存聊天历史失败:", error);
    }
  };

  // 删除聊天历史
  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChatHistory(chatId);

      // 如果删除的是当前聊天，创建新聊天
      if (chatId === currentChatId) {
        createNewChat();
      }

      // 重新加载聊天历史列表
      await loadChatHistories();
    } catch (error) {
      console.error("删除聊天历史失败:", error);
    }
  };

  // 当选定模型变化时，保存到前端配置 (用于下次进入时记住选择)
  useEffect(() => {
    if (currentAiConfig.provider && currentAiConfig.model) {
      saveFrontendAiConfig({
        provider: currentAiConfig.provider,
        model: currentAiConfig.model,
        ...(currentAiConfig.temperature && {
          temperature: currentAiConfig.temperature,
        }),
        ...(currentAiConfig.maxTokens && {
          maxTokens: currentAiConfig.maxTokens,
        }),
      });
    }
  }, [currentAiConfig]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handleGoToSettings = () => {
    navigate("/settings?tab=ai"); // 直接导航到AI设置标签页
  };

  // 检查是否使用DeepSeek Reasoner模型并且没有用户消息历史
  const isUsingReasoner =
    currentAiConfig.provider === "deepseek" &&
    (currentAiConfig.model === "deepseek-reasoner" ||
      currentAiConfig.model?.includes("reasoner"));

  const hasUserMessage = messages.some((msg) => msg.sender === "user");

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (
      !trimmedInput ||
      isLoading ||
      !currentAiConfig.provider ||
      !currentAiConfig.model
    )
      return;

    const userMessage = createChatMessage(trimmedInput, "user");
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const aiMessageId = crypto.randomUUID();
    setStreamingMessageId(aiMessageId);

    const initialAiMessage: ChatMessage = {
      id: aiMessageId,
      text: "正在思考...",
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, initialAiMessage]);
    setIsStreaming(true);

    console.log(
      `开始流式响应 (${currentAiConfig.provider}/${currentAiConfig.model}) ID:`,
      aiMessageId,
    );

    try {
      // 如果是DeepSeek Reasoner且没有用户消息历史，只发送当前用户消息
      const historyToSend =
        isUsingReasoner && !hasUserMessage
          ? [] // 如果是Reasoner且没有用户消息，则发送空历史
          : messages.filter((m) => m.id !== aiMessageId); // 否则发送过滤后的历史消息

      await getAiResponseStream(
        trimmedInput,
        historyToSend,
        currentAiConfig,
        (chunk: string) => {
          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (msg.id === aiMessageId) {
                const newText =
                  msg.text === "正在思考..." ? chunk : (msg.text || "") + chunk;
                return { ...msg, text: newText };
              }
              return msg;
            }),
          );
        },
        () => {
          console.log("流式响应完成 ID:", aiMessageId);
          setIsLoading(false);
          setIsStreaming(false);
          setStreamingMessageId(null);
        },
        (error: ChatError) => {
          console.error("流式获取AI响应出错 ID:", aiMessageId, error);
          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (msg.id === aiMessageId) {
                return {
                  ...msg,
                  text:
                    msg.text === "正在思考..." || !msg.text
                      ? `错误: ${error.message}`
                      : `${msg.text || ""}\n\n> **错误**: ${error.message}`,
                };
              }
              return msg;
            }),
          );
          setIsLoading(false);
          setIsStreaming(false);
          setStreamingMessageId(null);
        },
      );
    } catch (error) {
      console.error("处理流式响应时发生异常:", error);
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.id === aiMessageId) {
            return { ...msg, text: "处理请求时发生意外错误。" };
          }
          return msg;
        }),
      );
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessageId(null);
    }
  }, [
    inputValue,
    isLoading,
    messages,
    navigate,
    currentAiConfig,
    isUsingReasoner,
    hasUserMessage,
  ]);

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    // 恢复到初始欢迎消息，这样第一条消息永远是AI消息
    setMessages([
      {
        id: "welcome",
        text: "你好！我是 TaiASST，你的 AI 助手。有什么可以帮你的吗？",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
    setStreamingMessageId(null); // Clear streaming ID if a chat is cleared mid-stream
    setCurrentChatId(null); // 清除当前聊天ID，表示这是一个新聊天
  };

  // 按provider分组模型 - 只显示已配置的模型
  const groupedModels = availableModels
    .filter((model) => model.configured === true) // 只保留已配置的模型
    .reduce(
      (acc, model) => {
        const providerKey = model.providerName || model.provider;
        if (!acc[providerKey]) {
          acc[providerKey] = [];
        }
        acc[providerKey].push(model);
        return acc;
      },
      {} as Record<string, ModelDefinition[]>,
    );

  // 检查是否有可用的已配置模型
  const hasConfiguredModels = availableModels.some(
    (m) => m.configured === true,
  );

  // 格式化日期显示
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-divider/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <RiSparklingLine className="text-primary" />
          <h2 className="text-base font-medium">AI 对话</h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 聊天历史记录下拉菜单 */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="shadow"
                size="sm"
                className="text-foreground/60 hover:text-primary"
                startContent={<RiHistoryLine size={16} />}
                endContent={
                  isLoadingHistories ? (
                    <div className="animate-spin h-3 w-3 rounded-full border-2 border-primary border-r-transparent"></div>
                  ) : null
                }
              >
                {currentChatId ? "当前对话" : "新对话"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="聊天历史"
              className="max-h-[350px] overflow-y-auto"
              closeOnSelect
            >
              <DropdownItem
                key="new_chat"
                startContent={<RiFolderAddLine />}
                onPress={createNewChat}
                color="primary"
              >
                新建对话
              </DropdownItem>

              {/* 自动保存历史设置 */}
              <DropdownItem
                key="auto_save_setting"
                startContent={
                  <Switch
                    size="sm"
                    isSelected={autoSaveEnabled}
                    onChange={() => setAutoSaveEnabled((prev) => !prev)}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
                closeOnSelect={false}
              >
                自动保存对话
              </DropdownItem>

              {chatHistories.length > 0 ? (
                <>
                  {chatHistories.map((history) => (
                    <DropdownItem
                      key={history.id}
                      description={history.summary || "无摘要"}
                      startContent={<RiMessageLine />}
                      endContent={
                        <div className="flex items-center gap-1">
                          <small className="text-xs text-foreground/50">
                            {formatDate(history.updatedAt)}
                          </small>
                          <Button
                            isIconOnly
                            variant="shadow"
                            size="sm"
                            onPress={(e: any) => {
                              e.stopPropagation();
                              handleDeleteChat(history.id);
                            }}
                          >
                            <RiDeleteBinLine
                              size={14}
                              className="text-danger"
                            />
                          </Button>
                        </div>
                      }
                      onPress={() => loadChatHistory(history.id)}
                      className="py-2"
                    >
                      {history.title}
                    </DropdownItem>
                  ))}
                </>
              ) : (
                <DropdownItem key="no-history" isDisabled>
                  无历史记录
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>

          {/* 模型选择器 */}
          <Select
            aria-label="选择AI模型"
            placeholder={isInitializing ? "加载中..." : "选择模型"}
            variant="bordered"
            size="sm"
            className="w-[200px] min-w-[180px]"
            classNames={{
              value: "text-xs",
              trigger:
                "h-8 min-h-unit-8 bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary",
              listboxWrapper: "max-h-[300px]",
              popoverContent:
                "bg-background/90 dark:bg-default-100/90 backdrop-blur-md backdrop-saturate-150 border border-default-300/50 dark:border-default-200/30",
            }}
            selectedKeys={currentAiConfig.model ? [currentAiConfig.model] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              if (selectedKey) {
                const model = availableModels.find(
                  (m) => m.nativeModelId === selectedKey,
                );
                if (model) {
                  setCurrentAiConfig((prev) => ({
                    ...prev,
                    provider: model.provider,
                    model: model.nativeModelId,
                  }));
                }
              }
            }}
            startContent={
              <RiMistLine className="text-foreground/60" size={16} />
            }
            isDisabled={isInitializing || !hasConfiguredModels}
          >
            {Object.entries(groupedModels).map(
              ([providerDisplayKey, models]) => (
                <SelectSection
                  key={providerDisplayKey}
                  title={providerDisplayKey}
                >
                  {models.map((model) => (
                    <SelectItem
                      key={model.nativeModelId}
                      textValue={model.name}
                    >
                      <span className="text-sm">{model.name}</span>
                    </SelectItem>
                  ))}
                </SelectSection>
              ),
            )}
          </Select>

          {/* 保存聊天按钮 */}
          <Tooltip content="保存对话" placement="bottom" delay={0}>
            <Button
              isIconOnly
              variant="shadow"
              size="sm"
              radius="full"
              onPress={onOpenSaveModal}
              isDisabled={messages.length <= 1} // 如果只有欢迎消息，禁用保存
              className="text-foreground/60 hover:text-primary"
            >
              <RiSaveLine size={18} />
            </Button>
          </Tooltip>

          <Tooltip content="AI设置/API配置" placement="bottom" delay={0}>
            <Button
              isIconOnly
              variant="shadow"
              size="sm"
              radius="full"
              onPress={handleGoToSettings}
              className="text-foreground/60 hover:text-primary"
            >
              <RiSettings3Line size={18} />
            </Button>
          </Tooltip>
          <Tooltip content="清空对话" placement="bottom" delay={0}>
            <Button
              isIconOnly
              variant="shadow"
              size="sm"
              radius="full"
              onPress={clearChat}
              className="text-foreground/60 hover:text-danger"
            >
              <RiDeleteBinLine size={18} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 保存对话模态框 */}
      <Modal isOpen={isSaveModalOpen} onClose={onCloseSaveModal}>
        <ModalContent>
          <ModalHeader>保存对话</ModalHeader>
          <ModalBody>
            <Input
              label="对话标题"
              placeholder="输入一个有意义的标题"
              value={chatTitle}
              onChange={(e) => setChatTitle(e.target.value)}
              variant="bordered"
              autoFocus
            />
            {!currentChatId && (
              <div className="flex items-center gap-2 mt-3">
                <Switch
                  size="sm"
                  isSelected={autoSaveEnabled}
                  onChange={() => setAutoSaveEnabled((prev) => !prev)}
                />
                <span className="text-sm">启用自动保存对话</span>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="shadow" size="sm" onPress={onCloseSaveModal}>
              取消
            </Button>
            <Button
              color="primary"
              variant="shadow"
              size="sm"
              onPress={saveCurrentChat}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* API密钥未配置警告 */}
      {!hasConfiguredModels && !isInitializing && (
        <div className="mx-4 mt-4 p-3 bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400 rounded-lg border border-warning-200 dark:border-warning-800 flex items-center gap-2">
          <RiSettings3Line className="flex-shrink-0" size={18} />
          <p className="text-sm">
            未找到已配置的AI模型。
            <Button
              size="sm"
              color="warning"
              variant="shadow"
              className="ml-2"
              onPress={handleGoToSettings}
            >
              前往设置
            </Button>
          </p>
        </div>
      )}

      {/* 加载中提示 */}
      {isInitializing && (
        <div className="mx-4 mt-4 p-3 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-400 rounded-lg border border-secondary-200 dark:border-secondary-800 flex items-center gap-2">
          <div className="animate-spin mr-2">⏳</div>
          <p className="text-sm">正在加载AI配置...</p>
        </div>
      )}

      {/* Message List Area */}
      <ScrollShadow
        ref={scrollRef}
        hideScrollBar
        className="flex-1 overflow-y-auto p-4 space-y-0"
      >
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isStreaming={isStreaming}
            isCurrentStreamingMessage={message.id === streamingMessageId}
          />
        ))}
        {isLoading && !isStreaming && (
          <div className="flex items-end gap-2 justify-start mb-4">
            <Avatar
              icon={<RiRobot2Line size={20} />}
              size="sm"
              radius="full"
              className="mb-1 bg-gradient-to-br from-secondary to-primary text-white animate-pulse"
            />
            <div className="p-2.5 rounded-xl shadow-sm bg-content1 dark:bg-content2 rounded-bl-none glass-light dark:glass-dark border border-divider/10">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </ScrollShadow>

      {/* Input Area */}
      <div className="p-3 border-t border-divider/30 flex items-center gap-2 bg-content1 dark:bg-content2 glass-light dark:glass-dark flex-shrink-0">
        <Textarea
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isInitializing
              ? "正在加载配置..."
              : hasConfiguredModels
                ? "输入您的问题或指令... (Shift+Enter 换行)"
                : "请先配置AI模型"
          }
          minRows={1}
          maxRows={5}
          variant="bordered"
          radius="md"
          isDisabled={isLoading || !hasConfiguredModels || isInitializing}
          className="flex-1"
          classNames={{
            inputWrapper:
              "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary",
            input: "py-2 text-sm",
            description: "text-xs text-foreground/60",
          }}
        />
        <Button
          isIconOnly
          color="primary"
          size="lg"
          onPress={handleSendMessage}
          isLoading={isLoading}
          isDisabled={
            !inputValue.trim() ||
            !hasConfiguredModels ||
            isStreaming ||
            isInitializing
          }
          className="flex-shrink-0 click-scale shadow-sm hover:shadow-primary/30"
        >
          {!isLoading && <RiSendPlane2Fill size={20} />}
        </Button>
      </div>
    </div>
  );
}

export default AiApp;

// Basic CSS for typing indicator and cursor
const style = document.createElement("style");
style.textContent = `
.typing-indicator {
  display: flex;
  padding: 4px 8px;
}
.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 2px;
  background-color: currentColor; /* Use currentColor to adapt to text color */
  border-radius: 50%;
  opacity: 0.4;
  animation: typing-indicator-bounce 1s infinite ease-in-out;
}
.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing-indicator-bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
  40% { transform: scale(1.0); opacity: 1; }
}
.streaming-cursor {
  display: inline-block;
  width: 1px; /* More like a cursor */
  height: 1em;
  background-color: currentColor;
  animation: streaming-cursor-blink 1s infinite;
  margin-left: 1px;
  vertical-align: text-bottom;
}
@keyframes streaming-cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
`;
document.head.append(style);
