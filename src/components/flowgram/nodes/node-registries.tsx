/**
 * FlowGram.ai 节点注册表
 */

import React from "react";
import {
  WorkflowNodeRegistry,
  ValidateTrigger,
  Field,
} from "@flowgram.ai/free-layout-editor";
import {
  RiPlayFill,
  RiStopFill,
  RiRobotFill,
  RiEditBoxFill,
  RiCodeFill,
  RiQuestionFill,
} from "react-icons/ri";

import { PORT_CONFIGS } from "../ports/port-renderer";

// 节点类型常量
const NODE_TYPES = {
  START: "start",
  END: "end",
  AI_CHAT: "ai-chat",
  TEXT_INPUT: "text-input",
  CONDITION: "condition",
  CODE: "code",
} as const;

// 节点验证函数
const validateTitle = ({ value }: { value: string }) =>
  value ? undefined : "标题不能为空";

const validateContent = ({ value }: { value: string }) =>
  value ? undefined : "内容不能为空";

// 基础节点渲染组件
const NodeContainer: React.FC<{
  children: React.ReactNode;
  headerColor: string;
  icon: React.ReactNode;
}> = ({ children, headerColor, icon }) => (
  <div className="flowgram-node-container">
    <div className={`flowgram-node-header ${headerColor}`}>
      <div className="flowgram-node-icon">{icon}</div>
      {children}
    </div>
  </div>
);

