import {
  Tabs,
  List,
  Card,
  Button,
  Tag,
  Empty,
  Spin,
  Typography,
  Avatar,
} from "antd";
import { useEffect, useState } from "react";
import { PluginMetadata, PluginTypeExtra, OriginExtra } from "@/types/plugin";
import { getLoadedPlugins } from "@/utils/backend/plugin";
import { useNavigate } from "react-router";
import { RiEyeLine, RiToolsLine } from "@remixicon/react";

const { Title, Paragraph } = Typography;

function Tool() {
  const [plugins, setPlugins] = useState<PluginMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 工具类型常量，使用PluginTypeExtra的键
  const TOOL_TYPE = Object.keys(PluginTypeExtra)[0]; // "tool"
  // 本地来源常量，使用OriginExtra的键
  const LOCAL_ORIGIN = Object.keys(OriginExtra)[0]; // "local"

  useEffect(() => {
    // 获取所有插件
    const fetchPlugins = async () => {
      try {
        setLoading(true);
        const allPlugins = await getLoadedPlugins();
        setPlugins(allPlugins);
      } catch (error) {
        console.error("加载插件失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlugins();
  }, []);

  // 根据类型过滤插件
  const toolPlugins = plugins.filter(
    (plugin) => plugin.plugin_type === TOOL_TYPE,
  );

  const localPlugins = plugins.filter(
    (plugin) =>
      plugin.origin === LOCAL_ORIGIN && plugin.plugin_type === TOOL_TYPE,
  );

  // 打开插件详情页
  const openPluginDetail = (pluginId: string) => {
    navigate(`/tool/detail/${pluginId}`);
  };

  // 为插件生成随机颜色（基于插件ID）
  const getPluginColor = (pluginId: string) => {
    const colors = [
      "#1677ff",
      "#52c41a",
      "#fa8c16",
      "#eb2f96",
      "#722ed1",
      "#13c2c2",
    ];
    const index =
      pluginId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  // 为插件获取首字母图标
  const getPluginAvatar = (plugin: PluginMetadata) => {
    const bgColor = getPluginColor(plugin.id);
    const initial = plugin.name.charAt(0).toUpperCase();

    return (
      <Avatar
        shape="square"
        size={48}
        style={{ backgroundColor: bgColor, verticalAlign: "middle" }}
      >
        {initial}
      </Avatar>
    );
  };

  // 渲染插件列表
  const renderPluginList = (pluginList: PluginMetadata[]) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-16">
          <Spin size="large" tip="正在加载工具..." />
        </div>
      );
    }

    if (pluginList.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无可用工具"
          className="p-16"
        />
      );
    }

    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={pluginList}
        renderItem={(plugin) => (
          <List.Item>
            <Card
              hoverable
              className="h-full transform transition-all duration-300 hover:shadow-md"
              actions={[
                <Button
                  type="primary"
                  icon={<RiEyeLine />}
                  onClick={() => openPluginDetail(plugin.id)}
                >
                  打开工具
                </Button>,
              ]}
            >
              <div className="flex items-start gap-3">
                {getPluginAvatar(plugin)}
                <div className="flex-1 min-w-0">
                  <Title level={5} ellipsis={{ rows: 1 }} className="m-0">
                    {plugin.name}
                  </Title>
                  <div className="flex items-center gap-1 mt-1">
                    <Tag color="blue">v{plugin.version}</Tag>
                    {plugin.plugin_type && (
                      <Tag color={PluginTypeExtra[plugin.plugin_type].color}>
                        {PluginTypeExtra[plugin.plugin_type].name}
                      </Tag>
                    )}
                    {plugin.origin && (
                      <Tag color={OriginExtra[plugin.origin].color}>
                        {OriginExtra[plugin.origin].name}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>

              <Paragraph
                ellipsis={{ rows: 2 }}
                className="text-gray-500 mt-3"
                style={{ marginBottom: 8, minHeight: "3em" }}
              >
                {plugin.description || "暂无描述"}
              </Paragraph>

              {plugin.author && (
                <div className="text-xs text-gray-400 mt-2">
                  作者: {plugin.author}
                </div>
              )}
            </Card>
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="p-4">
      <Tabs
        items={[
          {
            key: "1",
            label: (
              <span className="flex items-center gap-1">
                <RiToolsLine />
                全部工具
              </span>
            ),
            children: renderPluginList(toolPlugins),
          },
          {
            key: "2",
            label: (
              <span className="flex items-center gap-1">
                <RiToolsLine />
                本地工具
              </span>
            ),
            children: renderPluginList(localPlugins),
          },
        ]}
      />
    </div>
  );
}

export default Tool;
