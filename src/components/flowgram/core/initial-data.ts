/**
 * FlowGram.ai 初始数据定义
 */

export const initialData = {
  nodes: [
    {
      id: "start_0",
      type: "start",
      meta: {
        position: { x: 100, y: 200 },
      },
      data: {
        title: "开始",
        content: "工作流开始节点",
        description: "这是工作流的起始点",
      },
    },
    {
      id: "ai_chat_0",
      type: "ai-chat",
      meta: {
        position: { x: 400, y: 200 },
      },
      data: {
        title: "AI对话",
        content: "与AI进行智能对话",
        description: "使用AI模型处理用户输入",
      },
    },
    {
      id: "condition_0",
      type: "condition",
      meta: {
        position: { x: 700, y: 200 },
      },
      data: {
        title: "条件判断",
        content: "根据AI回复进行分支",
        description: "判断AI回复的情感倾向",
      },
    },
    {
      id: "end_positive",
      type: "end",
      meta: {
        position: { x: 1000, y: 100 },
      },
      data: {
        title: "积极结束",
        content: "积极情感处理完成",
        description: "用户情感为积极时的结束节点",
      },
    },
    {
      id: "end_negative",
      type: "end",
      meta: {
        position: { x: 1000, y: 300 },
      },
      data: {
        title: "消极结束",
        content: "消极情感处理完成",
        description: "用户情感为消极时的结束节点",
      },
    },
  ],
  edges: [
    {
      sourceNodeID: "start_0",
      targetNodeID: "ai_chat_0",
    },
    {
      sourceNodeID: "ai_chat_0",
      targetNodeID: "condition_0",
    },
    {
      sourceNodeID: "condition_0",
      targetNodeID: "end_positive",
      sourcePortID: "positive",
    },
    {
      sourceNodeID: "condition_0",
      targetNodeID: "end_negative",
      sourcePortID: "negative",
    },
  ],
};
