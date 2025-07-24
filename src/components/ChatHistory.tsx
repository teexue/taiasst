import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ScrollShadow,
} from "@heroui/react";
import {
  RiHistoryLine,
  RiSearchLine,
  RiDeleteBinLine,
  RiChat3Line,
  RiTimeLine,
  RiRobot2Line,
  RiCloseLine,
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ChatSession } from "@/services/ai/types";
import { getAIManager } from "@/services/ai/manager";

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (session: ChatSession) => void;
  currentSessionId?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  isOpen,
  onClose,
  onSelectSession,
  currentSessionId,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(
    null,
  );

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  const aiManager = getAIManager();

  // 加载对话历史
  const loadSessions = async () => {
    try {
      setLoading(true);
      const allSessions = await aiManager.getAllChatSessions();
      setSessions(allSessions);
      setFilteredSessions(allSessions);
    } catch (error) {
      console.error("加载对话历史失败:", error);
      toast.error("加载对话历史失败");
    } finally {
      setLoading(false);
    }
  };

  // 搜索过滤
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSessions(sessions);
    } else {
      const filtered = sessions.filter(
        (session) =>
          session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.messages.some((msg) =>
            msg.content.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
      setFilteredSessions(filtered);
    }
  }, [searchQuery, sessions]);

  // 初始加载
  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  // 删除对话
  const handleDeleteSession = (session: ChatSession) => {
    setSessionToDelete(session);
    onDeleteModalOpen();
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      await aiManager.deleteChatSession(sessionToDelete.id);
      toast.success("对话已删除");
      await loadSessions();
      onDeleteModalClose();
      setSessionToDelete(null);
    } catch (error) {
      console.error("删除对话失败:", error);
      toast.error("删除对话失败");
    }
  };

  const cancelDeleteSession = () => {
    setSessionToDelete(null);
    onDeleteModalClose();
  };

  // 选择对话
  const handleSelectSession = (session: ChatSession) => {
    onSelectSession(session);
    onClose();
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "刚刚";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // 获取对话预览
  const getSessionPreview = (session: ChatSession) => {
    const lastUserMessage = session.messages
      .filter((msg) => msg.role === "user")
      .pop();
    return lastUserMessage?.content.slice(0, 100) || "无内容";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "p-0",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 px-6 py-4 border-b border-divider/20">
          <RiHistoryLine className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">对话历史</h2>
            <p className="text-sm text-foreground/60">
              {sessions.length} 个对话记录
            </p>
          </div>
          <Button isIconOnly variant="light" onPress={onClose}>
            <RiCloseLine />
          </Button>
        </ModalHeader>

        <ModalBody>
          {/* 搜索栏 */}
          <div className="sticky top-0 bg-background/80 backdrop-blur-sm p-4 border-b border-divider/20">
            <Input
              placeholder="搜索对话..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                <RiSearchLine className="w-4 h-4 text-foreground/40" />
              }
              variant="bordered"
            />
          </div>

          {/* 对话列表 */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-20">
                <RiChat3Line className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? "未找到匹配的对话" : "暂无对话记录"}
                </h3>
                <p className="text-foreground/60">
                  {searchQuery
                    ? "尝试使用其他关键词搜索"
                    : "开始与AI助手对话吧"}
                </p>
              </div>
            ) : (
              <ScrollShadow className="max-h-[60vh]">
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredSessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Card
                          isPressable
                          className={`hover:bg-default-50 transition-colors ${
                            currentSessionId === session.id
                              ? "ring-2 ring-primary"
                              : ""
                          }`}
                          onPress={() => handleSelectSession(session)}
                        >
                          <CardBody className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-foreground truncate">
                                    {session.title}
                                  </h4>
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    startContent={
                                      <RiRobot2Line className="w-3 h-3" />
                                    }
                                  >
                                    {session.provider}
                                  </Chip>
                                </div>
                                <p className="text-sm text-foreground/60 line-clamp-2 mb-2">
                                  {getSessionPreview(session)}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-foreground/40">
                                  <div className="flex items-center gap-1">
                                    <RiTimeLine className="w-3 h-3" />
                                    <span>{formatTime(session.updatedAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <RiChat3Line className="w-3 h-3" />
                                    <span>
                                      {session.messages.length} 条消息
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onPress={() => {
                                  handleDeleteSession(session);
                                }}
                              >
                                <RiDeleteBinLine className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardBody>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollShadow>
            )}
          </div>
        </ModalBody>
      </ModalContent>

      {/* 删除确认模态框 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDeleteSession}
        size="md"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3">
            <div className="p-2 bg-danger/10 rounded-lg">
              <RiDeleteBinLine className="w-5 h-5 text-danger" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-danger">确认删除</h2>
            </div>
          </ModalHeader>

          <ModalBody className="py-4">
            <div className="space-y-4">
              <p className="text-foreground">
                您确定要删除对话{" "}
                <span className="font-semibold">
                  "{sessionToDelete?.title}"
                </span>{" "}
                吗？
              </p>

              <div className="p-4 bg-danger/5 border border-danger/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-danger text-sm font-bold">!</span>
                  </div>
                  <div className="text-sm text-danger-600">
                    <p className="font-medium mb-1">此操作无法撤销</p>
                    <p>删除后，您将无法恢复此对话的任何内容。</p>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="gap-3">
            <Button variant="flat" onPress={cancelDeleteSession}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={confirmDeleteSession}
              startContent={<RiDeleteBinLine />}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
};

export default ChatHistory;
