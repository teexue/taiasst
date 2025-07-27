import { select } from "@/services/db/index";
import { error } from "@tauri-apps/plugin-log";
import { getAuthSettings } from "@/services/db/auth";

/**
 * 仪表盘统计数据接口
 */
export interface DashboardStats {
  // 密码管理统计
  passwords: {
    total: number;
    favorites: number;
    categories: number;
    recentlyUsed: number;
  };

  // 工作流统计
  workflows: {
    total: number;
    active: number;
    draft: number;
    templates: number;
    recentExecutions: number;
  };

  // AI助手统计
  ai: {
    totalConversations: number;
    todayMessages: number;
    activeProviders: number;
    favoriteConversations: number;
  };

  // 插件统计
  plugins: {
    total: number;
    active: number;
    hasBackend: number;
    categories: number;
  };

  // 安全统计
  security: {
    hasPassword: boolean;
    autoLockEnabled: boolean;
    lastAuthTime?: number;
    failedAttempts: number;
    recentSecurityEvents: number;
  };

  // 系统统计
  system: {
    uptime: number;
    lastStartup: number;
    totalSessions: number;
    averageSessionTime: number;
  };
}

/**
 * 最近活动接口
 */
export interface RecentActivity {
  id: string;
  type: "password" | "workflow" | "ai" | "plugin" | "security" | "system";
  title: string;
  description: string;
  timestamp: number;
  icon: string;
  color: string;
}

/**
 * 安全执行数据库查询
 */
async function safeQuery<T>(query: string, params: any[] = []): Promise<T[]> {
  try {
    return await select<T>(query, params);
  } catch (err) {
    // 如果表不存在或查询失败，返回空数组
    return [];
  }
}

/**
 * 获取密码管理统计
 */
async function getPasswordStats() {
  try {
    const [totalResult, favoritesResult, categoriesResult, recentResult] =
      await Promise.all([
        safeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM password_entries",
        ),
        safeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM password_entries WHERE is_favorite = 1",
        ),
        safeQuery<{ count: number }>(
          "SELECT COUNT(DISTINCT category) as count FROM password_entries",
        ),
        safeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM password_entries WHERE last_used > ?",
          [Date.now() - 7 * 24 * 60 * 60 * 1000], // 最近7天
        ),
      ]);

    return {
      total: totalResult[0]?.count || 0,
      favorites: favoritesResult[0]?.count || 0,
      categories: categoriesResult[0]?.count || 0,
      recentlyUsed: recentResult[0]?.count || 0,
    };
  } catch (err) {
    error(`获取密码统计失败: ${String(err)}`);
    return { total: 0, favorites: 0, categories: 0, recentlyUsed: 0 };
  }
}

/**
 * 获取工作流统计
 */
async function getWorkflowStats() {
  try {
    const [
      totalResult,
      activeResult,
      draftResult,
      templatesResult,
      executionsResult,
    ] = await Promise.all([
      safeQuery<{ count: number }>(
        "SELECT COUNT(*) as count FROM workflow_definitions",
      ),
      safeQuery<{ count: number }>(
        "SELECT COUNT(*) as count FROM workflow_definitions WHERE status = 'active'",
      ),
      safeQuery<{ count: number }>(
        "SELECT COUNT(*) as count FROM workflow_definitions WHERE status = 'draft'",
      ),
      safeQuery<{ count: number }>(
        "SELECT COUNT(*) as count FROM workflow_templates",
      ),
      safeQuery<{ count: number }>(
        "SELECT COUNT(*) as count FROM workflow_executions WHERE start_time > ?",
        [Date.now() - 24 * 60 * 60 * 1000], // 最近24小时
      ),
    ]);

    return {
      total: totalResult[0]?.count || 0,
      active: activeResult[0]?.count || 0,
      draft: draftResult[0]?.count || 0,
      templates: templatesResult[0]?.count || 0,
      recentExecutions: executionsResult[0]?.count || 0,
    };
  } catch (err) {
    error(`获取工作流统计失败: ${String(err)}`);
    return { total: 0, active: 0, draft: 0, templates: 0, recentExecutions: 0 };
  }
}

/**
 * 获取AI助手统计
 */
async function getAIStats() {
  try {
    const [conversationsResult, todayResult, providersResult, favoritesResult] =
      await Promise.all([
        safeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM ai_conversations",
        ),
        safeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM ai_messages WHERE created_at > ?",
          [Date.now() - 24 * 60 * 60 * 1000], // 今天
        ),
        safeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM ai_provider_config WHERE api_key IS NOT NULL",
        ),
        safeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM ai_conversations WHERE is_favorite = 1",
        ),
      ]);

    return {
      totalConversations: conversationsResult[0]?.count || 0,
      todayMessages: todayResult[0]?.count || 0,
      activeProviders: providersResult[0]?.count || 0,
      favoriteConversations: favoritesResult[0]?.count || 0,
    };
  } catch (err) {
    error(`获取AI统计失败: ${String(err)}`);
    return {
      totalConversations: 0,
      todayMessages: 0,
      activeProviders: 0,
      favoriteConversations: 0,
    };
  }
}

/**
 * 获取插件统计
 */
