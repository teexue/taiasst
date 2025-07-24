import { execute, select } from "@/services/db/index";
import { error, info } from "@tauri-apps/plugin-log";
import {
  PasswordEntry,
  PasswordCategory,
  PasswordFilter,
} from "@/types/password";
import { v4 as uuidv4 } from "uuid";

// 注意：密码管理表的创建和默认分类的初始化现在由Rust端的迁移系统处理
// 参见：src-tauri/src/db/migrations.rs 中的 get_password_management_migrations()

/**
 * 获取所有密码条目
 */
export async function getAllPasswordEntries(
  filter?: PasswordFilter,
): Promise<PasswordEntry[]> {
  try {
    let sql = `
      SELECT id, title, username, password, url, notes, category, tags, 
             is_favorite, created_at, updated_at, last_used
      FROM password_entries
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    // 添加搜索条件
    if (filter?.query) {
      conditions.push("(title LIKE ? OR username LIKE ? OR url LIKE ?)");
      const searchTerm = `%${filter.query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filter?.category) {
      conditions.push("category = ?");
      params.push(filter.category);
    }

    if (filter?.isFavorite !== undefined) {
      conditions.push("is_favorite = ?");
      params.push(filter.isFavorite ? 1 : 0);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    // 添加排序
    const sortBy = filter?.sortBy || "updated_at";
    const sortOrder = filter?.sortOrder || "desc";
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;

    const rows = await select<any>(sql, params);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      username: row.username,
      password: row.password,
      url: row.url,
      notes: row.notes,
      category: row.category,
      tags: JSON.parse(row.tags || "[]"),
      isFavorite: Boolean(row.is_favorite),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastUsed: row.last_used,
    }));
  } catch (err) {
    error(`获取密码条目失败: ${String(err)}`);
    return [];
  }
}

/**
 * 获取单个密码条目
 */
export async function getPasswordEntry(
  id: string,
): Promise<PasswordEntry | null> {
  try {
    const rows = await select<any>(
      `SELECT id, title, username, password, url, notes, category, tags, 
              is_favorite, created_at, updated_at, last_used
       FROM password_entries WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      username: row.username,
      password: row.password,
      url: row.url,
      notes: row.notes,
      category: row.category,
      tags: JSON.parse(row.tags || "[]"),
      isFavorite: Boolean(row.is_favorite),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastUsed: row.last_used,
    };
  } catch (err) {
    error(`获取密码条目失败: ${String(err)}`);
    return null;
  }
}

/**
 * 创建密码条目
 */
export async function createPasswordEntry(
  entry: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  try {
    const id = uuidv4();
    const now = Date.now();

    await execute(
      `INSERT INTO password_entries 
       (id, title, username, password, url, notes, category, tags, is_favorite, created_at, updated_at, last_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        entry.title,
        entry.username,
        entry.password,
        entry.url || null,
        entry.notes || null,
        entry.category,
        JSON.stringify(entry.tags),
        entry.isFavorite ? 1 : 0,
        now,
        now,
        entry.lastUsed || null,
      ],
    );

    info(`密码条目创建成功: ${entry.title}`);
    return id;
  } catch (err) {
    error(`创建密码条目失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 更新密码条目
 */
export async function updatePasswordEntry(
  id: string,
  entry: Partial<PasswordEntry>,
): Promise<void> {
  try {
    const now = Date.now();

    await execute(
      `UPDATE password_entries 
       SET title = COALESCE(?, title),
           username = COALESCE(?, username),
           password = COALESCE(?, password),
           url = COALESCE(?, url),
           notes = COALESCE(?, notes),
           category = COALESCE(?, category),
           tags = COALESCE(?, tags),
           is_favorite = COALESCE(?, is_favorite),
           updated_at = ?,
           last_used = COALESCE(?, last_used)
       WHERE id = ?`,
      [
        entry.title,
        entry.username,
        entry.password,
        entry.url,
        entry.notes,
        entry.category,
        entry.tags ? JSON.stringify(entry.tags) : null,
        entry.isFavorite !== undefined ? (entry.isFavorite ? 1 : 0) : null,
        now,
        entry.lastUsed,
        id,
      ],
    );

    info(`密码条目更新成功: ${id}`);
  } catch (err) {
    error(`更新密码条目失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 删除密码条目
 */
export async function deletePasswordEntry(id: string): Promise<void> {
  try {
    await execute("DELETE FROM password_entries WHERE id = ?", [id]);
    info(`密码条目删除成功: ${id}`);
  } catch (err) {
    error(`删除密码条目失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 获取所有密码分类
 */
export async function getAllPasswordCategories(): Promise<PasswordCategory[]> {
  try {
    const categories = await select<{
      id: string;
      name: string;
      icon: string;
      color: string;
    }>("SELECT id, name, icon, color FROM password_categories ORDER BY name");

    // 获取每个分类的密码数量
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const countRows = await select<{ count: number }>(
          "SELECT COUNT(*) as count FROM password_entries WHERE category = ?",
          [category.id],
        );
        return {
          ...category,
          count: countRows[0]?.count || 0,
        };
      }),
    );

    return categoriesWithCount;
  } catch (err) {
    error(`获取密码分类失败: ${String(err)}`);
    return [];
  }
}

/**
 * 更新密码最后使用时间
 */
export async function updatePasswordLastUsed(id: string): Promise<void> {
  try {
    const now = Date.now();
    await execute("UPDATE password_entries SET last_used = ? WHERE id = ?", [
      now,
      id,
    ]);
  } catch (err) {
    error(`更新密码使用时间失败: ${String(err)}`);
  }
}
