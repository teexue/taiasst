import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Switch,
  Select,
  SelectItem,
  Button,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
} from "@heroui/react";
import { motion } from "framer-motion";
import {
  RiShieldLine,
  RiTimeLine,
  RiMoonLine,
  RiKeyLine,
  RiDeleteBinLine,
  RiAlertLine,
} from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";
import {
  getAuthSettings,
  saveAuthSettings,
  clearAuthData,
} from "@/services/db/auth";
import { PasswordSetup } from "@/components/auth/PasswordSetup";

export default function SecuritySettings() {
  const { refreshSettings } = useAuth();
  const [settings, setSettings] = useState({
    hasPassword: false,
    autoLockEnabled: true,
    autoLockTime: 30,
    lockOnSystemSleep: true,
    biometricEnabled: false,
  });
  const [, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);

  const {
    isOpen: isResetOpen,
    onOpen: onResetOpen,
    onClose: onResetClose,
  } = useDisclosure();

  // 自动锁定时间选项
  const autoLockOptions = [
    { value: "1", label: "1分钟" },
    { value: "5", label: "5分钟" },
    { value: "15", label: "15分钟" },
    { value: "30", label: "30分钟" },
    { value: "60", label: "1小时" },
    { value: "120", label: "2小时" },
    { value: "0", label: "从不" },
  ];

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const authSettings = await getAuthSettings();
        setSettings({
          hasPassword: authSettings.hasPassword,
          autoLockEnabled: authSettings.autoLockEnabled,
          autoLockTime: authSettings.autoLockTime,
          lockOnSystemSleep: authSettings.lockOnSystemSleep,
          biometricEnabled: authSettings.biometricEnabled,
        });
      } catch (error) {
        console.error("加载安全设置失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 保存设置
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveAuthSettings({
        autoLockEnabled: settings.autoLockEnabled,
        autoLockTime: settings.autoLockTime,
        lockOnSystemSleep: settings.lockOnSystemSleep,
        biometricEnabled: settings.biometricEnabled,
      });
      await refreshSettings();
    } catch (error) {
      console.error("保存安全设置失败:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // 重置应用数据
  const handleResetApp = async () => {
    try {
      await clearAuthData();
      // 重新加载页面以重置应用状态
      window.location.reload();
    } catch (error) {
      console.error("重置应用失败:", error);
    }
  };

  // 密码设置完成
  const handlePasswordSetupComplete = async () => {
    setShowPasswordSetup(false);
    await refreshSettings();
    const newSettings = await getAuthSettings();
    setSettings((prev) => ({ ...prev, hasPassword: newSettings.hasPassword }));
  };

  if (showPasswordSetup) {
    return (
      <PasswordSetup
        onComplete={handlePasswordSetupComplete}
        isFirstTime={!settings.hasPassword}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <RiShieldLine className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900">安全设置</h1>
      </div>

      {/* 密码设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <RiKeyLine className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold">应用密码</h3>
                <p className="text-sm text-gray-600">设置密码以保护您的数据</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">
                    {settings.hasPassword ? "密码已设置" : "未设置密码"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {settings.hasPassword
                      ? "应用启动时需要输入密码"
                      : "设置密码以保护应用安全"}
                  </p>
                </div>
                {settings.hasPassword && (
                  <Chip color="success" variant="flat" size="sm">
                    已启用
                  </Chip>
                )}
              </div>
              <Button
                color={settings.hasPassword ? "default" : "primary"}
                variant={settings.hasPassword ? "bordered" : "solid"}
                onClick={() => setShowPasswordSetup(true)}
              >
                {settings.hasPassword ? "更改密码" : "设置密码"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* 自动锁定设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <RiTimeLine className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold">自动锁定</h3>
                <p className="text-sm text-gray-600">设置应用自动锁定的时间</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">启用自动锁定</p>
                <p className="text-sm text-gray-600">
                  在指定时间无操作后自动锁定应用
                </p>
              </div>
              <Switch
                isSelected={settings.autoLockEnabled}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, autoLockEnabled: value }))
                }
                isDisabled={!settings.hasPassword}
              />
            </div>

            {settings.autoLockEnabled && settings.hasPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Select
                  label="自动锁定时间"
                  placeholder="选择锁定时间"
                  selectedKeys={[settings.autoLockTime.toString()]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setSettings((prev) => ({
                      ...prev,
                      autoLockTime: parseInt(value),
                    }));
                  }}
                >
                  {autoLockOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              </motion.div>
            )}

            {!settings.hasPassword && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  需要先设置密码才能启用自动锁定功能
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* 系统睡眠锁定 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <RiMoonLine className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold">系统睡眠锁定</h3>
                <p className="text-sm text-gray-600">
                  系统睡眠或休眠时自动锁定应用
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">睡眠时锁定</p>
                <p className="text-sm text-gray-600">
                  检测到系统睡眠时自动锁定应用
                </p>
              </div>
              <Switch
                isSelected={settings.lockOnSystemSleep}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, lockOnSystemSleep: value }))
                }
                isDisabled={!settings.hasPassword}
              />
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* 保存按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          color="primary"
          size="lg"
          onClick={handleSaveSettings}
          isLoading={isSaving}
          className="w-full"
        >
          {isSaving ? "保存中..." : "保存设置"}
        </Button>
      </motion.div>

      <Divider />

      {/* 危险操作 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <RiAlertLine className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-red-700">危险操作</h3>
                <p className="text-sm text-red-600">这些操作将永久删除数据</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-700">重置应用</p>
                <p className="text-sm text-red-600">
                  清除所有数据，包括密码、设置和保存的信息
                </p>
              </div>
              <Button
                color="danger"
                variant="bordered"
                startContent={<RiDeleteBinLine className="w-4 h-4" />}
                onClick={onResetOpen}
              >
                重置应用
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* 重置确认模态框 */}
      <Modal isOpen={isResetOpen} onClose={onResetClose}>
        <ModalContent>
          <ModalHeader className="text-red-700">确认重置应用</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <RiAlertLine className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700">⚠️ 警告</p>
                    <p className="text-red-600 text-sm mt-1">
                      此操作将永久删除以下数据：
                    </p>
                  </div>
                </div>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>应用密码和安全设置</li>
                <li>所有AI配置和API密钥</li>
                <li>保存的对话记录</li>
                <li>工作流和自动化设置</li>
                <li>其他所有应用数据</li>
              </ul>
              <p className="text-sm text-gray-600">
                重置后，应用将回到初始状态，您需要重新进行所有配置。
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onResetClose}>
              取消
            </Button>
            <Button color="danger" onClick={handleResetApp}>
              确认重置
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
