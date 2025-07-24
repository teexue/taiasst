import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Textarea, Spinner, Tooltip } from "@heroui/react";
import { useNavigate } from "react-router";
import {
  RiRobot2Line,
  RiSendPlaneLine,
  RiSettings4Line,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiUser3Line,
  RiStopCircleLine,
  RiHistoryLine,
  RiAddLine,
} from "react-icons/ri";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AIProvider, ChatSession } from "@/services/ai/types";
import { getAIManager } from "@/services/ai/manager";
import { copyToClipboard } from "@/utils/password";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import ChatHistory from "@/components/ChatHistory";

// 聊天消息接口（用于UI显示）
interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

// 聊天状态
type ChatState = "idle" | "streaming" | "error";

// 创建聊天消息
const createChatMessage = (
  text: string,
  sender: "user" | "ai",
): ChatMessage => ({
  id: crypto.randomUUID(),
  text,
  sender,
  timestamp: new Date(),
});

// 消息气泡组件
interface MessageBubbleProps {
  message: ChatMessage;
  onCopy: () => void;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onCopy,
  isStreaming,
}) => {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}
    >
      <div
        className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* 头像 */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser
              ? "bg-primary text-white"
              : "bg-gradient-to-br from-secondary to-primary text-white"
          }`}
        >
          {isUser ? (
            <RiUser3Line className="w-3.5 h-3.5" />
          ) : (
            <RiRobot2Line className="w-3.5 h-3.5" />
          )}
        </div>

        {/* 消息内容 */}
        <div
          className={`relative group ${isUser ? "text-right" : "text-left"} min-w-0 flex-1`}
        >
          <div
            className={`inline-block p-3 rounded-2xl max-w-full ${
              isUser
                ? "bg-primary text-white rounded-br-md"
                : "bg-default-100 text-foreground rounded-bl-md"
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words text-sm">
                {message.text}
              </div>
            ) : (
              <div className="prose prose-sm max-w-none [&>*]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <MarkdownRenderer content={message.text} />
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                )}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div
            className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${
              isUser ? "-left-8" : "-right-8"
            }`}
          >
            <Tooltip content="复制">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="bg-background/80 backdrop-blur-sm shadow-sm"
                onPress={onCopy}
              >
                <RiFileCopyLine className="w-3 h-3" />
              </Button>
            </Tooltip>
          </div>

          {/* 时间戳 */}
          <div
            className={`text-xs text-foreground/40 mt-1 ${isUser ? "text-right" : "text-left"}`}
          >
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function AiApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatState, setChatState] = useState<ChatState>("idle");
  const [currentResponse, setCurrentResponse] = useState("");
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null,
  );
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(
    null,
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hasConfiguredProviders, setHasConfiguredProviders] = useState(false);

  const aiManager = getAIManager();
  const navigate = useNavigate();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse, scrollToBottom]);

  // 检查配置状态
  const checkConfigurationStatus = useCallback(async () => {
    try {
      const configs = await aiManager.getAllProviderConfigs();
      const hasEnabled = configs.some(
        (config) => config.enabled && config.apiKey,
      );
      setHasConfiguredProviders(hasEnabled);
      return hasEnabled;
    } catch (error) {
      console.error("检查AI配置状态失败:", error);
      return false;
    }
  }, [aiManager]);

  // 初始化
  useEffect(() => {
    const initializeAI = async () => {
      try {
        const defaultProvider = await aiManager.getDefaultProvider();
        setSelectedProvider(defaultProvider);

        // 检查是否有已配置的提供商
        await checkConfigurationStatus();
      } catch (error) {
        console.error("初始化AI配置失败:", error);
      }
    };

    initializeAI();
  }, [checkConfigurationStatus]);

  // 监听页面焦点，当用户从设置页面返回时重新检查配置
  useEffect(() => {
    const handleFocus = () => {
      checkConfigurationStatus();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkConfigurationStatus]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || chatState === "streaming") return;

    const userMessage = createChatMessage(inputMessage.trim(), "user");
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setChatState("streaming");
    setCurrentResponse("");

    try {
      await aiManager.sendMessage(
        userMessage.text,
        currentSession?.id,
        selectedProvider || undefined,
        undefined,
        {
          onStart: () => {
            setChatState("streaming");
          },
          onChunk: (chunk) => {
            setCurrentResponse((prev) => prev + chunk);
          },
          onComplete: (fullResponse) => {
            const aiMessage = createChatMessage(fullResponse, "ai");
            setMessages((prev) => [...prev, aiMessage]);
            setCurrentResponse("");
            setChatState("idle");
          },
          onError: (error) => {
            console.error("AI响应错误:", error);
            // 检查是否是配置相关的错误
            if (
              error.message.includes("未配置") ||
              error.message.includes("未启用") ||
              error.message.includes("未找到")
            ) {
              toast.error("请前往系统设置 > AI助手 配置AI提供商");
            } else {
              toast.error(`AI响应失败: ${error.message}`);
            }
            setChatState("error");
            setCurrentResponse("");
          },
        },
      );
    } catch (error) {
      console.error("发送消息失败:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // 检查是否是配置相关的错误
      if (
        errorMessage.includes("未配置") ||
        errorMessage.includes("未启用") ||
        errorMessage.includes("未找到")
      ) {
        toast.error("请前往系统设置 > AI助手 配置AI提供商");
      } else {
        toast.error("发送消息失败，请检查网络连接或AI配置");
      }
      setChatState("error");
      setCurrentResponse("");
    }
  };

  // 停止生成
  const handleStopGeneration = () => {
    setChatState("idle");
    if (currentResponse) {
      const aiMessage = createChatMessage(currentResponse, "ai");
      setMessages((prev) => [...prev, aiMessage]);
    }
    setCurrentResponse("");
  };

  // 清空对话
  const handleClearChat = () => {
    setMessages([]);
    setCurrentResponse("");
    setChatState("idle");
    setCurrentSession(null);
  };

  // 复制消息
  const handleCopyMessage = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success("已复制到剪贴板");
    } else {
      toast.error("复制失败");
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 打开设置页面
  const handleOpenSettings = () => {
    if (hasConfiguredProviders) {
      // 如果已配置提供商，直接跳转到设置页面
      navigate("/settings");
      toast.success("已跳转到系统设置");
    } else {
      toast.info("请前往系统设置 > AI助手 配置AI提供商");
    }
  };

  // 新建对话
  const handleNewChat = () => {
    setMessages([]);
    setCurrentResponse("");
    setChatState("idle");
    setCurrentSession(null);
  };

  // 选择历史对话
  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    // 将AI消息转换为UI消息格式
    const uiMessages: ChatMessage[] = session.messages.map((msg, index) => ({
      id: `${session.id}-${index}`,
      text: msg.content,
      sender: msg.role === "user" ? "user" : "ai",
      timestamp: new Date(session.updatedAt),
    }));
    setMessages(uiMessages);
    setCurrentResponse("");
    setChatState("idle");
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* 页面标题 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-divider/20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-br from-primary to-secondary rounded-xl text-white shadow-lg">
            <RiRobot2Line className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI 助手</h1>
            <p className="text-foreground/70 text-xs mt-0.5">
              智能对话助手，支持多种AI模型
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content="新建对话">
            <Button isIconOnly size="sm" variant="flat" onPress={handleNewChat}>
              <RiAddLine />
            </Button>
          </Tooltip>
          <Tooltip content="对话历史">
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onPress={() => setIsHistoryOpen(true)}
            >
              <RiHistoryLine />
            </Button>
          </Tooltip>
          <Tooltip content="清空对话">
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onPress={handleClearChat}
              isDisabled={messages.length === 0 && !currentResponse}
            >
              <RiDeleteBinLine />
            </Button>
          </Tooltip>
          <Tooltip
            content={hasConfiguredProviders ? "打开设置" : "配置AI提供商"}
          >
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              color={hasConfiguredProviders ? "default" : "warning"}
              onPress={handleOpenSettings}
            >
              <RiSettings4Line />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto">
          <div className="h-full px-4 py-4">
            <div className="max-w-4xl mx-auto space-y-4 min-h-full flex flex-col">
              {messages.length === 0 && !currentResponse ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                      <RiRobot2Line className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {hasConfiguredProviders
                        ? "开始与AI助手对话"
                        : "配置AI助手"}
                    </h3>
                    <p className="text-foreground/60 text-sm max-w-md mx-auto mb-4">
                      {hasConfiguredProviders
                        ? "我可以帮助您回答问题、提供建议、协助写作等。请在下方输入您的问题。"
                        : "请先配置AI提供商才能开始使用AI助手功能。"}
                    </p>
                    {!hasConfiguredProviders && (
                      <Button
                        color="primary"
                        variant="flat"
                        onPress={handleOpenSettings}
                        startContent={<RiSettings4Line />}
                      >
                        前往配置
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onCopy={() => handleCopyMessage(message.text)}
                    />
                  ))}

                  {/* 当前AI响应 */}
                  {currentResponse && (
                    <MessageBubble
                      message={createChatMessage(currentResponse, "ai")}
                      onCopy={() => handleCopyMessage(currentResponse)}
                      isStreaming={true}
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 输入区域 */}
        <div className="border-t border-divider/20 px-4 py-3 flex-shrink-0 bg-background/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onValueChange={setInputMessage}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    hasConfiguredProviders
                      ? "输入您的问题..."
                      : "请先配置AI提供商"
                  }
                  minRows={1}
                  maxRows={4}
                  variant="bordered"
                  size="sm"
                  isDisabled={!hasConfiguredProviders}
                  classNames={{
                    input: "resize-none",
                    inputWrapper: "min-h-unit-10",
                  }}
                />
              </div>
              <div className="flex gap-2">
                {chatState === "streaming" ? (
                  <Button
                    color="danger"
                    variant="flat"
                    size="sm"
                    onPress={handleStopGeneration}
                    startContent={<RiStopCircleLine />}
                  >
                    停止
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    size="sm"
                    onPress={handleSendMessage}
                    isDisabled={!inputMessage.trim() || !hasConfiguredProviders}
                    startContent={<RiSendPlaneLine />}
                  >
                    发送
                  </Button>
                )}
              </div>
            </div>

            {/* 状态指示器 */}
            {chatState === "streaming" && (
              <div className="flex items-center gap-2 mt-2 text-xs text-foreground/60">
                <Spinner size="sm" />
                <span>AI正在思考中...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 对话历史模态框 */}
      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSelectSession}
        currentSessionId={currentSession?.id}
      />
    </div>
  );
}

export default AiApp;
