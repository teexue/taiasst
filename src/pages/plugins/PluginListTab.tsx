import { useState, useEffect, useCallback } from "react";
import {
  Chip,
  Button,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { toast } from "sonner";
import { RiEyeLine, RiDeleteBin5Line, RiInboxLine } from "react-icons/ri";
import { error } from "@tauri-apps/plugin-log";
import {
  getPluginList,
  uninstallPlugin,
  clearPluginGlobal,
  removePluginScript,
} from "@/utils/plugin";
import { PluginMetadata, PluginType, PluginTypeExtra } from "@/types/plugin";
import { motion } from "framer-motion";

interface PluginListTabProps {
  onPreview: (plugin: PluginMetadata) => void;
  onUpdate: () => void;
}

function PluginListTab({ onPreview, onUpdate }: PluginListTabProps) {
  const [plugins, setPlugins] = useState<PluginMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [pluginToUninstall, setPluginToUninstall] =
    useState<PluginMetadata | null>(null);

  const {
    isOpen: isUninstallModalOpen,
    onOpen: onUninstallModalOpen,
    onClose: onUninstallModalClose,
  } = useDisclosure();

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

  const handleUninstall = (plugin: PluginMetadata) => {
    setPluginToUninstall(plugin);
    onUninstallModalOpen();
  };

  const confirmUninstall = async () => {
    if (!pluginToUninstall) return;

    try {
      await uninstallPlugin(pluginToUninstall.id);
      toast.success(`插件 ${pluginToUninstall.name} 已卸载`);
      fetchPlugins();
      onUpdate();
      onUninstallModalClose();
      setPluginToUninstall(null);
    } catch (err) {
      error(`卸载插件失败: ${String(err)}`);
      toast.error("卸载插件失败");
    }
  };

  const cancelUninstall = () => {
    setPluginToUninstall(null);
    onUninstallModalClose();
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
      <div className="flex flex-col items-center justify-center py-20 text-foreground/60">
        <div className="w-20 h-20 rounded-full bg-default-100 flex items-center justify-center mb-4">
          <RiInboxLine className="w-10 h-10 text-default-400" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">暂无插件</h3>
        <p className="text-sm text-foreground/60">
          点击上方"安装插件"按钮开始添加插件
        </p>
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
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.03,
        duration: 0.25,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">已安装插件</h2>
        <span className="text-sm text-foreground/60">
          {plugins.length} 个插件
        </span>
      </div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <Card className="h-full shadow-sm border border-divider/20 hover:border-primary/30 transition-all duration-200">
              <CardHeader className="p-4 pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                    {plugin.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Tooltip
                      content={plugin.name}
                      placement="top-start"
                      delay={300}
                    >
                      <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                        {plugin.name}
                      </h3>
                    </Tooltip>
                    <div className="flex items-center flex-wrap gap-2">
                      <Chip
                        variant="flat"
                        size="sm"
                        color="primary"
                        className="text-xs"
                      >
                        v{plugin.version}
                      </Chip>
                      {plugin.plugin_type && (
                        <Chip
                          variant="flat"
                          size="sm"
                          color={mapAntdColorToHeroUIColor(
                            PluginTypeExtra[plugin.plugin_type as PluginType]
                              ?.color,
                          )}
                          className="text-xs"
                        >
                          {PluginTypeExtra[plugin.plugin_type as PluginType]
                            ?.name || plugin.plugin_type}
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="px-4 py-3">
                <Tooltip
                  content={plugin.description || "暂无描述"}
                  placement="bottom-start"
                  delay={300}
                >
                  <p className="text-sm text-foreground/70 line-clamp-3 min-h-[3.5rem]">
                    {plugin.description || "暂无描述"}
                  </p>
                </Tooltip>

                {plugin.author && (
                  <p className="text-xs text-foreground/50 mt-3">
                    作者: {plugin.author}
                  </p>
                )}
              </CardBody>

              <CardFooter className="px-4 py-3 pt-0 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<RiEyeLine size={16} />}
                    onPress={() => handlePreview(plugin)}
                    className="text-xs"
                  >
                    预览
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<RiDeleteBin5Line size={16} />}
                    className="text-xs"
                    onPress={() => handleUninstall(plugin)}
                  >
                    卸载
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* 卸载确认模态框 */}
      <Modal
        isOpen={isUninstallModalOpen}
        onClose={cancelUninstall}
        size="md"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3">
            <div className="p-2 bg-danger/10 rounded-lg">
              <RiDeleteBin5Line className="w-5 h-5 text-danger" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-danger">确认卸载</h2>
            </div>
          </ModalHeader>

          <ModalBody className="py-4">
            <div className="space-y-4">
              <p className="text-foreground">
                您确定要卸载插件{" "}
                <span className="font-semibold">
                  "{pluginToUninstall?.name}"
                </span>{" "}
                吗？
              </p>

              <div className="p-4 bg-danger/5 border border-danger/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-danger text-sm font-bold">!</span>
                  </div>
                  <div className="text-sm text-danger-600">
                    <p className="font-medium mb-1">此操作无法撤销</p>
                    <p>卸载后，插件的所有数据和配置将被永久删除。</p>
                  </div>
                </div>
              </div>

              {pluginToUninstall && (
                <div className="text-sm text-foreground/60 space-y-1">
                  <p>
                    <span className="font-medium">版本:</span> v
                    {pluginToUninstall.version}
                  </p>
                  {pluginToUninstall.author && (
                    <p>
                      <span className="font-medium">作者:</span>{" "}
                      {pluginToUninstall.author}
                    </p>
                  )}
                  {pluginToUninstall.description && (
                    <p>
                      <span className="font-medium">描述:</span>{" "}
                      {pluginToUninstall.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="gap-3">
            <Button variant="flat" onPress={cancelUninstall}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={confirmUninstall}
              startContent={<RiDeleteBin5Line />}
            >
              确认卸载
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default PluginListTab;