export const nodeRegistries: WorkflowNodeRegistry[] = [
  // 开始节点
  {
    type: NODE_TYPES.START,
    meta: {
      isStart: true,
      deleteDisable: true,
      copyDisable: true,
      defaultPorts: PORT_CONFIGS.OUTPUT_ONLY,
    },
    formMeta: {
      validateTrigger: ValidateTrigger.onChange,
      validate: {
        title: validateTitle,
      },
      render: () => (
        <NodeContainer
          headerColor="bg-green-500"
          icon={<RiPlayFill className="w-4 h-4 text-white" />}
        >
          <div className="flowgram-node-content">
            <Field name="title">
              {({ field }) => (
                <div className="flowgram-node-title text-white font-medium">
                  {String(field.value || "开始")}
                </div>
              )}
            </Field>
            <Field name="content">
              {({ field }) => (
                <div className="flowgram-node-body">
                  <div className="flowgram-node-description text-gray-600 text-sm">
                    {String(field.value || "工作流开始节点")}
                  </div>
                </div>
              )}
            </Field>
          </div>
        </NodeContainer>
      ),
    },
  },

  // 结束节点
  {
    type: NODE_TYPES.END,
    meta: {
      deleteDisable: true,
      copyDisable: true,
      defaultPorts: PORT_CONFIGS.INPUT_ONLY,
    },
    formMeta: {
      validateTrigger: ValidateTrigger.onChange,
      validate: {
        title: validateTitle,
      },
      render: () => (
        <NodeContainer
          headerColor="bg-red-500"
          icon={<RiStopFill className="w-4 h-4 text-white" />}
        >
          <div className="flowgram-node-content">
            <Field name="title">
              {({ field }) => (
                <div className="flowgram-node-title text-white font-medium">
                  {String(field.value || "结束")}
                </div>
              )}
            </Field>
            <Field name="content">
              {({ field }) => (
                <div className="flowgram-node-body">
                  <div className="flowgram-node-description text-gray-600 text-sm">
                    {String(field.value || "工作流结束节点")}
                  </div>
                </div>
              )}
            </Field>
          </div>
        </NodeContainer>
      ),
    },
  },

  // AI对话节点
  {
    type: "ai-chat",
    meta: {
      defaultPorts: PORT_CONFIGS.INPUT_OUTPUT,
    },
    formMeta: {
      validateTrigger: ValidateTrigger.onChange,
      validate: {
        title: validateTitle,
        content: validateContent,
      },
      render: () => (
        <NodeContainer
          headerColor="bg-blue-500"
          icon={<RiRobotFill className="w-4 h-4 text-white" />}
        >
          <div className="flowgram-node-content">
            <Field name="title">
              {({ field }) => (
                <div className="flowgram-node-title text-white font-medium">
                  {String(field.value || "AI对话")}
                </div>
              )}
            </Field>
            <Field name="content">
              {({ field }) => (
                <div className="flowgram-node-body">
                  <div className="flowgram-node-description text-gray-600 text-sm">
                    {String(field.value || "与AI进行智能对话")}
                  </div>
                </div>
              )}
            </Field>
          </div>
        </NodeContainer>
      ),
    },
  },

  // 文本输入节点
  {
    type: "text-input",
    meta: {
      defaultPorts: PORT_CONFIGS.OUTPUT_ONLY,
    },
    formMeta: {
      validateTrigger: ValidateTrigger.onChange,
      validate: {
        title: validateTitle,
      },
      render: () => (
        <NodeContainer
          headerColor="bg-purple-500"
          icon={<RiEditBoxFill className="w-4 h-4 text-white" />}
        >
          <div className="flowgram-node-content">
            <Field name="title">
              {({ field }) => (
                <div className="flowgram-node-title text-white font-medium">
                  {String(field.value || "文本输入")}
                </div>
              )}
            </Field>
            <Field name="content">
              {({ field }) => (
                <div className="flowgram-node-body">
                  <div className="flowgram-node-description text-gray-600 text-sm">
                    {String(field.value || "输入文本数据")}
                  </div>
                </div>
              )}
            </Field>
          </div>
        </NodeContainer>
      ),
    },
  },

  // 条件判断节点
  {
    type: "condition",
    meta: {
      defaultPorts: PORT_CONFIGS.CONDITION,
      dynamicPort: true,
    },
    formMeta: {
      validateTrigger: ValidateTrigger.onChange,
      validate: {
        title: validateTitle,
      },
      render: () => (
        <NodeContainer
          headerColor="bg-orange-500"
          icon={<RiQuestionFill className="w-4 h-4 text-white" />}
        >
          <div className="flowgram-node-content">
            <Field name="title">
              {({ field }) => (
                <div className="flowgram-node-title text-white font-medium">
                  {String(field.value || "条件判断")}
                </div>
              )}
            </Field>
            <Field name="content">
              {({ field }) => (
                <div className="flowgram-node-body">
                  <div className="flowgram-node-description text-gray-600 text-sm">
                    {String(field.value || "根据条件分支执行")}
                  </div>
                  {/* 动态端口 */}
                  <div className="mt-2 space-y-1">
                    <div
                      data-port-id="positive"
                      data-port-type="output"
                      className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded"
                    >
                      ✓ 条件成立
                    </div>
                    <div
                      data-port-id="negative"
                      data-port-type="output"
                      className="text-xs text-red-600 px-2 py-1 bg-red-50 rounded"
                    >
                      ✗ 条件不成立
                    </div>
                  </div>
                </div>
              )}
            </Field>
          </div>
        </NodeContainer>
      ),
    },
  },

  // 代码执行节点
  {
    type: "code",
    meta: {
      defaultPorts: PORT_CONFIGS.INPUT_OUTPUT,
    },
    formMeta: {
      validateTrigger: ValidateTrigger.onChange,
      validate: {
        title: validateTitle,
      },
      render: () => (
        <NodeContainer
          headerColor="bg-gray-700"
          icon={<RiCodeFill className="w-4 h-4 text-white" />}
        >
          <div className="flowgram-node-content">
            <Field name="title">
              {({ field }) => (
                <div className="flowgram-node-title text-white font-medium">
                  {String(field.value || "代码执行")}
                </div>
              )}
            </Field>
            <Field name="content">
              {({ field }) => (
                <div className="flowgram-node-body">
                  <div className="flowgram-node-description text-gray-600 text-sm">
                    {String(field.value || "执行自定义代码")}
                  </div>
                </div>
              )}
            </Field>
          </div>
        </NodeContainer>
      ),
    },
  },
];
