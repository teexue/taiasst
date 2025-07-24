import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { AuthScreen } from "./AuthScreen";
import { PasswordSetup } from "./PasswordSetup";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { state, refreshSettings } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await refreshSettings();

        // 如果没有设置密码，显示密码设置界面
        if (!state.hasPassword && !state.isLoading) {
          setShowPasswordSetup(true);
        }
      } catch (error) {
        console.error("认证初始化失败:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [refreshSettings, state.hasPassword, state.isLoading]);

  // 密码设置完成后的处理
  const handlePasswordSetupComplete = async () => {
    setShowPasswordSetup(false);
    await refreshSettings();
  };

  // 认证成功后的处理
  const handleAuthenticated = () => {
    // 认证成功，AuthContext 会自动更新状态
  };

  // 显示加载界面
  if (isInitializing || state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Spinner size="md" color="white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">TaiASST</h2>
          <p className="text-gray-600">正在初始化...</p>
        </motion.div>
      </div>
    );
  }

  // 显示密码设置界面
  if (showPasswordSetup) {
    return (
      <PasswordSetup
        onComplete={handlePasswordSetupComplete}
        isFirstTime={true}
      />
    );
  }

  // 如果需要认证且未认证，显示认证界面
  if (state.hasPassword && (!state.isAuthenticated || state.isLocked)) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  // 认证通过，显示应用内容
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="app-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
