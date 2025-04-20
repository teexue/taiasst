import { useState, useEffect } from "react";
import { Space, Table, Button, message, Tag, Popconfirm } from "antd";
import { RiEyeLine, RiDeleteBin6Line } from "@remixicon/react";
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

interface PluginListTabProps {
  onPreview: (plugin: PluginMetadata) => void;
  onUpdate: () => void;
}

function PluginListTab({ onPreview, onUpdate }: PluginListTabProps) {
  const [plugins, setPlugins] = useState<PluginMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlugins = async () => {
    setLoading(true);
    try {
      const result = await getPluginList();
      setPlugins(result as PluginMetadata[]);
    } catch (error) {
      message.error("获取插件列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const handleUninstall = async (plugin: PluginMetadata) => {
    try {
      await uninstallPlugin(plugin.id);
      message.success(`插件 ${plugin.name} 已卸载`);
      fetchPlugins();
      onUpdate();
    } catch (err) {
      error(`卸载插件失败: ${String(err)}`);
      message.error("卸载插件失败");
    }
  };

  // 预览插件
  const handlePreview = async (plugin: PluginMetadata) => {
    // 强制清除可能存在的旧缓存
    clearPluginGlobal();

    // 移除可能存在的旧脚本标签
    removePluginScript(plugin.id);

    onPreview(plugin);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "类型",
      dataIndex: "plugin_type",
      key: "plugin_type",
      render: (text: string) => {
        return (
          <Tag color={PluginTypeExtra[text as PluginType].color}>
            {PluginTypeExtra[text as PluginType].name}
          </Tag>
        );
      },
    },
    {
      title: "版本",
      dataIndex: "version",
      key: "version",
      render: (text: string) => {
        return <Tag color="blue">v{text}</Tag>;
      },
    },
    {
      title: "来源",
      dataIndex: "origin",
      key: "origin",
      render: (text: string) => {
        return (
          <Tag color={OriginExtra[text as Origin].color}>
            {OriginExtra[text as Origin].name}
          </Tag>
        );
      },
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "作者",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: PluginMetadata) => (
        <Space>
          <Button
            type="primary"
            icon={<RiEyeLine />}
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          <Popconfirm
            title="确定要卸载插件吗？"
            onConfirm={() => handleUninstall(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<RiDeleteBin6Line />}>
              卸载
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={plugins}
      rowKey="id"
      loading={loading}
      pagination={false}
      locale={{ emptyText: "暂无已安装的插件" }}
      size="small"
    />
  );
}

export default PluginListTab;
