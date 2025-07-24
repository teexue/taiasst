import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { getPluginMetadata } from "@/services/tauri/plugin";
import { PluginMetadata } from "@/types/plugin";
import PluginLoader from "@/components/PluginLoader";
import { clearPluginGlobal, removePluginScript } from "@/utils/plugin";
import {
  RiArrowLeftLine,
  RiCloseCircleLine,
  RiErrorWarningLine,
  RiFileWarningLine,
} from "react-icons/ri";
import { motion } from "framer-motion";

const StatusCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  message: string;
  color?: "danger" | "warning" | "default";
  action?: React.ReactNode;
}> = ({ icon, title, message, color = "default", action }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="flex justify-center items-center h-full p-4"
  >
    <Card className="glass-light dark:glass-dark max-w-md w-full shadow-md">
      <CardBody className="flex flex-col items-center text-center gap-3 p-6 md:p-8">
        <div className={`text-${color}`}>
          {React.cloneElement(icon as React.ReactElement, {
            className: "w-12 h-12",
          })}
        </div>
        <h5 className="text-lg font-medium">{title}</h5>
        <p className="text-sm text-foreground/70">{message}</p>
        {action && <div className="mt-4">{action}</div>}
      </CardBody>
    </Card>
  </motion.div>
);

function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plugin, setPlugin] = useState<PluginMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPluginDetails = async () => {
      if (!id) {
        setError("插件ID不能为空");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Reset error on new fetch
        const pluginData = await getPluginMetadata(id);
        setPlugin(pluginData);
      } catch (err) {
        console.error("Error fetching plugin details:", err);
        setError(
          `无法加载插件信息: ${err instanceof Error ? err.message : String(err)}`,
        );
        setPlugin(null); // Ensure plugin is null on error
      } finally {
        setLoading(false);
      }
    };

    fetchPluginDetails();

    return () => {
      if (id) {
        clearPluginGlobal();
        removePluginScript(id);
      }
    };
  }, [id]);

  const goBack = () => {
    navigate("/tool");
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <Spinner size="lg" label="加载工具详情..." />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <StatusCard
        icon={<RiCloseCircleLine />}
        title="加载失败"
        message={error}
        color="danger"
        action={
          <Button
            radius="full"
            variant="shadow"
            size="sm"
            onPress={goBack}
            startContent={<RiArrowLeftLine size={16} />}
          >
            返回工具列表
          </Button>
        }
      />
    );
  }

  // Not Found State
  if (!plugin) {
    return (
      <StatusCard
        icon={<RiErrorWarningLine />}
        title="未找到工具"
        message="找不到指定的工具插件。"
        color="warning"
        action={
          <Button
            radius="full"
            variant="shadow"
            size="sm"
            onPress={goBack}
            startContent={<RiArrowLeftLine size={16} />}
          >
            返回工具列表
          </Button>
        }
      />
    );
  }

  // Success State - Render PluginLoader within a styled container
  return (
    <div className="flex flex-col h-full">
      {/* Header with Back Button and Plugin Title */}
      <div className="flex items-center justify-between p-3 border-b border-divider/30 flex-shrink-0 mb-4">
        <Button
          variant="shadow"
          size="sm"
          radius="full"
          onPress={goBack}
          startContent={<RiArrowLeftLine size={18} />}
          className="text-foreground/70 hover:text-foreground"
        >
          工具列表
        </Button>
        <h2 className="text-base font-medium truncate">{plugin.name}</h2>
        {/* Placeholder for potential actions (e.g., settings) */}
        <div className="w-20">&nbsp;</div>
      </div>

      {/* Plugin Loader Area - Could wrap in Card if needed, but loader handles its own UI */}
      <div className="flex-1 overflow-auto">
        <PluginLoader
          plugin={plugin}
          loadingContent={
            <div className="flex justify-center items-center h-64">
              <Spinner label="正在加载工具UI..." />
            </div>
          }
          errorContent={(errorMsg) => (
            <StatusCard
              icon={<RiFileWarningLine />}
              title="工具UI加载失败"
              message={errorMsg}
              color="danger"
              action={
                <Button
                  radius="full"
                  variant="shadow"
                  size="sm"
                  onPress={goBack}
                  startContent={<RiArrowLeftLine size={16} />}
                >
                  返回工具列表
                </Button>
              }
            />
          )}
        />
      </div>
    </div>
  );
}

export default ToolDetail;
