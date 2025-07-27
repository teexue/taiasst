import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  RiAddCircleLine,
  RiRefreshLine,
  RiFolderLine,
  RiGlobalLine,
  RiPuzzleLine,
} from "react-icons/ri";
import { error } from "@tauri-apps/plugin-log";
import { getPluginBaseDir } from "@/utils/plugin";
import { openPath } from "@tauri-apps/plugin-opener";
import PluginLoader from "@/components/PluginLoader";
import PluginListTab from "./PluginListTab";
import LocalInstallTab from "./LocalInstallTab";
import NetworkInstallTab from "./NetworkInstallTab";
import { PluginMetadata } from "@/types/plugin";

// Modal ClassNames based on design doc
const modalClassNames = {
  backdrop: "bg-default/50 backdrop-blur-sm backdrop-saturate-150",
  base: "glass-light dark:glass-dark border border-divider/30 shadow-xl mx-4",
  header: "border-b border-divider/30 font-medium",
  footer: "border-t border-divider/30",
  closeButton: "hover:bg-default-100/50 active:scale-95",
};

function Plugins() {
  const {
    isOpen: isOpenInstall,
    onOpen: onOpenInstall,
    onClose: onCloseInstall,
    onOpenChange: onOpenChangeInstall,
  } = useDisclosure();
  const {
    isOpen: isOpenPreview,
    onOpen: onOpenPreview,
    onClose: onClosePreview,
    onOpenChange: onOpenChangePreview,
  } = useDisclosure();

  const [currentPlugin, setCurrentPlugin] = useState<PluginMetadata | null>(
    null,
  );
  const [installTabKey, setInstallTabKey] = useState("local");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    toast.info("插件列表已刷新");
  }, []);

  const handlePreview = useCallback(
    (plugin: PluginMetadata) => {
      setCurrentPlugin(plugin);
      onOpenPreview();
    },
    [onOpenPreview],
  );

  const handleOpenPluginDir = useCallback(async () => {
    try {
      const dir = await getPluginBaseDir();
      await openPath(dir as string);
    } catch (err) {
      error(`打开插件目录失败: ${String(err)}`);
      toast.error("打开插件目录失败");
    }
  }, []);

  const closeInstallModal = useCallback(() => {
    onCloseInstall();
  }, [onCloseInstall]);

  const handleInstallSuccess = useCallback(() => {
    closeInstallModal();
    handleRefresh();
    toast.success("插件安装成功!");
  }, [closeInstallModal, handleRefresh]);

  const renderInstallModal = () => (
    <Modal
      isOpen={isOpenInstall}
      onOpenChange={onOpenChangeInstall}
      backdrop="blur"
      classNames={modalClassNames}
      size="2xl"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 pb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <RiAddCircleLine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">安装插件</h2>
            <p className="text-sm text-foreground/60">
              选择安装方式来添加新插件
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="px-6 py-0">
          <Tabs
            aria-label="安装方式"
            selectedKey={installTabKey}
            onSelectionChange={(key) => setInstallTabKey(key as string)}
            color="primary"
            variant="underlined"
            fullWidth
            classNames={{
              panel: "pt-6",
              tabList: "gap-8",
            }}
          >
            <Tab
              key="local"
              title={
                <div className="flex items-center gap-2">
                  <RiFolderLine size={18} />
                  <span>本地安装</span>
                </div>
              }
            >
              <LocalInstallTab
                onCancel={closeInstallModal}
                onSuccess={handleInstallSuccess}
              />
            </Tab>
            <Tab
              key="network"
              title={
                <div className="flex items-center gap-2">
                  <RiGlobalLine size={18} />
                  <span>网络安装</span>
                </div>
              }
            >
              <NetworkInstallTab
                onCancel={closeInstallModal}
                onSuccess={handleInstallSuccess}
              />
            </Tab>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  const renderPreviewModal = () => (
    <Modal
      isOpen={isOpenPreview}
      onOpenChange={onOpenChangePreview}
      size="4xl"
      backdrop="blur"
      classNames={modalClassNames}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 pb-4">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <RiPuzzleLine className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {currentPlugin?.name || "插件"}
            </h2>
            <p className="text-sm text-foreground/60">插件预览</p>
          </div>
        </ModalHeader>
        <ModalBody className="max-h-[70vh] overflow-y-auto px-6 py-0">
          {currentPlugin ? (
            <PluginLoader plugin={currentPlugin} key={currentPlugin.id} />
          ) : (
            <div className="text-center py-12 text-foreground/60">
              <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-4">
                <RiPuzzleLine className="w-8 h-8 text-default-400" />
              </div>
              <p>无法加载预览</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="pt-4">
          <Button variant="flat" onPress={onClosePreview}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl text-white shadow-lg">
            <RiPuzzleLine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">插件管理</h1>
            <p className="text-foreground/70 text-sm mt-1">
              管理和配置应用插件，扩展功能
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <Button
            startContent={<RiAddCircleLine />}
            color="primary"
            variant="shadow"
            size="md"
            onPress={onOpenInstall}
            className="shadow-sm hover:shadow-primary/30"
          >
            安装插件
          </Button>
          <Button
            startContent={<RiRefreshLine />}
            variant="bordered"
            size="md"
            onPress={handleRefresh}
            className="border-default-200 hover:border-primary/40"
          >
            刷新
          </Button>
        </div>
      </div>

      {/* 插件列表 */}
      <div className="flex-1">
        <PluginListTab
          onPreview={handlePreview}
          onUpdate={handleRefresh}
          key={refreshTrigger}
        />
      </div>

      {/* 底部操作 */}
      <div className="flex justify-center pt-4 border-t border-divider/30">
        <Button
          variant="flat"
          size="sm"
          onPress={handleOpenPluginDir}
          className="text-foreground/60 hover:text-foreground"
        >
          打开插件目录
        </Button>
      </div>

      {renderInstallModal()}
      {renderPreviewModal()}
    </div>
  );
}

export default Plugins;
