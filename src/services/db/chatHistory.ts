import { execute, select } from "./index";
import { error, info } from "@tauri-apps/plugin-log";
import { ChatCompletionMessage } from "@/services/ai/api";

// 聊天历史数据库接口
export interface DbChatHistory {
  id: string;
  title: string;
  provider?: string | null;
  model?: string | null;
  messages: string; // JSON字符串
  summary?: string | null;
  created_at: number;
  updated_at: number;
}

// 客户端使用的聊天历史接口
export interface ChatHistory {
  id: string;
  title: string;
  provider?: string;
  model?: string;
  messages: ChatCompletionMessage[];
  summary?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 保存或更新聊天历史
 * @param history 聊天历史对象
 * @returns 保存后的聊天ID
 */
export async function saveChatHistory(history: ChatHistory): Promise<string> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const messagesJson = JSON.stringify(history.messages);

    // 检查是否已存在
    const existing = await select<{ id: string }>(
      "SELECT id FROM ai_chat_histories WHERE id = ?",
      [history.id],
    );

    if (existing.length > 0) {
      // 更新现有记录
      await execute(
        `UPDATE ai_chat_histories SET 
          title = ?, 
          provider = ?, 
          model = ?, 
          messages = ?, 
          summary = ?, 
          updated_at = ? 
        WHERE id = ?`,
        [
          history.title,
          history.provider || null,
          history.model || null,
          messagesJson,
          history.summary || null,
          timestamp,
          history.id,
        ],
      );

      info(`已更新聊天历史: ${history.id}`);
    } else {
      // 插入新记录
      await execute(
        `INSERT INTO ai_chat_histories 
          (id, title, provider, model, messages, summary, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          history.id,
          history.title,
          history.provider || null,
          history.model || null,
          messagesJson,
          history.summary || null,
          timestamp,
          timestamp,
        ],
      );

      info(`已保存新聊天历史: ${history.id}`);
    }

    return history.id;
  } catch (err) {
    error(`保存聊天历史失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 获取单个聊天历史
 * @param id 聊天历史ID
 * @returns 聊天历史对象，不存在则返回null
 */
export async function getChatHistory(id: string): Promise<ChatHistory | null> {
  try {
    const rows = await select<DbChatHistory>(
      `SELECT id, title, provider, model, messages, summary, created_at, updated_at 
      FROM ai_chat_histories WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      provider: row.provider || undefined,
      model: row.model || undefined,
      messages: JSON.parse(row.messages),
      summary: row.summary || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    error(`获取聊天历史失败: ${String(err)}`);
    return null;
  }
}

/**
 * 获取所有聊天历史，按更新时间倒序排列
 * @param limit 限制返回数量
 * @param offset 分页偏移
 * @returns 聊天历史列表
 */
export async function getAllChatHistories(
  limit?: number,
  offset?: number,
): Promise<ChatHistory[]> {
  try {
    let sql = `SELECT id, title, provider, model, messages, summary, created_at, updated_at 
              FROM ai_chat_histories ORDER BY updated_at DESC`;

    const params = [];
    if (limit !== undefined) {
      sql += " LIMIT ?";
      params.push(limit);

      if (offset !== undefined) {
        sql += " OFFSET ?";
        params.push(offset);
      }
    }

    const rows = await select<DbChatHistory>(sql, params);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      provider: row.provider || undefined,
      model: row.model || undefined,
      messages: JSON.parse(row.messages),
      summary: row.summary || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    error(`获取聊天历史列表失败: ${String(err)}`);
    return [];
  }
}

/**
 * 删除聊天历史
 * @param id 聊天历史ID
 */
export async function deleteChatHistory(id: string): Promise<void> {
  try {
    await execute("DELETE FROM ai_chat_histories WHERE id = ?", [id]);
    info(`已删除聊天历史: ${id}`);
  } catch (err) {
    error(`删除聊天历史失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 生成聊天记录摘要
 * 从对话中提取前几个回合作为摘要
 * @param messages 消息列表
 * @returns 对话摘要
 */
export function generateChatSummary(messages: ChatCompletionMessage[]): string {
  // 跳过系统消息
  const userMessages = messages.filter((msg) => msg.role === "user");
  const firstUserMsg = userMessages.length > 0 ? userMessages[0].content : "";

  // 最多取50个字符作为摘要
  return firstUserMsg.length > 50
    ? firstUserMsg.substring(0, 47) + "..."
    : firstUserMsg;
}
