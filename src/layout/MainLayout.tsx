import React, { useState } from "react";
import { useLocation, useNavigate, useOutlet } from "react-router";
import {
  RiHome4Line,
  RiPuzzle2Line,
  RiRobot2Line,
  RiSettingsLine,
  RiToolsLine,
} from "@remixicon/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { motion, AnimatePresence } from "framer-motion";
import SiderBarLayout from "./SiderBarLayout";
import HeaderLayout from "./HeaderLayout";
import { getSystemSetting } from "@/services/db/system";
import {
  Modal,
  Button,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";

interface MenuItem {
  key: string;
  icon: React.ReactElement;
  label: string;
}

function MainLayout() {
  const APP_VERSION = import.meta.env.VITE_APP_VERSION;
  const APP_NAME = import.meta.env.VITE_APP_NAME;
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const appWindow = getCurrentWindow();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const menuItems: MenuItem[] = [
    { key: "/", icon: <RiHome4Line size={20} />, label: "首页" },
    { key: "/tool", icon: <RiToolsLine size={20} />, label: "工具" },
    { key: "/ai", icon: <RiRobot2Line size={20} />, label: "AI" },
    { key: "/plugins", icon: <RiPuzzle2Line size={20} />, label: "插件" },
    { key: "/settings", icon: <RiSettingsLine size={20} />, label: "设置" },
  ];

  const getCurrentKey = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length === 0) return "/";
    return `/${pathSegments[0]}`;
  };
  const currentKey = getCurrentKey();

  const handleMinimize = () => appWindow.minimize();

  const handleMaximize = async () => {
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  };

  const handleClose = async () => {
    const isMinimizeToTray =
      (await getSystemSetting("minimizeToTray")) === "true";

    if (isMinimizeToTray) {
      appWindow.hide();
    } else {
      setIsCloseModalOpen(true);
    }
  };

  const confirmClose = () => {
    appWindow.close();
  };

  const cancelClose = () => {
    setIsCloseModalOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <SiderBarLayout
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        menuItems={menuItems}
        currentKey={currentKey}
        APP_NAME={APP_NAME}
        APP_VERSION={APP_VERSION}
        navigate={navigate}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderLayout
          currentKey={currentKey}
          menuItems={menuItems}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          onClose={handleClose}
        />

        <main className="p-4 md:p-6 overflow-y-auto overflow-x-hidden flex-1">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={location.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Modal isOpen={isCloseModalOpen} onClose={cancelClose} backdrop="blur">
        <ModalContent>
          <ModalHeader>确认关闭</ModalHeader>
          <ModalBody>
            <p>确定要关闭应用吗？</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="shadow" size="sm" onPress={cancelClose}>
              取消
            </Button>
            <Button
              color="danger"
              variant="shadow"
              size="sm"
              onPress={confirmClose}
            >
              确认关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default MainLayout;
