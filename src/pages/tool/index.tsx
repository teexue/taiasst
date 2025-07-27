import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Input,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  RiToolsLine,
  RiSearchLine,
  RiPlayLine,
  RiInboxLine,
  RiAppsLine,
  RiPuzzleLine,
  RiStarLine,
  RiFilterLine,
  RiFile2Line,
} from "react-icons/ri";
import { motion } from "framer-motion";
import { getPluginList } from "@/utils/plugin";
import { PluginMetadata, PluginTypeExtra } from "@/types/plugin";

// 内置工具定义
interface BuiltinTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  isComingSoon?: boolean;
  featured?: boolean;
}

const builtinTools: BuiltinTool[] = [
  {
    id: "password-manager",
    name: "密码管理器",
    description: "安全存储和管理您的密码",
    category: "安全工具",
    icon: <RiStarLine className="w-6 h-6" />,
    featured: true,
  },
  {
    id: "markdown-editor",
    name: "Markdown编辑器",
    description: "实时预览的Markdown编辑器",
    category: "文档工具",
    icon: <RiFile2Line className="w-6 h-6" />,
    isComingSoon: true,
  },
  {
    id: "ai-watermark-remover",
    name: "AI去水印",
    description: "智能去除图片水印",
    category: "AI工具",
    icon: <RiStarLine className="w-6 h-6" />,
    isComingSoon: true,
  },
  {
    id: "text-converter",
    name: "文本转换器",
    description: "各种文本格式转换工具",
    category: "文本工具",
    icon: <RiFilterLine className="w-6 h-6" />,
    isComingSoon: true,
  },
];

// 内置工具卡片组件
interface BuiltinToolCardProps {
  tool: BuiltinTool;
  index: number;
  onClick: () => void;
}

