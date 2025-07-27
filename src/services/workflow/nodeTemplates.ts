/**
 * 工作流节点模板定义
 */

import { NodeTemplate, NodeType } from "./types";

// 输入节点模板
export const INPUT_NODE_TEMPLATES: NodeTemplate[] = [
  {
    id: "input_text",
    type: "input",
    subtype: "text",
    name: "文本输入",
    description: "接收文本输入数据",
    icon: "RiInputMethodLine",
    color: "blue",
    category: "输入",
    defaultConfig: {
      placeholder: "请输入文本",
      multiline: false,
      required: true,
    },
    ports: [
      {
        id: "output",
        type: "output",
        dataType: "string",
        label: "文本输出",
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        placeholder: { type: "string", title: "占位符" },
        multiline: { type: "boolean", title: "多行输入" },
        required: { type: "boolean", title: "必填" },
      },
    },
  },
  {
    id: "input_file",
    type: "input",
    subtype: "file",
    name: "文件输入",
    description: "接收文件输入",
    icon: "RiFileUploadLine",
    color: "green",
    category: "输入",
    defaultConfig: {
      acceptedTypes: ["*"],
      maxSize: 10485760, // 10MB
      multiple: false,
    },
    ports: [
      {
        id: "output",
        type: "output",
        dataType: "file",
        label: "文件输出",
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        acceptedTypes: { type: "array", title: "接受的文件类型" },
        maxSize: { type: "number", title: "最大文件大小(字节)" },
        multiple: { type: "boolean", title: "多文件选择" },
      },
    },
  },
];

// 处理节点模板
export const PROCESS_NODE_TEMPLATES: NodeTemplate[] = [
  {
    id: "process_text_transform",
    type: "process",
    subtype: "text_transform",
    name: "文本转换",
    description: "对文本进行各种转换操作",
    icon: "RiEditLine",
    color: "purple",
    category: "处理",
    defaultConfig: {
      operation: "uppercase",
      customPattern: "",
      replacement: "",
    },
    ports: [
      {
        id: "input",
        type: "input",
        dataType: "string",
        label: "文本输入",
        required: true,
      },
      {
        id: "output",
        type: "output",
        dataType: "string",
        label: "转换结果",
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["uppercase", "lowercase", "trim", "replace", "regex"],
          title: "转换操作",
        },
        customPattern: { type: "string", title: "自定义模式" },
        replacement: { type: "string", title: "替换文本" },
      },
    },
  },
  {
    id: "process_data_filter",
    type: "process",
    subtype: "data_filter",
    name: "数据过滤",
    description: "根据条件过滤数据",
    icon: "RiFilterLine",
    color: "orange",
    category: "处理",
    defaultConfig: {
      conditions: [],
      operator: "and",
    },
    ports: [
      {
        id: "input",
        type: "input",
        dataType: "array",
        label: "数据输入",
        required: true,
      },
      {
        id: "output",
        type: "output",
        dataType: "array",
        label: "过滤结果",
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        conditions: { type: "array", title: "过滤条件" },
        operator: {
          type: "string",
          enum: ["and", "or"],
          title: "条件操作符",
        },
      },
    },
  },
];

