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
} from "@remixicon/react";
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
      size="xl"
    >
      <ModalContent>
        <ModalHeader>安装插件</ModalHeader>
        <ModalBody className="px-2 py-0 md:px-4">
          <Tabs
            aria-label="安装方式"
            selectedKey={installTabKey}
            onSelectionChange={(key) => setInstallTabKey(key as string)}
            color="primary"
            variant="underlined"
            fullWidth
            classNames={{ panel: "pt-4" }}
          >
            <Tab
              key="local"
              title={
                <span className="flex items-center gap-1.5 text-sm">
                  <RiFolderLine size={16} /> 本地安装
                </span>
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
                <span className="flex items-center gap-1.5 text-sm">
                  <RiGlobalLine size={16} /> 网络安装
                </span>
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
      size="3xl"
      backdrop="blur"
      classNames={modalClassNames}
    >
      <ModalContent>
        <ModalHeader>{currentPlugin?.name || "插件"} - 预览</ModalHeader>
        <ModalBody className="max-h-[70vh] overflow-y-auto p-0 md:p-4">
          {currentPlugin ? (
            <PluginLoader plugin={currentPlugin} key={currentPlugin.id} />
          ) : (
            <div className="text-center p-8 text-foreground/60">
              无法加载预览。
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="shadow" size="sm" onPress={onClosePreview}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <div className="flex flex-col h-full">
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h4 className="text-lg font-semibold m-0">插件管理</h4>
        <div className="flex gap-2 items-center">
          <Button
            startContent={<RiAddCircleLine />}
            color="primary"
            variant="shadow"
            size="sm"
            onPress={onOpenInstall}
            className="shadow-sm hover:shadow-primary/30 click-scale"
          >
            安装新插件
          </Button>
          <Button
            startContent={<RiRefreshLine />}
            variant="shadow"
            size="sm"
            onPress={handleRefresh}
            className="shadow-sm hover:shadow-primary/30 click-scale"
          >
            刷新
          </Button>
        </div>
      </div>

      <PluginListTab
        onPreview={handlePreview}
        onUpdate={handleRefresh}
        key={refreshTrigger}
      />

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Button
          variant="shadow"
          size="sm"
          onPress={handleOpenPluginDir}
          className="hover:bg-default-100/50"
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
