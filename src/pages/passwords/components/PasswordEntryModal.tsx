import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Chip,
  Progress,
} from "@heroui/react";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiRefreshLine,
  RiSave3Line,
  RiCloseLine,
} from "react-icons/ri";
import { toast } from "sonner";
import { PasswordEntry, PasswordCategory } from "@/types/password";
import {
  createPasswordEntry,
  updatePasswordEntry,
} from "@/services/db/password";
import {
  generatePassword,
  checkPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  isValidUrl,
  DEFAULT_GENERATE_OPTIONS,
} from "@/utils/password";

interface PasswordEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  password?: PasswordEntry | null;
  categories: PasswordCategory[];
  onSaved: () => void;
}

const PasswordEntryModal: React.FC<PasswordEntryModalProps> = ({
  isOpen,
  onClose,
  password,
  categories,
  onSaved,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
    category: "other",
    isFavorite: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 重置表单
  useEffect(() => {
    if (isOpen) {
      if (password) {
        setFormData({
          title: password.title,
          username: password.username,
          password: password.password,
          url: password.url || "",
          notes: password.notes || "",
          category: password.category,
          isFavorite: password.isFavorite,
        });
      } else {
        setFormData({
          title: "",
          username: "",
          password: "",
          url: "",
          notes: "",
          category: "other",
          isFavorite: false,
        });
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen, password]);

  // 验证表单
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "请输入标题";
    }

    if (!formData.username.trim()) {
      newErrors.username = "请输入用户名";
    }

    if (!formData.password.trim()) {
      newErrors.password = "请输入密码";
    }

    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = "请输入有效的URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 生成随机密码
  const handleGeneratePassword = () => {
    try {
      const newPassword = generatePassword(DEFAULT_GENERATE_OPTIONS);
      setFormData((prev) => ({ ...prev, password: newPassword }));
      toast.success("密码已生成");
    } catch (error) {
      toast.error("生成密码失败");
    }
  };

  // 保存密码
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (password) {
        // 更新现有密码
        await updatePasswordEntry(password.id, {
          title: formData.title,
          username: formData.username,
          password: formData.password,
          url: formData.url || undefined,
          notes: formData.notes || undefined,
          category: formData.category,
          isFavorite: formData.isFavorite,
        });
        toast.success("密码已更新");
      } else {
        // 创建新密码
        await createPasswordEntry({
          title: formData.title,
          username: formData.username,
          password: formData.password,
          url: formData.url || undefined,
          notes: formData.notes || undefined,
          category: formData.category,
          tags: [],
          isFavorite: formData.isFavorite,
        });
        toast.success("密码已保存");
      }
      onSaved();
    } catch (error) {
      console.error("保存密码失败:", error);
      toast.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  const strengthResult = formData.password
    ? checkPasswordStrength(formData.password)
    : null;
  const strengthColor = strengthResult
    ? getPasswordStrengthColor(strengthResult.strength)
    : "default";
  const strengthText = strengthResult
    ? getPasswordStrengthText(strengthResult.strength)
    : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">
            {password ? "编辑密码" : "添加密码"}
          </h2>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {/* 标题 */}
          <Input
            label="标题"
            placeholder="输入网站或应用名称"
            value={formData.title}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, title: value }))
            }
            isInvalid={!!errors.title}
            errorMessage={errors.title}
            isRequired
          />

          {/* 用户名 */}
          <Input
            label="用户名"
            placeholder="输入用户名或邮箱"
            value={formData.username}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, username: value }))
            }
            isInvalid={!!errors.username}
            errorMessage={errors.username}
            isRequired
          />

          {/* 密码 */}
          <div className="space-y-2">
            <Input
              label="密码"
              placeholder="输入密码"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, password: value }))
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password}
              isRequired
              endContent={
                <div className="flex items-center gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={handleGeneratePassword}
                  >
                    <RiRefreshLine />
                  </Button>
                </div>
              }
            />

            {/* 密码强度指示器 */}
            {strengthResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/60">密码强度</span>
                  <Chip size="sm" color={strengthColor as any} variant="flat">
                    {strengthText}
                  </Chip>
                </div>
                <Progress
                  value={strengthResult.score}
                  color={strengthColor as any}
                  size="sm"
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* URL */}
          <Input
            label="网站地址"
            placeholder="https://example.com"
            value={formData.url}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, url: value }))
            }
            isInvalid={!!errors.url}
            errorMessage={errors.url}
          />

          {/* 分类 */}
          <Select
            label="分类"
            selectedKeys={[formData.category]}
            onSelectionChange={(keys) => {
              const category = Array.from(keys)[0] as string;
              setFormData((prev) => ({ ...prev, category }));
            }}
          >
            {categories.map((category) => (
              <SelectItem key={category.id}>{category.name}</SelectItem>
            ))}
          </Select>

          {/* 备注 */}
          <Textarea
            label="备注"
            placeholder="添加备注信息（可选）"
            value={formData.notes}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, notes: value }))
            }
            minRows={3}
          />

          {/* 收藏 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">添加到收藏</span>
            <Switch
              isSelected={formData.isFavorite}
              onValueChange={(checked) =>
                setFormData((prev) => ({ ...prev, isFavorite: checked }))
              }
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="flat"
            onPress={onClose}
            startContent={<RiCloseLine />}
          >
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={loading}
            startContent={<RiSave3Line />}
          >
            {password ? "更新" : "保存"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PasswordEntryModal;