async function getPluginStats() {
  try {
    const [totalResult, activeResult, backendResult, categoriesResult] =
      await Promise.all([
        safeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM plugin_metadata",
        ),
        safeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM plugin_metadata WHERE plugin_type = 'active'",
        ),
        safeQuery<{ count: number }>(
          "SELECT COUNT(*) as count FROM plugin_metadata WHERE has_backend = 1",
        ),
        safeQuery<{ count: number }>(
          "SELECT COUNT(DISTINCT plugin_type) as count FROM plugin_metadata",
        ),
      ]);

    return {
      total: totalResult[0]?.count || 0,
      active: activeResult[0]?.count || 0,
      hasBackend: backendResult[0]?.count || 0,
      categories: categoriesResult[0]?.count || 0,
    };
  } catch (err) {
    error(`获取插件统计失败: ${String(err)}`);
    return { total: 0, active: 0, hasBackend: 0, categories: 0 };
  }
}

/**
 * 获取安全统计
 */
async function getSecurityStats() {
  try {
    const authSettings = await getAuthSettings();

    const [securityEventsResult] = await Promise.all([
      safeQuery<{ count: number }>(
        "SELECT COUNT(*) as count FROM security_audit_log WHERE created_at > ?",
        [Date.now() - 24 * 60 * 60 * 1000], // 最近24小时
      ),
    ]);

    return {
      hasPassword: authSettings.hasPassword,
      autoLockEnabled: authSettings.autoLockEnabled,
      lastAuthTime: authSettings.lastAuthTime,
      failedAttempts: authSettings.failedAttempts,
      recentSecurityEvents: securityEventsResult[0]?.count || 0,
    };
  } catch (err) {
    error(`获取安全统计失败: ${String(err)}`);
    return {
      hasPassword: false,
      autoLockEnabled: false,
      failedAttempts: 0,
      recentSecurityEvents: 0,
    };
  }
}

/**
 * 获取系统统计
 */
async function getSystemStats() {
  try {
    const startupTime = Date.now(); // 简化实现，实际应该从系统获取
    const uptime = Date.now() - startupTime;

    const [sessionsResult] = await Promise.all([
      safeQuery<{ count: number }>(
        "SELECT COUNT(*) as count FROM security_sessions",
      ),
    ]);

    return {
      uptime,
      lastStartup: startupTime,
      totalSessions: sessionsResult[0]?.count || 0,
      averageSessionTime: 0, // 简化实现
    };
  } catch (err) {
    error(`获取系统统计失败: ${String(err)}`);
    return {
      uptime: 0,
      lastStartup: Date.now(),
      totalSessions: 0,
      averageSessionTime: 0,
    };
  }
}

/**
 * 获取最近活动
 */
export async function getRecentActivities(
  limit: number = 10,
): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];

  try {
    // 获取最近的密码活动
    const recentPasswords = await safeQuery<{
      id: string;
      title: string;
      updated_at: number;
    }>(
      "SELECT id, title, updated_at FROM password_entries ORDER BY updated_at DESC LIMIT 3",
    );

    recentPasswords.forEach((item) => {
      activities.push({
        id: `password_${item.id}`,
        type: "password",
        title: "更新密码",
        description: `密码 "${item.title}" 已更新`,
        timestamp: item.updated_at,
        icon: "RiLockLine",
        color: "blue",
      });
    });

    // 获取最近的工作流活动
    const recentWorkflows = await safeQuery<{
      id: string;
      name: string;
      updated_at: number;
    }>(
      "SELECT id, name, updated_at FROM workflow_definitions ORDER BY updated_at DESC LIMIT 3",
    );

    recentWorkflows.forEach((item) => {
      activities.push({
        id: `workflow_${item.id}`,
        type: "workflow",
        title: "工作流更新",
        description: `工作流 "${item.name}" 已更新`,
        timestamp: item.updated_at,
        icon: "RiFlowChart",
        color: "green",
      });
    });

    // 如果没有真实活动，添加一些示例活动
    if (activities.length === 0) {
      activities.push(
        {
          id: "welcome_1",
          type: "system",
          title: "欢迎使用 TaiASST",
          description: "应用已成功启动",
          timestamp: Date.now() - 1000 * 60 * 5, // 5分钟前
          icon: "RiShieldLine",
          color: "blue",
        },
        {
          id: "welcome_2",
          type: "system",
          title: "系统初始化完成",
          description: "所有功能模块已加载",
          timestamp: Date.now() - 1000 * 60 * 10, // 10分钟前
          icon: "RiComputerLine",
          color: "green",
        },
      );
    }

    // 按时间排序并限制数量
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  } catch (err) {
    error(`获取最近活动失败: ${String(err)}`);
    return [];
  }
}

/**
 * 获取完整的仪表盘统计数据
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [passwords, workflows, ai, plugins, security, system] =
      await Promise.all([
        getPasswordStats(),
        getWorkflowStats(),
        getAIStats(),
        getPluginStats(),
        getSecurityStats(),
        getSystemStats(),
      ]);

    return {
      passwords,
      workflows,
      ai,
      plugins,
      security,
      system,
    };
  } catch (err) {
    error(`获取仪表盘统计失败: ${String(err)}`);
    throw err;
  }
}
