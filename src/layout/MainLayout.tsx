import React from "react";
import { Layout, Menu, Avatar, Tag, Badge, Card } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { RiHome4Line, RiSettingsLine, RiToolsLine } from "@remixicon/react";
import WindowControls from "@/components/WindowControls";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-shell";
function MainLayout() {
  const APP_VERSION = import.meta.env.VITE_APP_VERSION;
  const APP_NAME = import.meta.env.VITE_APP_NAME;
  const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION;
  const { Header, Sider, Content } = Layout;
  const location = useLocation();
  const navigate = useNavigate();
  const appWindow = getCurrentWindow();

  // 菜单项目配置
  const menuItems = [
    {
      key: "/",
      icon: <RiHome4Line size={16} />,
      label: "首页",
    },
    {
      key: "/tool",
      icon: <RiToolsLine size={16} />,
      label: "工具",
    },
    {
      key: "/settings",
      icon: <RiSettingsLine size={16} />,
      label: "设置",
    },
  ];

  // 获取当前选中的菜单项
  const selectedKeys = [
    location.pathname === "/" ? "/" : `/${location.pathname.split("/")[1]}`,
  ];

  const handleMinimize = () => {
    appWindow.minimize();
  };

  const handleMaximize = async () => {
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  };

  const handleClose = () => {
    appWindow.hide();
  };

  const updateApp = async () => {
    await open(import.meta.env.VITE_APP_GITHUB + "/releases");
  };

  return (
    <Layout className="h-screen overflow-hidden">
      <Header
        className="flex items-center justify-between h-[40px] z-10 fixed top-0 left-0 right-0 w-full shadow-md"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <Avatar src="/logo.png" alt="logo" size={32} shape="square" />
          <span className="font-medium text-base text-color-text-primary dark:text-color-text-secondary">
            {APP_NAME}「{APP_DESCRIPTION}」
          </span>
        </div>
        <div
          className="flex items-center"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <ThemeSwitcher />
          <WindowControls
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onClose={handleClose}
          />
        </div>
      </Header>
      <Layout className="mt-[40px] h-[calc(100vh-40px)]">
        <Sider
          width={150}
          className="h-full overflow-hidden fixed left-0"
          theme="light"
        >
          <Menu
            className="h-full py-2 border-0"
            mode="vertical"
            selectedKeys={selectedKeys}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
          <div className="absolute bottom-2 left-0 right-0 px-4 py-2 text-center">
            <a onClick={updateApp}>
              <Badge count={"升级"} color="red">
                <Tag color="purple" className="text-white text-xs opacity-80">
                  V{APP_VERSION}
                </Tag>
              </Badge>
            </a>
          </div>
        </Sider>
        <Layout className="h-full">
          <Content className="p-3 overflow-auto h-full">
            <Card
              className="w-full h-full rounded-xl shadow-md overflow-auto bg-color-bg-card dark:bg-color-bg-tertiary"
              styles={{ body: { padding: "16px" } }}
            >
              <Outlet />
            </Card>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
