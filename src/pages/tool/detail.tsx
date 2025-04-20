import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button, Spin, Result } from "antd";
import { getPluginMetadata } from "@/utils/backend/plugin";
import { PluginMetadata } from "@/types/plugin";
import PluginLoader from "@/components/PluginLoader";
import { clearPluginGlobal, removePluginScript } from "@/utils/plugin";
import { RiArrowLeftLine } from "@remixicon/react";

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
        const pluginData = await getPluginMetadata(id);
        setPlugin(pluginData);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchPluginDetails();

    // 组件卸载时清理
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error}
        extra={
          <Button type="primary" onClick={goBack}>
            返回工具列表
          </Button>
        }
      />
    );
  }

  if (!plugin) {
    return (
      <Result
        status="warning"
        title="未找到工具"
        subTitle="找不到指定的工具"
        extra={
          <Button icon={<RiArrowLeftLine />} type="primary" onClick={goBack}>
            返回工具列表
          </Button>
        }
      />
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Button icon={<RiArrowLeftLine />} type="primary" onClick={goBack}>
          返回工具列表
        </Button>
      </div>

      <PluginLoader
        plugin={plugin}
        loadingContent={<Spin tip="正在加载工具UI..." />}
        errorContent={(errorMsg) => (
          <Result status="error" title="工具UI加载失败" subTitle={errorMsg} />
        )}
      />
    </div>
  );
}

export default ToolDetail;
