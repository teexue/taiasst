import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

/**
 * 初始化数据库连接
 */
export async function initDatabase() {
  if (!db) {
    db = await Database.load("sqlite:taiasst.db");
  }
  return db;
}

/**
 * 获取数据库实例
 */
export function getDatabase() {
  if (!db) {
    throw new Error("数据库未初始化");
  }
  return db;
}

/**
 * 执行SQL查询
 * @param sql SQL语句
 * @param params 参数
 */
export async function execute(sql: string, params: any[] = []) {
  const database = await initDatabase();
  return await database.execute(sql, params);
}

/**
 * 执行SELECT查询
 * @param sql SQL语句
 * @param params 参数
 */
export async function select<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const database = await initDatabase();
  const result = await database.select<T>(sql, params);
  return Array.isArray(result) ? result : [];
}
