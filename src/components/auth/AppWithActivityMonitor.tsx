import React from "react";
import { useActivityMonitor } from "@/hooks/useActivityMonitor";
import { useAuthShortcuts } from "@/hooks/useAuthShortcuts";

interface AppWithActivityMonitorProps {
  children: React.ReactNode;
}

export const AppWithActivityMonitor: React.FC<AppWithActivityMonitorProps> = ({
  children,
}) => {
  // 启用活动监听器
  useActivityMonitor();

  // 启用认证快捷键
  useAuthShortcuts();

  return <>{children}</>;
};
