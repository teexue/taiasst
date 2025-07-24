/**
 * 工作流数据库服务
 */

import { execute, select } from "@/services/db/index";
import { error, info } from "@tauri-apps/plugin-log";
import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowFilter,
  WorkflowSort,
  WorkflowListResponse,
  ExecutionStatus,
  WorkflowStatus,
} from "./types";
import { v4 as uuidv4 } from "uuid";

/**
 * 工作流数据库服务类
 */
export class WorkflowDatabaseService {
  private static instance: WorkflowDatabaseService;

  private constructor() {}

  static getInstance(): WorkflowDatabaseService {
    if (!WorkflowDatabaseService.instance) {
      WorkflowDatabaseService.instance = new WorkflowDatabaseService();
    }
    return WorkflowDatabaseService.instance;
  }

  // 工作流定义管理
  async createWorkflow(
    workflow: Omit<WorkflowDefinition, "id" | "createdAt" | "updatedAt">,
  ): Promise<WorkflowDefinition> {
    try {
      const id = uuidv4();
      const now = Date.now();

      const newWorkflow: WorkflowDefinition = {
        ...workflow,
        id,
        createdAt: now,
        updatedAt: now,
      };

      await execute(
        `INSERT INTO workflow_definitions 
         (id, name, description, version, status, definition, variables, settings, tags, category, is_template, created_at, updated_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newWorkflow.id,
          newWorkflow.name,
          newWorkflow.description || null,
          newWorkflow.version,
          newWorkflow.status,
          JSON.stringify({
            nodes: newWorkflow.nodes,
            connections: newWorkflow.connections,
          }),
          JSON.stringify(newWorkflow.variables),
          JSON.stringify(newWorkflow.settings),
          JSON.stringify(newWorkflow.tags),
          newWorkflow.category,
          newWorkflow.isTemplate ? 1 : 0,
          newWorkflow.createdAt,
          newWorkflow.updatedAt,
          newWorkflow.createdBy,
        ],
      );

      info(`工作流已创建: ${newWorkflow.name} (${newWorkflow.id})`);
      return newWorkflow;
    } catch (err) {
      error(`创建工作流失败: ${String(err)}`);
      throw err;
    }
  }

  async updateWorkflow(
    id: string,
    updates: Partial<WorkflowDefinition>,
  ): Promise<void> {
    try {
      const now = Date.now();
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.name !== undefined) {
        updateFields.push("name = ?");
        updateValues.push(updates.name);
      }
      if (updates.description !== undefined) {
        updateFields.push("description = ?");
        updateValues.push(updates.description);
      }
      if (updates.version !== undefined) {
        updateFields.push("version = ?");
        updateValues.push(updates.version);
      }
      if (updates.status !== undefined) {
        updateFields.push("status = ?");
        updateValues.push(updates.status);
      }
      if (updates.nodes !== undefined || updates.connections !== undefined) {
        const currentWorkflow = await this.getWorkflow(id);
        if (currentWorkflow) {
          updateFields.push("definition = ?");
          updateValues.push(
            JSON.stringify({
              nodes: updates.nodes || currentWorkflow.nodes,
              connections: updates.connections || currentWorkflow.connections,
            }),
          );
        }
      }
      if (updates.variables !== undefined) {
        updateFields.push("variables = ?");
        updateValues.push(JSON.stringify(updates.variables));
      }
      if (updates.settings !== undefined) {
        updateFields.push("settings = ?");
        updateValues.push(JSON.stringify(updates.settings));
      }
      if (updates.tags !== undefined) {
        updateFields.push("tags = ?");
        updateValues.push(JSON.stringify(updates.tags));
      }
      if (updates.category !== undefined) {
        updateFields.push("category = ?");
        updateValues.push(updates.category);
      }

      updateFields.push("updated_at = ?");
      updateValues.push(now);
      updateValues.push(id);

      await execute(
        `UPDATE workflow_definitions SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues,
      );

      info(`工作流已更新: ${id}`);
    } catch (err) {
      error(`更新工作流失败: ${String(err)}`);
      throw err;
    }
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition | null> {
    try {
      const rows = await select<any>(
        "SELECT * FROM workflow_definitions WHERE id = ?",
        [id],
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      const definition = JSON.parse(row.definition);

      return {
        id: row.id,
        name: row.name,
        description: row.description,
        version: row.version,
        status: row.status as WorkflowStatus,
        nodes: definition.nodes || [],
        connections: definition.connections || [],
        variables: JSON.parse(row.variables || "{}"),
        settings: JSON.parse(row.settings || "{}"),
        tags: JSON.parse(row.tags || "[]"),
        category: row.category,
        isTemplate: Boolean(row.is_template),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by,
      };
    } catch (err) {
      error(`获取工作流失败: ${String(err)}`);
      return null;
    }
  }

  async getWorkflows(
    filter?: WorkflowFilter,
    sort?: WorkflowSort,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<WorkflowListResponse> {
    try {
      let whereClause = "WHERE 1=1";
      const params: any[] = [];

      // 构建过滤条件
      if (filter?.status && filter.status.length > 0) {
        whereClause += ` AND status IN (${filter.status.map(() => "?").join(",")})`;
        params.push(...filter.status);
      }
      if (filter?.category && filter.category.length > 0) {
        whereClause += ` AND category IN (${filter.category.map(() => "?").join(",")})`;
        params.push(...filter.category);
      }
      if (filter?.isTemplate !== undefined) {
        whereClause += " AND is_template = ?";
        params.push(filter.isTemplate ? 1 : 0);
      }
      if (filter?.dateRange) {
        whereClause += " AND created_at BETWEEN ? AND ?";
        params.push(filter.dateRange.start, filter.dateRange.end);
      }
      if (filter?.author) {
        whereClause += " AND created_by = ?";
        params.push(filter.author);
      }

      // 构建排序条件
      let orderClause = "ORDER BY created_at DESC";
      if (sort) {
        const sortField =
          sort.by === "name"
            ? "name"
            : sort.by === "createdAt"
              ? "created_at"
              : sort.by === "updatedAt"
                ? "updated_at"
                : "created_at";
        orderClause = `ORDER BY ${sortField} ${sort.order.toUpperCase()}`;
      }

      // 获取总数
      const countRows = await select<{ count: number }>(
        `SELECT COUNT(*) as count FROM workflow_definitions ${whereClause}`,
        params,
      );
      const total = countRows[0]?.count || 0;

      // 获取分页数据
      const offset = (page - 1) * pageSize;
      const rows = await select<any>(
        `SELECT * FROM workflow_definitions ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
        [...params, pageSize, offset],
      );

      const workflows: WorkflowDefinition[] = rows.map((row) => {
        const definition = JSON.parse(row.definition);
        return {
          id: row.id,
          name: row.name,
          description: row.description,
          version: row.version,
          status: row.status as WorkflowStatus,
          nodes: definition.nodes || [],
          connections: definition.connections || [],
          variables: JSON.parse(row.variables || "{}"),
          settings: JSON.parse(row.settings || "{}"),
          tags: JSON.parse(row.tags || "[]"),
          category: row.category,
          isTemplate: Boolean(row.is_template),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          createdBy: row.created_by,
        };
      });

      return {
        workflows,
        total,
        page,
        pageSize,
        hasMore: offset + workflows.length < total,
      };
    } catch (err) {
      error(`获取工作流列表失败: ${String(err)}`);
      throw err;
    }
  }

  async deleteWorkflow(id: string): Promise<void> {
    try {
      await execute("DELETE FROM workflow_definitions WHERE id = ?", [id]);
      info(`工作流已删除: ${id}`);
    } catch (err) {
      error(`删除工作流失败: ${String(err)}`);
      throw err;
    }
  }

  // 工作流执行记录管理
  async createExecution(
    execution: Omit<WorkflowExecution, "id" | "nodeExecutions">,
  ): Promise<string> {
    try {
      const id = uuidv4();

      await execute(
        `INSERT INTO workflow_executions 
         (id, workflow_id, workflow_version, status, start_time, end_time, duration, input_data, output_data, error_message, triggered_by, logs, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          execution.workflowId,
          execution.workflowVersion,
          execution.status,
          execution.startTime,
          execution.endTime || null,
          execution.duration || null,
          execution.input ? JSON.stringify(execution.input) : null,
          execution.output ? JSON.stringify(execution.output) : null,
          execution.error || null,
          execution.triggeredBy,
          JSON.stringify(execution.logs || []),
          Date.now(),
        ],
      );

      info(`工作流执行记录已创建: ${id}`);
      return id;
    } catch (err) {
      error(`创建工作流执行记录失败: ${String(err)}`);
      throw err;
    }
  }

  async updateExecution(
    id: string,
    updates: Partial<WorkflowExecution>,
  ): Promise<void> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.status !== undefined) {
        updateFields.push("status = ?");
        updateValues.push(updates.status);
      }
      if (updates.endTime !== undefined) {
        updateFields.push("end_time = ?");
        updateValues.push(updates.endTime);
      }
      if (updates.duration !== undefined) {
        updateFields.push("duration = ?");
        updateValues.push(updates.duration);
      }
      if (updates.output !== undefined) {
        updateFields.push("output_data = ?");
        updateValues.push(JSON.stringify(updates.output));
      }
      if (updates.error !== undefined) {
        updateFields.push("error_message = ?");
        updateValues.push(updates.error);
      }
      if (updates.logs !== undefined) {
        updateFields.push("logs = ?");
        updateValues.push(JSON.stringify(updates.logs));
      }

      updateValues.push(id);

      await execute(
        `UPDATE workflow_executions SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues,
      );
    } catch (err) {
      error(`更新工作流执行记录失败: ${String(err)}`);
      throw err;
    }
  }

  async getExecution(id: string): Promise<WorkflowExecution | null> {
    try {
      const rows = await select<any>(
        "SELECT * FROM workflow_executions WHERE id = ?",
        [id],
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        workflowId: row.workflow_id,
        workflowVersion: row.workflow_version,
        status: row.status as ExecutionStatus,
        startTime: row.start_time,
        endTime: row.end_time,
        duration: row.duration,
        input: row.input_data ? JSON.parse(row.input_data) : undefined,
        output: row.output_data ? JSON.parse(row.output_data) : undefined,
        error: row.error_message,
        nodeExecutions: [], // 这里可以扩展为从单独的表中获取
        triggeredBy: row.triggered_by as any,
        logs: JSON.parse(row.logs || "[]"),
      };
    } catch (err) {
      error(`获取工作流执行记录失败: ${String(err)}`);
      return null;
    }
  }

  async getExecutionsByWorkflow(
    workflowId: string,
    limit: number = 50,
  ): Promise<WorkflowExecution[]> {
    try {
      const rows = await select<any>(
        "SELECT * FROM workflow_executions WHERE workflow_id = ? ORDER BY start_time DESC LIMIT ?",
        [workflowId, limit],
      );

      return rows.map((row) => ({
        id: row.id,
        workflowId: row.workflow_id,
        workflowVersion: row.workflow_version,
        status: row.status as ExecutionStatus,
        startTime: row.start_time,
        endTime: row.end_time,
        duration: row.duration,
        input: row.input_data ? JSON.parse(row.input_data) : undefined,
        output: row.output_data ? JSON.parse(row.output_data) : undefined,
        error: row.error_message,
        nodeExecutions: [],
        triggeredBy: row.triggered_by as any,
        logs: JSON.parse(row.logs || "[]"),
      }));
    } catch (err) {
      error(`获取工作流执行历史失败: ${String(err)}`);
      return [];
    }
  }
}

/**
 * 获取工作流数据库服务实例
 */
export function getWorkflowDatabase(): WorkflowDatabaseService {
  return WorkflowDatabaseService.getInstance();
}
