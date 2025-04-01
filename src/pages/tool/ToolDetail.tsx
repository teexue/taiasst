import { RiArrowGoBackFill } from "@remixicon/react";
import {
  Button,
  Divider,
  Typography,
  Space,
  Tag,
  Spin,
  Card,
  Result,
} from "antd";
import { useNavigate, useParams } from "react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import * as RemixIcons from "@remixicon/react";
import { localToolManager } from "@/utils/local-tool-manager";
import tools from "@/store/tools/tool.json";

const { Title, Text, Paragraph } = Typography;

interface Tool {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  icon?: string;
  path: string;
  type?: string;
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

interface ToolDetailProps {
  tool?: Tool;
}

function ToolDetail(props: ToolDetailProps) {
  const { tool: propTool } = props;
  const navigate = useNavigate();
  const params = useParams<{ path: string }>();
  const [tool, setTool] = useState<Tool | null>(propTool || null);
  const [loading, setLoading] = useState(!propTool);
  const [error, setError] = useState<string | null>(null);
  const [componentError, setComponentError] = useState<boolean>(false);

  useEffect(() => {
    // 如果没有通过props传递工具，则从路径参数获取
    if (!propTool && params.path) {
      setLoading(true);
      setComponentError(false); // 重置组件错误状态

      // 尝试从预设工具中查找
      let foundTool: Tool | null = null;

      // 在所有工具分类中查找
      for (const category of tools as Category[]) {
        if (category.tools) {
          const match = category.tools.find(
            (t: Tool) => t.path === params.path
          );
          if (match) {
            foundTool = match;
            break;
          }
        }
      }

      // 如果没找到，尝试从本地工具中查找
      if (!foundTool) {
        localToolManager
          .loadTools()
          .then(() => {
            const localTools = localToolManager.getTools();
            const localTool = localTools.find((t) => t.path === params.path);

            if (localTool) {
              setTool(localTool);
            } else {
              setError(`未找到路径为 ${params.path} 的工具`);
            }
            setLoading(false);
          })
          .catch(() => {
            setError("加载工具失败");
            setLoading(false);
          });
      } else {
        setTool(foundTool);
        setLoading(false);
      }
    }
  }, [propTool, params.path]);

  if (loading) {
    return (
      <div className="text-center p-12">
        <Spin size="large" />
        <div className="mt-5">加载工具中...</div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="text-center p-12">
        <Title level={4}>😢 {error || "未找到工具"}</Title>
        <Button type="primary" onClick={() => navigate("/tool")}>
          返回工具列表
        </Button>
      </div>
    );
  }

  // 获取工具图标
  const ToolIcon = tool.icon
    ? RemixIcons[tool.icon as keyof typeof RemixIcons]
    : null;

  // 准备安全的动态导入逻辑
  const getToolComponent = () => {
    if (componentError) {
      return (
        <Result
          status="404"
          title="工具模块未找到"
          subTitle={`找不到工具 "${tool.name}" 的实现文件`}
          extra={
            <Button type="primary" onClick={() => navigate("/tool")}>
              返回工具列表
            </Button>
          }
        />
      );
    }

    // 使用错误边界处理动态导入失败
    const ToolComponentLazy = lazy(() => {
      return import(`@/pages/tool/tools/${tool.path}/index.tsx`).catch(() => {
        setComponentError(true);
        // 返回一个简单的默认组件避免React报错
        return {
          default: () => null,
        };
      });
    });

    return (
      <Suspense
        fallback={
          <div className="text-center p-8">
            <Spin />
          </div>
        }
      >
        <ToolComponentLazy />
      </Suspense>
    );
  };

  return (
    <div className="tool-detail-container">
      {/* 工具头部信息 */}
      <div className="mb-5">
        <Space align="center" className="mb-4">
          <Button
            icon={<RiArrowGoBackFill />}
            type="primary"
            onClick={() => navigate("/tool")}
          />
          <Title level={3} className="m-0">
            {tool.name}
          </Title>
          {(tool as any).isLocalTool && <Tag color="blue">本地</Tag>}
        </Space>

        <Card className="mb-5">
          <Space align="start">
            {ToolIcon && <ToolIcon className="text-3xl" />}
            <Space direction="vertical">
              <Paragraph>{tool.description}</Paragraph>

              <Space wrap>
                {tool.tags &&
                  tool.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                {tool.category && <Tag color="green">{tool.category}</Tag>}
              </Space>

              <Space split={<Divider type="vertical" />}>
                {tool.version && (
                  <Text type="secondary">版本: {tool.version}</Text>
                )}
                {tool.author && (
                  <Text type="secondary">作者: {tool.author}</Text>
                )}
              </Space>
            </Space>
          </Space>
        </Card>
      </div>

      <Divider />

      {/* 工具内容 */}
      <div className="tool-detail-content">{getToolComponent()}</div>
    </div>
  );
}

export default ToolDetail;
