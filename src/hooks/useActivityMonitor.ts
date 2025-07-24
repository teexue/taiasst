import { useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * 用户活动监听器 Hook
 * 监听用户的鼠标、键盘活动，用于自动锁定功能
 */
export const useActivityMonitor = () => {
  const { updateActivity, state } = useAuth();

  // 活动事件处理器
  const handleActivity = useCallback(() => {
    if (state.isAuthenticated && !state.isLocked) {
      updateActivity();
    }
  }, [updateActivity, state.isAuthenticated, state.isLocked]);

  // 节流处理，避免过于频繁的更新
  const throttledHandleActivity = useCallback(() => {
    let lastCall = 0;
    return () => {
      const now = Date.now();
      if (now - lastCall >= 1000) {
        // 最多每秒更新一次
        lastCall = now;
        handleActivity();
      }
    };
  }, [handleActivity])();

  useEffect(() => {
    // 只在已认证且未锁定时监听活动
    if (!state.isAuthenticated || state.isLocked) {
      return;
    }

    // 监听的事件类型
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // 添加事件监听器
    events.forEach((event) => {
      document.addEventListener(event, throttledHandleActivity, true);
    });

    // 清理函数
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, throttledHandleActivity, true);
      });
    };
  }, [throttledHandleActivity, state.isAuthenticated, state.isLocked]);

  return {
    updateActivity: handleActivity,
  };
};
