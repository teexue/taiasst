import { useState } from "react";
import { Button, Space, Typography, Modal, message, Tabs } from "antd";
import {
  RiAddCircleLine,
  RiRefreshLine,
  RiFolderLine,
  RiGlobalLine,
} from "@remixicon/react";
import { error } from "@tauri-apps/plugin-log";
import { getPluginBaseDir } from "@/utils/plugin";
import { open } from "@tauri-apps/plugin-shell";
import PluginLoader from "@/components/PluginLoader";
import PluginListTab from "./PluginListTab";
import LocalInstallTab from "./LocalInstallTab";
import NetworkInstallTab from "./NetworkInstallTab";
import { PluginMetadata } from "@/types/plugin";

const { Title } = Typography;

function Plugins() {
  const [installModalVisible, setInstallModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [currentPlugin, setCurrentPlugin] = useState<PluginMetadata | null>(
    null
  );
  const [activeTabKey, setActiveTabKey] = useState("local");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    // 通过更新refreshTrigger触发子组件刷新
    setRefreshTrigger((prev) => prev + 1);
  };

  // 预览插件
  const handlePreview = (plugin: PluginMetadata) => {
    setCurrentPlugin(plugin);
    setPreviewModalVisible(true);
  };

  // 预览模态框关闭处理
  const handlePreviewModalClose = () => {
    setPreviewModalVisible(false);
  };

  const handleOpenPluginDir = async () => {
    try {
      const dir = await getPluginBaseDir();
      await open(dir as string);
    } catch (err) {
      error(`打开插件目录失败: ${String(err)}`);
      message.error("打开插件目录失败");
    }
  };

  // 渲染安装插件模态框
  const renderInstallModal = () => (
    <Modal
      title="安装插件"
      open={installModalVisible}
      onCancel={() => setInstallModalVisible(false)}
      footer={null}
    >
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        items={[
          {
            key: "local",
            label: (
              <span>
                <RiFolderLine /> 本地安装
              </span>
            ),
            children: (
              <LocalInstallTab
                onCancel={() => setInstallModalVisible(false)}
                onSuccess={() => {
                  setInstallModalVisible(false);
                  handleRefresh();
                }}
              />
            ),
          },
          {
            key: "network",
            label: (
              <span>
                <RiGlobalLine /> 网络安装
              </span>
            ),
            children: (
              <NetworkInstallTab
                onCancel={() => setInstallModalVisible(false)}
                onSuccess={() => {
                  setInstallModalVisible(false);
                  handleRefresh();
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  );

  return (
    <>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          插件管理
        </Title>
        <Space>
          <Button
            icon={<RiAddCircleLine />}
            type="primary"
            onClick={() => setInstallModalVisible(true)}
          >
            安装新插件
          </Button>
          <Button icon={<RiRefreshLine />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      <PluginListTab
        onPreview={handlePreview}
        onUpdate={handleRefresh}
        key={refreshTrigger} // 用于强制组件重新渲染以刷新数据
      />

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Button type="link" onClick={handleOpenPluginDir}>
          打开插件目录
        </Button>
      </div>

      {/* 渲染安装插件模态框 */}
      {renderInstallModal()}

      {/* 预览插件的模态框 */}
      <Modal
        title="插件预览"
        open={previewModalVisible}
        onCancel={handlePreviewModalClose}
        footer={[
          <Button key="close" onClick={handlePreviewModalClose}>
            关闭
          </Button>,
        ]}
        width={800}
        destroyOnClose={true}
      >
        <PluginLoader
          plugin={currentPlugin?.id || ""}
          key={currentPlugin?.id || "no-plugin"}
        />
      </Modal>
    </>
  );
}

export default Plugins;
