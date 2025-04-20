import { Space, Typography, Button, Avatar, Tag } from "antd";
import { open } from "@tauri-apps/plugin-shell";
import { RiGithubFill } from "@remixicon/react";
import APP_LOGO from "/logo.png";
import { check } from "@tauri-apps/plugin-updater";
import { message } from "antd";
import { useState } from "react";
const { Title, Paragraph } = Typography;

interface AboutTabProps {
  onUpdate?: () => void;
}

function AboutTab({ onUpdate }: AboutTabProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [checkUpdateLoading, setCheckUpdateLoading] = useState(false);

  const APP_NAME = import.meta.env.VITE_APP_NAME;
  const APP_VERSION = import.meta.env.VITE_APP_VERSION;
  const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION;
  const APP_GITHUB = import.meta.env.VITE_APP_GITHUB;

  const openGitHub = async () => {
    // 使用系统默认浏览器打开 GitHub 项目
    await open(APP_GITHUB);
  };

  const checkUpdate = async () => {
    try {
      setCheckUpdateLoading(true);
      const update = await check();
      console.log(update);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      messageApi.error(`检查更新失败: 请检查网络连接！`);
    } finally {
      setCheckUpdateLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Space
        direction="vertical"
        align="center"
        style={{ width: "100%", marginBottom: 24 }}
      >
        <Avatar shape="square" src={APP_LOGO} size={100} />
        <Title level={3} style={{ margin: "4px 0" }}>
          {APP_NAME}
        </Title>
        <Space>
          <Tag color="blue">轻量级</Tag>
          <Tag color="green">无广告</Tag>
          <Tag color="purple">开源</Tag>
        </Space>
      </Space>
      <Space
        direction="vertical"
        align="center"
        style={{ width: "100%", margin: "0 auto" }}
      >
        <Paragraph style={{ textAlign: "center" }}>{APP_DESCRIPTION}</Paragraph>
        <Paragraph style={{ textAlign: "center" }}>
          当前版本：<Tag color="purple">V{APP_VERSION}</Tag>
        </Paragraph>
        <Space>
          <Button
            type="default"
            onClick={checkUpdate}
            loading={checkUpdateLoading}
          >
            检查更新
          </Button>
          <Button type="primary" onClick={openGitHub}>
            <Space align="center">
              <RiGithubFill />
              <span>访问项目</span>
            </Space>
          </Button>
        </Space>
      </Space>
    </>
  );
}

export default AboutTab;