// AI节点模板
export const AI_NODE_TEMPLATES: NodeTemplate[] = [
  {
    id: "ai_text_generation",
    type: "ai",
    subtype: "text_generation",
    name: "AI文本生成",
    description: "使用AI生成文本内容",
    icon: "RiRobot2Line",
    color: "cyan",
    category: "AI",
    defaultConfig: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      prompt: "",
      temperature: 0.7,
      maxTokens: 1000,
    },
    ports: [
      {
        id: "prompt",
        type: "input",
        dataType: "string",
        label: "提示词",
        required: true,
      },
      {
        id: "context",
        type: "input",
        dataType: "string",
        label: "上下文",
        required: false,
      },
      {
        id: "output",
        type: "output",
        dataType: "string",
        label: "生成文本",
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        provider: {
          type: "string",
          enum: ["openai", "claude", "qianwen"],
          title: "AI提供商",
        },
        model: { type: "string", title: "模型" },
        prompt: { type: "string", title: "系统提示词" },
        temperature: {
          type: "number",
          minimum: 0,
          maximum: 2,
          title: "创造性",
        },
        maxTokens: {
          type: "number",
          minimum: 1,
          maximum: 8000,
          title: "最大令牌数",
        },
      },
    },
  },
  {
    id: "ai_text_analysis",
    type: "ai",
    subtype: "text_analysis",
    name: "AI文本分析",
    description: "使用AI分析文本内容",
    icon: "RiSearchEyeLine",
    color: "indigo",
    category: "AI",
    defaultConfig: {
      analysisType: "sentiment",
      language: "zh",
    },
    ports: [
      {
        id: "input",
        type: "input",
        dataType: "string",
        label: "文本输入",
        required: true,
      },
      {
        id: "output",
        type: "output",
        dataType: "object",
        label: "分析结果",
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        analysisType: {
          type: "string",
          enum: ["sentiment", "keywords", "summary", "classification"],
          title: "分析类型",
        },
        language: {
          type: "string",
          enum: ["zh", "en"],
          title: "语言",
        },
      },
    },
  },
];

// 工具节点模板
export const TOOL_NODE_TEMPLATES: NodeTemplate[] = [
  {
    id: "tool_http_request",
    type: "tool",
    subtype: "http_request",
    name: "HTTP请求",
    description: "发送HTTP请求",
    icon: "RiGlobalLine",
    color: "teal",
    category: "工具",
    defaultConfig: {
      method: "GET",
      url: "",
      headers: {},
      timeout: 30000,
    },
    ports: [
      {
        id: "url",
        type: "input",
        dataType: "string",
        label: "请求URL",
        required: true,
      },
      {
        id: "data",
        type: "input",
        dataType: "object",
        label: "请求数据",
        required: false,
      },
      {
        id: "response",
        type: "output",
        dataType: "object",
        label: "响应数据",
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
          title: "请求方法",
        },
        url: { type: "string", title: "请求URL" },
        headers: { type: "object", title: "请求头" },
        timeout: { type: "number", title: "超时时间(毫秒)" },
      },
    },
  },
  {
    id: "tool_email_send",
    type: "tool",
    subtype: "email_send",
    name: "发送邮件",
    description: "发送电子邮件",
    icon: "RiMailSendLine",
    color: "red",
    category: "工具",
    defaultConfig: {
      smtpHost: "",
      smtpPort: 587,
      secure: false,
      auth: {
        user: "",
        pass: "",
      },
    },
    ports: [
      {
        id: "to",
        type: "input",
        dataType: "string",
        label: "收件人",
        required: true,
      },
      {
        id: "subject",
        type: "input",
        dataType: "string",
        label: "邮件主题",
        required: true,
      },
      {
        id: "content",
        type: "input",
        dataType: "string",
        label: "邮件内容",
        required: true,
      },
      {
        id: "result",
        type: "output",
        dataType: "object",
        label: "发送结果",
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        smtpHost: { type: "string", title: "SMTP服务器" },
        smtpPort: { type: "number", title: "SMTP端口" },
        secure: { type: "boolean", title: "使用SSL" },
        auth: {
          type: "object",
          properties: {
            user: { type: "string", title: "用户名" },
            pass: { type: "string", title: "密码" },
          },
        },
      },
    },
  },
];

