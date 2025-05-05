import { useState, useEffect, useCallback } from "react";
import {
  Chip,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Avatar,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tooltip,
} from "@heroui/react";
import { toast } from "sonner";
import { RiEyeLine, RiDeleteBin6Line, RiInboxLine } from "@remixicon/react";
import { error } from "@tauri-apps/plugin-log";
import {
  getPluginList,
  uninstallPlugin,
  clearPluginGlobal,
  removePluginScript,
} from "@/utils/plugin";
import {
  PluginMetadata,
  PluginType,
  PluginTypeExtra,
  Origin,
  OriginExtra,
} from "@/types/plugin";
import { motion } from "framer-motion";

interface PluginListTabProps {
  onPreview: (plugin: PluginMetadata) => void;
  onUpdate: () => void;
}

function PluginListTab({ onPreview, onUpdate }: PluginListTabProps) {
  const [plugins, setPlugins] = useState<PluginMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlugins = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPluginList();
      setPlugins(result as PluginMetadata[]);
    } catch (err) {
      console.error("Error fetching plugin list:", err);
      toast.error("获取插件列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlugins();
  }, [fetchPlugins]);

  const handleUninstall = async (plugin: PluginMetadata) => {
    try {
      await uninstallPlugin(plugin.id);
      toast.success(`插件 ${plugin.name} 已卸载`);
      fetchPlugins();
      onUpdate();
    } catch (err) {
      error(`卸载插件失败: ${String(err)}`);
      toast.error("卸载插件失败");
    }
  };

  const handlePreview = (plugin: PluginMetadata) => {
    clearPluginGlobal();
    removePluginScript(plugin.id);
    onPreview(plugin);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <Spinner size="lg" label="正在加载插件列表..." />
      </div>
    );
  }

  if (!loading && plugins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-foreground-500 h-64">
        <RiInboxLine className="w-16 h-16 mb-4 text-foreground-300" />
        <span>暂无已安装的插件</span>
      </div>
    );
  }

  // Helper function to map antd color to HeroUI Chip color
  const mapAntdColorToHeroUIColor = (
    color?: string,
  ): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    switch (color) {
      case "blue":
        return "primary";
      case "green":
        return "success";
      case "orange":
        return "warning";
      case "red":
        return "danger";
      case "purple":
        return "secondary";
      default:
        return "default";
    }
  };

  // Animation variants for the grid items (similar to ToolIndex)
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  return (
    <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
      {plugins.map((plugin, index) => (
        <motion.div
          key={plugin.id}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="glass-light dark:glass-dark overflow-hidden h-full shadow-sm border border-divider/10">
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
                <div className="flex items-center flex-wrap gap-1 mt-1 text-xs">
                  {plugin.plugin_type && (
                    <Chip
                      variant="flat"
                      size="sm"
                      radius="sm"
                      color={mapAntdColorToHeroUIColor(
                        PluginTypeExtra[plugin.plugin_type as PluginType]
                          ?.color,
                      )}
                      className="bg-opacity-10 border-opacity-30"
                    >
                      {PluginTypeExtra[plugin.plugin_type as PluginType]
                        ?.name || plugin.plugin_type}
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
                  {plugin.origin && (
                    <Chip
                      variant="bordered"
                      size="sm"
                      radius="sm"
                      color={mapAntdColorToHeroUIColor(
                        OriginExtra[plugin.origin as Origin]?.color,
                      )}
                      className="border-opacity-70"
                    >
                      {OriginExtra[plugin.origin as Origin]?.name ||
                        plugin.origin}
                    </Chip>
                  )}
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
            <CardFooter className="pt-1 pb-2 px-3 flex justify-between items-center border-t border-divider/10">
              <span className="text-tiny text-foreground/50 truncate">
                {plugin.author ? `作者: ${plugin.author}` : ""}
              </span>
              <div className="flex gap-1">
                <Tooltip content="预览" placement="top">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    radius="full"
                    className="text-primary hover:bg-primary/10"
                    onPress={() => handlePreview(plugin)}
                  >
                    <RiEyeLine size={16} />
                  </Button>
                </Tooltip>
                <Popover placement="top-end">
                  <PopoverTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      radius="full"
                      className="text-danger hover:bg-danger/10"
                    >
                      <RiDeleteBin6Line size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-danger/10">
                      <h4 className="text-sm font-medium text-danger-600">
                        确认卸载
                      </h4>
                    </div>
                    <div className="p-3 text-sm">
                      确定要卸载插件 "
                      <span className="font-medium">{plugin.name}</span>" 吗？
                    </div>
                    <div className="flex justify-end gap-2 p-2 bg-default-100/50">
                      <Button size="sm" variant="flat" radius="md">
                        取消
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        radius="md"
                        onPress={() => handleUninstall(plugin)}
                        className="shadow-sm"
                      >
                        确定卸载
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default PluginListTab;
