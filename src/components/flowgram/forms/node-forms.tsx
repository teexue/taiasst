/**
 * FlowGram.ai 节点配置表单
 */

import React from "react";
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormSwitch,
  FormNumber,
  FormKeyValue,
  FormConditions,
} from "./form-components";

// AI对话节点表单
export const AIChatNodeForm: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const config = data.config || {};
  const updateConfig = (key: string, value: any) => {
    updateData("config", { ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="节点名称"
        value={data.title}
        onChange={(value) => updateData("title", value)}
        required
      />

      <FormTextarea
        label="描述"
        value={data.content}
        onChange={(value) => updateData("content", value)}
        placeholder="描述这个AI对话节点的功能"
      />

      <FormSelect
        label="AI模型"
        value={config.model}
        onChange={(value) => updateConfig("model", value)}
        options={[
          { value: "gpt-4", label: "GPT-4" },
          { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
          { value: "claude-3", label: "Claude 3" },
          { value: "gemini-pro", label: "Gemini Pro" },
        ]}
      />

      <FormNumber
        label="温度"
        value={config.temperature}
        onChange={(value) => updateConfig("temperature", value)}
        min={0}
        max={2}
        step={0.1}
      />

      <FormNumber
        label="最大令牌数"
        value={config.maxTokens}
        onChange={(value) => updateConfig("maxTokens", value)}
        min={1}
        max={4000}
      />

      <FormTextarea
        label="系统提示"
        value={config.systemPrompt}
        onChange={(value) => updateConfig("systemPrompt", value)}
        placeholder="设置AI的角色和行为指导"
        rows={4}
      />

      <FormSwitch
        label="流式输出"
        value={config.stream}
        onChange={(value) => updateConfig("stream", value)}
        description="启用流式输出以获得更快的响应"
      />
    </div>
  );
};

// 条件判断节点表单
export const ConditionNodeForm: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const config = data.config || {};
  const updateConfig = (key: string, value: any) => {
    updateData("config", { ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="节点名称"
        value={data.title}
        onChange={(value) => updateData("title", value)}
        required
      />

      <FormTextarea
        label="描述"
        value={data.content}
        onChange={(value) => updateData("content", value)}
        placeholder="描述这个条件判断的逻辑"
      />

      <FormConditions
        label="判断条件"
        value={config.conditions}
        onChange={(value) => updateConfig("conditions", value)}
      />

      <FormSelect
        label="逻辑关系"
        value={config.logic}
        onChange={(value) => updateConfig("logic", value)}
        options={[
          { value: "and", label: "且 (AND)" },
          { value: "or", label: "或 (OR)" },
        ]}
      />

      <FormSwitch
        label="默认分支"
        value={config.hasDefault}
        onChange={(value) => updateConfig("hasDefault", value)}
        description="当所有条件都不满足时的默认分支"
      />
    </div>
  );
};

// 代码执行节点表单
export const CodeNodeForm: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const config = data.config || {};
  const updateConfig = (key: string, value: any) => {
    updateData("config", { ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="节点名称"
        value={data.title}
        onChange={(value) => updateData("title", value)}
        required
      />

      <FormTextarea
        label="描述"
        value={data.content}
        onChange={(value) => updateData("content", value)}
        placeholder="描述这段代码的功能"
      />

      <FormSelect
        label="编程语言"
        value={config.language}
        onChange={(value) => updateConfig("language", value)}
        options={[
          { value: "javascript", label: "JavaScript" },
          { value: "python", label: "Python" },
          { value: "typescript", label: "TypeScript" },
          { value: "bash", label: "Bash" },
        ]}
      />

      <FormTextarea
        label="代码"
        value={config.code}
        onChange={(value) => updateConfig("code", value)}
        placeholder="输入要执行的代码"
        rows={8}
      />

      <FormKeyValue
        label="环境变量"
        value={config.env}
        onChange={(value) => updateConfig("env", value)}
      />

      <FormNumber
        label="超时时间 (秒)"
        value={config.timeout}
        onChange={(value) => updateConfig("timeout", value)}
        min={1}
        max={300}
      />

      <FormSwitch
        label="异步执行"
        value={config.async}
        onChange={(value) => updateConfig("async", value)}
        description="是否异步执行代码"
      />
    </div>
  );
};

// 文本输入节点表单
export const TextInputNodeForm: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const config = data.config || {};
  const updateConfig = (key: string, value: any) => {
    updateData("config", { ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="节点名称"
        value={data.title}
        onChange={(value) => updateData("title", value)}
        required
      />

      <FormTextarea
        label="描述"
        value={data.content}
        onChange={(value) => updateData("content", value)}
        placeholder="描述这个输入字段的用途"
      />

      <FormInput
        label="提示文本"
        value={config.placeholder}
        onChange={(value) => updateConfig("placeholder", value)}
        placeholder="输入框的提示文本"
      />

      <FormTextarea
        label="默认值"
        value={config.defaultValue}
        onChange={(value) => updateConfig("defaultValue", value)}
        placeholder="输入框的默认值"
      />

      <FormSelect
        label="输入类型"
        value={config.inputType}
        onChange={(value) => updateConfig("inputType", value)}
        options={[
          { value: "text", label: "单行文本" },
          { value: "textarea", label: "多行文本" },
          { value: "email", label: "邮箱" },
          { value: "number", label: "数字" },
          { value: "password", label: "密码" },
        ]}
      />

      <FormSwitch
        label="必填"
        value={config.required}
        onChange={(value) => updateConfig("required", value)}
        description="是否为必填字段"
      />

      <FormNumber
        label="最大长度"
        value={config.maxLength}
        onChange={(value) => updateConfig("maxLength", value)}
        min={1}
        max={10000}
      />
    </div>
  );
};

// HTTP请求节点表单
export const HttpRequestNodeForm: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const config = data.config || {};
  const updateConfig = (key: string, value: any) => {
    updateData("config", { ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="节点名称"
        value={data.title}
        onChange={(value) => updateData("title", value)}
        required
      />

      <FormTextarea
        label="描述"
        value={data.content}
        onChange={(value) => updateData("content", value)}
        placeholder="描述这个HTTP请求的用途"
      />

      <FormSelect
        label="请求方法"
        value={config.method}
        onChange={(value) => updateConfig("method", value)}
        options={[
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PUT", label: "PUT" },
          { value: "DELETE", label: "DELETE" },
          { value: "PATCH", label: "PATCH" },
        ]}
      />

      <FormInput
        label="请求URL"
        value={config.url}
        onChange={(value) => updateConfig("url", value)}
        placeholder="https://api.example.com/endpoint"
        required
      />

      <FormKeyValue
        label="请求头"
        value={config.headers}
        onChange={(value) => updateConfig("headers", value)}
      />

      <FormTextarea
        label="请求体"
        value={config.body}
        onChange={(value) => updateConfig("body", value)}
        placeholder="JSON格式的请求体"
        rows={4}
      />

      <FormNumber
        label="超时时间 (秒)"
        value={config.timeout}
        onChange={(value) => updateConfig("timeout", value)}
        min={1}
        max={300}
      />

      <FormSwitch
        label="跟随重定向"
        value={config.followRedirects}
        onChange={(value) => updateConfig("followRedirects", value)}
        description="是否自动跟随HTTP重定向"
      />
    </div>
  );
};
