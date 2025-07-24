import { execute, select } from "@/services/db/index";
import { error } from "@tauri-apps/plugin-log";

/**
 * 系统设置的类型定义
 */
export interface SystemSettings {
  minimizeToTray: boolean;
  autoStart: boolean;
  autoUpdate: boolean;
  currentTheme: string;
  // 安全设置
  autoLockEnabled: boolean;
  autoLockTime: number; // 分钟
  lockOnSystemSleep: boolean;
}

/**
 * 获取单个系统设置
 * @param key 设置键名
 * @returns 设置值，如果不存在则返回 null
 */
export async function getSystemSetting(key: string): Promise<string | null> {
  try {
    const rows = await select<{ value: string }>(
      "SELECT value FROM system_settings WHERE key = ?",
      [key],
    );

    return rows.length > 0 ? rows[0].value : null;
  } catch (err) {
    error(`获取系统设置失败 (${key}): ${String(err)}`);
    return null;
  }
}

/**
 * 设置单个系统配置项（带重试机制）
 * @param key 设置键名
 * @param value 设置值
 * @param retries 最大重试次数
 * @param delay 重试前延迟时间（毫秒）
 */
export async function setSystemSetting(
  key: string,
  value: string | boolean | number,
  retries = 3,
  delay = 300,
): Promise<void> {
  const strValue = typeof value === "string" ? value : String(value);
  const now = Math.floor(Date.now() / 1000);

  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await execute(
        `INSERT INTO system_settings (key, value, updated_at) 
         VALUES (?, ?, ?) 
         ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?`,
        [key, strValue, now, strValue, now],
      );
      return; // 操作成功，立即返回
    } catch (err: any) {
      lastError = err;

      // 检查错误是否为数据库锁定
      const isLockError =
        err.toString().includes("database is locked") ||
        (err.code && (err.code === 517 || err.code === "SQLITE_BUSY"));

      // 如果是最后一次尝试或者不是锁定错误，则不再重试
      if (attempt === retries || !isLockError) {
        break;
      }

      // 记录重试信息
      error(
        `设置系统设置 ${key} 时数据库锁定，${attempt + 1}/${retries} 次重试`,
      );

      // 等待一段时间后重试，每次增加延迟
      await new Promise((resolve) =>
        setTimeout(resolve, delay * (attempt + 1)),
      );
    }
  }

  // 所有重试都失败
  error(`设置系统设置失败 (${key}): ${String(lastError)}`);
  throw lastError;
}

/**
 * 获取所有系统设置（带重试机制）
 * @param retries 最大重试次数
 * @param delay 重试前延迟时间（毫秒）
 * @returns 所有系统设置的对象
 */
export async function getAllSystemSettings(
  retries = 3,
  delay = 300,
): Promise<SystemSettings> {
  // 默认设置
  const defaultSettings: SystemSettings = {
    minimizeToTray: false,
    autoStart: false,
    autoUpdate: true,
    currentTheme: "light",
    // 安全设置默认值
    autoLockEnabled: true,
    autoLockTime: 30, // 默认30分钟
    lockOnSystemSleep: true,
  };

  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const rows = await select<{ key: string; value: string }>(
        "SELECT key, value FROM system_settings",
      );

      // 将结果转换为键值对象
      const settingsMap: Record<string, string> = {};
      rows.forEach((row) => {
        settingsMap[row.key] = row.value;
      });

      // 使用默认值构建完整的设置对象
      return {
        minimizeToTray: parseBoolean(
          settingsMap["minimizeToTray"],
          defaultSettings.minimizeToTray,
        ),
        autoStart: parseBoolean(
          settingsMap["autoStart"],
          defaultSettings.autoStart,
        ),
        autoUpdate: parseBoolean(
          settingsMap["autoUpdate"],
          defaultSettings.autoUpdate,
        ),
        currentTheme:
          settingsMap["currentTheme"] || defaultSettings.currentTheme,
        // 安全设置
        autoLockEnabled: parseBoolean(
          settingsMap["autoLockEnabled"],
          defaultSettings.autoLockEnabled,
        ),
        autoLockTime:
          parseInt(settingsMap["autoLockTime"]) || defaultSettings.autoLockTime,
        lockOnSystemSleep: parseBoolean(
          settingsMap["lockOnSystemSleep"],
          defaultSettings.lockOnSystemSleep,
        ),
      };
    } catch (err: any) {
      lastError = err;

      // 检查错误是否为数据库锁定
      const isLockError =
        err.toString().includes("database is locked") ||
        (err.code && (err.code === 517 || err.code === "SQLITE_BUSY"));

      // 如果是最后一次尝试或者不是锁定错误，则不再重试
      if (attempt === retries || !isLockError) {
        break;
      }

      // 记录重试信息
      error(`获取系统设置时数据库锁定，${attempt + 1}/${retries} 次重试`);

      // 等待一段时间后重试，每次增加延迟
      await new Promise((resolve) =>
        setTimeout(resolve, delay * (attempt + 1)),
      );
    }
  }

  // 所有重试都失败，记录错误并返回默认设置
  error(`获取所有系统设置失败: ${String(lastError)}，使用默认设置`);
  return defaultSettings;
}

