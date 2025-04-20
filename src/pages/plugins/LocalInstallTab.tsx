import { Button, Space, Typography, Upload, message } from "antd";
import { RiAddCircleLine } from "@remixicon/react";
import { useState } from "react";
import type { UploadFile, UploadProps } from "antd";
import { error } from "@tauri-apps/plugin-log";
import {
  uploadPlugin,
  installPluginWithProgress,
  type InstallProgressStage,
} from "@/utils/plugin";

const { Text } = Typography;

interface LocalInstallTabProps {
  onCancel: () => void;
  onSuccess: () => void;
}

function LocalInstallTab({ onCancel, onSuccess }: LocalInstallTabProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  // 自定义上传方法
  const customUploadRequest = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;

    try {
      onProgress({ percent: 30 });

      // 获取文件路径或使用临时路径
      let filePath: string;
      if ((file as any).originFileObj?.path) {
        // 如果有本地路径，直接使用
        filePath = (file as any).originFileObj.path;
      } else {
        // 使用uploadPlugin上传到临时目录
        filePath = await uploadPlugin(file);
      }

      // 设置文件对象的路径属性，以便后续安装
      file.path = filePath;
      onProgress({ percent: 100 });
      onSuccess({ file, path: filePath });
    } catch (err) {
      error(`上传插件文件失败: ${String(err)}`);
      onError(err);
    }
  };

  // 处理文件变化
  const handleFileChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
  };

  // 从本地安装插件
  const handleInstallUpload = async () => {
    if (fileList.length === 0) {
      message.error("请选择插件文件");
      return;
    }

    setUploadLoading(true);
    try {
      // 获取已上传文件的路径
      const filePath = fileList[0].response?.path || (fileList[0] as any).path;
      if (!filePath) {
        throw new Error("无法获取文件路径");
      }

      // 使用统一的安装流程
      await installPluginWithProgress(
        filePath,
        "local",
        (stage: InstallProgressStage, msg?: string) => {
          if (stage === "start") {
            message.loading({
              content: msg,
              key: "installPlugin",
              duration: 0,
            });
          } else if (stage === "installing") {
            message.loading({
              content: msg,
              key: "installPlugin",
              duration: 0,
            });
          } else if (stage === "complete") {
            message.success({
              content: msg,
              key: "installPlugin",
            });
          } else if (stage === "error") {
            message.error({
              content: `安装失败: ${msg}`,
              key: "installPlugin",
            });
          } else if (stage === "already_installed") {
            message.warning({
              content: msg,
              key: "installPlugin",
            });
          }
        }
      );

      setFileList([]);
      onSuccess();
    } catch (err) {
      error(`安装插件失败: ${String(err)}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Text>请选择插件包文件(*.zip)</Text>
      </div>
      <Upload.Dragger
        name="file"
        multiple={false}
        maxCount={1}
        fileList={fileList}
        customRequest={customUploadRequest}
        onChange={handleFileChange}
        beforeUpload={(file) => {
          // 检查文件类型
          const isZip = file.name.endsWith(".zip");
          if (!isZip) {
            message.error("只能上传 ZIP 格式的插件包!");
            return Upload.LIST_IGNORE;
          }
          return true;
        }}
        showUploadList={{ showRemoveIcon: true }}
      >
        <p className="ant-upload-drag-icon">
          <RiAddCircleLine style={{ fontSize: 48, color: "#1890ff" }} />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">支持单个插件包文件上传 (*.zip)</p>
      </Upload.Dragger>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Space>
          <Button
            onClick={() => {
              onCancel();
              setFileList([]);
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            loading={uploadLoading}
            onClick={handleInstallUpload}
            disabled={fileList.length === 0}
          >
            安装
          </Button>
        </Space>
      </div>
    </>
  );
}

export default LocalInstallTab;
