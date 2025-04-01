import tools from "@/store/tools/tool.json";
import {
  Tabs,
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Space,
  Tag,
  Button,
  Switch,
  message,
  Modal,
  Form,
  Input,
  Select,
  Dropdown,
  Divider,
  Spin,
} from "antd";
import React, { useState, useEffect } from "react";
import * as RemixIcons from "@remixicon/react";
import { useNavigate } from "react-router";
import { localToolManager } from "@/utils/local-tool-manager";
import { LocalTool } from "@/types/local-tool";
import {
  PlusOutlined,
  EditOutlined,
  MoreOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Tool {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  icon?: string;
  path: string;
  type: string;
  category?: string;
  tags?: string[];
}

interface Category {
  name: string;
  icon: string;
  path: string;
  type?: string;
  tools?: Tool[];
}

interface ToolWithLocalFlag extends Tool {
  isLocalTool?: boolean;
}

// 可用的 RemixIcon 图标列表
const availableIcons = Object.keys(RemixIcons)
  .filter((key) => key.startsWith("Ri") && key.endsWith("Line"))
  .sort();

function Tool() {
  const navigate = useNavigate();
  const [toolList, setToolList] = useState<Category[]>([]);
  const [localTools, setLocalTools] = useState<LocalTool[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingTool, setEditingTool] = useState<LocalTool | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    setIsLoading(true);
    try {
      // 保存当前活动标签
      const currentActiveTab = activeTab;

      // 加载本地工具
      await localToolManager.loadTools();
      const localToolsList = localToolManager.getAllTools(); // 获取所有本地工具，包括禁用的
      setLocalTools(localToolsList);

      // 收集所有工具项（使用Map防止重复，键为工具路径）
      const allToolItemsMap = new Map<string, ToolWithLocalFlag>();

      // 加载预设工具
      const allTools = [...tools] as Category[]; // 使用类型断言确保类型一致

      // 收集分类
      const categorySet = new Set<string>();

      // 创建分类名称到索引的映射
      const categoryNameToIndex = new Map<string, number>();
      allTools.forEach((category, index) => {
        if (category.name) {
          categoryNameToIndex.set(category.name.toLowerCase(), index);
        }
      });

      // 从预设分类中提取
      allTools.forEach((category) => {
        if (
          category.name &&
          category.name !== "全部工具" &&
          category.name !== "本地工具"
        ) {
          categorySet.add(category.name);
        }

        if (category.tools && category.tools.length > 0) {
          // 收集预设工具，使用路径作为key避免重复
          category.tools.forEach((tool: Tool) => {
            // 使用类型断言
            // 使用路径作为唯一标识，因为预设工具的路径应该是唯一的
            const key = tool.path;
            if (!allToolItemsMap.has(key)) {
              allToolItemsMap.set(key, tool);
            }

            // 从工具的category字段收集分类
            if (tool.category) {
              categorySet.add(tool.category);
            }
          });
        }
      });

      // 从本地工具中提取分类并将本地工具添加到对应分类
      localToolsList.forEach((tool) => {
        if (tool.category) {
          categorySet.add(tool.category);

          // 将本地工具添加到对应的分类中
          const categoryIndex = findCategoryIndexByName(
            allTools,
            tool.category
          );

          if (categoryIndex >= 0) {
            // 如果找到对应分类，添加工具到该分类
            const toolWithFlag = {
              ...tool,
              type: tool.type,
              isLocalTool: true,
            };

            if (!allTools[categoryIndex].tools) {
              allTools[categoryIndex].tools = [] as Tool[]; // 使用类型断言
            }

            // 确保不重复添加
            const existingToolIndex = allTools[categoryIndex].tools!.findIndex(
              (t: any) => t.isLocalTool && t.id === tool.id
            );

            if (existingToolIndex === -1) {
              allTools[categoryIndex].tools!.push(toolWithFlag as Tool); // 使用类型断言
            }
          }
        }

        // 添加本地工具到全部工具Map，使用路径作为key避免重复
        // 注意：如果本地工具与预设工具路径相同，本地工具会覆盖预设工具
        const key = tool.path;
        allToolItemsMap.set(key, {
          ...tool,
          type: tool.type,
          isLocalTool: true,
        });
      });

      // 转换为数组并排序
      const categoriesArray = Array.from(categorySet).sort();
      setCategories(categoriesArray);

      // 添加"本地工具"分类（如果不存在）
      if (localToolsList.length > 0) {
        const localToolCategory: Category = {
          name: "本地工具",
          icon: "RiTerminalBoxLine",
          path: "local-tools",
          type: "tool",
          tools: localToolsList.map((lt) => ({
            ...lt,
            type: lt.type,
            isLocalTool: true,
          })) as Tool[], // 使用类型断言
        };

        // 检查本地工具分类是否已存在
        const existingIndex = allTools.findIndex(
          (cat) => cat.path === "local-tools"
        );
        if (existingIndex >= 0) {
          allTools[existingIndex] = localToolCategory;
        } else {
          allTools.push(localToolCategory);
        }
      }

      // 创建"全部工具"分类并添加到最前面
      if (allToolItemsMap.size > 0) {
        const allToolsCategory: Category = {
          name: "全部工具",
          icon: "RiAppsLine",
          path: "all-tools",
          type: "tool",
          tools: Array.from(allToolItemsMap.values()) as Tool[], // 使用类型断言
        };
        allTools.unshift(allToolsCategory);
      }

      setToolList(allTools);

      // 如果有当前活动标签，则保持；否则设为第一个标签
      if (
        currentActiveTab &&
        allTools.some((tool) => tool.path === currentActiveTab)
      ) {
        setActiveTab(currentActiveTab);
      } else if (allTools.length > 0) {
        setActiveTab(allTools[0].path);
      }
    } catch (error) {
      console.error("加载工具失败:", error);
      message.error("加载工具失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 根据分类名称查找分类索引
  const findCategoryIndexByName = (
    categories: Category[],
    name: string
  ): number => {
    // 先尝试精确匹配
    let index = categories.findIndex(
      (cat) => cat.name && cat.name.toLowerCase() === name.toLowerCase()
    );

    // 如果没找到，尝试包含匹配
    if (index === -1) {
      index = categories.findIndex(
        (cat) => cat.name && name.toLowerCase().includes(cat.name.toLowerCase())
      );
    }

    // 如果还没找到，尝试反向包含匹配
    if (index === -1) {
      index = categories.findIndex(
        (cat) => cat.name && cat.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    return index;
  };

  const handleToggleTool = async (toolId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await localToolManager.enableTool(toolId);
      } else {
        await localToolManager.disableTool(toolId);
      }

      // 重新加载工具列表，确保状态更新
      await loadTools();
      message.success(`${enabled ? "启用" : "禁用"}工具成功`);
    } catch (error) {
      console.error(`${enabled ? "启用" : "禁用"}工具失败:`, error);
      message.error(`${enabled ? "启用" : "禁用"}工具失败`);
    }
  };

  const handleCardClick = (path: string) => {
    navigate(`/tool/${path}`);
  };

  // 显示添加工具模态框
  const showAddToolModal = () => {
    setEditingTool(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 显示编辑工具模态框
  const showEditToolModal = (tool: LocalTool) => {
    setEditingTool(tool);
    form.setFieldsValue({
      name: tool.name,
      description: tool.description,
      path: tool.path,
      icon: tool.icon,
      category: tool.category,
      tags: tool.tags.join(", "),
      version: tool.version,
      author: tool.author,
    });
    setIsModalVisible(true);
  };

  // 处理工具表单提交（添加或编辑）
  const handleToolFormSubmit = async (values: any) => {
    try {
      const { name, description, path, icon, category, author, version, tags } =
        values;

      // 拆分标签为数组
      const tagsArray = tags
        ? tags.split(",").map((tag: string) => tag.trim())
        : [];

      // 创建工具对象
      const toolData = {
        name,
        description,
        path,
        icon,
        category,
        author: author || "未知",
        version: version || "1.0.0",
        tags: tagsArray,
        type: "local" as "local", // 类型断言
      };

      if (editingTool) {
        // 编辑现有工具
        await localToolManager.updateTool(editingTool.id, toolData);
        message.success("编辑工具成功");
      } else {
        // 添加新工具
        await localToolManager.addTool(toolData);
        message.success("添加工具成功");
      }

      await loadTools(); // 重新加载工具列表
      setIsModalVisible(false);
    } catch (error) {
      console.error(editingTool ? "编辑工具失败:" : "添加工具失败:", error);
      message.error(editingTool ? "编辑工具失败" : "添加工具失败");
    }
  };

  // 处理删除工具
  const handleDeleteTool = async (toolId: string) => {
    try {
      const success = await localToolManager.removeTool(toolId);
      if (success) {
        message.success("删除工具成功");
        await loadTools(); // 重新加载工具列表
      } else {
        message.error("删除工具失败");
      }
    } catch (error) {
      console.error("删除工具失败:", error);
      message.error("删除工具失败");
    }
  };

  // 生成标签页标题
  const renderTabTitle = (category: Category) => {
    const IconComponent = category.icon
      ? RemixIcons[category.icon as keyof typeof RemixIcons]
      : null;

    return (
      <Space size={4}>
        {IconComponent && <IconComponent />}
        <span>{category.name}</span>
      </Space>
    );
  };

  // 添加工具按钮
  const renderAddToolButton = () => {
    return (
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={showAddToolModal}
        className="mb-4"
      >
        添加本地工具
      </Button>
    );
  };

  // 添加新分类的处理函数
  const handleAddCategory = (input: string) => {
    const newCategory = input.trim();
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      return newCategory;
    }
    return undefined;
  };

  // 获取工具的启用状态
  const getToolEnabledStatus = (tool: any): boolean => {
    if (!tool.isLocalTool) return true; // 预设工具默认启用

    // 对于本地工具，从localTools中获取最新状态
    const localTool = localTools.find((lt) => lt.id === tool.id);
    return !!localTool?.enabled;
  };

  return (
    <>
      {/* 添加工具按钮 */}
      {renderAddToolButton()}

      {/* 标签页工具列表 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={toolList.map((category) => {
            return {
              key: category.path,
              label: renderTabTitle(category),
              children: category.tools && (
                <Row gutter={[16, 16]}>
                  {category.tools.map((tool: Tool) => {
                    const ToolIcon = tool.icon
                      ? RemixIcons[tool.icon as keyof typeof RemixIcons]
                      : null;

                    const isLocalTool = category.path === "local-tools";
                    const isActuallyLocalTool =
                      isLocalTool || (tool as any).isLocalTool;
                    const isEnabled = getToolEnabledStatus(tool);

                    // 本地工具的操作菜单
                    const toolMenu = isActuallyLocalTool && (
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "edit",
                              icon: <EditOutlined />,
                              label: "编辑",
                              onClick: (e) => {
                                e.domEvent.stopPropagation();
                                showEditToolModal(tool as unknown as LocalTool);
                              },
                              disabled: !isEnabled,
                            },
                            {
                              key: "delete",
                              icon: <DeleteOutlined />,
                              label: "删除",
                              danger: true,
                              onClick: (e) => {
                                e.domEvent.stopPropagation();
                                Modal.confirm({
                                  title: "确认删除",
                                  content: `确定要删除工具"${tool.name}"吗？`,
                                  okText: "确认",
                                  cancelText: "取消",
                                  okButtonProps: { danger: true },
                                  onOk: () =>
                                    handleDeleteTool(
                                      (tool as unknown as LocalTool).id
                                    ),
                                });
                              },
                              disabled: !isEnabled,
                            },
                          ],
                        }}
                        trigger={["click"]}
                        placement="bottomRight"
                        disabled={!isEnabled}
                      >
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                          disabled={!isEnabled}
                        />
                      </Dropdown>
                    );

                    return (
                      <Col
                        key={
                          isActuallyLocalTool
                            ? (tool as unknown as LocalTool).id
                            : tool.name
                        }
                        xs={24}
                        sm={24}
                        md={12}
                        lg={8}
                        xl={6}
                      >
                        <div className="tool-card-wrapper relative h-full">
                          {/* 添加一个淡灰色遮罩，如果工具被禁用 */}
                          {isActuallyLocalTool && !isEnabled && (
                            <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center pointer-events-none">
                              <Text type="secondary" className="text-sm">
                                "{tool.name}"已禁用
                              </Text>
                            </div>
                          )}

                          <Card
                            hoverable={isEnabled}
                            onClick={
                              isEnabled
                                ? () => handleCardClick(tool.path)
                                : undefined
                            }
                            size="small"
                            className="h-full"
                            extra={
                              <>
                                {isActuallyLocalTool && (
                                  <Space>
                                    <Switch
                                      size="small"
                                      checked={isEnabled}
                                      onChange={(checked, event) => {
                                        // 阻止卡片点击事件
                                        event.stopPropagation();
                                        handleToggleTool(
                                          (tool as unknown as LocalTool).id,
                                          checked
                                        );
                                      }}
                                      className="z-20 relative"
                                    />
                                    {toolMenu}
                                  </Space>
                                )}
                              </>
                            }
                          >
                            <Space
                              align="start"
                              direction="vertical"
                              className="w-full"
                            >
                              <Space align="start" className="w-full">
                                <Avatar
                                  size={40}
                                  icon={ToolIcon && <ToolIcon />}
                                />
                                <Space direction="vertical" className="w-full">
                                  <Title level={5} ellipsis={{ rows: 1 }}>
                                    {tool.name}
                                    {isActuallyLocalTool && (
                                      <Tag color="blue" className="ml-2">
                                        本地
                                      </Tag>
                                    )}
                                  </Title>
                                  <Paragraph
                                    type="secondary"
                                    ellipsis={{ rows: 2 }}
                                  >
                                    {tool.description || "暂无描述"}
                                  </Paragraph>
                                </Space>
                              </Space>

                              <div className="min-h-[32px]">
                                {tool.tags && tool.tags.length > 0 ? (
                                  <Space wrap>
                                    {tool.tags.slice(0, 3).map((tag) => (
                                      <Tag key={tag}>{tag}</Tag>
                                    ))}
                                    {tool.tags.length > 3 && (
                                      <Text type="secondary">
                                        +{tool.tags.length - 3}
                                      </Text>
                                    )}
                                  </Space>
                                ) : (
                                  <div className="h-6"></div>
                                )}
                              </div>

                              <Space split={<Divider type="vertical" />}>
                                {tool.version && (
                                  <Text type="secondary">
                                    版本: {tool.version}
                                  </Text>
                                )}
                                {tool.author && (
                                  <Text type="secondary">
                                    作者: {tool.author}
                                  </Text>
                                )}
                              </Space>
                            </Space>
                          </Card>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              ),
            };
          })}
        />
      )}

      {/* 工具表单模态框（添加/编辑） */}
      <Modal
        title={editingTool ? "编辑本地工具" : "添加本地工具"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleToolFormSubmit}>
          <Form.Item
            name="name"
            label="工具名称"
            rules={[{ required: true, message: "请输入工具名称" }]}
          >
            <Input placeholder="请输入工具名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="工具描述"
            rules={[{ required: true, message: "请输入工具描述" }]}
          >
            <TextArea rows={3} placeholder="请输入工具描述" />
          </Form.Item>

          <Form.Item
            name="path"
            label="工具路径"
            rules={[{ required: true, message: "请输入工具路径" }]}
            tooltip="本地工具的URL路径，如：my-tool"
          >
            <Input placeholder="请输入工具路径" />
          </Form.Item>

          <Form.Item
            name="icon"
            label="图标"
            rules={[{ required: true, message: "请选择图标" }]}
          >
            <Select
              showSearch
              placeholder="请选择图标"
              optionFilterProp="children"
            >
              {availableIcons.map((icon) => (
                <Option key={icon} value={icon}>
                  <Space>
                    {RemixIcons[icon as keyof typeof RemixIcons] &&
                      React.createElement(
                        RemixIcons[icon as keyof typeof RemixIcons]
                      )}
                    {icon}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: "请选择或输入工具分类" }]}
          >
            <Select
              placeholder="选择分类"
              showSearch
              allowClear
              options={categories.map((cat) => ({ label: cat, value: cat }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider className="my-2" />
                  <Input.Search
                    placeholder="添加新分类"
                    enterButton="添加"
                    onSearch={handleAddCategory}
                  />
                </>
              )}
            />
          </Form.Item>

          <Form.Item name="tags" label="标签" tooltip="多个标签请用逗号分隔">
            <Input placeholder="如：文本,处理,工具（逗号分隔）" />
          </Form.Item>

          <Form.Item name="version" label="版本">
            <Input placeholder="如：1.0.0" />
          </Form.Item>

          <Form.Item name="author" label="作者">
            <Input placeholder="工具作者" />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingTool ? "保存" : "添加"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Tool;
