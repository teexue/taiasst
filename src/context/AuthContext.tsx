import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import {
  getAuthSettings,
  updateLastAuthTime,
  incrementFailedAttempts,
  isAccountLocked,
  AuthSettings,
} from "@/services/db/auth";
import { verifyPassword } from "@/utils/crypto";
import { error, info } from "@tauri-apps/plugin-log";

interface AuthState {
  isAuthenticated: boolean;
  isLocked: boolean;
  hasPassword: boolean;
  isLoading: boolean;
  lastActivity: number;
  settings: AuthSettings | null;
  lockoutUntil?: number;
  failedAttempts: number;
}

interface AuthContextType {
  state: AuthState;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  lock: () => void;
  updateActivity: () => void;
  checkAutoLock: () => void;
  refreshSettings: () => Promise<void>;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_LOCKED"; payload: boolean }
  | { type: "SET_HAS_PASSWORD"; payload: boolean }
  | { type: "SET_SETTINGS"; payload: AuthSettings }
  | { type: "UPDATE_ACTIVITY" }
  | { type: "SET_FAILED_ATTEMPTS"; payload: number }
  | { type: "SET_LOCKOUT"; payload: number | undefined };

const initialState: AuthState = {
  isAuthenticated: false,
  isLocked: false,
  hasPassword: false,
  isLoading: true,
  lastActivity: Date.now(),
  settings: null,
  failedAttempts: 0,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_AUTHENTICATED":
      return {
        ...state,
        isAuthenticated: action.payload,
        isLocked: action.payload ? false : state.isLocked,
        lastActivity: action.payload ? Date.now() : state.lastActivity,
      };
    case "SET_LOCKED":
      return {
        ...state,
        isLocked: action.payload,
        isAuthenticated: action.payload ? false : state.isAuthenticated,
      };
    case "SET_HAS_PASSWORD":
      return { ...state, hasPassword: action.payload };
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    case "UPDATE_ACTIVITY":
      return { ...state, lastActivity: Date.now() };
    case "SET_FAILED_ATTEMPTS":
      return { ...state, failedAttempts: action.payload };
    case "SET_LOCKOUT":
      return { ...state, lockoutUntil: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 刷新设置
  const refreshSettings = useCallback(async () => {
    try {
      const settings = await getAuthSettings();
      dispatch({ type: "SET_SETTINGS", payload: settings });
      dispatch({ type: "SET_HAS_PASSWORD", payload: settings.hasPassword });
      dispatch({
        type: "SET_FAILED_ATTEMPTS",
        payload: settings.failedAttempts,
      });
      dispatch({ type: "SET_LOCKOUT", payload: settings.lockoutUntil });

      // 如果没有设置密码，则自动认证
      if (!settings.hasPassword) {
        dispatch({ type: "SET_AUTHENTICATED", payload: true });
      }
    } catch (err) {
      error(`刷新认证设置失败: ${String(err)}`);
    }
  }, []);

  // 登录
  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const settings = await getAuthSettings();

      if (
        !settings.hasPassword ||
        !settings.passwordHash ||
        !settings.passwordSalt
      ) {
        error("密码未设置或配置不完整");
        return false;
      }

      // 检查是否被锁定（但仍然允许密码验证）
      const locked = await isAccountLocked();
      if (locked) {
        dispatch({ type: "SET_LOCKED", payload: true });
        error("账户已被锁定，请稍后再试");
        return false;
      }

      const isValid = await verifyPassword(
        password,
        settings.passwordHash,
        settings.passwordSalt,
      );

      if (isValid) {
        await updateLastAuthTime();
        dispatch({ type: "SET_AUTHENTICATED", payload: true });
        dispatch({ type: "SET_LOCKED", payload: false });
        dispatch({ type: "SET_FAILED_ATTEMPTS", payload: 0 });
        dispatch({ type: "SET_LOCKOUT", payload: undefined });
        info("用户登录成功");
        return true;
      } else {
        const failedCount = await incrementFailedAttempts();
        dispatch({ type: "SET_FAILED_ATTEMPTS", payload: failedCount });

        if (failedCount >= 5) {
          dispatch({ type: "SET_LOCKED", payload: true });
          const lockoutTime = Date.now() + 15 * 60 * 1000;
          dispatch({ type: "SET_LOCKOUT", payload: lockoutTime });
        }

        error(`登录失败，失败次数: ${failedCount}`);
        return false;
      }
    } catch (err) {
      error(`登录过程出错: ${String(err)}`);
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // 登出
  const logout = useCallback(() => {
    dispatch({ type: "SET_AUTHENTICATED", payload: false });
    info("用户已登出");
  }, []);

  // 锁定
  const lock = useCallback(() => {
    dispatch({ type: "SET_LOCKED", payload: true });
    dispatch({ type: "SET_AUTHENTICATED", payload: false });
    info("应用已锁定");
  }, []);

  // 更新活动时间
  const updateActivity = useCallback(() => {
    if (state.isAuthenticated && !state.isLocked) {
      dispatch({ type: "UPDATE_ACTIVITY" });
    }
  }, [state.isAuthenticated, state.isLocked]);

  // 检查自动锁定
  const checkAutoLock = useCallback(() => {
    if (
      !state.isAuthenticated ||
      state.isLocked ||
      !state.settings?.autoLockEnabled
    ) {
      return;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - state.lastActivity;
    const autoLockTimeMs = (state.settings.autoLockTime || 30) * 60 * 1000;

    if (timeSinceLastActivity >= autoLockTimeMs) {
      lock();
      info(`应用因闲置 ${state.settings.autoLockTime} 分钟而自动锁定`);
    }
  }, [
    state.isAuthenticated,
    state.isLocked,
    state.lastActivity,
    state.settings,
    lock,
  ]);

  // 初始化
  useEffect(() => {
    const init = async () => {
      try {
        await refreshSettings();
      } catch (err) {
        error(`认证初始化失败: ${String(err)}`);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    init();
  }, [refreshSettings]);

  // 自动锁定检查定时器
  useEffect(() => {
    if (!state.settings?.autoLockEnabled) {
      return;
    }

    const interval = setInterval(checkAutoLock, 30000); // 每30秒检查一次
    return () => clearInterval(interval);
  }, [checkAutoLock, state.settings?.autoLockEnabled]);

  // 系统睡眠检测（简单实现）
  useEffect(() => {
    if (!state.settings?.lockOnSystemSleep) {
      return;
    }

    let lastTime = Date.now();

    const checkSystemSleep = () => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastTime;

      // 如果时间差超过5分钟，可能是系统睡眠了
      if (timeDiff > 5 * 60 * 1000 && state.isAuthenticated) {
        lock();
        info("检测到系统睡眠，应用已自动锁定");
      }

      lastTime = currentTime;
    };

    const interval = setInterval(checkSystemSleep, 10000); // 每10秒检查一次
    return () => clearInterval(interval);
  }, [state.settings?.lockOnSystemSleep, state.isAuthenticated, lock]);

  const value: AuthContextType = {
    state,
    login,
    logout,
    lock,
    updateActivity,
    checkAutoLock,
    refreshSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
