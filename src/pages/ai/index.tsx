import React, { useState, useRef, useEffect, useCallback } from "react";
import { Textarea, Button, Avatar, ScrollShadow, Tooltip } from "@heroui/react";
import {
  RiSendPlane2Fill,
  RiRobot2Line,
  RiUserLine,
  RiSparklingLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown"; // For rendering AI responses
import remarkGfm from "remark-gfm"; // GitHub Flavored Markdown
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"; // Code highlighting
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"; // Code style

// Message type definition
interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

// Mock function for AI response (replace with actual API call)
const getAiResponse = async (inputText: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
  // Simple echo response for now, include code block example
  return `你发送了: "${inputText}"

这是一个代码块示例：

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);\n}
greet("TaiASST");
\`\`\`
`;
};

function AiApp() {
  const [messages, setMessages] = useState<Message[]>([
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: trimmedInput,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const aiText = await getAiResponse(trimmedInput);
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: aiText,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "抱歉，处理您的请求时出现错误。",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline on Enter
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "cleared",
        text: "聊天已清空。",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

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
        {/* Add a copy button here if needed */}
      </div>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      {/* Optional Header */}
      <div className="flex justify-between items-center p-3 border-b border-divider/30 flex-shrink-0">
        <h2 className="text-base font-medium flex items-center gap-1.5">
          <RiSparklingLine className="text-primary" /> AI 对话
        </h2>
        <Tooltip content="清空对话" placement="bottom">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={clearChat}
            className="text-foreground/60 hover:text-danger"
          >
            <RiDeleteBinLine size={18} />
          </Button>
        </Tooltip>
      </div>

      {/* Message List Area */}
      <ScrollShadow
        ref={scrollRef}
        hideScrollBar
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: message.sender === "user" ? 10 : -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "ai" && (
                <Avatar
                  icon={<RiRobot2Line size={20} />}
                  size="sm"
                  className="mb-1 bg-gradient-to-br from-secondary to-primary text-white"
                />
              )}
              <div
                className={`max-w-[75%] p-2.5 rounded-xl shadow-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-content1 dark:bg-content2 text-foreground rounded-bl-none glass-light dark:glass-dark border border-divider/10"
                }`}
              >
                {/* Render Markdown for AI messages */}
                {message.sender === "ai" ? (
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: CodeBlock,
                    }}
                  >
                    {message.text}
                  </Markdown>
                ) : (
                  <span className="whitespace-pre-wrap break-words">
                    {message.text}
                  </span>
                )}
              </div>
              {message.sender === "user" && (
                <Avatar
                  icon={<RiUserLine size={18} />}
                  size="sm"
                  className="mb-1 bg-default-200 dark:bg-default-300 text-default-600"
                />
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-end gap-2 justify-start"
            >
              <Avatar
                icon={<RiRobot2Line size={20} />}
                size="sm"
                className="mb-1 bg-gradient-to-br from-secondary to-primary text-white animate-pulse"
              />
              <div className="p-2.5 rounded-xl shadow-sm bg-content1 dark:bg-content2 rounded-bl-none glass-light dark:glass-dark border border-divider/10">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollShadow>

      {/* Input Area */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="p-3 border-t border-divider/30 flex items-center gap-2 bg-content1 dark:bg-content2 glass-light dark:glass-dark flex-shrink-0"
      >
        <Textarea
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入您的问题或指令... (Shift+Enter 换行)"
          minRows={1}
          maxRows={5}
          variant="bordered" // Use bordered variant
          radius="lg" // Match design doc input radius
          isDisabled={isLoading}
          className="flex-1"
          classNames={{
            inputWrapper:
              "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary",
            input: "py-2 text-sm",
          }}
        />
        <Button
          isIconOnly
          color="primary"
          radius="lg" // Match input radius
          onPress={handleSendMessage}
          isLoading={isLoading}
          isDisabled={!inputValue.trim()}
          className="h-11 w-11 flex-shrink-0 click-scale shadow-sm hover:shadow-primary/30"
        >
          {!isLoading && <RiSendPlane2Fill size={20} />}
        </Button>
      </motion.div>
    </div>
  );
}

export default AiApp;

// Basic CSS for typing indicator
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
  background-color: #9E9E9E;
  border-radius: 50%;
  opacity: 0.4;
  animation: typing-indicator-bounce 1s infinite ease-in-out;
}
.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing-indicator-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); opacity: 1; }
}
`;
document.head.append(style);