const BuiltinToolCard: React.FC<BuiltinToolCardProps> = ({
  tool,
  index,
  onClick,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`h-full shadow-sm border border-divider/20 transition-all duration-200 flex flex-col ${
          tool.isComingSoon
            ? "opacity-60 cursor-not-allowed"
            : "hover:border-primary/30 cursor-pointer"
        }`}
        isPressable={!tool.isComingSoon}
        onPress={onClick}
      >
        <CardHeader className="p-4 pb-3 flex-shrink-0">
          <div className="flex items-start gap-3 w-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-sm flex-shrink-0">
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground line-clamp-1 mb-2">
                {tool.name}
              </h3>
              <div className="flex items-center flex-wrap gap-1">
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="text-xs"
                >
                  {tool.category}
                </Chip>
                {tool.featured && (
                  <Chip
                    size="sm"
                    color="warning"
                    variant="flat"
                    className="text-xs"
                  >
                    推荐
                  </Chip>
                )}
                {tool.isComingSoon && (
                  <Chip
                    size="sm"
                    color="default"
                    variant="flat"
                    className="text-xs"
                  >
                    即将推出
                  </Chip>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-4 py-3 pb-4 flex-1 flex flex-col">
          <p className="text-sm text-foreground/70 line-clamp-3 flex-1 min-h-[4rem]">
            {tool.description}
          </p>

          {/* 状态指示器 */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-divider/20">
            <span className="text-xs text-foreground/50">
              {tool.isComingSoon ? "即将推出" : "点击卡片打开"}
            </span>
            {!tool.isComingSoon && (
              <RiPlayLine className="w-4 h-4 text-primary/60" />
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// 插件工具卡片组件
interface PluginToolCardProps {
  tool: PluginMetadata;
  index: number;
  onClick: () => void;
}

const PluginToolCard: React.FC<PluginToolCardProps> = ({
  tool,
  index,
  onClick,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="h-full shadow-sm border border-divider/20 hover:border-secondary/30 transition-all duration-200 cursor-pointer flex flex-col"
        isPressable
        onPress={onClick}
      >
        <CardHeader className="p-4 pb-3 flex-shrink-0">
          <div className="flex items-start gap-3 w-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-semibold text-lg shadow-sm flex-shrink-0">
              {tool.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground line-clamp-1 mb-2">
                {tool.name}
              </h3>
              <div className="flex items-center flex-wrap gap-1">
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="text-xs"
                >
                  v{tool.version}
                </Chip>
                {tool.plugin_type && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color="secondary"
                    className="text-xs"
                  >
                    {PluginTypeExtra[tool.plugin_type]?.name ||
                      tool.plugin_type}
                  </Chip>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-4 py-3 pb-4 flex-1 flex flex-col">
          <p className="text-sm text-foreground/70 line-clamp-3 flex-1 min-h-[4rem]">
            {tool.description || "暂无描述"}
          </p>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-divider/20">
            <div className="flex flex-col">
              {tool.author && (
                <p className="text-xs text-foreground/50 mb-1">
                  作者: {tool.author}
                </p>
              )}
              <span className="text-xs text-foreground/50">点击卡片启动</span>
            </div>
            <RiPlayLine className="w-4 h-4 text-secondary/60" />
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

function Tool() {
  const navigate = useNavigate();
  const [pluginTools, setPluginTools] = useState<PluginMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  // 获取插件工具列表
  const fetchPluginTools = useCallback(async () => {
    try {
      setLoading(true);
      const plugins = await getPluginList();
      // 只显示工具类型的插件
      const toolPlugins = plugins.filter(
        (plugin: PluginMetadata) => plugin.plugin_type === "tool",
      );
      setPluginTools(toolPlugins);
    } catch (error) {
      console.error("获取插件工具失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPluginTools();
  }, [fetchPluginTools]);

  // 处理工具点击
  const handleToolClick = (tool: BuiltinTool | PluginMetadata) => {
    if ("isComingSoon" in tool && tool.isComingSoon) {
      return; // 即将推出的工具不可点击
    }

    if ("plugin_type" in tool) {
      // 插件工具，跳转到详情页
      navigate(`/tool/detail/${tool.id}`);
    } else {
      // 内置工具，根据ID跳转到对应页面
      switch (tool.id) {
        case "password-manager":
          navigate("/passwords");
          break;
        default:
          console.log("工具暂未实现:", tool.id);
      }
    }
  };

  // 过滤工具
  const filteredBuiltinTools = builtinTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredPluginTools = pluginTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.description &&
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // 根据选中的标签过滤
  const getFilteredTools = () => {
    switch (selectedTab) {
      case "builtin":
        return { builtin: filteredBuiltinTools, plugin: [] };
      case "plugin":
        return { builtin: [], plugin: filteredPluginTools };
      default:
        return { builtin: filteredBuiltinTools, plugin: filteredPluginTools };
    }
  };

  const { builtin: displayBuiltinTools, plugin: displayPluginTools } =
    getFilteredTools();
  const totalTools = displayBuiltinTools.length + displayPluginTools.length;

  return (
    <div className="flex flex-col gap-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl text-white shadow-lg">
            <RiToolsLine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">工具中心</h1>
            <p className="text-foreground/70 text-sm mt-1">
              内置工具和插件工具的统一管理中心
            </p>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="搜索工具..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<RiSearchLine className="text-default-400" />}
              variant="bordered"
              size="md"
              classNames={{
                input: "text-sm",
                inputWrapper: "border-default-200 hover:border-primary/40",
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-foreground/60">
              共 {totalTools} 个工具
            </div>
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              variant="bordered"
              size="sm"
              classNames={{
                tabList: "gap-2",
                tab: "px-3 py-2",
                cursor: "bg-primary",
              }}
            >
              <Tab
                key="all"
                title={
                  <div className="flex items-center gap-2">
                    <RiAppsLine size={16} />
                    <span>全部</span>
                  </div>
                }
              />
              <Tab
                key="builtin"
                title={
                  <div className="flex items-center gap-2">
                    <RiToolsLine size={16} />
                    <span>内置</span>
                  </div>
                }
              />
              <Tab
                key="plugin"
                title={
                  <div className="flex items-center gap-2">
                    <RiPuzzleLine size={16} />
                    <span>插件</span>
                  </div>
                }
              />
            </Tabs>
          </div>
        </div>
      </div>

      {/* 工具列表 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-foreground/60 mt-4">加载工具列表...</p>
        </div>
      ) : totalTools === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-default-100 to-default-200 flex items-center justify-center mb-6 shadow-sm">
            <RiInboxLine className="w-12 h-12 text-default-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchQuery ? "未找到匹配工具" : "暂无可用工具"}
          </h3>
          <p className="text-sm text-foreground/60 text-center max-w-md">
            {searchQuery
              ? `没有找到包含"${searchQuery}"的工具，请尝试其他关键词`
              : "当前没有可用的工具，请安装插件或等待内置工具上线"}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* 内置工具 */}
          {displayBuiltinTools.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RiToolsLine className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  内置工具
                </h2>
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="ml-auto"
                >
                  {displayBuiltinTools.length} 个
                </Chip>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayBuiltinTools.map((tool, index) => (
                  <BuiltinToolCard
                    key={tool.id}
                    tool={tool}
                    index={index}
                    onClick={() => handleToolClick(tool)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 插件工具 */}
          {displayPluginTools.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <RiPuzzleLine className="w-4 h-4 text-secondary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  插件工具
                </h2>
                <Chip
                  size="sm"
                  variant="flat"
                  color="secondary"
                  className="ml-auto"
                >
                  {displayPluginTools.length} 个
                </Chip>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayPluginTools.map((tool, index) => (
                  <PluginToolCard
                    key={tool.id}
                    tool={tool}
                    index={index}
                    onClick={() => handleToolClick(tool)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Tool;
