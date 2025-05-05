import { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
  Avatar,
  Tooltip,
} from "@heroui/react";
import { PluginMetadata, PluginTypeExtra, OriginExtra } from "@/types/plugin";
import { getLoadedPlugins } from "@/utils/backend/plugin";
import { useNavigate } from "react-router";
import { RiToolsLine, RiInboxLine, RiComputerLine } from "@remixicon/react";
import { motion } from "framer-motion";

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

  // Animation variants for the grid items
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05, // Stagger animation
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  // 渲染插件列表
  const renderPluginList = (pluginList: PluginMetadata[]) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-16">
          <Spinner size="lg" label="正在加载工具..." />
        </div>
      );
    }

    if (pluginList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-16 text-foreground-500 h-64">
          <RiInboxLine className="w-16 h-16 mb-4 text-foreground-300" />
          <span>暂无可用工具</span>
        </div>
      );
    }

    return (
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
        {pluginList.map((plugin, index) => (
          <motion.div
            key={plugin.id}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              isPressable
              onPress={() => openPluginDetail(plugin.id)}
              className="glass-light dark:glass-dark overflow-hidden h-full shadow-sm border border-divider/10"
            >
              <CardHeader className="p-3 flex items-start gap-3">
                <Avatar
                  name={plugin.name.charAt(0).toUpperCase()}
                  size="md"
                  radius="md"
                  className="flex-shrink-0 bg-gradient-to-br from-secondary to-primary text-white"
                />
                <div className="flex-1 min-w-0">
                  <Tooltip
                    content={plugin.name}
                    placement="top-start"
                    delay={500}
                  >
                    <h5 className="text-sm font-medium m-0 line-clamp-1">
                      {plugin.name}
                    </h5>
                  </Tooltip>
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    {plugin.plugin_type && (
                      <Chip
                        variant="flat"
                        size="sm"
                        radius="sm"
                        className="bg-primary/10 text-primary border-primary/30"
                      >
                        {PluginTypeExtra[plugin.plugin_type]?.name ||
                          plugin.plugin_type}
                      </Chip>
                    )}
                    <Chip
                      variant="bordered"
                      size="sm"
                      radius="sm"
                      className="border-default-300/70 text-foreground/70"
                    >
                      v{plugin.version}
                    </Chip>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0 pb-3 px-3 text-xs text-foreground/70">
                <Tooltip
                  content={plugin.description || "暂无描述"}
                  placement="bottom-start"
                  delay={500}
                >
                  <p className="min-h-[2.5em] line-clamp-2">
                    {plugin.description || "暂无描述"}
                  </p>
                </Tooltip>
              </CardBody>
              {plugin.author && (
                <CardFooter className="pt-0 pb-2 px-3 text-tiny text-foreground/50">
                  <span>作者: {plugin.author}</span>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="p-4">
      <Tabs
        aria-label="工具类型"
        color="primary"
        variant="underlined"
        classNames={{
          tabList: "px-4",
          panel: "p-0 pt-4",
        }}
        fullWidth
      >
        <Tab
          key="all"
          title={
            <span className="flex items-center gap-1.5 text-sm">
              <RiToolsLine size={16} />
              全部工具
            </span>
          }
        >
          {renderPluginList(toolPlugins)}
        </Tab>
        <Tab
          key="local"
          title={
            <span className="flex items-center gap-1.5 text-sm">
              <RiComputerLine size={16} />
              本地工具
            </span>
          }
        >
          {renderPluginList(localPlugins)}
        </Tab>
      </Tabs>
    </div>
  );
}

export default Tool;
