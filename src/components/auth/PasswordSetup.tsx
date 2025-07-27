import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Progress,
  Chip,
  Divider,
} from "@heroui/react";
import { motion } from "framer-motion";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLockLine,
  RiShieldLine,
  RiCheckLine,
  RiCloseLine,
} from "react-icons/ri";
import { hashPassword, checkPasswordStrength } from "@/utils/crypto";
import { setPasswordHash } from "@/services/db/auth";

interface PasswordSetupProps {
  onComplete: () => void;
  isFirstTime?: boolean;
}

export const PasswordSetup: React.FC<PasswordSetupProps> = ({
  onComplete,
  isFirstTime = false,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = checkPasswordStrength(password);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const getStrengthColor = (level: string) => {
    switch (level) {
      case "weak":
        return "danger";
      case "fair":
        return "warning";
      case "good":
        return "primary";
      case "strong":
        return "success";
      default:
        return "default";
    }
  };

  const getStrengthText = (level: string) => {
    switch (level) {
      case "weak":
        return "弱";
      case "fair":
        return "一般";
      case "good":
        return "良好";
      case "strong":
        return "强";
      default:
        return "";
    }
  };

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError("请填写所有字段");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (passwordStrength.level === "weak") {
      setError("密码强度太弱，请设置更安全的密码");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { hash, salt } = await hashPassword(password);
      await setPasswordHash(hash, salt);
      onComplete();
    } catch (err) {
      setError("设置密码失败，请重试");
      console.error("密码设置失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="pb-2">
            <div className="w-full text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              >
                <RiShieldLine className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isFirstTime ? "设置应用密码" : "更改密码"}
              </h1>
              <p className="text-gray-600">
                {isFirstTime
                  ? "为了保护您的数据安全，请设置一个强密码"
                  : "请输入新的密码"}
              </p>
            </div>
          </CardHeader>

          <CardBody className="pt-2">
            <div className="space-y-6">
              {/* 密码输入 */}
              <div className="space-y-4">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="新密码"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={
                    password.length > 0 && passwordStrength.level === "weak"
                  }
                  startContent={
                    <RiLockLine className="w-4 h-4 text-gray-400" />
                  }
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <RiEyeOffLine className="w-4 h-4" />
                      ) : (
                        <RiEyeLine className="w-4 h-4" />
                      )}
                    </button>
                  }
                />

                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  label="确认密码"
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  isInvalid={confirmPassword.length > 0 && !passwordsMatch}
                  errorMessage={
                    confirmPassword.length > 0 && !passwordsMatch
                      ? "密码不一致"
                      : ""
                  }
                  startContent={
                    <RiLockLine className="w-4 h-4 text-gray-400" />
                  }
                  endContent={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <RiEyeOffLine className="w-4 h-4" />
                      ) : (
                        <RiEyeLine className="w-4 h-4" />
                      )}
                    </button>
                  }
                />
              </div>

              {/* 密码强度指示器 */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        密码强度
                      </span>
                      <Chip
                        size="sm"
                        color={getStrengthColor(passwordStrength.level)}
                        variant="flat"
                      >
                        {getStrengthText(passwordStrength.level)}
                      </Chip>
                    </div>
                    <Progress
                      value={passwordStrength.score}
                      color={getStrengthColor(passwordStrength.level)}
                      size="sm"
                    />
                  </div>

                  {/* 密码要求检查 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      密码要求：
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { check: password.length >= 8, text: "至少8个字符" },
                        { check: /[a-z]/.test(password), text: "包含小写字母" },
                        { check: /[A-Z]/.test(password), text: "包含大写字母" },
                        { check: /[0-9]/.test(password), text: "包含数字" },
                        {
                          check: /[^a-zA-Z0-9]/.test(password),
                          text: "包含特殊字符",
                        },
                      ].map((requirement, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {requirement.check ? (
                            <RiCheckLine className="w-4 h-4 text-green-500" />
                          ) : (
                            <RiCloseLine className="w-4 h-4 text-gray-300" />
                          )}
                          <span
                            className={`text-sm ${requirement.check ? "text-green-600" : "text-gray-500"}`}
                          >
                            {requirement.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 错误信息 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}

              <Divider />

              {/* 提交按钮 */}
              <Button
                color="primary"
                size="lg"
                className="w-full font-medium"
                onClick={handleSubmit}
                isLoading={isLoading}
                isDisabled={
                  !password ||
                  !confirmPassword ||
                  !passwordsMatch ||
                  passwordStrength.level === "weak"
                }
              >
                {isLoading
                  ? "设置中..."
                  : isFirstTime
                    ? "完成设置"
                    : "更改密码"}
              </Button>

              {/* 安全提示 */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <RiShieldLine className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      安全提示
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• 请使用强密码保护您的数据</li>
                      <li>• 不要与他人分享您的密码</li>
                      <li>• 定期更改密码以提高安全性</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};
