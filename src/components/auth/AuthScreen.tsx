import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Progress,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLockLine,
  RiShieldLine,
  RiTimeLine,
} from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const { state, login } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  const {
    isOpen: isHelpOpen,
    onOpen: onHelpOpen,
    onClose: onHelpClose,
  } = useDisclosure();

  // 计算锁定剩余时间
  useEffect(() => {
    if (!state.lockoutUntil) {
      setLockoutTimeLeft(0);
      return;
    }

    const updateLockoutTime = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, state.lockoutUntil! - now);
      setLockoutTimeLeft(timeLeft);

      if (timeLeft === 0) {
        setError("");
      }
    };

    updateLockoutTime();
    const interval = setInterval(updateLockoutTime, 1000);
    return () => clearInterval(interval);
  }, [state.lockoutUntil]);

  const handleLogin = async () => {
    if (!password.trim()) {
      setError("请输入密码");
      return;
    }

    if (lockoutTimeLeft > 0) {
      setError(`账户已被锁定，请等待 ${formatTime(lockoutTimeLeft)} 后再试`);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await login(password);

      if (success) {
        onAuthenticated();
      } else {
        setError(
          state.isLocked && lockoutTimeLeft > 0 ? "账户已被锁定" : "密码错误",
        );
        if (!success && lockoutTimeLeft === 0) {
          // 只有在非锁定状态下才清空密码
          setPassword("");
        }
      }
    } catch (err) {
      setError("登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleLogin();
    }
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isLocked = lockoutTimeLeft > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0">
            <CardBody className="p-8">
              {/* 应用图标和标题 */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                >
                  <RiShieldLine className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  TaiASST
                </h1>
                <p className="text-gray-600">请输入密码以解锁应用</p>
              </div>

              {/* 锁定状态显示 */}
              {isLocked && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Card className="bg-red-50 border border-red-200">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3">
                        <RiLockLine className="w-5 h-5 text-red-500" />
                        <div className="flex-1">
                          <p className="text-red-700 font-medium">
                            账户暂时锁定
                          </p>
                          <p className="text-red-600 text-sm mt-1">
                            由于多次密码错误，账户已被锁定。您可以输入密码，但需要等待锁定时间结束。
                          </p>
                          {lockoutTimeLeft > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <RiTimeLine className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-red-600 font-medium">
                                  剩余时间: {formatTime(lockoutTimeLeft)}
                                </span>
                              </div>
                              <Progress
                                value={
                                  ((15 * 60 * 1000 - lockoutTimeLeft) /
                                    (15 * 60 * 1000)) *
                                  100
                                }
                                color="danger"
                                size="sm"
                              />
                              <p className="text-xs text-red-500 mt-1">
                                锁定时间结束后即可尝试登录
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              {/* 失败次数显示 */}
              {state.failedAttempts > 0 && !isLocked && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <Chip
                    color="warning"
                    variant="flat"
                    className="w-full justify-center"
                  >
                    密码错误 {state.failedAttempts} 次，
                    {5 - state.failedAttempts} 次后将锁定账户
                  </Chip>
                </motion.div>
              )}

              {/* 密码输入 */}
              <div className="space-y-4">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="密码"
                  placeholder="请输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  isDisabled={isLoading}
                  isInvalid={!!error}
                  errorMessage={error}
                  startContent={
                    <RiLockLine className="w-4 h-4 text-gray-400" />
                  }
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <RiEyeOffLine className="w-4 h-4" />
                      ) : (
                        <RiEyeLine className="w-4 h-4" />
                      )}
                    </button>
                  }
                  classNames={{
                    input: "text-center",
                    inputWrapper:
                      "border-2 border-gray-200 hover:border-blue-300 focus-within:border-blue-500",
                  }}
                />

                <Button
                  color="primary"
                  size="lg"
                  className="w-full font-medium"
                  onClick={handleLogin}
                  isLoading={isLoading}
                  isDisabled={lockoutTimeLeft > 0 || !password.trim()}
                >
                  {isLoading
                    ? "验证中..."
                    : lockoutTimeLeft > 0
                      ? `锁定中 (${formatTime(lockoutTimeLeft)})`
                      : "解锁"}
                </Button>
              </div>

              {/* 帮助信息 */}
              <div className="mt-6 text-center">
                <Button
                  variant="light"
                  size="sm"
                  onClick={onHelpOpen}
                  className="text-gray-500 hover:text-gray-700"
                >
                  忘记密码？
                </Button>
              </div>

              {/* 安全提示 */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <RiShieldLine className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      安全提示
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      为了保护您的数据安全，连续输错密码5次将锁定账户15分钟
                    </p>
                    {process.env.NODE_ENV === "development" && (
                      <p className="text-xs text-blue-600 mt-2">
                        开发模式：即使在锁定状态下，您也可以输入密码，但需要等待锁定时间结束才能提交
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* 帮助模态框 */}
      <Modal isOpen={isHelpOpen} onClose={onHelpClose}>
        <ModalContent>
          <ModalHeader>密码重置帮助</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-gray-700">
                如果您忘记了密码，可以通过以下方式重置：
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium mb-2">⚠️ 重要提醒</p>
                <p className="text-yellow-700 text-sm">
                  重置密码将清除所有加密数据，包括保存的密码、AI配置等。请确保您已备份重要数据。
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">重置步骤：</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>关闭应用程序</li>
                  <li>删除应用数据目录中的数据库文件</li>
                  <li>重新启动应用程序</li>
                  <li>按照向导重新设置密码</li>
                </ol>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onHelpClose}>
              我知道了
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