/**
 * 保存完整的系统设置（带重试机制）
 * @param settings 系统设置对象
 * @param retries 最大重试次数
 * @param delay 重试前延迟时间（毫秒）
 */
export async function saveAllSystemSettings(
  settings: SystemSettings,
  retries = 3,
  delay = 300,
): Promise<void> {
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // 使用顺序设置而非事务，以减少锁定时间
      await setSystemSetting("minimizeToTray", settings.minimizeToTray);
      await setSystemSetting("autoStart", settings.autoStart);
      await setSystemSetting("autoUpdate", settings.autoUpdate);
      await setSystemSetting("currentTheme", settings.currentTheme);

      return; // 所有设置保存成功
    } catch (err: any) {
      lastError = err;

      // 检查错误是否为数据库锁定
      const isLockError =
        err.toString().includes("database is locked") ||
        (err.code && (err.code === 517 || err.code === "SQLITE_BUSY"));

      // 如果是最后一次尝试或者不是锁定错误，则不再重试
      if (attempt === retries || !isLockError) {
        break;
      }

      // 记录重试信息
      error(`保存所有系统设置时数据库锁定，${attempt + 1}/${retries} 次重试`);

      // 等待一段时间后重试，每次增加延迟
      await new Promise((resolve) =>
        setTimeout(resolve, delay * (attempt + 1)),
      );
    }
  }

  // 所有重试都失败
  error(`保存所有系统设置失败: ${String(lastError)}`);
  throw lastError;
}

/**
 * 初始化系统设置，确保默认值存在
 * @param retries 最大重试次数
 */
export async function initSystemSettings(retries = 3): Promise<void> {
  try {
    // 获取当前设置或默认值
    const settings = await getAllSystemSettings();

    // 不使用 saveAllSystemSettings，而是单独设置每个选项
    // 这样单个设置失败不会影响整体初始化
    const promises = [
      setSystemSetting("minimizeToTray", settings.minimizeToTray, retries),
      setSystemSetting("autoStart", settings.autoStart, retries),
      setSystemSetting("autoUpdate", settings.autoUpdate, retries),
      setSystemSetting("currentTheme", settings.currentTheme, retries),
    ];

    // 使用 Promise.allSettled 而非 Promise.all
    // 这样即使部分设置失败，也可以完成其他设置
    const results = await Promise.allSettled(promises);

    // 检查哪些设置失败了
    const failedSettings = results
      .map((result, index) => ({ result, index }))
      .filter((item) => item.result.status === "rejected")
      .map((item) => {
        switch (item.index) {
          case 0:
            return "minimizeToTray";
          case 1:
            return "autoStart";
          case 2:
            return "autoUpdate";
          case 3:
            return "currentTheme";
          default:
            return `unknown-${item.index}`;
        }
      });

    if (failedSettings.length > 0) {
      error(`部分系统设置初始化失败: ${failedSettings.join(", ")}`);
    }
  } catch (err) {
    error(`初始化系统设置失败: ${String(err)}`);
    // 不抛出错误，避免阻止应用启动
  }
}

/**
 * 帮助函数：将字符串解析为布尔值
 */
function parseBoolean(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true";
}
