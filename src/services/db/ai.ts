import { execute, select } from "@/services/db/index";
import { error } from "@tauri-apps/plugin-log";

export interface AiProviderConfig {
  provider: string; // e.g., 'openai'
  api_key?: string | null;
  base_url?: string | null;
  // 可以添加其他提供商特定的设置
  updated_at: number;
}

export interface AiModelConfig {
  id?: number;
  provider: string; // 对应的AI提供商ID
  model_id: string; // 模型ID，与提供商相关
  name: string; // 用户友好的模型名称
  description?: string; // 模型说明
  enabled: boolean; // 是否启用
  created_at?: number;
  updated_at?: number;
}

export interface AiPromptTemplate {
  id?: number;
  title: string; // 模板标题
  content: string; // 提示词内容
  category?: string; // 分类
  tags?: string; // 标签，逗号分隔
  is_favorite: boolean; // 是否收藏
  created_at?: number;
  updated_at?: number;
}

/**
 * 保存或更新 AI 提供商配置
 * @param provider 提供商标识 (e.g., 'openai')
 * @param config 配置对象
 */
export async function saveAiProviderConfig(
  provider: string,
  config: Partial<Omit<AiProviderConfig, "provider" | "updated_at">>,
): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000);
  try {
    const existing = await select<any>(
      "SELECT provider FROM ai_provider_config WHERE provider = ?",
      [provider],
    );

    if (existing.length > 0) {
      // 构建更新语句
      let sql = "UPDATE ai_provider_config SET updated_at = ?";
      const params: (string | number | null)[] = [timestamp];
      if (config.api_key !== undefined) {
        sql += ", api_key = ?";
        params.push(config.api_key);
      }
      if (config.base_url !== undefined) {
        sql += ", base_url = ?";
        params.push(config.base_url);
      }
      sql += " WHERE provider = ?";
      params.push(provider);

      await execute(sql, params);
      console.log(`AI config updated for provider: ${provider}`);
    } else {
      // 插入新配置
      await execute(
        `INSERT INTO ai_provider_config (provider, api_key, base_url, updated_at)
         VALUES (?, ?, ?, ?)`,
        [provider, config.api_key ?? null, config.base_url ?? null, timestamp],
      );
      console.log(`AI config inserted for provider: ${provider}`);
    }
  } catch (err) {
    error(`保存 AI 提供商 ${provider} 配置失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 获取指定 AI 提供商的配置
 * @param provider 提供商标识
 * @returns 配置对象或 null
 */
export async function getAiProviderConfig(
  provider: string,
): Promise<Omit<AiProviderConfig, "provider"> | null> {
  try {
    const rows = await select<Omit<AiProviderConfig, "provider">>(
      "SELECT api_key, base_url, updated_at FROM ai_provider_config WHERE provider = ?",
      [provider],
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    error(`获取 AI 提供商 ${provider} 配置失败: ${String(err)}`);
    return null;
  }
}

/**
 * 删除指定 AI 提供商的配置
 * @param provider 提供商标识
 */
export async function deleteAiProviderConfig(provider: string): Promise<void> {
  try {
    await execute("DELETE FROM ai_provider_config WHERE provider = ?", [
      provider,
    ]);
    console.log(`AI config deleted for provider: ${provider}`);
  } catch (err) {
    error(`删除 AI 提供商 ${provider} 配置失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 获取所有已配置的AI提供商列表
 */
export async function getAllAiProviders(): Promise<string[]> {
  try {
    const rows = await select<{ provider: string }>(
      "SELECT provider FROM ai_provider_config ORDER BY provider",
    );
    return rows.map((row) => row.provider);
  } catch (err) {
    error(`获取 AI 提供商列表失败: ${String(err)}`);
    return [];
  }
}

// ========================== 模型配置相关函数 ==========================

/**
 * 保存或更新模型配置
 * @param modelConfig 模型配置对象
 */
export async function saveModelConfig(
  modelConfig: AiModelConfig,
): Promise<number> {
  const timestamp = Math.floor(Date.now() / 1000);
  try {
    if (modelConfig.id) {
      // 更新已有模型
      await execute(
        `UPDATE ai_model_config 
         SET name = ?, description = ?, enabled = ?, updated_at = ? 
         WHERE id = ?`,
        [
          modelConfig.name,
          modelConfig.description || null,
          modelConfig.enabled ? 1 : 0,
          timestamp,
          modelConfig.id,
        ],
      );
      return modelConfig.id;
    } else {
      // 添加新模型
      const result = await execute(
        `INSERT INTO ai_model_config 
         (provider, model_id, name, description, enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          modelConfig.provider,
          modelConfig.model_id,
          modelConfig.name,
          modelConfig.description || null,
          modelConfig.enabled ? 1 : 0,
          timestamp,
          timestamp,
        ],
      );
      return result.lastInsertId as number;
    }
  } catch (err) {
    error(`保存模型配置失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 批量保存模型配置
 * @param modelConfigs 模型配置对象数组
 */
export async function saveModelConfigs(
  modelConfigs: AiModelConfig[],
): Promise<void> {
  try {
    // 使用事务处理批量保存
    await execute("BEGIN TRANSACTION");
    for (const config of modelConfigs) {
      await saveModelConfig(config);
    }
    await execute("COMMIT");
  } catch (err) {
    await execute("ROLLBACK");
    error(`批量保存模型配置失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 获取指定ID的模型配置
 * @param id 模型配置ID
 */
export async function getModelConfigById(
  id: number,
): Promise<AiModelConfig | null> {
  try {
    const rows = await select<any>(
      `SELECT id, provider, model_id, name, description, enabled, created_at, updated_at
       FROM ai_model_config WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) return null;

    return {
      id: rows[0].id,
      provider: rows[0].provider,
      model_id: rows[0].model_id,
      name: rows[0].name,
      description: rows[0].description,
      enabled: rows[0].enabled === 1,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
    };
  } catch (err) {
    error(`获取模型配置失败: ${String(err)}`);
    return null;
  }
}

/**
 * 获取指定提供商的所有模型配置
 * @param provider 提供商ID
 * @param enabledOnly 是否只返回启用的模型
 */
export async function getModelsByProvider(
  provider: string,
  enabledOnly: boolean = false,
): Promise<AiModelConfig[]> {
  try {
    let sql = `
      SELECT id, provider, model_id, name, description, enabled, created_at, updated_at
      FROM ai_model_config 
      WHERE provider = ?
    `;

    if (enabledOnly) {
      sql += " AND enabled = 1";
    }

    sql += " ORDER BY name";

    const rows = await select<any>(sql, [provider]);

    return rows.map((row) => ({
      id: row.id,
      provider: row.provider,
      model_id: row.model_id,
      name: row.name,
      description: row.description,
      enabled: row.enabled === 1,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (err) {
    error(`获取提供商 ${provider} 的模型配置失败: ${String(err)}`);
    return [];
  }
}

/**
 * 获取所有已启用的模型配置
 */
export async function getAllEnabledModels(): Promise<AiModelConfig[]> {
  try {
    const sql = `
      SELECT m.id, m.provider, m.model_id, m.name, m.description, m.enabled, 
             m.created_at, m.updated_at
      FROM ai_model_config m
      INNER JOIN ai_provider_config p ON m.provider = p.provider
      WHERE m.enabled = 1
      ORDER BY m.provider, m.name
    `;

    const rows = await select<any>(sql);

    return rows.map((row) => ({
      id: row.id,
      provider: row.provider,
      model_id: row.model_id,
      name: row.name,
      description: row.description,
      enabled: true, // 因为查询条件中已经限制了 enabled = 1
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (err) {
    error(`获取所有已启用模型失败: ${String(err)}`);
    return [];
  }
}

/**
 * 删除指定ID的模型配置
 * @param id 模型配置ID
 */
export async function deleteModelConfig(id: number): Promise<void> {
  try {
    await execute("DELETE FROM ai_model_config WHERE id = ?", [id]);
  } catch (err) {
    error(`删除模型配置失败: ${String(err)}`);
    throw err;
  }
}

// ========================== 提示词模板相关函数 ==========================

/**
 * 保存或更新提示词模板
 * @param template 提示词模板对象
 */
export async function savePromptTemplate(
  template: AiPromptTemplate,
): Promise<number> {
  const timestamp = Math.floor(Date.now() / 1000);
  try {
    if (template.id) {
      // 更新已有模板
      await execute(
        `UPDATE ai_prompt_templates 
         SET title = ?, content = ?, category = ?, tags = ?, is_favorite = ?, updated_at = ? 
         WHERE id = ?`,
        [
          template.title,
          template.content,
          template.category || null,
          template.tags || null,
          template.is_favorite ? 1 : 0,
          timestamp,
          template.id,
        ],
      );
      return template.id;
    } else {
      // 添加新模板
      const result = await execute(
        `INSERT INTO ai_prompt_templates 
         (title, content, category, tags, is_favorite, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          template.title,
          template.content,
          template.category || null,
          template.tags || null,
          template.is_favorite ? 1 : 0,
          timestamp,
          timestamp,
        ],
      );
      return result.lastInsertId as number;
    }
  } catch (err) {
    error(`保存提示词模板失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 获取指定ID的提示词模板
 * @param id 提示词模板ID
 */
export async function getPromptTemplateById(
  id: number,
): Promise<AiPromptTemplate | null> {
  try {
    const rows = await select<any>(
      `SELECT id, title, content, category, tags, is_favorite, created_at, updated_at
       FROM ai_prompt_templates WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) return null;

    return {
      id: rows[0].id,
      title: rows[0].title,
      content: rows[0].content,
      category: rows[0].category,
      tags: rows[0].tags,
      is_favorite: rows[0].is_favorite === 1,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
    };
  } catch (err) {
    error(`获取提示词模板失败: ${String(err)}`);
    return null;
  }
}

/**
 * 获取所有提示词模板
 * @param category 可选的分类过滤
 * @param favoritesOnly 是否只返回收藏的模板
 */
export async function getAllPromptTemplates(
  category?: string,
  favoritesOnly: boolean = false,
): Promise<AiPromptTemplate[]> {
  try {
    let sql = `
      SELECT id, title, content, category, tags, is_favorite, created_at, updated_at
      FROM ai_prompt_templates 
      WHERE 1=1
    `;

    const params: any[] = [];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (favoritesOnly) {
      sql += " AND is_favorite = 1";
    }

    sql += " ORDER BY title";

    const rows = await select<any>(sql, params);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      tags: row.tags,
      is_favorite: row.is_favorite === 1,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (err) {
    error(`获取提示词模板失败: ${String(err)}`);
    return [];
  }
}

/**
 * 删除指定ID的提示词模板
 * @param id 提示词模板ID
 */
export async function deletePromptTemplate(id: number): Promise<void> {
  try {
    await execute("DELETE FROM ai_prompt_templates WHERE id = ?", [id]);
  } catch (err) {
    error(`删除提示词模板失败: ${String(err)}`);
    throw err;
  }
}

/**
 * 获取所有提示词分类
 */
export async function getPromptCategories(): Promise<string[]> {
  try {
    const rows = await select<{ category: string }>(
      "SELECT DISTINCT category FROM ai_prompt_templates WHERE category IS NOT NULL",
    );
    return rows.map((row) => row.category).filter((category) => !!category);
  } catch (err) {
    error(`获取提示词分类失败: ${String(err)}`);
    return [];
  }
}