// 控制节点模板
export const CONTROL_NODE_TEMPLATES: NodeTemplate[] = [
  {
    id: "control_condition",
    type: "control",
    subtype: "condition",
    name: "条件判断",
    description: "根据条件选择执行路径",
    icon: "RiGitBranchLine",
    color: "yellow",
    category: "控制",
    defaultConfig: {
      condition: "",
      operator: "equals",
      value: "",
    },
    ports: [
      {
        id: "input",
        type: "input",
        dataType: "any",
        label: "输入值",
        required: true,
      },
      {
        id: "true",
        type: "output",
        dataType: "any",
        label: "条件为真",
      },
      {
        id: "false",
        type: "output",
        dataType: "any",
        label: "条件为假",
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        condition: { type: "string", title: "条件表达式" },
        operator: {
          type: "string",
          enum: ["equals", "not_equals", "greater", "less", "contains"],
          title: "比较操作符",
        },
        value: { type: "string", title: "比较值" },
      },
    },
  },
  {
    id: "control_loop",
    type: "control",
    subtype: "loop",
    name: "循环",
    description: "循环执行操作",
    icon: "RiRefreshLine",
    color: "pink",
    category: "控制",
    defaultConfig: {
      loopType: "for",
      count: 10,
      condition: "",
    },
    ports: [
      {
        id: "input",
        type: "input",
        dataType: "array",
        label: "循环数据",
        required: true,
      },
      {
        id: "item",
        type: "output",
        dataType: "any",
        label: "当前项",
      },
      {
        id: "index",
        type: "output",
        dataType: "number",
        label: "索引",
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        loopType: {
          type: "string",
          enum: ["for", "while", "forEach"],
          title: "循环类型",
        },
        count: { type: "number", title: "循环次数" },
        condition: { type: "string", title: "循环条件" },
      },
    },
  },
];

// 输出节点模板
export const OUTPUT_NODE_TEMPLATES: NodeTemplate[] = [
  {
    id: "output_display",
    type: "output",
    subtype: "display",
    name: "结果显示",
    description: "显示处理结果",
    icon: "RiEyeLine",
    color: "gray",
    category: "输出",
    defaultConfig: {
      format: "text",
      title: "处理结果",
    },
    ports: [
      {
        id: "input",
        type: "input",
        dataType: "any",
        label: "显示内容",
        required: true,
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        format: {
          type: "string",
          enum: ["text", "json", "table", "chart"],
          title: "显示格式",
        },
        title: { type: "string", title: "标题" },
      },
    },
  },
  {
    id: "output_file_save",
    type: "output",
    subtype: "file_save",
    name: "保存文件",
    description: "将结果保存为文件",
    icon: "RiSaveLine",
    color: "emerald",
    category: "输出",
    defaultConfig: {
      filename: "output.txt",
      format: "text",
      encoding: "utf-8",
    },
    ports: [
      {
        id: "input",
        type: "input",
        dataType: "any",
        label: "文件内容",
        required: true,
      },
      {
        id: "filename",
        type: "input",
        dataType: "string",
        label: "文件名",
        required: false,
      },
    ],
    configSchema: {
      type: "object",
      properties: {
        filename: { type: "string", title: "文件名" },
        format: {
          type: "string",
          enum: ["text", "json", "csv", "xml"],
          title: "文件格式",
        },
        encoding: {
          type: "string",
          enum: ["utf-8", "ascii", "base64"],
          title: "编码格式",
        },
      },
    },
  },
];

// 所有节点模板
export const ALL_NODE_TEMPLATES: NodeTemplate[] = [
  ...INPUT_NODE_TEMPLATES,
  ...PROCESS_NODE_TEMPLATES,
  ...AI_NODE_TEMPLATES,
  ...TOOL_NODE_TEMPLATES,
  ...CONTROL_NODE_TEMPLATES,
  ...OUTPUT_NODE_TEMPLATES,
];

// 按类型获取节点模板
export function getNodeTemplatesByType(type: NodeType): NodeTemplate[] {
  return ALL_NODE_TEMPLATES.filter((template) => template.type === type);
}

// 按分类获取节点模板
export function getNodeTemplatesByCategory(category: string): NodeTemplate[] {
  return ALL_NODE_TEMPLATES.filter(
    (template) => template.category === category,
  );
}

// 获取节点模板
export function getNodeTemplate(id: string): NodeTemplate | undefined {
  return ALL_NODE_TEMPLATES.find((template) => template.id === id);
}

// 获取所有分类
export function getNodeCategories(): string[] {
  const categories = new Set(
    ALL_NODE_TEMPLATES.map((template) => template.category),
  );
  return Array.from(categories);
}
