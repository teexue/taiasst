import Database from "@tauri-apps/plugin-sql";
import { info, error } from "@tauri-apps/plugin-log";

let db: Database | null = null;
let isInitialized = false;

/**
 * 初始化数据库连接及所有相关表
 */
export async function initDatabase() {
  if (isInitialized) return db;

  try {
    info("Initializing database...");
    db = await Database.load("sqlite:taiasst.db");
    // 移除对 initAiConfigTable 的调用，因为表创建已通过迁移系统处理
    // await initAiConfigTable();

    // 将来如果有其他需要手动初始化的表，可以在这里添加
    // await initOtherTables();

    isInitialized = true;
    info("Database initialized successfully.");
    return db;
  } catch (err) {
    error(`数据库初始化失败: ${String(err)}`);
    db = null; // 初始化失败，重置db实例
    isInitialized = false;
    throw err; // 重新抛出错误，以便上层可以处理
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
