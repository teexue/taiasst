import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Switch,
  Slider,
  Card,
  CardBody,
  Chip,
  Progress,
} from "@heroui/react";
import {
  RiRefreshLine,
  RiFileCopyLine,
  RiCloseLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import { toast } from "sonner";
import {
  PasswordGenerateOptions,
  DEFAULT_GENERATE_OPTIONS,
} from "@/types/password";
import {
  generatePassword,
  checkPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  copyToClipboard,
} from "@/utils/password";

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordGeneratorModal: React.FC<PasswordGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [options, setOptions] = useState<PasswordGenerateOptions>(
    DEFAULT_GENERATE_OPTIONS,
  );
  const [generatedPassword, setGeneratedPassword] = useState("");

  // 生成密码
  const handleGeneratePassword = () => {
    try {
      const password = generatePassword(options);
      setGeneratedPassword(password);
    } catch (error) {
      toast.error("生成密码失败");
    }
  };

  // 复制密码
  const handleCopyPassword = async () => {
    if (!generatedPassword) return;

    const success = await copyToClipboard(generatedPassword);
    if (success) {
      toast.success("密码已复制到剪贴板");
    } else {
      toast.error("复制失败");
    }
  };

  // 初始化时生成密码
  useEffect(() => {
    if (isOpen) {
      handleGeneratePassword();
    }
  }, [isOpen, options]);

  const strengthResult = generatedPassword
    ? checkPasswordStrength(generatedPassword)
    : null;
  const strengthColor = strengthResult
    ? getPasswordStrengthColor(strengthResult.strength)
    : "default";
  const strengthText = strengthResult
    ? getPasswordStrengthText(strengthResult.strength)
    : "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <RiShieldCheckLine className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">密码生成器</h2>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* 生成的密码 */}
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">生成的密码</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<RiRefreshLine />}
                    onPress={handleGeneratePassword}
                  >
                    重新生成
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    startContent={<RiFileCopyLine />}
                    onPress={handleCopyPassword}
                    isDisabled={!generatedPassword}
                  >
                    复制
                  </Button>
                </div>
              </div>

              <Input
                value={generatedPassword}
                readOnly
                variant="bordered"
                classNames={{
                  input: "font-mono text-lg",
                }}
              />

              {/* 密码强度 */}
              {strengthResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">密码强度</span>
                    <Chip size="sm" color={strengthColor as any} variant="flat">
                      {strengthText} ({strengthResult.score}/100)
                    </Chip>
                  </div>
                  <Progress
                    value={strengthResult.score}
                    color={strengthColor as any}
                    size="sm"
                    className="w-full"
                  />

                  {/* 强度反馈 */}
                  {strengthResult.suggestions.length > 0 && (
                    <div className="text-xs text-foreground/60">
                      <p className="font-medium mb-1">建议:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {strengthResult.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* 生成选项 */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold">生成选项</h3>

            {/* 密码长度 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">密码长度</span>
                <span className="text-sm text-foreground/60">
                  {options.length} 位
                </span>
              </div>
              <Slider
                value={options.length}
                onChange={(value) =>
                  setOptions((prev) => ({
                    ...prev,
                    length: Array.isArray(value) ? value[0] : value,
                  }))
                }
                minValue={4}
                maxValue={128}
                step={1}
                color="primary"
                className="w-full"
              />
            </div>

            {/* 字符类型选项 */}
            <div className="space-y-3">
              <span className="text-sm font-medium">包含字符类型</span>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">大写字母 (A-Z)</span>
                  <Switch
                    size="sm"
                    isSelected={options.includeUppercase}
                    onValueChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeUppercase: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">小写字母 (a-z)</span>
                  <Switch
                    size="sm"
                    isSelected={options.includeLowercase}
                    onValueChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeLowercase: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">数字 (0-9)</span>
                  <Switch
                    size="sm"
                    isSelected={options.includeNumbers}
                    onValueChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeNumbers: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">特殊符号</span>
                  <Switch
                    size="sm"
                    isSelected={options.includeSymbols}
                    onValueChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeSymbols: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* 排除选项 */}
            <div className="space-y-3">
              <span className="text-sm font-medium">排除选项</span>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm">排除相似字符</span>
                    <p className="text-xs text-foreground/60">
                      排除 i, l, 1, L, o, 0, O
                    </p>
                  </div>
                  <Switch
                    size="sm"
                    isSelected={options.excludeSimilar}
                    onValueChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        excludeSimilar: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm">排除模糊字符</span>
                    <p className="text-xs text-foreground/60">
                      排除 {}, [], (), /, \, ', ", ~, ,, ;, ., &lt;, &gt;
                    </p>
                  </div>
                  <Switch
                    size="sm"
                    isSelected={options.excludeAmbiguous}
                    onValueChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        excludeAmbiguous: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="flat"
            onPress={onClose}
            startContent={<RiCloseLine />}
          >
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PasswordGeneratorModal;
