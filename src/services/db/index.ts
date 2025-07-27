import Database from "@tauri-apps/plugin-sql";
import { info, error } from "@tauri-apps/plugin-log";

let db: Database | null = null;
let isInitialized = false;
let initPromise: Promise<Database | null> | null = null;

/**
 * 初始化数据库连接及所有相关表
 */
export async function initDatabase() {
  if (isInitialized) return db;

  // 如果已经有初始化在进行中，等待它完成
  if (initPromise) {
    return await initPromise;
  }

  initPromise = (async () => {
    try {
      info("Initializing database...");
      db = await Database.load("sqlite:taiasst.db");
      // 所有表创建都通过Rust端的迁移系统处理
      // 包括AI配置表、密码管理表等

      // 将来如果有其他需要手动初始化的数据，可以在这里添加
      // await initOtherData();

      isInitialized = true;
      info("Database initialized successfully.");
      return db;
    } catch (err) {
      error(`数据库初始化失败: ${String(err)}`);
      db = null;
      isInitialized = false;
      throw err;
    } finally {
      initPromise = null;
    }
  })();

  return await initPromise;
}

/**
 * 轻量级数据库连接检查
 * 只检查连接是否可用，不执行复杂操作
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    if (!isInitialized || !db) {
      // 如果数据库未初始化，尝试快速初始化
      await initDatabase();
    }

    // 如果数据库已经初始化，直接返回成功
    if (db && isInitialized) {
      return true;
    }

    return false;
  } catch (err) {
    console.warn("数据库连接检查失败:", err);
    return false;
  }
}

/**
 * 获取数据库实例 (确保已初始化)
 */
export async function getDatabase() {
  if (!isInitialized || !db) {
    await initDatabase(); // 如果未初始化或db为null，尝试初始化
  }
  if (!db) {
    // 如果初始化后仍然没有db实例，抛出错误
    throw new Error("数据库未能成功初始化");
  }
  return db;
}

/**
 * 执行SQL命令 (INSERT, UPDATE, DELETE)
 * @param sql SQL语句
 * @param params 参数
 */
export async function execute(sql: string, params: any[] = []) {
  const database = await getDatabase(); // 确保数据库已连接
  return await database.execute(sql, params);
}

/**
 * 执行SELECT查询
 * @param sql SQL语句
 * @param params 参数
 */
export async function select<T = any>(
  sql: string,
  params: any[] = [],
): Promise<T[]> {
  const database = await getDatabase(); // 确保数据库已连接
  const result = await database.select<T>(sql, params);
  // 确保总是返回数组，即使结果是空或非数组
  return Array.isArray(result) ? result : [];
}
