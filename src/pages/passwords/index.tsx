import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Tabs,
  Tab,
  Chip,
  Spinner,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  RiLockPasswordLine,
  RiAddLine,
  RiSearchLine,
  RiStarLine,
  RiStarFill,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiEyeOffLine,
  RiFileCopyLine,
  RiExternalLinkLine,
  RiShieldCheckLine,
  RiInboxLine,
} from "react-icons/ri";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PasswordEntry, PasswordCategory } from "@/types/password";
import {
  getAllPasswordEntries,
  getAllPasswordCategories,
  deletePasswordEntry,
  updatePasswordLastUsed,
} from "@/services/db/password";
import {
  copyToClipboard,
  formatTimestamp,
  extractDomain,
  getFaviconUrl,
  checkPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
} from "@/utils/password";
import PasswordEntryModal from "./components/PasswordEntryModal";
import PasswordGeneratorModal from "./components/PasswordGeneratorModal";

// 密码卡片组件
interface PasswordCardProps {
  password: PasswordEntry;
  index: number;
  isPasswordVisible: boolean;
  onToggleVisibility: () => void;
  onCopyPassword: () => void;
  onCopyUsername: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PasswordCard: React.FC<PasswordCardProps> = ({
  password,
  index,
  isPasswordVisible,
  onToggleVisibility,
  onCopyPassword,
  onCopyUsername,
  onEdit,
  onDelete,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
      },
    },
  };

  const strengthResult = checkPasswordStrength(password.password);
  const strengthColor = getPasswordStrengthColor(strengthResult.strength);
  const strengthText = getPasswordStrengthText(strengthResult.strength);

  const handleOpenUrl = () => {
    if (password.url) {
      window.open(password.url, "_blank");
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-full shadow-sm border border-divider/20 hover:border-primary/30 transition-all duration-200">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-start gap-3 w-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-sm flex-shrink-0">
              {password.url ? (
                <img
                  src={getFaviconUrl(password.url)}
                  alt=""
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    const nextElement =
                      target.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <RiLockPasswordLine
                className="w-6 h-6"
                style={{ display: password.url ? "none" : "flex" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground line-clamp-1 flex-1">
                  {password.title}
                </h3>
                {password.isFavorite && (
                  <RiStarFill className="w-4 h-4 text-warning" />
                )}
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="text-default-400 hover:text-foreground"
                    >
                      <RiMoreLine />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem
                      key="edit"
                      startContent={<RiEditLine />}
                      onPress={onEdit}
                    >
                      编辑
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      startContent={<RiDeleteBinLine />}
                      color="danger"
                      onPress={onDelete}
                    >
                      删除
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="flex items-center gap-2">
                <Chip
                  size="sm"
                  variant="flat"
                  color={strengthColor as any}
                  className="text-xs"
                >
                  {strengthText}
                </Chip>
                {password.url && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="text-default-400 hover:text-primary"
                    onPress={handleOpenUrl}
                  >
                    <RiExternalLinkLine className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-4 py-3 space-y-3">
          {/* 用户名 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/60">用户名</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono max-w-[120px] truncate">
                {password.username}
              </span>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-default-400 hover:text-primary"
                onPress={onCopyUsername}
              >
                <RiFileCopyLine className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* 密码 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/60">密码</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono max-w-[120px] truncate">
                {isPasswordVisible ? password.password : "••••••••"}
              </span>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-default-400 hover:text-primary"
                onPress={onToggleVisibility}
              >
                {isPasswordVisible ? (
                  <RiEyeOffLine className="w-3 h-3" />
                ) : (
                  <RiEyeLine className="w-3 h-3" />
                )}
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-default-400 hover:text-primary"
                onPress={onCopyPassword}
              >
                <RiFileCopyLine className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* 最后使用时间 */}
          {password.lastUsed && (
            <div className="text-xs text-foreground/50 pt-2 border-t border-divider/20">
              最后使用: {formatTimestamp(password.lastUsed)}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

function PasswordManager() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [categories, setCategories] = useState<PasswordCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedPassword, setSelectedPassword] =
    useState<PasswordEntry | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(
    new Set(),
  );
  const [passwordToDelete, setPasswordToDelete] =
    useState<PasswordEntry | null>(null);

  const {
    isOpen: isEntryModalOpen,
    onOpen: onEntryModalOpen,
    onClose: onEntryModalClose,
  } = useDisclosure();

  const {
    isOpen: isGeneratorModalOpen,
    onOpen: onGeneratorModalOpen,
    onClose: onGeneratorModalClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  // 初始化数据
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      // 数据库表已通过Rust端迁移系统初始化，直接加载数据
      await loadData();
    } catch (error) {
      console.error("初始化密码管理失败:", error);
      toast.error("初始化失败");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [passwordsData, categoriesData] = await Promise.all([
        getAllPasswordEntries(),
        getAllPasswordCategories(),
      ]);
      setPasswords(passwordsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("加载数据失败:", error);
      toast.error("加载数据失败");
    }
  };

  // 过滤密码
  const filteredPasswords = passwords.filter((password) => {
    const matchesSearch =
      !searchQuery ||
      password.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (password.url &&
        extractDomain(password.url)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || password.category === selectedCategory;
    const matchesFavorites = !showFavorites || password.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // 处理密码操作
  const handleCopyPassword = async (password: PasswordEntry) => {
    const success = await copyToClipboard(password.password);
    if (success) {
      toast.success("密码已复制到剪贴板");
      await updatePasswordLastUsed(password.id);
      await loadData(); // 刷新数据以更新最后使用时间
    } else {
      toast.error("复制失败");
    }
  };

  const handleCopyUsername = async (username: string) => {
    const success = await copyToClipboard(username);
    if (success) {
      toast.success("用户名已复制到剪贴板");
    } else {
      toast.error("复制失败");
    }
  };

  const handleTogglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  const handleEditPassword = (password: PasswordEntry) => {
    setSelectedPassword(password);
    onEntryModalOpen();
  };

  const handleDeletePassword = (password: PasswordEntry) => {
    setPasswordToDelete(password);
    onDeleteModalOpen();
  };

  const confirmDeletePassword = async () => {
    if (!passwordToDelete) return;

    try {
      await deletePasswordEntry(passwordToDelete.id);
      toast.success("密码已删除");
      await loadData();
      onDeleteModalClose();
      setPasswordToDelete(null);
    } catch (error) {
      console.error("删除密码失败:", error);
      toast.error("删除失败");
    }
  };

  const cancelDeletePassword = () => {
    setPasswordToDelete(null);
    onDeleteModalClose();
  };

  const handleAddPassword = () => {
    setSelectedPassword(null);
    onEntryModalOpen();
  };

  const handleModalClose = () => {
    setSelectedPassword(null);
    onEntryModalClose();
  };

  const handlePasswordSaved = () => {
    loadData();
    handleModalClose();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl text-white shadow-lg">
            <RiLockPasswordLine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">密码管理器</h1>
            <p className="text-foreground/70 text-sm mt-1">
              安全存储和管理您的密码
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            color="secondary"
            variant="flat"
            startContent={<RiShieldCheckLine />}
            onPress={onGeneratorModalOpen}
          >
            密码生成器
          </Button>
          <Button
            color="primary"
            startContent={<RiAddLine />}
            onPress={handleAddPassword}
          >
            添加密码
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="搜索密码..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<RiSearchLine className="text-default-400" />}
              variant="bordered"
              size="md"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={showFavorites ? "solid" : "bordered"}
              color="warning"
              size="md"
              startContent={showFavorites ? <RiStarFill /> : <RiStarLine />}
              onPress={() => setShowFavorites(!showFavorites)}
            >
              收藏
            </Button>
          </div>
        </div>

        {/* 分类标签 */}
        <Tabs
          selectedKey={selectedCategory}
          onSelectionChange={(key) => setSelectedCategory(key as string)}
          variant="underlined"
          size="sm"
        >
          <Tab key="all" title="全部" />
          {categories.map((category) => (
            <Tab
              key={category.id}
              title={
                <div className="flex items-center gap-2">
                  <span>{category.name}</span>
                  <Chip size="sm" variant="flat">
                    {category.count}
                  </Chip>
                </div>
              }
            />
          ))}
        </Tabs>
      </div>

      {/* 密码列表 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-foreground/60 mt-4">加载密码列表...</p>
        </div>
      ) : filteredPasswords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-default-100 to-default-200 flex items-center justify-center mb-6 shadow-sm">
            <RiInboxLine className="w-12 h-12 text-default-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchQuery || showFavorites || selectedCategory !== "all"
              ? "未找到匹配的密码"
              : "暂无密码"}
          </h3>
          <p className="text-sm text-foreground/60 text-center max-w-md mb-4">
            {searchQuery
              ? `没有找到包含"${searchQuery}"的密码`
              : showFavorites
                ? "您还没有收藏任何密码"
                : selectedCategory !== "all"
                  ? "该分类下暂无密码"
                  : "开始添加您的第一个密码"}
          </p>
          {!searchQuery && !showFavorites && selectedCategory === "all" && (
            <Button
              color="primary"
              startContent={<RiAddLine />}
              onPress={handleAddPassword}
            >
              添加密码
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPasswords.map((password, index) => (
            <PasswordCard
              key={password.id}
              password={password}
              index={index}
              isPasswordVisible={visiblePasswords.has(password.id)}
              onToggleVisibility={() =>
                handleTogglePasswordVisibility(password.id)
              }
              onCopyPassword={() => handleCopyPassword(password)}
              onCopyUsername={() => handleCopyUsername(password.username)}
              onEdit={() => handleEditPassword(password)}
              onDelete={() => handleDeletePassword(password)}
            />
          ))}
        </div>
      )}

      {/* 模态框 */}
      <PasswordEntryModal
        isOpen={isEntryModalOpen}
        onClose={handleModalClose}
        password={selectedPassword}
        categories={categories}
        onSaved={handlePasswordSaved}
      />

      <PasswordGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={onGeneratorModalClose}
      />

      {/* 删除确认模态框 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDeletePassword}
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
                您确定要删除密码条目{" "}
                <span className="font-semibold">
                  "{passwordToDelete?.title}"
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
                    <p>删除后，您将无法恢复此密码条目的任何信息。</p>
                  </div>
                </div>
              </div>

              {passwordToDelete && (
                <div className="text-sm text-foreground/60 space-y-1">
                  <p>
                    <span className="font-medium">用户名:</span>{" "}
                    {passwordToDelete.username}
                  </p>
                  {passwordToDelete.url && (
                    <p>
                      <span className="font-medium">网站:</span>{" "}
                      {passwordToDelete.url}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">分类:</span>{" "}
                    {passwordToDelete.category}
                  </p>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="gap-3">
            <Button variant="flat" onPress={cancelDeletePassword}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={confirmDeletePassword}
              startContent={<RiDeleteBinLine />}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default PasswordManager;
