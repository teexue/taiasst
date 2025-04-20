import { Button, message } from "antd";
import { RiRestartLine } from "@remixicon/react";
import { restartPluginSystem } from "@/utils/plugin";
import { error } from "@tauri-apps/plugin-log";
import { useState } from "react";
function SystemTools() {
  const [restartLoading, setRestartLoading] = useState(false);
  const handleRestartPluginSystem = async () => {
    setRestartLoading(true);
    try {
      await restartPluginSystem();
      message.success("插件系统已重启");
    } catch (err) {
      error(`重启插件系统失败: ${String(err)}`);
      message.error("重启插件系统失败");
    } finally {
      setRestartLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleRestartPluginSystem} loading={restartLoading}>
        <RiRestartLine />
        重启插件系统
      </Button>
    </>
  );
}

export default SystemTools;
