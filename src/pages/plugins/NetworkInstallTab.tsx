import { useState } from "react";
import {
  Button,
  Space,
  Typography,
  Form,
  Input,
  Progress,
  message,
} from "antd";
import { error } from "@tauri-apps/plugin-log";
import { installPluginFromUrl } from "@/utils/plugin";

const { Text } = Typography;

interface NetworkInstallTabProps {
  onCancel: () => void;
  onSuccess: () => void;
}

function NetworkInstallTab({ onCancel, onSuccess }: NetworkInstallTabProps) {
  const [form] = Form.useForm();
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  // 从网络安装插件
  const handleNetworkInstall = async () => {
    try {
      // 表单验证
      const values = await form.validateFields();
      const url = values.pluginUrl;

      setDownloadLoading(true);
      setShowProgress(true);
      setDownloadProgress(0);

      // 使用统一的网络安装流程
      await installPluginFromUrl(url, (stage, progress, msg) => {
        // 更新进度指示器
        if (stage === "downloading" && progress !== undefined) {
          setDownloadProgress(progress);
        } else if (stage === "downloaded") {
          setDownloadProgress(100);
        } else if (stage === "installing") {
          message.loading({
            content: msg,
            key: "downloadPlugin",
            duration: 0,
          });
        } else if (stage === "complete") {
          setShowProgress(false);
          message.success({
            content: msg,
            key: "downloadPlugin",
          });
        } else if (stage === "error") {
          setShowProgress(false);
          message.error({
            content: msg,
            key: "downloadPlugin",
          });
        }
      });

      form.resetFields();
      onSuccess();
    } catch (err) {
      error(`从网络安装插件失败: ${String(err)}`);
      setShowProgress(false);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <>
      <Form form={form} layout="vertical">
        <Form.Item
          name="pluginUrl"
          label="插件URL"
          rules={[
            { required: true, message: "请输入插件URL" },
            {
              type: "url",
              message: "请输入有效的URL地址",
            },
            {
              validator: (_, value) => {
                if (value && !value.endsWith(".zip")) {
                  return Promise.reject("插件URL必须指向.zip文件");
                }
                return Promise.resolve();
              },
            },
          ]}
          help="输入插件的ZIP包下载链接，例如：https://github.com/user/repo/releases/download/v1.0/plugin.zip"
        >
          <Input
            placeholder="https://example.com/plugin.zip"
            allowClear
            size="large"
          />
        </Form.Item>

        <div className="example-links" style={{ marginBottom: 16 }}>
          <Text type="secondary">示例：</Text>
          <Button
            type="link"
            onClick={() =>
              form.setFieldsValue({
                pluginUrl:
                  "https://github.com/tauri-apps/plugins-workspace/archive/refs/heads/v1.zip",
              })
            }
          >
            Tauri 插件示例
          </Button>
        </div>
      </Form>

      {/* 下载进度条 */}
      {showProgress && (
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Progress
            percent={Math.round(downloadProgress)}
            status={downloadProgress >= 100 ? "success" : "active"}
            strokeColor={downloadProgress >= 100 ? "#52c41a" : "#1890ff"}
          />
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <Text type="secondary">
              {downloadProgress < 100
                ? `正在下载：${Math.round(downloadProgress)}%`
                : "下载完成，准备安装..."}
            </Text>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Space>
          <Button
            onClick={() => {
              onCancel();
              form.resetFields();
              setShowProgress(false);
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            loading={downloadLoading}
            onClick={handleNetworkInstall}
            disabled={showProgress}
          >
            下载并安装
          </Button>
        </Space>
      </div>
    </>
  );
}

export default NetworkInstallTab;
