import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * 认证相关快捷键 Hook
 */
export const useAuthShortcuts = () => {
  const { lock, state } = useAuth();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 只在已认证且未锁定时处理快捷键
      if (!state.isAuthenticated || state.isLocked || !state.hasPassword) {
        return;
      }

      // Ctrl+Shift+L 或 Cmd+Shift+L 锁定应用
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "l"
      ) {
        event.preventDefault();
        lock();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [lock, state.isAuthenticated, state.isLocked, state.hasPassword]);
};
