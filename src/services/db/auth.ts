import { execute, select } from "@/services/db/index";
import { error, info } from "@tauri-apps/plugin-log";

/**
 * 认证设置的类型定义
 */
export interface AuthSettings {
  hasPassword: boolean;
  passwordHash?: string;
  passwordSalt?: string;
  autoLockEnabled: boolean;
  autoLockTime: number; // 分钟
  lockOnSystemSleep: boolean;
  biometricEnabled: boolean;
  lastAuthTime?: number;
  failedAttempts: number;
  lockoutUntil?: number;
}

/**
 * 认证状态
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLocked: boolean;
  lastActivity: number;
  sessionId?: string;
}

/**
 * 获取认证设置
 */
export async function getAuthSettings(): Promise<AuthSettings> {
  try {
    const rows = await select<{ key: string; value: string }>(
      "SELECT key, value FROM auth_settings",
      [],
    );

    const settings: Record<string, string> = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    return {
      hasPassword: settings.hasPassword === "true",
      passwordHash: settings.passwordHash,
      passwordSalt: settings.passwordSalt,
      autoLockEnabled: settings.autoLockEnabled !== "false", // 默认启用
      autoLockTime: parseInt(settings.autoLockTime) || 30, // 默认30分钟
      lockOnSystemSleep: settings.lockOnSystemSleep !== "false", // 默认启用
      biometricEnabled: settings.biometricEnabled === "true",
      lastAuthTime: settings.lastAuthTime
        ? parseInt(settings.lastAuthTime)
        : undefined,
      failedAttempts: parseInt(settings.failedAttempts) || 0,
      lockoutUntil: settings.lockoutUntil
        ? parseInt(settings.lockoutUntil)
        : undefined,
    };
  } catch (err) {
    error(`获取认证设置失败: ${String(err)}`);
    // 返回默认设置
    return {
      hasPassword: false,
      autoLockEnabled: true,
      autoLockTime: 30,
      lockOnSystemSleep: true,
      biometricEnabled: false,
      failedAttempts: 0,
    };
  }
}

/**
 * 设置认证配置项
 */
export async function setAuthSetting(
  key: string,
  value: string | boolean | number,
): Promise<void> {
  try {
    const strValue = typeof value === "string" ? value : String(value);
    const now = Math.floor(Date.now() / 1000);

    await execute(
      `INSERT INTO auth_settings (key, value, updated_at) 
       VALUES (?, ?, ?) 
       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?`,
      [key, strValue, now, strValue, now],
    );

    info(`认证设置已更新: ${key} = ${strValue}`);
  } catch (err) {
    error(`设置认证配置失败 (${key}): ${String(err)}`);
    throw err;
  }
}

/**
 * 保存密码哈希和盐值
 */
export async function setPasswordHash(
  hash: string,
  salt: string,
): Promise<void> {
  try {
    await setAuthSetting("passwordHash", hash);
    await setAuthSetting("passwordSalt", salt);
    await setAuthSetting("hasPassword", true);
    info("密码哈希已保存");
  } catch (err) {
    error(`保存密码哈希失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 更新最后认证时间
 */
export async function updateLastAuthTime(): Promise<void> {
  try {
    const now = Date.now();
    await setAuthSetting("lastAuthTime", now);
    await setAuthSetting("failedAttempts", 0); // 重置失败次数
    await setAuthSetting("lockoutUntil", 0); // 清除锁定
  } catch (err) {
    error(`更新认证时间失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 增加失败尝试次数
 */
export async function incrementFailedAttempts(): Promise<number> {
  try {
    const settings = await getAuthSettings();
    const newCount = settings.failedAttempts + 1;

    await setAuthSetting("failedAttempts", newCount);

    // 如果失败次数过多，设置锁定时间
    if (newCount >= 5) {
      const lockoutTime = Date.now() + 15 * 60 * 1000; // 锁定15分钟
      await setAuthSetting("lockoutUntil", lockoutTime);
      info(`账户已锁定15分钟，失败次数: ${newCount}`);
    }

    return newCount;
  } catch (err) {
    error(`更新失败次数失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 检查是否被锁定
 */
export async function isAccountLocked(): Promise<boolean> {
  try {
    const settings = await getAuthSettings();

    if (!settings.lockoutUntil) {
      return false;
    }

    const now = Date.now();
    if (now < settings.lockoutUntil) {
      return true;
    }

    // 锁定时间已过，清除锁定状态
    await setAuthSetting("lockoutUntil", 0);
    await setAuthSetting("failedAttempts", 0);
    return false;
  } catch (err) {
    error(`检查锁定状态失败: ${String(err)}`);
    return false;
  }
}

/**
 * 保存所有认证设置
 */
export async function saveAuthSettings(
  settings: Partial<AuthSettings>,
): Promise<void> {
  try {
    const promises: Promise<void>[] = [];

    if (settings.autoLockEnabled !== undefined) {
      promises.push(
        setAuthSetting("autoLockEnabled", settings.autoLockEnabled),
      );
    }

    if (settings.autoLockTime !== undefined) {
      promises.push(setAuthSetting("autoLockTime", settings.autoLockTime));
    }

    if (settings.lockOnSystemSleep !== undefined) {
      promises.push(
        setAuthSetting("lockOnSystemSleep", settings.lockOnSystemSleep),
      );
    }

    if (settings.biometricEnabled !== undefined) {
      promises.push(
        setAuthSetting("biometricEnabled", settings.biometricEnabled),
      );
    }

    await Promise.all(promises);
    info("认证设置已保存");
  } catch (err) {
    error(`保存认证设置失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 清除所有认证数据（重置应用）
 */
export async function clearAuthData(): Promise<void> {
  try {
    await execute("DELETE FROM auth_settings", []);
    info("认证数据已清除");
  } catch (err) {
    error(`清除认证数据失败: ${String(err)}`);
    throw err;
  }
}
