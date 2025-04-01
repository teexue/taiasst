import { Tabs, Space, Typography, Button, Avatar, Tag } from "antd";
import * as RemixIcons from "@remixicon/react";
import { open } from "@tauri-apps/plugin-shell";
import { RiGithubFill } from "@remixicon/react";
import APP_LOGO from "/logo.png";

const { Title, Paragraph } = Typography;

// 应用信息（实际应用中可从环境变量或配置文件获取）

function Settings() {
  const APP_NAME = import.meta.env.VITE_APP_NAME;
  const APP_VERSION = import.meta.env.VITE_APP_VERSION;
  const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION;
  const APP_GITHUB = import.meta.env.VITE_APP_GITHUB;

  const openGitHub = async () => {
    // 使用系统默认浏览器打开 GitHub 项目
    await open(APP_GITHUB);
  };

  return (
    <>
      <Tabs
        defaultActiveKey="about"
        items={[
          {
            key: "about",
            label: (
              <Space size={4}>
                <RemixIcons.RiInformationLine size={16} />
                <span>关于</span>
              </Space>
            ),
            children: (
              <>
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
                  <Paragraph style={{ textAlign: "center" }}>
                    {APP_DESCRIPTION}
                  </Paragraph>
                  <Paragraph style={{ textAlign: "center" }}>
                    当前版本：<Tag color="purple">V{APP_VERSION}</Tag>
                  </Paragraph>
                  <Button
                    type="primary"
                    style={{ marginTop: 24 }}
                    onClick={openGitHub}
                  >
                    <Space align="center">
                      <RiGithubFill />
                      <span>访问项目</span>
                    </Space>
                  </Button>
                </Space>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export default Settings;
