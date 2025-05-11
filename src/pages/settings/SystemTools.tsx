import { Button } from "@heroui/react";
import { toast } from "sonner";
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
      toast.success("插件系统已重启");
    } catch (err) {
      error(`重启插件系统失败: ${String(err)}`);
      toast.error("重启插件系统失败");
    } finally {
      setRestartLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="shadow"
        size="sm"
        onPress={handleRestartPluginSystem}
        isLoading={restartLoading}
        startContent={<RiRestartLine />}
      >
        重启插件系统
      </Button>
    </>
  );
}

export default SystemTools;
